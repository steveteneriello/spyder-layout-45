
import React, { useState } from 'react';
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
      
      // Calculate bounding box - FIXED: Corrected longitude calculation
      const latRange = radiusMiles / 69; // degrees latitude per mile
      const lngRange = radiusMiles / (69 * Math.cos(searchCoords.lat * Math.PI / 180)); // degrees longitude per mile
      
      const minLat = searchCoords.lat - latRange;
      const maxLat = searchCoords.lat + latRange;
      const minLng = searchCoords.lng - lngRange; // FIXED: was searchCoords.lng - lngRange
      const maxLng = searchCoords.lng + lngRange; // FIXED: now correctly adding lngRange

      console.log('Bounding box:', { minLat, maxLat, minLng, maxLng });

      // Build query using centroid coordinates and county-level indexes
      let query = supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
          city,
          latitude,
          longitude,
          centroid_latitude,
          centroid_longitude,
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
        .not('centroid_latitude', 'is', null)
        .not('centroid_longitude', 'is', null)
        .gte('centroid_latitude', minLat)
        .lte('centroid_latitude', maxLat)
        .gte('centroid_longitude', minLng)
        .lte('centroid_longitude', maxLng);

      const { data: locationData, error } = await query;

      if (error) throw error;

      console.log('Found locations in bounding box:', locationData?.length || 0);

      if (!locationData || locationData.length === 0) {
        console.log('No locations found in bounding box');
        onSearchResults([], searchCoords);
        toast({
          title: "No Results",
          description: "No counties found within the specified criteria",
        });
        return;
      }

      // Group by county and calculate distances using centroid coordinates
      const countyMap = new Map();
      let locationsWithinRadius = 0;
      
      locationData.forEach(location => {
        // Use centroid coordinates for county distance calculation
        const countyLat = typeof location.centroid_latitude === 'number' 
          ? location.centroid_latitude 
          : parseFloat(location.centroid_latitude);
        const countyLng = typeof location.centroid_longitude === 'number' 
          ? location.centroid_longitude 
          : parseFloat(location.centroid_longitude);
        
        // Skip if centroid coordinates are invalid
        if (isNaN(countyLat) || isNaN(countyLng)) {
          console.log('Skipping location with invalid centroid coordinates:', location);
          return;
        }

        const distance = calculateDistance(
          searchCoords.lat,
          searchCoords.lng,
          countyLat,
          countyLng
        );

        // Only process counties within the actual search radius
        if (distance <= radiusMiles) {
          locationsWithinRadius++;
          const countyKey = `${location.county_name}-${location.state_name}`;
          
          // Parse numeric values
          const parseNumber = (value: any) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              const parsed = parseFloat(value.replace(/[,%$]/g, ''));
              return isNaN(parsed) ? null : parsed;
            }
            return null;
          };

          if (!countyMap.has(countyKey)) {
            // Create new county entry using centroid as county center
            countyMap.set(countyKey, {
              id: countyKey,
              county_name: location.county_name,
              state_name: location.state_name,
              center_lat: countyLat,
              center_lng: countyLng,
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
        .sort((a, b) => a.distance_miles - b.distance_miles); // Sort by distance, closest first

      console.log('Final search results:', results.length, 'counties found');
      if (results.length > 0) {
        console.log('Closest counties:', results.slice(0, 5).map(c => ({ name: c.county_name, state: c.state_name, distance: c.distance_miles })));
        console.log('Furthest counties:', results.slice(-5).map(c => ({ name: c.county_name, state: c.state_name, distance: c.distance_miles })));
      }
      
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
    <div className="bg-card rounded-lg border border-border shadow-sm p-4">
      <div className="flex items-center space-x-6">
        <div className="flex-1 max-w-4xl">
          <CityAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onPlaceSelect={handlePlaceSelect}
          />
        </div>
        
        <div className="w-64">
          <Label htmlFor="radius" className="text-sm font-medium text-muted-foreground mb-3 block">
            Radius: {radiusMiles} miles
          </Label>
          <div className="flex items-center justify-center py-2">
            <Slider
              id="radius"
              min={1}
              max={150}
              step={1}
              value={[radiusMiles]}
              onValueChange={(value) => setRadiusMiles(value[0])}
              className="w-full"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
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
