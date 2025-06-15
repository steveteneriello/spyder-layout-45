
import React from 'react';
import { Input } from "@/components/ui/input";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { city: string; state: string; country: string; lat: number; lng: number }) => void;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ value, onChange, onPlaceSelect }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // For now, just simulate selecting a place when user presses Enter
      // In a real implementation, this would integrate with Google Places API
      if (value.toLowerCase().includes('los angeles')) {
        onPlaceSelect({
          city: 'Los Angeles',
          state: 'California',
          country: 'United States',
          lat: 34.0522,
          lng: -118.2437
        });
      } else if (value.toLowerCase().includes('new york')) {
        onPlaceSelect({
          city: 'New York',
          state: 'New York',
          country: 'United States', 
          lat: 40.7128,
          lng: -74.0060
        });
      }
    }
  };

  return (
    <Input
      type="text"
      placeholder="Enter city or ZIP code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={handleKeyPress}
      className="w-full"
    />
  );
};

export default CityAutocomplete;
