
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CityData {
  id: string;
  city: string;
  state_name: string;
  county_name: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  country: string;
}

interface CountyCitiesTableProps {
  selectedCounties: Set<string>;
  searchResults: any[];
  onSelectedCitiesChange: (cities: CityData[]) => void;
}

const CountyCitiesTable: React.FC<CountyCitiesTableProps> = ({
  selectedCounties,
  searchResults,
  onSelectedCitiesChange
}) => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCounties.size > 0) {
      fetchCitiesForCounties();
    } else {
      setCities([]);
      setSelectedCities(new Set());
    }
  }, [selectedCounties]);

  const fetchCitiesForCounties = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use mock data since we don't have the actual cities table
      const mockCities: CityData[] = [
        {
          id: '1',
          city: 'Los Angeles',
          state_name: 'California',
          county_name: 'Los Angeles County',
          postal_code: '90210',
          latitude: 34.0522,
          longitude: -118.2437,
          population: 4000000,
          country: 'United States'
        },
        {
          id: '2',
          city: 'Beverly Hills',
          state_name: 'California', 
          county_name: 'Los Angeles County',
          postal_code: '90210',
          latitude: 34.0736,
          longitude: -118.4004,
          population: 34000,
          country: 'United States'
        },
        {
          id: '3',
          city: 'Santa Monica',
          state_name: 'California',
          county_name: 'Los Angeles County', 
          postal_code: '90401',
          latitude: 34.0195,
          longitude: -118.4912,
          population: 93000,
          country: 'United States'
        }
      ];

      setCities(mockCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to load cities for selected counties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelection = (cityId: string, checked: boolean) => {
    const newSelected = new Set(selectedCities);
    if (checked) {
      newSelected.add(cityId);
    } else {
      newSelected.delete(cityId);
    }
    setSelectedCities(newSelected);
    
    // Get the selected city objects
    const selectedCityObjects = cities.filter(city => newSelected.has(city.id));
    onSelectedCitiesChange(selectedCityObjects);
  };

  const handleSelectAll = () => {
    if (selectedCities.size === cities.length) {
      setSelectedCities(new Set());
      onSelectedCitiesChange([]);
    } else {
      const allIds = new Set(cities.map(city => city.id));
      setSelectedCities(allIds);
      onSelectedCitiesChange(cities);
    }
  };

  if (selectedCounties.size === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-lg font-medium">Select Counties</p>
          <p className="text-sm mt-1">Choose counties from the search results to view their cities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-slate-900">Cities</h3>
          <span className="text-sm text-slate-500">
            {cities.length} cities found
          </span>
        </div>
        
        {cities.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-slate-600 border-slate-300"
          >
            {selectedCities.size === cities.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
          </div>
        ) : cities.length > 0 ? (
          <div className="space-y-1 p-2">
            {cities.map((city) => (
              <div
                key={city.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
              >
                <Checkbox
                  checked={selectedCities.has(city.id)}
                  onCheckedChange={(checked) => handleCitySelection(city.id, !!checked)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 truncate">{city.city}</h4>
                    <span className="text-sm text-slate-500 ml-2">
                      {city.population?.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {city.county_name}, {city.state_name}
                  </p>
                  {city.postal_code && (
                    <p className="text-xs text-slate-500">{city.postal_code}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <p>No cities found for selected counties</p>
          </div>
        )}
      </div>
      
      {selectedCities.size > 0 && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <p className="text-sm text-slate-600">
            {selectedCities.size} cities selected
          </p>
        </div>
      )}
    </div>
  );
};

export default CountyCitiesTable;
