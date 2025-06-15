import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import CountyLocationFilters from "@/components/county/CountyLocationFilters";
import CountyLocationResults from "@/components/county/CountyLocationResults";
import CountyLocationMap from "@/components/county/CountyLocationMap";
import CountySavedLists from "@/components/county/CountySavedLists";
import CountyCitiesTable from "@/components/county/CountyCitiesTable";

interface CountyLocationList {
  id: string;
  name: string;
  description: string | null;
  center_city: string;
  radius_miles: number;
  location_count: number;
  created_at: string;
  center_latitude: number;
  center_longitude: number;
  filters: any;
  created_by: string;
  last_accessed_at: string;
  updated_at: string;
}

const CountyLocationLists = () => {
  const [savedLists, setSavedLists] = useState<CountyLocationList[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [centerCoords, setCenterCoords] = useState<{lat: number; lng: number} | null>(null);
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set());
  const [selectedCities, setSelectedCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedLists();
  }, []);

  const fetchSavedLists = async () => {
    try {
      // Remove the list_type filter since the column doesn't exist
      const { data, error } = await supabase
        .from('location_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Use simple type assertion to avoid deep type inference
      setSavedLists((data || []) as CountyLocationList[]);
    } catch (error) {
      console.error('Error fetching saved county lists:', error);
      toast({
        title: "Error",
        description: "Failed to load saved county lists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: any[], coords: {lat: number; lng: number} | null) => {
    console.log('Search results received:', results);
    setSearchResults(results);
    setCenterCoords(coords);
    // Clear selected counties when new search results come in
    setSelectedCounties(new Set());
    // Clear selected cities when new search results come in
    setSelectedCities([]);
  };

  const handleListSaved = () => {
    fetchSavedLists();
  };

  const handleCountySelectionChange = (countyId: string, checked: boolean) => {
    console.log('County selection changed:', countyId, checked);
    const newSelected = new Set(selectedCounties);
    if (checked) {
      newSelected.add(countyId);
    } else {
      newSelected.delete(countyId);
    }
    setSelectedCounties(newSelected);
    
    // Clear selected cities when county selection changes
    // The cities table will refresh with new county data
    setSelectedCities([]);
  };

  const handleSelectedCitiesChange = (cities: any[]) => {
    console.log('Selected cities changed:', cities);
    setSelectedCities(cities);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-900 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading county data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full">
        {/* Clean, professional header with gradient */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold tracking-wide text-slate-900">Location List Builder</h1>
              </div>
              
              {/* Search bar */}
              <div className="flex-1 max-w-3xl ml-12">
                <CountyLocationFilters 
                  onSearchResults={handleSearchResults}
                  onListSaved={handleListSaved} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map section */}
        <div className="h-[60vh] bg-white border-b border-slate-200">
          <CountyLocationMap 
            searchResults={searchResults}
            centerCoords={centerCoords}
            selectedCities={selectedCities}
            selectedCounties={selectedCounties}
          />
        </div>

        {/* Main content area with consistent spacing */}
        <div className="flex gap-6 h-full bg-white min-h-[40vh] p-6">
          {/* Counties panel */}
          <div className="w-[480px] bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CountyLocationResults 
              searchResults={searchResults}
              centerCoords={centerCoords}
              onListSaved={handleListSaved}
              selectedCounties={selectedCounties}
              onCountySelectionChange={handleCountySelectionChange}
            />
          </div>
          
          {/* Cities panel */}
          <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CountyCitiesTable 
              selectedCounties={selectedCounties}
              searchResults={searchResults}
              onSelectedCitiesChange={handleSelectedCitiesChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountyLocationLists;
