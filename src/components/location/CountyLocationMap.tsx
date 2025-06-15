
import React from 'react';

interface CountyLocationMapProps {
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  selectedCities: any[];
  selectedCounties: Set<string>;
}

const CountyLocationMap: React.FC<CountyLocationMapProps> = ({ 
  searchResults, 
  centerCoords, 
  selectedCities, 
  selectedCounties 
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-slate-600 text-2xl">🗺️</span>
        </div>
        <p className="text-slate-600">Map component placeholder</p>
        <p className="text-sm text-slate-500 mt-2">
          {centerCoords ? `Center: ${centerCoords.lat.toFixed(3)}, ${centerCoords.lng.toFixed(3)}` : 'No center coordinates'}
        </p>
      </div>
    </div>
  );
};

export default CountyLocationMap;
