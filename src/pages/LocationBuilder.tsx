
import React, { useState, useEffect } from 'react';
import { MapPin, Building2, List, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SidebarLayout from "@/components/layout/SidebarLayout";
import CountyLocationFilters from "@/components/location/CountyLocationFilters";
import CountyLocationResults from "@/components/location/CountyLocationResults";
import CountyLocationMap from "@/components/location/CountyLocationMap";
import CountyCitiesTable from "@/components/location/CountyCitiesTable";

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

const LocationBuilder = () => {
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
      const { data, error } = await supabase
        .from('location_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
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
    setSelectedCounties(new Set());
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
    setSelectedCities([]);
  };

  const handleSelectedCitiesChange = (cities: any[]) => {
    console.log('Selected cities changed:', cities);
    setSelectedCities(cities);
  };

  const menuItems = [
    { title: "Dashboard", path: "/", icon: "home", section: "Main" },
    { title: "Campaigns", path: "/campaigns", icon: "megaphone", section: "Tools" },
    { title: "Scheduler", path: "/scheduler", icon: "calendar", section: "Tools" },
    { title: "Location Builder", path: "/location-builder", icon: "map-pin", section: "Tools" },
    { title: "Theme", path: "/theme", icon: "palette", section: "Settings" },
  ];

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
    <SidebarLayout
      menuItems={menuItems}
      nav={
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-white">Tools</h1>
          </div>
        </div>
      }
      category={
        <div className="flex items-center space-x-2 text-white/80 text-sm">
          <Building2 className="h-4 w-4" />
          <span>Location Tools</span>
        </div>
      }
      footer={
        <div className="text-xs text-white/60 text-center">
          <p>{savedLists.length} saved lists</p>
        </div>
      }
    >
      <div className="h-full bg-slate-50">
        {/* Page header with title and search */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-wide text-slate-900">Location List Builder</h1>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="max-w-3xl">
            <CountyLocationFilters 
              onSearchResults={handleSearchResults}
              onListSaved={handleListSaved} 
            />
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

        {/* Main content area */}
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
    </SidebarLayout>
  );
};

export default LocationBuilder;
