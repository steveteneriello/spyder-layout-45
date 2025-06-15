
import React from 'react';

interface CountyLocationResultsProps {
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  onListSaved: () => void;
  selectedCounties: Set<string>;
  onCountySelectionChange: (countyId: string, checked: boolean) => void;
}

const CountyLocationResults: React.FC<CountyLocationResultsProps> = ({ 
  searchResults, 
  centerCoords, 
  onListSaved,
  selectedCounties,
  onCountySelectionChange 
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Counties</h3>
      <div className="text-slate-500">
        {searchResults.length === 0 ? 'No counties found. Search for a location to get started.' : `${searchResults.length} counties found`}
      </div>
    </div>
  );
};

export default CountyLocationResults;
