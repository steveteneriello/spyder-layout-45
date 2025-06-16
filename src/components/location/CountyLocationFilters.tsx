import React, { useState } from 'react';
import { Search, MapPin, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CityAutocomplete from "./CityAutocomplete";

interface CountyLocationFiltersProps {
  onSearchResults: (results: any[], coords: {lat: number; lng: number} | null) => void;
  onListSaved: () => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const US_TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'Pacific/Honolulu', 'America/Phoenix'
];

const CountyLocationFilters: React.FC<CountyLocationFiltersProps> = ({ 
  onSearchResults, 
  onListSaved 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCoords, setSearchCoords] = useState<{lat: number; lng: number} | null>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const handlePlaceSelect = (place: { city: string; state: string; country: string; lat: number; lng: number }) => {
    console.log('Place selected:', place);
    setSearchCoords({ lat: place.lat, lng: place.lng });
    setSearchValue(`${place.city}, ${place.state}`);
  };

  const handleStateChange = (state: string, checked: boolean) => {
    setSelectedStates(prev => 
      checked ? [...prev, state] : prev.filter(s => s !== state)
    );
  };

  const handleTimezoneChange = (timezone: string, checked: boolean) => {
    setSelectedTimezones(prev => 
      checked ? [...prev, timezone] : prev.filter(t => t !== timezone)
    );
  };

  const clearAllFilters = () => {
    setSelectedStates([]);
    setSelectedTimezones([]);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a city or ZIP code to search",
        variant: "destructive",
      });
      return;
    }

    if (!searchCoords) {
      toast({
        title: "Location Required",
        description: "Please select a valid location from the autocomplete",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 Starting improved county search');
      console.log('Search coordinates:', searchCoords);
      console.log('Radius:', radiusMiles, 'miles');
      console.log('State filters:', selectedStates);
      console.log('Timezone filters:', selectedTimezones);
      
      // Skip PostGIS and go directly to the reliable fallback method
      console.log('🔄 Using JavaScript distance calculation (reliable method)...');
      
      const fallbackResults = await performFallbackSearch();
      onSearchResults(fallbackResults, searchCoords);
      
      if (fallbackResults.length > 0) {
        toast({
          title: "Search Complete",
          description: `Found ${fallbackResults.length} counties within ${radiusMiles} miles`,
        });
      } else {
        toast({
          title: "No Results",
          description: `No counties found within ${radiusMiles} miles`,
        });
      }

    } catch (error) {
      console.error('💥 Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for counties. Please try again.",
        variant: "destructive",
      });
      onSearchResults([], searchCoords);
    } finally {
      setIsSearching(false);
    }
  };

  // Optimized search function that handles large radius searches efficiently
  const performFallbackSearch = async () => {
    console.log('🔄 Performing optimized JavaScript distance search');
    console.log(`📏 Search radius: ${radiusMiles} miles ${radiusMiles > 500 ? '(LARGE SEARCH)' : '(STANDARD SEARCH)'}`);
    
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 3959; // Radius of the Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // For large searches, use a different strategy
    if (radiusMiles > 500) {
      return await performLargeRadiusSearch(calculateDistance);
    }

    // Standard search for smaller radius
    return await performStandardSearch(calculateDistance);
  };

  // Optimized search for large radius (500+ miles)
  const performLargeRadiusSearch = async (calculateDistance: Function) => {
    console.log('🌍 Performing LARGE RADIUS search - using county-first approach');
    
    try {
      // Step 1: Get unique counties with their centroids first
      let query = supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
          centroid_latitude,
          centroid_longitude,
          timezone
        `)
        .not('county_name', 'is', null)
        .not('centroid_latitude', 'is', null)
        .not('centroid_longitude', 'is', null);

      // Apply filters early to reduce data
      if (selectedStates.length > 0) {
        query = query.in('state_name', selectedStates);
        console.log('🏛️ State filter applied:', selectedStates);
      }

      if (selectedTimezones.length > 0) {
        query = query.in('timezone', selectedTimezones);
        console.log('🕐 Timezone filter applied:', selectedTimezones);
      }

      console.log('🗄️ Fetching unique counties...');
      const { data: countyData, error: countyError } = await query
        .select('county_name, state_name, centroid_latitude, centroid_longitude, timezone')
        .group('county_name, state_name, centroid_latitude, centroid_longitude, timezone');

      if (countyError) {
        console.error('❌ County query error:', countyError);
        // Fallback to distinct approach
        const { data: allData, error: allError } = await query;
        if (allError) throw allError;
        
        // Create unique counties map
        const uniqueCounties = new Map();
        allData?.forEach(record => {
          const key = `${record.county_name}-${record.state_name}`;
          if (!uniqueCounties.has(key)) {
            uniqueCounties.set(key, record);
          }
        });
        
        console.log('📊 Using fallback distinct approach, unique counties:', uniqueCounties.size);
        const countyArray = Array.from(uniqueCounties.values());
        return await processCountiesWithDistance(countyArray, calculateDistance);
      }

      console.log('📊 Unique counties fetched:', countyData?.length || 0);
      return await processCountiesWithDistance(countyData || [], calculateDistance);

    } catch (error) {
      console.error('💥 Large radius search error:', error);
      throw error;
    }
  };

  // Standard search for smaller radius (under 500 miles)
  const performStandardSearch = async (calculateDistance: Function) => {
    console.log('🎯 Performing STANDARD RADIUS search');
    
    // Calculate a reasonable bounding box for smaller searches
    const latDelta = Math.min(radiusMiles / 69 * 1.5, 20); // Cap at 20 degrees
    const lngDelta = Math.min(radiusMiles / (69 * Math.cos(searchCoords!.lat * Math.PI / 180)) * 1.5, 30); // Cap at 30 degrees
    
    const minLat = searchCoords!.lat - latDelta;
    const maxLat = searchCoords!.lat + latDelta;
    const minLng = searchCoords!.lng - lngDelta;
    const maxLng = searchCoords!.lng + lngDelta;

    console.log('📦 Standard bounding box:', { 
      center: searchCoords,
      bounds: { minLat, maxLat, minLng, maxLng },
      deltas: { latDelta, lngDelta }
    });

    // Build the query with bounding box
    let query = supabase
      .from('location_data')
      .select(`
        county_name,
        state_name,
        centroid_latitude,
        centroid_longitude,
        timezone,
        city,
        population,
        income_household_median,
        home_value,
        age_median,
        education_bachelors,
        race_white,
        race_black,
        race_asian,
        hispanic
      `)
      .not('county_name', 'is', null)
      .not('centroid_latitude', 'is', null)
      .not('centroid_longitude', 'is', null)
      .not('city', 'is', null)
      .gte('centroid_latitude', minLat)
      .lte('centroid_latitude', maxLat)
      .gte('centroid_longitude', minLng)
      .lte('centroid_longitude', maxLng);

    // Apply additional filters
    if (selectedStates.length > 0) {
      query = query.in('state_name', selectedStates);
    }
    if (selectedTimezones.length > 0) {
      query = query.in('timezone', selectedTimezones);
    }

    console.log('🗄️ Executing standard search query...');
    const { data: locationData, error } = await query;

    if (error) throw error;

    console.log('📊 Standard search raw results:', locationData?.length || 0, 'records');

    if (!locationData || locationData.length === 0) {
      return [];
    }

    return await processLocationDataWithAggregation(locationData, calculateDistance);
  };

  // Process counties and calculate distances (for large radius searches)
  const processCountiesWithDistance = async (counties: any[], calculateDistance: Function) => {
    console.log('⚡ Processing counties with distance calculation...');
    
    const results = [];
    let processedCount = 0;
    
    for (const county of counties) {
      const countyLat = parseFloat(county.centroid_latitude);
      const countyLng = parseFloat(county.centroid_longitude);
      
      if (isNaN(countyLat) || isNaN(countyLng)) continue;

      const distance = calculateDistance(
        searchCoords!.lat,
        searchCoords!.lng,
        countyLat,
        countyLng
      );

      if (distance <= radiusMiles) {
        // For large searches, get city count separately to avoid loading all city data
        const { count: cityCount } = await supabase
          .from('location_data')
          .select('*', { count: 'exact', head: true })
          .eq('county_name', county.county_name)
          .eq('state_name', county.state_name)
          .not('city', 'is', null);

        results.push({
          id: `${county.county_name}-${county.state_name}`,
          county_name: county.county_name,
          state_name: county.state_name,
          center_lat: countyLat,
          center_lng: countyLng,
          distance_miles: Math.round(distance * 10) / 10,
          city_count: cityCount || 0,
          total_population: 0, // Will be filled if needed
          avg_income_household_median: 0,
          avg_home_value: 0,
          avg_age_median: 0,
          education_bachelors_pct: 0,
          race_white_pct: 0,
          race_black_pct: 0,
          race_asian_pct: 0,
          race_hispanic_pct: 0,
          timezone: county.timezone
        });

        processedCount++;
        
        // Log progress for large searches
        if (processedCount % 50 === 0) {
          console.log(`📈 Processed ${processedCount} counties, found ${results.length} within radius`);
        }
      }
    }

    // Sort by distance
    results.sort((a, b) => a.distance_miles - b.distance_miles);
    
    console.log(`✅ Large radius search complete: ${results.length} counties found`);
    return results;
  };

  // Process location data with aggregation (for standard searches)
  const processLocationDataWithAggregation = async (locationData: any[], calculateDistance: Function) => {
    console.log('📊 Processing location data with aggregation...');
    
    const countyMap = new Map();
    let distanceCalculations = 0;
    
    locationData.forEach(location => {
      const countyKey = `${location.county_name}-${location.state_name}`;
      
      const countyLat = parseFloat(location.centroid_latitude);
      const countyLng = parseFloat(location.centroid_longitude);
      
      if (isNaN(countyLat) || isNaN(countyLng)) return;

      const distance = calculateDistance(
        searchCoords!.lat,
        searchCoords!.lng,
        countyLat,
        countyLng
      );
      distanceCalculations++;

      if (distance <= radiusMiles) {
        if (!countyMap.has(countyKey)) {
          countyMap.set(countyKey, {
            id: countyKey,
            county_name: location.county_name,
            state_name: location.state_name,
            center_lat: countyLat,
            center_lng: countyLng,
            distance_miles: Math.round(distance * 10) / 10,
            timezone: location.timezone,
            cities: new Set(),
            populations: [],
            incomes: [],
            homeValues: [],
            ages: [],
            educations: [],
            races: { white: [], black: [], asian: [], hispanic: [] }
          });
        }
        
        const county = countyMap.get(countyKey);
        county.cities.add(location.city);
        
        // Collect numeric data for averaging
        const parseNumber = (value: any) => {
          if (!value) return null;
          const cleaned = value.toString().replace(/[,%$]/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? null : num;
        };

        const pop = parseNumber(location.population);
        const inc = parseNumber(location.income_household_median);
        const home = parseNumber(location.home_value);
        const age = parseNumber(location.age_median);
        const edu = parseNumber(location.education_bachelors);
        const raceW = parseNumber(location.race_white);
        const raceB = parseNumber(location.race_black);
        const raceA = parseNumber(location.race_asian);
        const raceH = parseNumber(location.hispanic);

        if (pop !== null) county.populations.push(pop);
        if (inc !== null) county.incomes.push(inc);
        if (home !== null) county.homeValues.push(home);
        if (age !== null) county.ages.push(age);
        if (edu !== null) county.educations.push(edu);
        if (raceW !== null) county.races.white.push(raceW);
        if (raceB !== null) county.races.black.push(raceB);
        if (raceA !== null) county.races.asian.push(raceA);
        if (raceH !== null) county.races.hispanic.push(raceH);

        if (distance < county.distance_miles) {
          county.distance_miles = Math.round(distance * 10) / 10;
        }
      }
    });

    console.log(`📊 Aggregation stats: ${distanceCalculations} distance calculations, ${countyMap.size} unique counties`);

    // Convert to results format
    const results = Array.from(countyMap.values()).map(county => {
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

      return {
        id: county.id,
        county_name: county.county_name,
        state_name: county.state_name,
        center_lat: county.center_lat,
        center_lng: county.center_lng,
        distance_miles: county.distance_miles,
        city_count: county.cities.size,
        total_population: sum(county.populations),
        avg_income_household_median: avg(county.incomes),
        avg_home_value: avg(county.homeValues),
        avg_age_median: avg(county.ages),
        education_bachelors_pct: avg(county.educations),
        race_white_pct: avg(county.races.white),
        race_black_pct: avg(county.races.black),
        race_asian_pct: avg(county.races.asian),
        race_hispanic_pct: avg(county.races.hispanic),
        timezone: county.timezone
      };
    });

    results.sort((a, b) => a.distance_miles - b.distance_miles);
    return results;
  };

  const activeFiltersCount = selectedStates.length + selectedTimezones.length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <div className="flex items-center space-x-6">
        <div className="flex-1">
          <CityAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onPlaceSelect={handlePlaceSelect}
          />
        </div>
        
        <div className="w-64">
          <Label htmlFor="radius" className="text-sm font-medium text-slate-700 mb-3 block">
            Radius: {radiusMiles} miles
          </Label>
          <div className="flex items-center justify-center py-2">
            <Slider
              id="radius"
              min={1}
              max={3000}
              step={1}
              value={[radiusMiles]}
              onValueChange={(value) => setRadiusMiles(value[0])}
              className="w-full"
            />
          </div>
        </div>

        {/* Filter Button */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="relative border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 bg-white border border-slate-200 shadow-lg" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Search Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* States Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">States</Label>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {US_STATES.map((state) => (
                      <div key={state} className="flex items-center space-x-2">
                        <Checkbox
                          id={`state-${state}`}
                          checked={selectedStates.includes(state)}
                          onCheckedChange={(checked) => handleStateChange(state, !!checked)}
                        />
                        <label 
                          htmlFor={`state-${state}`}
                          className="text-xs text-slate-600 cursor-pointer"
                        >
                          {state}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedStates.length > 0 && (
                  <p className="text-xs text-slate-500">
                    {selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Timezones Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Time Zones</Label>
                <div className="space-y-1">
                  {US_TIMEZONES.map((timezone) => (
                    <div key={timezone} className="flex items-center space-x-2">
                      <Checkbox
                        id={`timezone-${timezone}`}
                        checked={selectedTimezones.includes(timezone)}
                        onCheckedChange={(checked) => handleTimezoneChange(timezone, !!checked)}
                      />
                      <label 
                        htmlFor={`timezone-${timezone}`}
                        className="text-sm text-slate-600 cursor-pointer"
                      >
                        {timezone.replace('America/', '').replace('Pacific/', '').replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedTimezones.length > 0 && (
                  <p className="text-xs text-slate-500">
                    {selectedTimezones.length} timezone{selectedTimezones.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CountyLocationFilters;