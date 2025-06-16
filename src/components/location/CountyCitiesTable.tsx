import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CityFilters from "./CityFilters";

interface CityData {
  id: string;
  city: string;
  state_name: string;
  county_name: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  country: string;
  income_household_median?: number;
  age_median?: number;
  home_value?: number;
}

interface CountyCitiesTableProps {
  selectedCounties: Set<string>;
  searchResults: any[];
  onSelectedCitiesChange: (cities: CityData[]) => void;
}

const CountyCitiesTable: React.FC<CountyCitiesTableProps> = ({
  selectedCounties,
  searchResults,
  onSelectedCitiesChange
}) => {
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Dynamic filter ranges
  const [maxPopulation, setMaxPopulation] = useState(1000000);
  const [maxIncome, setMaxIncome] = useState(200000);
  const [maxHomeValue, setMaxHomeValue] = useState(1250000);
  const [populationRange, setPopulationRange] = useState<[number, number]>([0, 1000000]);
  const [incomeRange, setIncomeRange] = useState<[number, number]>([0, 200000]);
  const [homeValueRange, setHomeValueRange] = useState<[number, number]>([0, 1250000]);
  
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCounties.size > 0) {
      fetchCitiesForCounties();
    } else {
      setAllCities([]);
      setFilteredCities([]);
      setSelectedCities(new Set());
    }
  }, [selectedCounties, searchResults]);

  useEffect(() => {
    applyFilters();
  }, [allCities, populationRange, incomeRange, homeValueRange]);

  // Update filter ranges when cities data changes
  useEffect(() => {
    if (allCities.length > 0) {
      const populations = allCities.map(c => c.population).filter(p => p !== null && p !== undefined);
      const incomes = allCities.map(c => c.income_household_median).filter(i => i !== null && i !== undefined);
      const homeValues = allCities.map(c => c.home_value).filter(h => h !== null && h !== undefined);

      if (populations.length > 0) {
        const maxPop = Math.max(...populations);
        setMaxPopulation(maxPop);
        setPopulationRange(prevRange => [prevRange[0], maxPop]);
      }

      if (incomes.length > 0) {
        const maxInc = Math.max(...incomes);
        setMaxIncome(maxInc);
        setIncomeRange(prevRange => [prevRange[0], maxInc]);
      }

      if (homeValues.length > 0) {
        const maxHome = Math.max(...homeValues);
        setMaxHomeValue(maxHome);
        setHomeValueRange(prevRange => [prevRange[0], maxHome]);
      }
    }
  }, [allCities]);

  const parseNumber = (value: any) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[,%$]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  const applyFilters = () => {
    console.log('=== APPLYING FILTERS ===');
    console.log('Filter ranges:', { populationRange, incomeRange, homeValueRange });
    
    const filtered = allCities.filter(city => {
      const population = city.population || 0;
      const income = city.income_household_median || 0;
      const homeValue = city.home_value || 0;

      console.log(`City: ${city.city}`, {
        population: { raw: city.population, parsed: population },
        income: { raw: city.income_household_median, parsed: income },
        homeValue: { raw: city.home_value, parsed: homeValue }
      });

      const passesPopulation = population >= populationRange[0] && population <= populationRange[1];
      const passesIncome = income >= incomeRange[0] && income <= incomeRange[1];
      const passesHomeValue = homeValue >= homeValueRange[0] && homeValue <= homeValueRange[1];

      console.log(`${city.city} filter results:`, {
        passesPopulation,
        passesIncome,
        passesHomeValue,
        overallPass: passesPopulation && passesIncome && passesHomeValue
      });

      return passesPopulation && passesIncome && passesHomeValue;
    });

    console.log(`Filtered ${filtered.length} cities from ${allCities.length} total`);
    setFilteredCities(filtered);
    
    // Update selected cities to only include filtered ones
    const newSelected = new Set(
      Array.from(selectedCities).filter(cityId => 
        filtered.some(city => city.id === cityId)
      )
    );
    setSelectedCities(newSelected);
    
    const selectedCityObjects = filtered.filter(city => newSelected.has(city.id));
    onSelectedCitiesChange(selectedCityObjects);
  };

  const clearFilters = () => {
    setPopulationRange([0, maxPopulation]);
    setIncomeRange([0, maxIncome]);
    setHomeValueRange([0, maxHomeValue]);
  };

  const fetchCitiesForCounties = async () => {
    setIsLoading(true);
    try {
      const selectedCountyData = searchResults.filter((county) => {
        const countyId = `${county.county_name}-${county.state_name}`;
        return selectedCounties.has(countyId);
      });

      if (selectedCountyData.length === 0) {
        setAllCities([]);
        return;
      }

      let cityData = [];

      for (const county of selectedCountyData) {
        const { data: countyCities, error } = await supabase
          .from('location_data')
          .select(`
            id,
            city,
            state_name,
            county_name,
            postal_code,
            latitude,
            longitude,
            population,
            income_household_median,
            age_median,
            home_value
          `)
          .eq('county_name', county.county_name)
          .eq('state_name', county.state_name)
          .not('city', 'is', null)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .order('city')
          .limit(50);

        if (error) {
          console.error(`Error fetching cities for ${county.county_name}:`, error);
          continue;
        }

        if (countyCities && countyCities.length > 0) {
          cityData.push(...countyCities);
        }
      }

      console.log('=== RAW CITY DATA SAMPLE ===');
      cityData.slice(0, 5).forEach(city => {
        console.log(`${city.city}:`, {
          population: city.population,
          income_household_median: city.income_household_median,
          home_value: city.home_value
        });
      });

      const formattedCities: CityData[] = cityData.map(city => ({
        id: city.id,
        city: city.city,
        state_name: city.state_name,
        county_name: city.county_name,
        postal_code: city.postal_code,
        latitude: city.latitude,
        longitude: city.longitude,
        population: parseNumber(city.population),
        country: 'United States',
        income_household_median: parseNumber(city.income_household_median),
        age_median: parseNumber(city.age_median),
        home_value: parseNumber(city.home_value)
      }));

      console.log('=== PARSED CITY DATA SAMPLE ===');
      formattedCities.slice(0, 5).forEach(city => {
        console.log(`${city.city}:`, {
          population: city.population,
          income_household_median: city.income_household_median,
          home_value: city.home_value
        });
      });

      // Find min/max values for debugging
      const populations = formattedCities.map(c => c.population).filter(p => p !== null);
      const incomes = formattedCities.map(c => c.income_household_median).filter(i => i !== null);
      const homeValues = formattedCities.map(c => c.home_value).filter(h => h !== null);

      console.log('=== DATA RANGES ===');
      console.log('Population range:', { min: Math.min(...populations), max: Math.max(...populations) });
      console.log('Income range:', { min: Math.min(...incomes), max: Math.max(...incomes) });
      console.log('Home value range:', { min: Math.min(...homeValues), max: Math.max(...homeValues) });

      const uniqueCities = formattedCities.filter((city, index, self) => 
        index === self.findIndex((c) => 
          c.city === city.city && 
          c.state_name === city.state_name && 
          c.county_name === city.county_name
        )
      );

      setAllCities(uniqueCities.sort((a, b) => a.city.localeCompare(b.city)));
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to load cities for selected counties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelection = (cityId: string, checked: boolean) => {
    const newSelected = new Set(selectedCities);
    if (checked) {
      newSelected.add(cityId);
    } else {
      newSelected.delete(cityId);
    }
    setSelectedCities(newSelected);
    
    const selectedCityObjects = filteredCities.filter(city => newSelected.has(city.id));
    onSelectedCitiesChange(selectedCityObjects);
  };

  const handleSelectAll = () => {
    if (selectedCities.size === filteredCities.length) {
      setSelectedCities(new Set());
      onSelectedCitiesChange([]);
    } else {
      const allIds = new Set(filteredCities.map(city => city.id));
      setSelectedCities(allIds);
      onSelectedCitiesChange(filteredCities);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  if (selectedCounties.size === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-lg font-medium">Select Counties</p>
          <p className="text-sm mt-1">Choose counties from the search results to view their cities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-slate-900">Cities</h3>
          <span className="text-sm text-slate-500">
            {filteredCities.length} of {allCities.length} cities
          </span>
        </div>
        
        {filteredCities.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-slate-600 border-slate-300"
          >
            {selectedCities.size === filteredCities.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="border-b border-slate-200">
        <div className="p-4">
          <CityFilters
            populationRange={populationRange}
            incomeRange={incomeRange}
            homeValueRange={homeValueRange}
            maxPopulation={maxPopulation}
            maxIncome={maxIncome}
            maxHomeValue={maxHomeValue}
            onPopulationChange={setPopulationRange}
            onIncomeChange={setIncomeRange}
            onHomeValueChange={setHomeValueRange}
            onClearFilters={clearFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
          </div>
        ) : filteredCities.length > 0 ? (
          <div className="space-y-1 p-2">
            {filteredCities.map((city) => (
              <div
                key={city.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
              >
                <Checkbox
                  checked={selectedCities.has(city.id)}
                  onCheckedChange={(checked) => handleCitySelection(city.id, !!checked)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 truncate">{city.city}</h4>
                    <span className="text-sm text-slate-500 ml-2">
                      {city.population?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {city.county_name}, {city.state_name}
                  </p>
                  <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    {city.income_household_median && (
                      <span>Income: {formatCurrency(city.income_household_median)}</span>
                    )}
                    {city.home_value && (
                      <span>Home: {formatCurrency(city.home_value)}</span>
                    )}
                  </div>
                  {city.postal_code && (
                    <p className="text-xs text-slate-500">{city.postal_code}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : allCities.length > 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="text-center">
              <p>No cities match the current filters</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Clear filters to see all cities
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <p>No cities found for selected counties</p>
          </div>
        )}
      </div>
      
      {selectedCities.size > 0 && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <p className="text-sm text-slate-600">
            {selectedCities.size} cities selected
          </p>
        </div>
      )}
    </div>
  );
};

export default CountyCitiesTable;
