
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
          .select('city, state_name, postal_code, latitude, longitude')
          .not('city', 'is', null)
          .not('state_name', 'is', null)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        // Check if input is numeric (ZIP code search)
        if (/^\d+$/.test(value)) {
          query = query.ilike('postal_code', `${value}%`);
        } else {
          // City name search
          query = query.ilike('city', `${value}%`);
        }

        const { data, error } = await query
          .order('city')
          .limit(10);

        if (error) throw error;

        // Remove duplicates based on city + state combination
        const uniqueResults = data.reduce((acc: LocationResult[], current) => {
          const key = `${current.city}-${current.state_name}`;
          if (!acc.find(item => `${item.city}-${item.state_name}` === key)) {
            acc.push(current);
          }
          return acc;
        }, []);

        setSuggestions(uniqueResults);
        setShowSuggestions(true);

        // Auto-select if there's an exact match
        const exactMatch = uniqueResults.find(location => {
          if (/^\d+$/.test(value)) {
            return location.postal_code === value;
          } else {
            return location.city.toLowerCase() === value.toLowerCase();
          }
        });

        if (exactMatch && uniqueResults.length === 1) {
          handleSuggestionClick(exactMatch);
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
    const displayValue = location.postal_code 
      ? `${location.city}, ${location.state_name} ${location.postal_code}`
      : `${location.city}, ${location.state_name}`;
    
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
      
      // Try to auto-select if user typed a complete location
      if (value && suggestions.length > 0) {
        const potentialMatch = suggestions.find(location => {
          const searchTerm = value.toLowerCase().trim();
          const cityMatch = location.city.toLowerCase() === searchTerm;
          const zipMatch = location.postal_code === searchTerm;
          const cityStateMatch = `${location.city.toLowerCase()}, ${location.state_name.toLowerCase()}` === searchTerm;
          
          return cityMatch || zipMatch || cityStateMatch;
        });
        
        if (potentialMatch) {
          handleSuggestionClick(potentialMatch);
        }
      }
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
        placeholder="Enter city or ZIP code"
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
              key={index}
              className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              onClick={() => handleSuggestionClick(location)}
            >
              <div className="font-medium text-slate-900">
                {location.city}, {location.state_name}
              </div>
              {location.postal_code && (
                <div className="text-sm text-slate-500">
                  ZIP: {location.postal_code}
                </div>
              )}
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
