
import React from 'react';

interface CountyLocationFiltersProps {
  onSearchResults: (results: any[], coords: {lat: number; lng: number} | null) => void;
  onListSaved: () => void;
}

const CountyLocationFilters: React.FC<CountyLocationFiltersProps> = ({ onSearchResults, onListSaved }) => {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search for counties, cities, or regions..."
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
      />
    </div>
  );
};

export default CountyLocationFilters;
