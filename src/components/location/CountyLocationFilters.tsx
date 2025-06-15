import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, MapPin, Settings, X, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CityAutocomplete from './CityAutocomplete';

interface CountyLocationFiltersProps {
  onSearchResults: (results: any[], centerCoords: {lat: number; lng: number} | null) => void;
  onListSaved: () => void;
}

interface FilterState {
  centerZipCode: string;
  centerCoords: { lat: number; lng: number } | null;
  radiusMiles: number;
  minPopulation: number;
  maxPopulation: number;
  minMedianAge: number;
  maxMedianAge: number;
  minHouseholdIncome: number;
  maxHouseholdIncome: number;
  minHomeValue: number;
  maxHomeValue: number;
  homeOwnershipMin: number;
  homeOwnershipMax: number;
  selectedStates: string[];
}

const US_STATES = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' }
];

const CountyLocationFilters: React.FC<CountyLocationFiltersProps> = ({ onSearchResults, onListSaved }) => {
  const [filters, setFilters] = useState<FilterState>({
    centerZipCode: '',
    centerCoords: null,
    radiusMiles: 50,
    minPopulation: 1,
    maxPopulation: 10000000,
    minMedianAge: 18,
    maxMedianAge: 85,
    minHouseholdIncome: 0,
    maxHouseholdIncome: 500000,
    minHomeValue: 0,
    maxHomeValue: 2000000,
    homeOwnershipMin: 0,
    homeOwnershipMax: 100,
    selectedStates: [],
  });

  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [hasInitialSearch, setHasInitialSearch] = useState(false);
  const [allCountiesInRadius, setAllCountiesInRadius] = useState<any[]>([]);
  const { toast } = useToast();

  // Auto-search when radius changes
  useEffect(() => {
    if (hasInitialSearch && filters.centerZipCode.trim() && filters.centerCoords) {
      const debounceTimer = setTimeout(() => {
        searchCounties();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [filters.radiusMiles, hasInitialSearch]);

  const normalizeValue = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 0 : num;
  };

  const handleZipCodeSelect = (place: { city: string; state: string; country: string; lat: number; lng: number }) => {
    console.log('ZIP code processed:', place);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const addState = (stateId: string) => {
    if (!filters.selectedStates.includes(stateId)) {
      setFilters(prev => ({
        ...prev,
        selectedStates: [...prev.selectedStates, stateId]
      }));
    }
    setShowStateDropdown(false);
  };

  const removeState = (stateId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedStates: prev.selectedStates.filter(id => id !== stateId)
    }));
  };

  const aggregateCountyData = (cities: any[]) => {
    const countiesByName = new Map();
    
    cities.forEach(city => {
      const countyName = city.county_name;
      if (!countyName) return;
      
      if (!countiesByName.has(countyName)) {
        countiesByName.set(countyName, {
          county_name: countyName,
          state_name: city.state_name,
          state_id: city.state_id,
          cities: [],
          total_population: 0,
          total_housing_units: 0,
          center_lat: 0,
          center_lng: 0,
          distances: []
        });
      }
      
      const county = countiesByName.get(countyName);
      county.cities.push(city);
      county.total_population += normalizeValue(city.population);
      county.total_housing_units += normalizeValue(city.housing_units);
      county.distances.push(city.distance_miles);
    });

    // Calculate averages and center coordinates for each county
    const countyResults = Array.from(countiesByName.values()).map(county => {
      const cityCount = county.cities.length;
      
      // Calculate center coordinates (average of all cities in county)
      county.center_lat = county.cities.reduce((sum: number, city: any) => sum + city.latitude, 0) / cityCount;
      county.center_lng = county.cities.reduce((sum: number, city: any) => sum + city.longitude, 0) / cityCount;
      
      // Calculate distance from search center to county center
      const distance_miles = filters.centerCoords ? 
        calculateDistance(filters.centerCoords.lat, filters.centerCoords.lng, county.center_lat, county.center_lng) : 0;
      
      // Calculate weighted averages for demographic data
      const totalPop = county.total_population;
      
      let avg_age_median = 0;
      let avg_income_household_median = 0;
      let avg_home_value = 0;
      let avg_home_ownership = 0;
      
      if (totalPop > 0) {
        avg_age_median = county.cities.reduce((sum: number, city: any) => {
          const pop = normalizeValue(city.population);
          const age = normalizeValue(city.age_median);
          return sum + (age * pop);
        }, 0) / totalPop;
        
        avg_income_household_median = county.cities.reduce((sum: number, city: any) => {
          const pop = normalizeValue(city.population);
          const income = normalizeValue(city.income_household_median);
          return sum + (income * pop);
        }, 0) / totalPop;
        
        avg_home_value = county.cities.reduce((sum: number, city: any) => {
          const pop = normalizeValue(city.population);
          const value = normalizeValue(city.home_value);
          return sum + (value * pop);
        }, 0) / totalPop;
        
        avg_home_ownership = county.cities.reduce((sum: number, city: any) => {
          const pop = normalizeValue(city.population);
          const ownership = normalizeValue(city.home_ownership);
          return sum + (ownership * pop);
        }, 0) / totalPop;
      }
      
      return {
        county_name: county.county_name,
        state_name: county.state_name,
        state_id: county.state_id,
        city_count: cityCount,
        total_population: county.total_population,
        total_housing_units: county.total_housing_units,
        avg_age_median: Math.round(avg_age_median * 10) / 10,
        avg_income_household_median: Math.round(avg_income_household_median),
        avg_home_value: Math.round(avg_home_value),
        avg_home_ownership: Math.round(avg_home_ownership * 10) / 10,
        center_lat: county.center_lat,
        center_lng: county.center_lng,
        distance_miles,
        cities: county.cities,
        // Add timezone (simplified - using the first city's state to determine timezone)
        timezone: getTimezoneForState(county.state_id)
      };
    });

    return countyResults.sort((a, b) => a.distance_miles - b.distance_miles);
  };

  const getTimezoneForState = (stateId: string): string => {
    const timezones: { [key: string]: string } = {
      'CA': 'Pacific',
      'NY': 'Eastern', 
      'TX': 'Central',
      'FL': 'Eastern',
      'IL': 'Central',
      'PA': 'Eastern',
      'OH': 'Eastern',
      'GA': 'Eastern',
      'NC': 'Eastern',
      'MI': 'Eastern',
      'NJ': 'Eastern',
      'VA': 'Eastern',
      'WA': 'Pacific',
      'AZ': 'Mountain',
      'MA': 'Eastern',
      'TN': 'Eastern',
      'IN': 'Eastern',
      'MO': 'Central',
      'MD': 'Eastern',
      'WI': 'Central',
      'CO': 'Mountain',
      'MN': 'Central',
      'SC': 'Eastern',
      'AL': 'Central',
      'LA': 'Central',
      'KY': 'Eastern',
      'OR': 'Pacific',
      'OK': 'Central',
      'CT': 'Eastern',
      'UT': 'Mountain',
      'IA': 'Central',
      'NV': 'Pacific',
      'AR': 'Central',
      'MS': 'Central',
      'KS': 'Central',
      'NM': 'Mountain',
      'NE': 'Central',
      'WV': 'Eastern',
      'ID': 'Mountain',
      'HI': 'Hawaii',
      'NH': 'Eastern',
      'ME': 'Eastern',
      'MT': 'Mountain',
      'RI': 'Eastern',
      'DE': 'Eastern',
      'SD': 'Central',
      'ND': 'Central',
      'AK': 'Alaska',
      'VT': 'Eastern',
      'WY': 'Mountain'
    };
    
    return timezones[stateId] || 'Unknown';
  };

  const applyFiltersToResults = (counties: any[]) => {
    console.log('Applying filters to counties:', counties.length);
    
    const filteredResults = counties.filter(county => {
      // Population filter
      const withinPopulation = county.total_population >= filters.minPopulation && county.total_population <= filters.maxPopulation;
      
      // Age filter
      const withinAge = county.avg_age_median === 0 || (county.avg_age_median >= filters.minMedianAge && county.avg_age_median <= filters.maxMedianAge);
      
      // Income filter
      const withinIncome = county.avg_income_household_median === 0 || (county.avg_income_household_median >= filters.minHouseholdIncome && county.avg_income_household_median <= filters.maxHouseholdIncome);
      
      // Home value filter
      const withinHomeValue = county.avg_home_value === 0 || (county.avg_home_value >= filters.minHomeValue && county.avg_home_value <= filters.maxHomeValue);
      
      // Home ownership filter
      const withinHomeOwnership = county.avg_home_ownership === 0 || (county.avg_home_ownership >= filters.homeOwnershipMin && county.avg_home_ownership <= filters.homeOwnershipMax);
      
      // State filter
      const withinStates = filters.selectedStates.length === 0 || filters.selectedStates.includes(county.state_id);
      
      return withinPopulation && withinAge && withinIncome && withinHomeValue && withinHomeOwnership && withinStates;
    });

    console.log(`Filter results: ${filteredResults.length} counties out of ${counties.length} total`);
    return filteredResults;
  };

  const searchCounties = async () => {
    if (!filters.centerZipCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ZIP code",
        variant: "destructive",
      });
      return;
    }

    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(filters.centerZipCode.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid ZIP code (e.g., 30309 or 30309-1234)",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log('Looking up ZIP code in database:', filters.centerZipCode);
      const { data: zipData, error: zipError } = await supabase
        .from('location_data' as any)
        .select('city, state_name, latitude, longitude, postal_code')
        .eq('postal_code', filters.centerZipCode.trim())
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(1);

      if (zipError) {
        console.error('Error finding ZIP code:', zipError);
        throw zipError;
      }

      if (!zipData || zipData.length === 0) {
        toast({
          title: "Not Found",
          description: "ZIP code not found in our database. Please try a different ZIP code.",
          variant: "destructive",
        });
        onSearchResults([], null);
        return;
      }

      const centerLocation = zipData[0];
      const centerCoords = { lat: centerLocation.latitude, lng: centerLocation.longitude };
      console.log('Found center coordinates for ZIP code:', centerCoords);

      setFilters(prev => ({ ...prev, centerCoords }));

      // Use a simpler approach for the radius search
      const { data: locationsData, error: locationsError } = await supabase
        .from('location_data' as any)
        .select('*')
        .gte('latitude', centerCoords.lat - (filters.radiusMiles / 69))
        .lte('latitude', centerCoords.lat + (filters.radiusMiles / 69))
        .gte('longitude', centerCoords.lng - (filters.radiusMiles / 69))
        .lte('longitude', centerCoords.lng + (filters.radiusMiles / 69))
        .gt('population', 0);

      if (locationsError) {
        console.error('Error searching cities within radius:', locationsError);
        throw locationsError;
      }

      if (!locationsData || locationsData.length === 0) {
        toast({
          title: "No Results",
          description: `No cities found within ${filters.radiusMiles} miles of this ZIP code.`,
        });
        onSearchResults([], centerCoords);
        setAllCountiesInRadius([]);
        return;
      }

      const allCitiesProcessed = (locationsData || [])
        .map((location: any) => {
          const distance = calculateDistance(
            centerCoords.lat,
            centerCoords.lng,
            location.latitude,
            location.longitude
          );
          
          const population = normalizeValue(location.population);
          
          return {
            id: location.id,
            city: location.city,
            state_name: location.state_name,
            state_id: location.state_id,
            county_name: location.county_name,
            postal_code: location.postal_code,
            latitude: location.latitude,
            longitude: location.longitude,
            distance_miles: distance,
            population: population,
            age_median: normalizeValue(location.age_median),
            income_household_median: normalizeValue(location.income_household_median),
            housing_units: normalizeValue(location.housing_units),
            home_value: normalizeValue(location.home_value),
            home_ownership: normalizeValue(location.home_ownership),
            veteran: normalizeValue(location.veteran)
          };
        })
        .filter((location: any) => location.distance_miles <= filters.radiusMiles && location.population >= 1)
        .sort((a: any, b: any) => a.distance_miles - b.distance_miles);

      console.log(`All cities in radius: ${allCitiesProcessed.length} cities`);
      
      // Aggregate cities into counties
      const countyResults = aggregateCountyData(allCitiesProcessed);
      console.log(`Aggregated into ${countyResults.length} counties`);
      
      setAllCountiesInRadius(countyResults);
      
      // Apply filters to get final results
      const filteredResults = applyFiltersToResults(countyResults);
      console.log('Sending filtered county results to map and results:', filteredResults.length);
      onSearchResults(filteredResults, centerCoords);
      
      if (!hasInitialSearch) {
        setHasInitialSearch(true);
        toast({
          title: "Search Complete",
          description: `Found ${filteredResults.length} counties within ${filters.radiusMiles} miles`,
        });
      }

      const statesInResults = [...new Set(countyResults.map(county => county.state_id))];
      if (filters.selectedStates.length === 0) {
        setFilters(prev => ({ ...prev, selectedStates: statesInResults }));
      }

    } catch (error) {
      console.error('Error searching counties:', error);
      toast({
        title: "Error",
        description: "Failed to search counties. Please try again.",
        variant: "destructive",
      });
      onSearchResults([], null);
      setAllCountiesInRadius([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInitialSearch = () => {
    setHasInitialSearch(false);
    searchCounties();
  };

  const handleUpdateFilters = () => {
    console.log('Update filters button clicked');
    
    if (hasInitialSearch && allCountiesInRadius.length > 0 && filters.centerCoords) {
      const filteredResults = applyFiltersToResults(allCountiesInRadius);
      console.log('Updating filters - sending filtered county results:', filteredResults.length);
      onSearchResults(filteredResults, filters.centerCoords);
      toast({
        title: "Filters Updated",
        description: `Search results updated: ${filteredResults.length} counties match your criteria`,
      });
    } else {
      toast({
        title: "No Data",
        description: "Please perform a search first before applying filters",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      {/* Main search bar with radius */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-28 relative">
          <CityAutocomplete
            value={filters.centerZipCode}
            onChange={(value) => setFilters(prev => ({ ...prev, centerZipCode: value }))}
            onPlaceSelect={handleZipCodeSelect}
          />
        </div>
        
        <div className="flex-1">
          <Label className="text-sm text-gray-600 mb-3 block">
            Search Radius: {filters.radiusMiles} miles
          </Label>
          <div className="px-2">
            <Slider
              value={[filters.radiusMiles]}
              onValueChange={(value) => {
                console.log('Slider value changed to:', value[0]);
                setFilters(prev => ({ ...prev, radiusMiles: value[0] }));
              }}
              max={3500}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <Button 
          onClick={handleInitialSearch} 
          disabled={isSearching}
          className="px-6"
        >
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? 'Searching...' : 'Search'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Settings className="h-4 w-4 mr-1" />
          Filters
        </Button>
      </div>

      {/* Advanced filters - same structure as city version but with county-appropriate labels */}
      {showAdvanced && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Population Range */}
              <div>
                <Label className="text-sm mb-3 block">
                  County Population: {filters.minPopulation.toLocaleString()} - {filters.maxPopulation.toLocaleString()}
                </Label>
                <Slider
                  value={[filters.minPopulation, filters.maxPopulation]}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    minPopulation: Math.max(1, value[0]),
                    maxPopulation: value[1] 
                  }))}
                  max={10000000}
                  min={1}
                  step={1000}
                  className="w-full"
                />
              </div>

              {/* Average Age Range */}
              <div>
                <Label className="text-sm mb-3 block">
                  Average Age: {filters.minMedianAge} - {filters.maxMedianAge}
                </Label>
                <Slider
                  value={[filters.minMedianAge, filters.maxMedianAge]}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    minMedianAge: value[0], 
                    maxMedianAge: value[1] 
                  }))}
                  max={85}
                  min={18}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Average Household Income Range */}
              <div>
                <Label className="text-sm mb-3 block">
                  Average Income: ${filters.minHouseholdIncome.toLocaleString()} - ${filters.maxHouseholdIncome.toLocaleString()}
                </Label>
                <Slider
                  value={[filters.minHouseholdIncome, filters.maxHouseholdIncome]}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    minHouseholdIncome: value[0], 
                    maxHouseholdIncome: value[1] 
                  }))}
                  max={500000}
                  min={0}
                  step={5000}
                  className="w-full"
                />
              </div>

              {/* Average Home Value Range */}
              <div>
                <Label className="text-sm mb-3 block">
                  Average Home Value: ${filters.minHomeValue.toLocaleString()} - ${filters.maxHomeValue.toLocaleString()}
                </Label>
                <Slider
                  value={[filters.minHomeValue, filters.maxHomeValue]}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    minHomeValue: value[0], 
                    maxHomeValue: value[1] 
                  }))}
                  max={2000000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
              </div>

              {/* Average Home Ownership Percentage */}
              <div>
                <Label className="text-sm mb-3 block">
                  Average Home Ownership: {filters.homeOwnershipMin}% - {filters.homeOwnershipMax}%
                </Label>
                <Slider
                  value={[filters.homeOwnershipMin, filters.homeOwnershipMax]}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    homeOwnershipMin: value[0], 
                    homeOwnershipMax: value[1] 
                  }))}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* State Filter with Tags */}
              <div className="col-span-full">
                <Label className="text-sm mb-3 block">States</Label>
                <div className="space-y-2">
                  {filters.selectedStates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {filters.selectedStates.map(stateId => {
                        const state = US_STATES.find(s => s.id === stateId);
                        return (
                          <Badge key={stateId} variant="secondary" className="flex items-center gap-1">
                            {state?.name}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-red-500" 
                              onClick={() => removeState(stateId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStateDropdown(!showStateDropdown)}
                      className="text-sm"
                    >
                      Add State
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                    
                    {showStateDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {US_STATES
                          .filter(state => !filters.selectedStates.includes(state.id))
                          .map(state => (
                            <button
                              key={state.id}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                              onClick={() => addState(state.id)}
                            >
                              {state.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Update Filters Button */}
            <div className="flex justify-center pt-4 border-t">
              <Button 
                onClick={handleUpdateFilters}
                disabled={!hasInitialSearch || allCountiesInRadius.length === 0}
                className="px-8"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CountyLocationFilters;
