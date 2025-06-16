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
      
      // Convert miles to meters for PostGIS (1 mile = 1609.344 meters)
      const radiusMeters = radiusMiles * 1609.344;
      
      // Build the SQL query using PostGIS for accurate distance calculations
      let sqlQuery = `
        SELECT DISTINCT
          county_name,
          state_name,
          centroid_latitude,
          centroid_longitude,
          timezone,
          -- Use PostGIS to calculate accurate distance in miles
          ST_Distance(
            ST_MakePoint(centroid_longitude, centroid_latitude)::geography,
            ST_MakePoint($1, $2)::geography
          ) / 1609.344 as distance_miles,
          -- Aggregate statistics for the county
          COUNT(*) as city_count,
          SUM(CASE WHEN population ~ '^[0-9]+$' THEN population::integer ELSE 0 END) as total_population,
          AVG(CASE WHEN income_household_median ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(income_household_median, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as avg_income_household_median,
          AVG(CASE WHEN home_value ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(home_value, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as avg_home_value,
          AVG(CASE WHEN age_median ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(age_median, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as avg_age_median,
          AVG(CASE WHEN education_bachelors ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(education_bachelors, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as education_bachelors_pct,
          AVG(CASE WHEN race_white ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(race_white, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as race_white_pct,
          AVG(CASE WHEN race_black ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(race_black, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as race_black_pct,
          AVG(CASE WHEN race_asian ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(race_asian, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as race_asian_pct,
          AVG(CASE WHEN hispanic ~ '^[0-9.]+$' 
              THEN NULLIF(regexp_replace(hispanic, '[^0-9.]', '', 'g'), '')::numeric 
              ELSE NULL END) as race_hispanic_pct
        FROM location_data
        WHERE 
          county_name IS NOT NULL 
          AND centroid_latitude IS NOT NULL 
          AND centroid_longitude IS NOT NULL
          AND city IS NOT NULL
          -- Use PostGIS spatial filter for performance
          AND ST_DWithin(
            ST_MakePoint(centroid_longitude, centroid_latitude)::geography,
            ST_MakePoint($3, $4)::geography,
            $5
          )
      `;

      const params = [
        searchCoords.lng, // $1 - longitude for distance calculation
        searchCoords.lat, // $2 - latitude for distance calculation  
        searchCoords.lng, // $3 - longitude for spatial filter
        searchCoords.lat, // $4 - latitude for spatial filter
        radiusMeters      // $5 - radius in meters
      ];

      let paramIndex = 6;

      // Add state filter if selected
      if (selectedStates.length > 0) {
        const stateParams = selectedStates.map(() => `$${paramIndex++}`).join(',');
        sqlQuery += ` AND state_name IN (${stateParams})`;
        params.push(...selectedStates);
      }

      // Add timezone filter if selected
      if (selectedTimezones.length > 0) {
        const timezoneParams = selectedTimezones.map(() => `$${paramIndex++}`).join(',');
        sqlQuery += ` AND timezone IN (${timezoneParams})`;
        params.push(...selectedTimezones);
      }

      // Group by county and order by distance
      sqlQuery += `
        GROUP BY county_name, state_name, centroid_latitude, centroid_longitude, timezone
        HAVING ST_Distance(
          ST_MakePoint(centroid_longitude, centroid_latitude)::geography,
          ST_MakePoint($1, $2)::geography
        ) / 1609.344 <= $${paramIndex}
        ORDER BY distance_miles ASC
      `;
      
      params.push(radiusMiles); // Add radius in miles for final filter

      console.log('🗄️ Executing SQL query:', sqlQuery);
      console.log('📊 Query parameters:', params);

      const { data: counties, error } = await supabase.rpc('execute_sql', {
        sql_query: sqlQuery,
        sql_params: params
      });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      if (!counties || counties.length === 0) {
        console.log('📭 No counties found within radius');
        onSearchResults([], searchCoords);
        toast({
          title: "No Results",
          description: `No counties found within ${radiusMiles} miles`,
        });
        return;
      }

      // Transform the results to match expected format
      const results = counties.map((county: any) => ({
        id: `${county.county_name}-${county.state_name}`,
        county_name: county.county_name,
        state_name: county.state_name,
        center_lat: parseFloat(county.centroid_latitude),
        center_lng: parseFloat(county.centroid_longitude),
        distance_miles: Math.round(county.distance_miles * 10) / 10,
        city_count: county.city_count,
        total_population: county.total_population || 0,
        avg_income_household_median: county.avg_income_household_median || 0,
        avg_home_value: county.avg_home_value || 0,
        avg_age_median: county.avg_age_median || 0,
        education_bachelors_pct: county.education_bachelors_pct || 0,
        race_white_pct: county.race_white_pct || 0,
        race_black_pct: county.race_black_pct || 0,
        race_asian_pct: county.race_asian_pct || 0,
        race_hispanic_pct: county.race_hispanic_pct || 0,
        timezone: county.timezone
      }));

      console.log(`✅ Found ${results.length} counties within ${radiusMiles} miles`);
      console.log('🏆 Top 5 closest counties:', results.slice(0, 5).map(c => ({
        name: `${c.county_name}, ${c.state_name}`,
        distance: c.distance_miles,
        cities: c.city_count,
        population: c.total_population
      })));
      
      onSearchResults(results, searchCoords);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} counties within ${radiusMiles} miles`,
      });

    } catch (error) {
      console.error('💥 Search error:', error);
      
      // Fallback to JavaScript distance calculation if PostGIS fails
      console.log('🔄 Falling back to JavaScript distance calculation...');
      
      try {
        const fallbackResults = await performFallbackSearch();
        onSearchResults(fallbackResults, searchCoords);
        
        toast({
          title: "Search Complete (Fallback)",
          description: `Found ${fallbackResults.length} counties using fallback method`,
        });
      } catch (fallbackError) {
        console.error('💥 Fallback search also failed:', fallbackError);
        toast({
          title: "Search Error",
          description: "Failed to search for counties. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Fallback search using JavaScript distance calculation
  const performFallbackSearch = async () => {
    console.log('🔄 Performing fallback search with JavaScript distance calculation');
    
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

    // Get a broader set of counties for distance filtering
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
      .not('city', 'is', null);

    // Apply filters
    if (selectedStates.length > 0) {
      query = query.in('state_name', selectedStates);
    }
    if (selectedTimezones.length > 0) {
      query = query.in('timezone', selectedTimezones);
    }

    const { data: locationData, error } = await query;
    if (error) throw error;

    // Group by county and calculate distances
    const countyMap = new Map();
    
    locationData?.forEach(location => {
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
      }
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