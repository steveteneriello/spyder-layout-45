
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

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a city or ZIP code to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // For now, we'll use a simple mock search since we don't have the counties table
      const mockResults = [
        {
          id: '1',
          county_name: 'Los Angeles County',
          state_name: 'California',
          total_population: 10000000,
          city_count: 88,
          distance_miles: 0,
          latitude: 34.0522,
          longitude: -118.2437
        },
        {
          id: '2', 
          county_name: 'Orange County',
          state_name: 'California',
          total_population: 3200000,
          city_count: 34,
          distance_miles: 25,
          latitude: 33.7175,
          longitude: -117.8311
        }
      ];

      onSearchResults(mockResults, searchCoords);
      
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} counties within ${radiusMiles} miles`,
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
