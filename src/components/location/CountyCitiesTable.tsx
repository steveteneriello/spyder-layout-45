
import React from 'react';

interface CountyCitiesTableProps {
  selectedCounties: Set<string>;
  searchResults: any[];
  onSelectedCitiesChange: (cities: any[]) => void;
}

const CountyCitiesTable: React.FC<CountyCitiesTableProps> = ({ 
  selectedCounties, 
  searchResults, 
  onSelectedCitiesChange 
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Cities</h3>
      <div className="text-slate-500">
        {selectedCounties.size === 0 
          ? 'Select counties to view cities' 
          : `Cities in ${selectedCounties.size} selected counties`}
      </div>
    </div>
  );
};

export default CountyCitiesTable;
