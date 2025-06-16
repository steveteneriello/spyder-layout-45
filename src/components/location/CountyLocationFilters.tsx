
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
      
      // Calculate rough bounding box to limit the initial query
      const latRange = radiusMiles / 69; // Roughly 69 miles per degree of latitude
      const lngRange = radiusMiles / (69 * Math.cos(searchCoords.lat * Math.PI / 180));
      
      const minLat = searchCoords.lat - latRange;
      const maxLat = searchCoords.lat + latRange;
      const minLng = searchCoords.lng - lngRange;
      const maxLng = searchCoords.lng + lngRange;

      console.log('Bounding box:', { minLat, maxLat, minLng, maxLng });

      // Query with bounding box filter first to reduce dataset
      const { data: locationData, error } = await supabase
        .from('location_data')
        .select(`
          county_name,
          state_name,
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

      console.log('Found locations in bounding box:', locationData?.length || 0);

      if (!locationData || locationData.length === 0) {
        console.log('No locations found in bounding box');
        onSearchResults([], searchCoords);
        toast({
          title: "No Results",
          description: "No counties found within the specified radius",
        });
        return;
      }

      // Group by county and calculate distances
      const countyMap = new Map();
      
      locationData.forEach(location => {
        const countyKey = `${location.county_name}-${location.state_name}`;
        
        if (!countyMap.has(countyKey)) {
          const distance = calculateDistance(
            searchCoords.lat,
            searchCoords.lng,
            location.latitude,
            location.longitude
          );

          // Only include if within radius
          if (distance <= radiusMiles) {
            // Parse numeric values, handling text fields
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
              center_lat: location.latitude,
              center_lng: location.longitude,
              distance_miles: Math.round(distance * 10) / 10,
              total_population: parseNumber(location.population),
              avg_income_household_median: parseNumber(location.income_household_median),
              avg_home_value: parseNumber(location.home_value),
              avg_age_median: parseNumber(location.age_median),
              education_bachelors_pct: parseNumber(location.education_bachelors),
              race_white_pct: parseNumber(location.race_white),
              race_black_pct: parseNumber(location.race_black),
              race_asian_pct: parseNumber(location.race_asian),
              race_hispanic_pct: parseNumber(location.race_hispanic),
              city_count: 1 // We'll aggregate this
            });
          }
        } else {
          // Update city count for existing county (if within radius)
          const distance = calculateDistance(
            searchCoords.lat,
            searchCoords.lng,
            location.latitude,
            location.longitude
          );
          
          if (distance <= radiusMiles) {
            const county = countyMap.get(countyKey);
            county.city_count += 1;
          }
        }
      });

      const results = Array.from(countyMap.values())
        .sort((a, b) => a.distance_miles - b.distance_miles) // Sort by distance, closest first
        .slice(0, 50); // Limit to 50 results for performance

      console.log('Final search results:', results.length, 'counties found');
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
