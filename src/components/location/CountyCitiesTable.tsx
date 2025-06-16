import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, DollarSign, Home, GraduationCap, MapPin, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface County {
  id: string;
  county_name: string;
  state_name: string;
  center_lat: number;
  center_lng: number;
  distance_miles: number;
  city_count: number;
  total_population: number;
  avg_income_household_median: number;
  avg_home_value: number;
  avg_age_median: number;
  education_bachelors_pct: number;
  race_white_pct: number;
  race_black_pct: number;
  race_asian_pct: number;
  race_hispanic_pct: number;
  timezone: string;
}

interface City {
  id: string;
  city: string;
  state_name: string;
  county_name: string;
  latitude: number;
  longitude: number;
  population: number;
  income_household_median: number;
  home_value: number;
  age_median: number;
  education_bachelors: number;
  race_white: number;
  race_black: number;
  race_asian: number;
  hispanic: number;
  timezone: string;
}

interface CountyCitiesTableProps {
  counties: County[];
  searchCoords: {lat: number; lng: number} | null;
}

const CountyCitiesTable: React.FC<CountyCitiesTableProps> = ({ counties, searchCoords }) => {
  const [expandedCounty, setExpandedCounty] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [sortField, setSortField] = useState<keyof County>('distance_miles');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // City filter states with dynamic maximums
  const [showCityFilters, setShowCityFilters] = useState(false);
  const [populationRange, setPopulationRange] = useState([0, 100000]);
  const [incomeRange, setIncomeRange] = useState([0, 200000]);
  const [homeValueRange, setHomeValueRange] = useState([0, 1250000]);
  const [maxPopulation, setMaxPopulation] = useState(100000);
  const [maxIncome, setMaxIncome] = useState(200000);
  const [maxHomeValue, setMaxHomeValue] = useState(1250000);

  const { toast } = useToast();

  // Update filter maximums when cities change
  useEffect(() => {
    if (cities.length > 0) {
      const populations = cities.map(c => c.population || 0).filter(p => p > 0);
      const incomes = cities.map(c => c.income_household_median || 0).filter(i => i > 0);
      const homeValues = cities.map(c => c.home_value || 0).filter(h => h > 0);

      if (populations.length > 0) {
        const newMaxPop = Math.max(...populations);
        setMaxPopulation(newMaxPop);
        setPopulationRange([0, newMaxPop]);
      }

      if (incomes.length > 0) {
        const newMaxIncome = Math.max(...incomes);
        setMaxIncome(newMaxIncome);
        setIncomeRange([0, newMaxIncome]);
      }

      if (homeValues.length > 0) {
        const newMaxHomeValue = Math.max(...homeValues);
        setMaxHomeValue(newMaxHomeValue);
        setHomeValueRange([0, newMaxHomeValue]);
      }

      console.log('📊 Updated filter ranges:', {
        population: { max: maxPopulation, range: populationRange },
        income: { max: maxIncome, range: incomeRange },
        homeValue: { max: maxHomeValue, range: homeValueRange }
      });
    }
  }, [cities]);

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[,%$]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  const handleSort = (field: keyof County) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCounties = [...counties].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    const aNum = typeof aValue === 'number' ? aValue : 0;
    const bNum = typeof bValue === 'number' ? bValue : 0;
    
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const loadCitiesForCounty = async (county: County) => {
    if (expandedCounty === county.id) {
      setExpandedCounty(null);
      setCities([]);
      return;
    }

    setLoadingCities(true);
    setExpandedCounty(county.id);
    
    try {
      console.log(`🏙️ Loading cities for ${county.county_name}, ${county.state_name}`);
      
      const { data: cityData, error } = await supabase
        .from('location_data')
        .select(`
          id,
          city,
          state_name,
          county_name,
          latitude,
          longitude,
          population,
          income_household_median,
          home_value,
          age_median,
          education_bachelors,
          race_white,
          race_black,
          race_asian,
          hispanic,
          timezone
        `)
        .eq('county_name', county.county_name)
        .eq('state_name', county.state_name)
        .not('city', 'is', null)
        .order('city');

      if (error) throw error;

      if (!cityData || cityData.length === 0) {
        console.log('📭 No cities found for county');
        setCities([]);
        toast({
          title: "No Cities Found",
          description: `No cities found in ${county.county_name}, ${county.state_name}`,
        });
        return;
      }

      // Transform and parse the city data
      const transformedCities: City[] = cityData.map(city => ({
        id: city.id || `${city.city}-${city.state_name}`,
        city: city.city,
        state_name: city.state_name,
        county_name: city.county_name,
        latitude: parseFloat(city.latitude) || 0,
        longitude: parseFloat(city.longitude) || 0,
        population: parseNumber(city.population),
        income_household_median: parseNumber(city.income_household_median),
        home_value: parseNumber(city.home_value),
        age_median: parseNumber(city.age_median),
        education_bachelors: parseNumber(city.education_bachelors),
        race_white: parseNumber(city.race_white),
        race_black: parseNumber(city.race_black),
        race_asian: parseNumber(city.race_asian),
        hispanic: parseNumber(city.hispanic),
        timezone: city.timezone
      }));

      console.log(`✅ Loaded ${transformedCities.length} cities for ${county.county_name}`);
      
      // Debug: Show sample of data and ranges
      if (transformedCities.length > 0) {
        console.log('📊 Raw data sample:', transformedCities.slice(0, 3));
        
        const populations = transformedCities.map(c => c.population).filter(p => p > 0);
        const incomes = transformedCities.map(c => c.income_household_median).filter(i => i > 0);
        const homeValues = transformedCities.map(c => c.home_value).filter(h => h > 0);
        
        console.log('📈 Data ranges:', {
          population: { min: Math.min(...populations), max: Math.max(...populations) },
          income: { min: Math.min(...incomes), max: Math.max(...incomes) },
          homeValue: { min: Math.min(...homeValues), max: Math.max(...homeValues) }
        });
      }

      setCities(transformedCities);
      
    } catch (error) {
      console.error('💥 Error loading cities:', error);
      toast({
        title: "Error Loading Cities",
        description: "Failed to load cities for this county. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCities(false);
    }
  };

  // Filter cities based on current filter values
  const filteredCities = cities.filter(city => {
    const population = city.population || 0;
    const income = city.income_household_median || 0;
    const homeValue = city.home_value || 0;

    const passesPopulation = population >= populationRange[0] && population <= populationRange[1];
    const passesIncome = income >= incomeRange[0] && income <= incomeRange[1];
    const passesHomeValue = homeValue >= homeValueRange[0] && homeValue <= homeValueRange[1];

    const passes = passesPopulation && passesIncome && passesHomeValue;
    
    // Log filter application for debugging
    if (!passes) {
      console.log(`🚫 City ${city.city} filtered out:`, {
        population: { value: population, range: populationRange, passes: passesPopulation },
        income: { value: income, range: incomeRange, passes: passesIncome },
        homeValue: { value: homeValue, range: homeValueRange, passes: passesHomeValue }
      });
    }

    return passes;
  });

  const clearCityFilters = () => {
    setPopulationRange([0, maxPopulation]);
    setIncomeRange([0, maxIncome]);
    setHomeValueRange([0, maxHomeValue]);
  };

  const activeFiltersCount = (
    (populationRange[1] < maxPopulation ? 1 : 0) +
    (incomeRange[1] < maxIncome ? 1 : 0) +
    (homeValueRange[1] < maxHomeValue ? 1 : 0)
  );

  const SortButton: React.FC<{ field: keyof County; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 text-xs font-medium text-slate-600 hover:text-slate-900"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        )}
      </div>
    </Button>
  );

  if (counties.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
        <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Counties Found</h3>
        <p className="text-slate-600">
          Try adjusting your search radius or location to find counties in your area.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Counties Found ({counties.length})
          </h2>
          <div className="text-sm text-slate-600">
            Click a county to view cities
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="county_name">County</SortButton>
                </th>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="distance_miles">Distance</SortButton>
                </th>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="city_count">Cities</SortButton>
                </th>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="total_population">Population</SortButton>
                </th>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="avg_income_household_median">Avg Income</SortButton>
                </th>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="avg_home_value">Avg Home Value</SortButton>
                </th>
                <th className="text-left p-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <SortButton field="education_bachelors_pct">Education</SortButton>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedCounties.map((county) => (
                <React.Fragment key={county.id}>
                  <tr 
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => loadCitiesForCounty(county)}
                  >
                    <td className="p-3">
                      <div className="flex items-center">
                        {expandedCounty === county.id ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 mr-2" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 mr-2" />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">{county.county_name}</div>
                          <div className="text-sm text-slate-600">{county.state_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-slate-900">
                      {county.distance_miles} mi
                    </td>
                    <td className="p-3 text-sm text-slate-900">
                      {county.city_count}
                    </td>
                    <td className="p-3 text-sm text-slate-900">
                      {formatNumber(county.total_population)}
                    </td>
                    <td className="p-3 text-sm text-slate-900">
                      {formatCurrency(county.avg_income_household_median)}
                    </td>
                    <td className="p-3 text-sm text-slate-900">
                      {formatCurrency(county.avg_home_value)}
                    </td>
                    <td className="p-3 text-sm text-slate-900">
                      {county.education_bachelors_pct ? `${county.education_bachelors_pct.toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>

                  {/* Cities section */}
                  {expandedCounty === county.id && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <div className="bg-slate-50 border-t border-slate-200">
                          {loadingCities ? (
                            <div className="p-8 text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-600 mx-auto mb-4"></div>
                              <p className="text-slate-600">Loading cities...</p>
                            </div>
                          ) : (
                            <div className="p-4">
                              {/* City Filters */}
                              <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-medium text-slate-900">
                                  Cities in {county.county_name} ({filteredCities.length} of {cities.length})
                                </h3>
                                
                                <Popover open={showCityFilters} onOpenChange={setShowCityFilters}>
                                  <PopoverTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="relative"
                                    >
                                      <Filter className="h-4 w-4 mr-2" />
                                      City Filters
                                      {activeFiltersCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                          {activeFiltersCount}
                                        </span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium">City Filters</h4>
                                        {activeFiltersCount > 0 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearCityFilters}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>

                                      {/* Population Filter */}
                                      <div>
                                        <Label className="text-sm font-medium">
                                          Population: {formatNumber(populationRange[0])} - {formatNumber(populationRange[1])}
                                        </Label>
                                        <Slider
                                          min={0}
                                          max={maxPopulation}
                                          step={Math.max(1, Math.floor(maxPopulation / 1000))}
                                          value={populationRange}
                                          onValueChange={setPopulationRange}
                                          className="mt-2"
                                        />
                                      </div>

                                      {/* Income Filter */}
                                      <div>
                                        <Label className="text-sm font-medium">
                                          Income: {formatCurrency(incomeRange[0])} - {formatCurrency(incomeRange[1])}
                                        </Label>
                                        <Slider
                                          min={0}
                                          max={maxIncome}
                                          step={Math.max(1000, Math.floor(maxIncome / 100))}
                                          value={incomeRange}
                                          onValueChange={setIncomeRange}
                                          className="mt-2"
                                        />
                                      </div>

                                      {/* Home Value Filter */}
                                      <div>
                                        <Label className="text-sm font-medium">
                                          Home Value: {formatCurrency(homeValueRange[0])} - {formatCurrency(homeValueRange[1])}
                                        </Label>
                                        <Slider
                                          min={0}
                                          max={maxHomeValue}
                                          step={Math.max(5000, Math.floor(maxHomeValue / 100))}
                                          value={homeValueRange}
                                          onValueChange={setHomeValueRange}
                                          className="mt-2"
                                        />
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>

                              {/* Cities Grid */}
                              {filteredCities.length === 0 ? (
                                <div className="text-center py-8 text-slate-600">
                                  {cities.length === 0 ? 'No cities found in this county' : 'No cities match the current filters'}
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {filteredCities.map((city) => (
                                    <div 
                                      key={city.id} 
                                      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                                    >
                                      <h4 className="font-medium text-slate-900 mb-2">{city.city}</h4>
                                      <div className="space-y-1 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-3 w-3" />
                                          <span>Pop: {formatNumber(city.population)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <DollarSign className="h-3 w-3" />
                                          <span>Income: {formatCurrency(city.income_household_median)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Home className="h-3 w-3" />
                                          <span>Home: {formatCurrency(city.home_value)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <GraduationCap className="h-3 w-3" />
                                          <span>Education: {city.education_bachelors ? `${city.education_bachelors.toFixed(1)}%` : 'N/A'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CountyCitiesTable;