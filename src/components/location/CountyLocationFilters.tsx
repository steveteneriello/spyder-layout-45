import React, { useState } from 'react';
import { Search, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CityAutocomplete from "./CityAutocomplete";

interface CountyLocationFiltersProps {
  onSearchResults: (results: any[], coords: {lat: number; lng: number} | null) => void;
  onListSaved: () => void;
}

const CountyLocationFilters: React.FC<CountyLocationFiltersProps> = ({ 
  onSearchResults, 
  onListSaved 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCoords, setSearchCoords] = useState<{lat: number; lng: number} | null>(null);
  const { toast } = useToast();

  const handlePlaceSelect = (place: { city: string; state: string; country: string; lat: number; lng: number }) => {
    console.log('Place selected:', place);
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
    const distance = R * c;
    return distance;
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
      console.log('Starting search with coords:', searchCoords, 'radius:', radiusMiles);
      
      // Use a larger bounding box to ensure we don't miss counties at the edges
      const latRange = (radiusMiles * 1.5) / 69; // Add 50% buffer to latitude range
      const lngRange = (radiusMiles * 1.5) / (69 * Math.cos(searchCoords.lat * Math.PI / 180)); // Add 50% buffer to longitude range
      
      const minLat = searchCoords.lat - latRange;
      const maxLat = searchCoords.lat + latRange;
      const minLng = searchCoords.lng - lngRange;
      const maxLng = searchCoords.lng + lngRange;

      console.log('Extended bounding box:', { minLat, maxLat, minLng, maxLng });

      // Query with the larger bounding box to get all potential locations
      const { data: locationData, error } = await supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
          city,
          latitude,
          longitude,
          population,
          income_household_median,
          age_median,
          education_bachelors,
          home_value,
          race_white,
          race_black,
          race_asian,
          race_hispanic: hispanic
        `)
        .not('county_name', 'is', null)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng);

      if (error) throw error;

      console.log('Found locations in extended bounding box:', locationData?.length || 0);

      if (!locationData || locationData.length === 0) {
        console.log('No locations found in bounding box');
        onSearchResults([], searchCoords);
        toast({
          title: "No Results",
          description: "No counties found within the specified radius",
        });
        return;
      }

      // Calculate distances for all locations and group by county
      const countyMap = new Map();
      let locationsWithinRadius = 0;
      
      locationData.forEach(location => {
        const distance = calculateDistance(
          searchCoords.lat,
          searchCoords.lng,
          location.latitude,
          location.longitude
        );

        // Only process locations within the actual search radius
        if (distance <= radiusMiles) {
          locationsWithinRadius++;
          const countyKey = `${location.county_name}-${location.state_name}`;
          
          // Parse numeric values, handling text fields
          const parseNumber = (value: any) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              const parsed = parseFloat(value.replace(/[,%$]/g, ''));
              return isNaN(parsed) ? null : parsed;
            }
            return null;
          };

          if (!countyMap.has(countyKey)) {
            // Create new county entry
            countyMap.set(countyKey, {
              id: countyKey,
              county_name: location.county_name,
              state_name: location.state_name,
              center_lat: location.latitude,
              center_lng: location.longitude,
              distance_miles: Math.round(distance * 10) / 10,
              total_population: parseNumber(location.population) || 0,
              avg_income_household_median: parseNumber(location.income_household_median),
              avg_home_value: parseNumber(location.home_value),
              avg_age_median: parseNumber(location.age_median),
              education_bachelors_pct: parseNumber(location.education_bachelors),
              race_white_pct: parseNumber(location.race_white),
              race_black_pct: parseNumber(location.race_black),
              race_asian_pct: parseNumber(location.race_asian),
              race_hispanic_pct: parseNumber(location.race_hispanic),
              city_count: 1,
              min_distance: distance,
              total_population_sum: parseNumber(location.population) || 0,
              income_sum: parseNumber(location.income_household_median) || 0,
              home_value_sum: parseNumber(location.home_value) || 0,
              location_count_for_avg: 1
            });
          } else {
            // Update existing county with aggregated data
            const county = countyMap.get(countyKey);
            county.city_count += 1;
            county.total_population_sum += parseNumber(location.population) || 0;
            county.income_sum += parseNumber(location.income_household_median) || 0;
            county.home_value_sum += parseNumber(location.home_value) || 0;
            county.location_count_for_avg += 1;
            
            // Keep the closest distance to search center
            if (distance < county.min_distance) {
              county.min_distance = distance;
              county.distance_miles = Math.round(distance * 10) / 10;
              county.center_lat = location.latitude;
              county.center_lng = location.longitude;
            }
            
            // Update averages
            county.total_population = county.total_population_sum;
            if (county.location_count_for_avg > 0) {
              county.avg_income_household_median = county.income_sum / county.location_count_for_avg;
              county.avg_home_value = county.home_value_sum / county.location_count_for_avg;
            }
          }
        }
      });

      console.log(`Found ${locationsWithinRadius} locations within ${radiusMiles} miles`);
      console.log(`Grouped into ${countyMap.size} counties`);

      const results = Array.from(countyMap.values())
        .map(county => {
          // Clean up temporary aggregation fields
          const { total_population_sum, income_sum, home_value_sum, location_count_for_avg, min_distance, ...cleanCounty } = county;
          return cleanCounty;
        })
        .sort((a, b) => a.distance_miles - b.distance_miles) // Sort by distance, closest first
        .slice(0, 50); // Limit to 50 results for performance

      console.log('Final search results:', results.length, 'counties found');
      console.log('Sample counties:', results.slice(0, 3).map(c => ({ name: c.county_name, state: c.state_name, distance: c.distance_miles, cities: c.city_count })));
      
      onSearchResults(results, searchCoords);
      
      toast({
        title: "Search Complete",
        description: `Found ${results.length} counties within ${radiusMiles} miles`,
      });
    } catch (error) {
      console.error('Search error:', error);
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
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <CityAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onPlaceSelect={handlePlaceSelect}
          />
        </div>
        
        <div className="w-32">
          <Input
            type="number"
            placeholder="Miles"
            value={radiusMiles}
            onChange={(e) => setRadiusMiles(parseInt(e.target.value) || 50)}
            min="1"
            max="500"
            className="text-center"
          />
        </div>
        
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
