import React, { useState } from 'react';
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
    console.log('🎯 Place selected:', place);
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
      console.log('🔍 Starting county search with actual data structure');
      console.log('📍 Search coordinates:', searchCoords);
      console.log('🎯 Radius:', radiusMiles, 'miles');
      console.log('🏛️ State filters:', selectedStates);
      console.log('🕐 Timezone filters:', selectedTimezones);

      // For large searches, get data in chunks to avoid timeouts
      const isLargeSearch = radiusMiles > 500;
      const chunkSize = isLargeSearch ? 3000 : 10000;

      console.log(`📦 Search strategy: ${isLargeSearch ? 'LARGE' : 'STANDARD'} (chunk size: ${chunkSize})`);

      // Build base query
      let query = supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
          centroid_latitude,
          centroid_longitude,
          latitude,
          longitude,
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
        .not('city', 'is', null);

      // For large searches, use more restrictive filtering upfront
      if (isLargeSearch) {
        // Use state filter to reduce dataset for large searches
        if (selectedStates.length > 0) {
          query = query.in('state_name', selectedStates);
          console.log('🏛️ Applied state filter for large search:', selectedStates);
        } else {
          // If no state filter for large search, use a reasonable geographic bound
          const latDelta = Math.min(radiusMiles / 69, 25); // Cap at 25 degrees
          const lngDelta = Math.min(radiusMiles / (69 * Math.cos(searchCoords.lat * Math.PI / 180)), 35);
          
          query = query
            .not('centroid_latitude', 'is', null)
            .not('centroid_longitude', 'is', null)
            .gte('centroid_latitude', searchCoords.lat - latDelta)
            .lte('centroid_latitude', searchCoords.lat + latDelta)
            .gte('centroid_longitude', searchCoords.lng - lngDelta)
            .lte('centroid_longitude', searchCoords.lng + lngDelta);
        }
      } else {
        // For standard searches, use bounding box
        const latDelta = radiusMiles / 69 * 1.5; // 1.5x buffer
        const lngDelta = radiusMiles / (69 * Math.cos(searchCoords.lat * Math.PI / 180)) * 1.5;
        
        query = query
          .not('centroid_latitude', 'is', null)
          .not('centroid_longitude', 'is', null)
          .gte('centroid_latitude', searchCoords.lat - latDelta)
          .lte('centroid_latitude', searchCoords.lat + latDelta)
          .gte('centroid_longitude', searchCoords.lng - lngDelta)
          .lte('centroid_longitude', searchCoords.lng + lngDelta);
      }

      // Apply additional filters
      if (selectedTimezones.length > 0) {
        query = query.in('timezone', selectedTimezones);
        console.log('🕐 Applied timezone filter:', selectedTimezones);
      }

      // Limit records
      query = query.limit(chunkSize);

      console.log(`🗄️ Executing query (limit: ${chunkSize})...`);
      const { data: locationData, error } = await query;

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('📊 Raw database results:', locationData?.length || 0, 'records');

      if (!locationData || locationData.length === 0) {
        console.log('📭 No location data found');
        onSearchResults([], searchCoords);
        toast({
          title: "No Results",
          description: `No data found. Try a different location or increase radius.`,
        });
        return;
      }

      // Process the data and group by county
      const countyMap = new Map();
      let processedCount = 0;
      let countiesWithinRadius = 0;

      console.log('⚡ Processing location data and calculating distances...');

      locationData.forEach(location => {
        const countyKey = `${location.county_name}-${location.state_name}`;
        
        // Use centroid coordinates (they should be populated based on CSV)
        const countyLat = location.centroid_latitude;
        const countyLng = location.centroid_longitude;
        
        // Fallback to regular coordinates if centroid is missing
        const lat = countyLat !== null ? countyLat : location.latitude;
        const lng = countyLng !== null ? countyLng : location.longitude;
        
        if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
          console.log('⚠️ Skipping record with missing coordinates:', location.city, location.county_name);
          return;
        }

        processedCount++;

        // Calculate distance
        const distance = calculateDistance(
          searchCoords.lat,
          searchCoords.lng,
          lat,
          lng
        );

        // Debug: Log first few distance calculations
        if (processedCount <= 5) {
          console.log(`📏 Distance calc ${processedCount}:`, {
            city: location.city,
            county: location.county_name,
            coords: { lat, lng },
            distance: distance.toFixed(1)
          });
        }

        // Only include counties within the search radius
        if (distance <= radiusMiles) {
          if (!countyMap.has(countyKey)) {
            countiesWithinRadius++;
            
            countyMap.set(countyKey, {
              id: countyKey,
              county_name: location.county_name,
              state_name: location.state_name,
              center_lat: lat,
              center_lng: lng,
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
          
          // Update distance if this is closer
          if (distance < county.distance_miles) {
            county.distance_miles = Math.round(distance * 10) / 10;
          }

          // Since the data is properly typed, we can use values directly
          if (location.population) county.populations.push(location.population);
          if (location.income_household_median) county.incomes.push(location.income_household_median);
          if (location.home_value) county.homeValues.push(location.home_value);
          if (location.age_median) county.ages.push(location.age_median);
          if (location.education_bachelors) county.educations.push(parseFloat(location.education_bachelors) || 0);
          
          // Handle race data (might be strings with percentages)
          const parseRaceValue = (value: any) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              const cleaned = value.replace(/[%]/g, '');
              const num = parseFloat(cleaned);
              return isNaN(num) ? 0 : num;
            }
            return 0;
          };

          county.races.white.push(parseRaceValue(location.race_white));
          county.races.black.push(parseRaceValue(location.race_black));
          county.races.asian.push(parseRaceValue(location.race_asian));
          county.races.hispanic.push(parseRaceValue(location.hispanic));
        }

        // Progress logging
        if (processedCount % 1000 === 0) {
          console.log(`📈 Processed ${processedCount}/${locationData.length}, found ${countyMap.size} counties within radius`);
        }
      });

      console.log(`📊 Processing complete:`, {
        totalRecords: locationData.length,
        processedRecords: processedCount,
        countiesWithinRadius,
        uniqueCounties: countyMap.size
      });

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

      // Sort by distance
      results.sort((a, b) => a.distance_miles - b.distance_miles);
      
      console.log(`✅ Search complete: ${results.length} counties found within ${radiusMiles} miles`);
      
      if (results.length > 0) {
        console.log('🏆 Closest counties:', results.slice(0, 5).map(c => ({
          name: `${c.county_name}, ${c.state_name}`,
          distance: c.distance_miles,
          cities: c.city_count,
          population: c.total_population
        })));
      }
      
      onSearchResults(results, searchCoords);
      
      const message = results.length > 0 
        ? `Found ${results.length} counties within ${radiusMiles} miles`
        : `No counties found within ${radiusMiles} miles. Try increasing radius.`;
      
      toast({
        title: "Search Complete",
        description: message,
        variant: results.length > 0 ? "default" : "destructive"
      });

    } catch (error) {
      console.error('💥 Search error:', error);
      toast({
        title: "Search Error",
        description: `Search failed: ${error.message}`,
        variant: "destructive",
      });
      onSearchResults([], searchCoords);
    } finally {
      setIsSearching(false);
    }
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