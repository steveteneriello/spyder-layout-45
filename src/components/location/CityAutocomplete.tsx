
import React from 'react';
import { Input } from "@/components/ui/input";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: { city: string; state: string; country: string; lat: number; lng: number }) => void;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ value, onChange, onPlaceSelect }) => {
  return (
    <Input
      type="text"
      placeholder="ZIP Code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
    />
  );
};

export default CityAutocomplete;
