import React, { useState } from 'react';
import { Search, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CityAutocomplete from "./CityAutocomplete";

interface DebugSearchProps {
  onSearchResults: (results: any[], coords: {lat: number; lng: number} | null) => void;
  onListSaved: () => void;
}

const DebugSearch: React.FC<DebugSearchProps> = ({ onSearchResults, onListSaved }) => {
  const [searchValue, setSearchValue] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCoords, setSearchCoords] = useState<{lat: number; lng: number} | null>(null);
  const { toast } = useToast();

  const handlePlaceSelect = (place: { city: string; state: string; country: string; lat: number; lng: number }) => {
    console.log('🎯 Place selected:', place);
    setSearchCoords({ lat: place.lat, lng: place.lng });
    setSearchValue(`${place.city}, ${place.state}`);
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

  const testDatabaseConnection = async () => {
    console.log('🔌 Testing database connection...');
    try {
      const { data, error } = await supabase
        .from('location_data')
        .select('county_name, state_name')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection error:', error);
        return false;
      }
      
      console.log('✅ Database connection successful, sample data:', data);
      return true;
    } catch (error) {
      console.error('💥 Database connection failed:', error);
      return false;
    }
  };

  const handleTestSearch = async () => {
    console.log('🧪 Running test search...');
    
    // Test database connection first
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      toast({
        title: "Database Error",
        description: "Cannot connect to database",
        variant: "destructive",
      });
      return;
    }

    // Use a default location for testing
    const testCoords = searchCoords || { lat: 42.3601, lng: -71.0589 }; // Boston, MA
    const testRadius = radiusMiles || 50;

    console.log('🎯 Test search with coords:', testCoords, 'radius:', testRadius);

    setIsSearching(true);
    try {
      // Simple query to get some counties
      const { data: counties, error } = await supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
          centroid_latitude,
          centroid_longitude,
          city
        `)
        .not('county_name', 'is', null)
        .not('centroid_latitude', 'is', null)
        .not('centroid_longitude', 'is', null)
        .limit(100);

      if (error) throw error;

      console.log('📊 Raw query results:', counties?.length || 0, 'records');

      if (!counties || counties.length === 0) {
        toast({
          title: "No Data",
          description: "No county data found in database",
          variant: "destructive",
        });
        onSearchResults([], testCoords);
        return;
      }

      // Group by county and calculate distances
      const countyMap = new Map();
      
      counties.forEach(location => {
        const countyKey = `${location.county_name}-${location.state_name}`;
        
        const countyLat = parseFloat(location.centroid_latitude);
        const countyLng = parseFloat(location.centroid_longitude);
        
        if (isNaN(countyLat) || isNaN(countyLng)) return;

        const distance = calculateDistance(
          testCoords.lat,
          testCoords.lng,
          countyLat,
          countyLng
        );

        if (distance <= testRadius) {
          if (!countyMap.has(countyKey)) {
            countyMap.set(countyKey, {
              id: countyKey,
              county_name: location.county_name,
              state_name: location.state_name,
              center_lat: countyLat,
              center_lng: countyLng,
              distance_miles: Math.round(distance * 10) / 10,
              city_count: 1,
              total_population: 0,
              avg_income_household_median: 0,
              avg_home_value: 0,
              avg_age_median: 0,
              education_bachelors_pct: 0,
              race_white_pct: 0,
              race_black_pct: 0,
              race_asian_pct: 0,
              race_hispanic_pct: 0,
              timezone: 'America/New_York'
            });
          } else {
            const county = countyMap.get(countyKey);
            county.city_count += 1;
          }
        }
      });

      const results = Array.from(countyMap.values());
      results.sort((a, b) => a.distance_miles - b.distance_miles);

      console.log('✅ Test search results:', results.length, 'counties found');
      console.log('🏆 Sample results:', results.slice(0, 3));

      onSearchResults(results, testCoords);
      
      toast({
        title: "Test Search Complete",
        description: `Found ${results.length} counties within ${testRadius} miles`,
      });

    } catch (error) {
      console.error('💥 Test search error:', error);
      toast({
        title: "Search Error",
        description: `Search failed: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRealSearch = async () => {
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

    console.log('🔍 Starting real search...');
    console.log('📍 Search coordinates:', searchCoords);
    console.log('🎯 Radius:', radiusMiles, 'miles');

    setIsSearching(true);
    try {
      // Calculate a bounding box for initial filtering
      const latDelta = radiusMiles / 69; // Rough conversion: 1 degree lat ≈ 69 miles
      const lngDelta = radiusMiles / (69 * Math.cos(searchCoords.lat * Math.PI / 180));
      
      const minLat = searchCoords.lat - latDelta;
      const maxLat = searchCoords.lat + latDelta;
      const minLng = searchCoords.lng - lngDelta;
      const maxLng = searchCoords.lng + lngDelta;

      console.log('📦 Bounding box:', { minLat, maxLat, minLng, maxLng });

      const { data: locationData, error } = await supabase
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

      if (error) throw error;

      console.log('📊 Found location records:', locationData?.length || 0);

      if (!locationData || locationData.length === 0) {
        console.log('📭 No location data found');
        onSearchResults([], searchCoords);
        toast({
          title: "No Results",
          description: "No counties found within the specified radius",
        });
        return;
      }

      // Group by county and calculate distances - same logic as before
      const countyMap = new Map();
      
      locationData.forEach(location => {
        const countyKey = `${location.county_name}-${location.state_name}`;
        
        const countyLat = parseFloat(location.centroid_latitude);
        const countyLng = parseFloat(location.centroid_longitude);
        
        if (isNaN(countyLat) || isNaN(countyLng)) return;

        const distance = calculateDistance(
          searchCoords.lat,
          searchCoords.lng,
          countyLat,
          countyLng
        );

        if (distance <= radiusMiles) {
          if (!countyMap.has(countyKey)) {
            const parseNumber = (value: any) => {
              if (typeof value === 'number') return value;
              if (typeof value === 'string') {
                const parsed = parseFloat(value.replace(/[,%$]/g, ''));
                return isNaN(parsed) ? null : parsed;
              }
              return null;
            };

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

          if (pop !== null) county.populations.push(pop);
          if (inc !== null) county.incomes.push(inc);
          if (home !== null) county.homeValues.push(home);
          if (age !== null) county.ages.push(age);
          if (edu !== null) county.educations.push(edu);
        }
      });

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
          race_white_pct: 0,
          race_black_pct: 0,
          race_asian_pct: 0,
          race_hispanic_pct: 0,
          timezone: county.timezone
        };
      });

      results.sort((a, b) => a.distance_miles - b.distance_miles);
      
      console.log('✅ Real search results:', results.length, 'counties found');
      
      onSearchResults(results, searchCoords);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} counties within ${radiusMiles} miles`,
      });

    } catch (error) {
      console.error('💥 Real search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for counties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

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

        {/* Debug buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleTestSearch}
            disabled={isSearching}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent" />
            ) : (
              <>
                🧪 Test
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleRealSearch}
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
      
      {/* Debug info */}
      <div className="mt-4 p-3 bg-slate-50 rounded-md text-sm">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <strong>Search Location:</strong><br />
            {searchCoords ? `${searchCoords.lat.toFixed(4)}, ${searchCoords.lng.toFixed(4)}` : 'None selected'}
          </div>
          <div>
            <strong>Search Text:</strong><br />
            {searchValue || 'Empty'}
          </div>
          <div>
            <strong>Radius:</strong><br />
            {radiusMiles} miles
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugSearch;