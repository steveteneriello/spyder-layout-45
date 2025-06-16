import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { city: string; state: string; country: string; lat: number; lng: number }) => void;
}

interface LocationResult {
  city: string;
  state_name: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  county_name: string;
  population: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ value, onChange, onPlaceSelect }) => {
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchLocations = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        let query = supabase
          .from('location_data')
          .select('city, state_name, postal_code, latitude, longitude, county_name, population')
          .not('city', 'is', null)
          .not('state_name', 'is', null)
          .not('postal_code', 'is', null)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        const searchTerm = value.trim();

        // Check if input is a ZIP code (5 digits)
        if (/^\d{1,5}$/.test(searchTerm)) {
          query = query.ilike('postal_code', `${searchTerm}%`);
        } 
        // Check if input is "city, state" format
        else if (searchTerm.includes(',')) {
          const [cityPart, statePart] = searchTerm.split(',').map(s => s.trim());
          if (cityPart && statePart) {
            query = query
              .ilike('city', `${cityPart}%`)
              .ilike('state_name', `${statePart}%`);
          }
        }
        // Just city name search
        else {
          query = query.ilike('city', `${searchTerm}%`);
        }

        const { data, error } = await query
          .order('population', { ascending: false, nullsFirst: false })
          .order('city')
          .limit(50);

        if (error) throw error;

        // For cities with multiple ZIP codes, group by city+state and pick the highest population one
        const cityStateMap = new Map<string, LocationResult>();
        
        data.forEach(location => {
          const cityStateKey = `${location.city}-${location.state_name}`;
          const existing = cityStateMap.get(cityStateKey);
          
          if (!existing) {
            cityStateMap.set(cityStateKey, location);
          } else {
            // Compare population (convert to number, handle null/empty)
            const currentPop = parseInt(location.population?.replace(/,/g, '') || '0');
            const existingPop = parseInt(existing.population?.replace(/,/g, '') || '0');
            
            if (currentPop > existingPop) {
              cityStateMap.set(cityStateKey, location);
            }
          }
        });

        const uniqueResults = Array.from(cityStateMap.values()).slice(0, 10);
        setSuggestions(uniqueResults);
        setShowSuggestions(true);

        // Auto-select if there's an exact match
        if (uniqueResults.length === 1) {
          const location = uniqueResults[0];
          const isExactZipMatch = /^\d{5}$/.test(searchTerm) && location.postal_code === searchTerm;
          const isExactCityMatch = location.city.toLowerCase() === searchTerm.toLowerCase();
          const isExactCityStateMatch = searchTerm.includes(',') && 
            `${location.city.toLowerCase()}, ${location.state_name.toLowerCase()}` === searchTerm.toLowerCase();
          
          if (isExactZipMatch || isExactCityMatch || isExactCityStateMatch) {
            handleSuggestionClick(location);
          }
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSuggestionClick = (location: LocationResult) => {
    const displayValue = `${location.city}, ${location.state_name} ${location.postal_code}`;
    
    onChange(displayValue);
    onPlaceSelect({
      city: location.city,
      state: location.state_name,
      country: 'United States',
      lat: location.latitude,
      lng: location.longitude
    });
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[0]);
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder="Enter city, state or ZIP code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((location, index) => (
            <div
              key={`${location.city}-${location.state_name}-${location.postal_code}`}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              onClick={() => handleSuggestionClick(location)}
            >
              <div className="font-medium text-slate-900">
                {location.city}, {location.state_name}
              </div>
              <div className="text-sm text-slate-500 flex justify-between">
                <span>ZIP: {location.postal_code}</span>
                <span>{location.county_name} County</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
