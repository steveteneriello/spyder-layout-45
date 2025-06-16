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

  // Simplified search function that works for all radius sizes
  const performFallbackSearch = async () => {
    console.log('🔄 Performing simplified search');
    console.log(`📏 Search radius: ${radiusMiles} miles`);
    
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

    try {
      // For large searches, limit to a reasonable number of records
      const recordLimit = radiusMiles > 500 ? 5000 : 2000;
      
      console.log(`🗄️ Fetching location data (limit: ${recordLimit})...`);
      
      // Simple query to get location data
      let query = supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
          centroid_latitude,
          centroid_longitude,
          timezone,
          city
        `)
        .not('county_name', 'is', null)
        .not('centroid_latitude', 'is', null)
        .not('centroid_longitude', 'is', null)
        .not('city', 'is', null)
        .limit(recordLimit);

      // Apply filters if selected
      if (selectedStates.length > 0) {
        query = query.in('state_name', selectedStates);
        console.log('🏛️ Applied state filter:', selectedStates);
      }

      if (selectedTimezones.length > 0) {
        query = query.in('timezone', selectedTimezones);
        console.log('🕐 Applied timezone filter:', selectedTimezones);
      }

      const { data: locationData, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      console.log('📊 Raw database results:', locationData?.length || 0, 'records');

      if (!locationData || locationData.length === 0) {
        console.log('📭 No location data found');
        return [];
      }

      // Create unique counties map and calculate distances
      const countyMap = new Map();
      let processedRecords = 0;
      let countiesWithinRadius = 0;
      
      console.log('⚡ Processing records and calculating distances...');
      
      locationData.forEach((location, index) => {
        const countyKey = `${location.county_name}-${location.state_name}`;
        
        // Parse coordinates
        const countyLat = parseFloat(location.centroid_latitude);
        const countyLng = parseFloat(location.centroid_longitude);
        
        if (isNaN(countyLat) || isNaN(countyLng)) {
          return;
        }

        processedRecords++;

        // Calculate distance
        const distance = calculateDistance(
          searchCoords!.lat,
          searchCoords!.lng,
          countyLat,
          countyLng
        );

        // Only include counties within radius
        if (distance <= radiusMiles) {
          if (!countyMap.has(countyKey)) {
            countiesWithinRadius++;
            countyMap.set(countyKey, {
              id: countyKey,
              county_name: location.county_name,
              state_name: location.state_name,
              center_lat: countyLat,
              center_lng: countyLng,
              distance_miles: Math.round(distance * 10) / 10,
              timezone: location.timezone,
              cities: new Set()
            });
          }
          
          // Add city to the county
          const county = countyMap.get(countyKey);
          county.cities.add(location.city);
          
          // Update distance if this is closer
          if (distance < county.distance_miles) {
            county.distance_miles = Math.round(distance * 10) / 10;
          }
        }

        // Progress logging for large datasets
        if (processedRecords % 1000 === 0) {
          console.log(`📈 Processed ${processedRecords}/${locationData.length} records, ${countyMap.size} counties found`);
        }
      });

      console.log(`📊 Processing complete:`, {
        totalRecords: locationData.length,
        processedRecords,
        countiesWithinRadius,
        uniqueCounties: countyMap.size
      });

      // Convert to results array
      const results = Array.from(countyMap.values()).map(county => ({
        id: county.id,
        county_name: county.county_name,
        state_name: county.state_name,
        center_lat: county.center_lat,
        center_lng: county.center_lng,
        distance_miles: county.distance_miles,
        city_count: county.cities.size,
        total_population: 0,
        avg_income_household_median: 0,
        avg_home_value: 0,
        avg_age_median: 0,
        education_bachelors_pct: 0,
        race_white_pct: 0,
        race_black_pct: 0,
        race_asian_pct: 0,
        race_hispanic_pct: 0,
        timezone: county.timezone
      }));

      // Sort by distance
      results.sort((a, b) => a.distance_miles - b.distance_miles);
      
      console.log(`✅ Search complete: ${results.length} counties found within ${radiusMiles} miles`);
      
      if (results.length > 0) {
        console.log('🏆 Closest counties:', results.slice(0, 5).map(c => ({
          name: `${c.county_name}, ${c.state_name}`,
          distance: c.distance_miles,
          cities: c.city_count
        })));
      }
      
      return results;

    } catch (error) {
      console.error('💥 Search error:', error);
      throw error;
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