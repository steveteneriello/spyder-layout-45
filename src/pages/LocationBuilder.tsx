import React, { useState, useEffect } from 'react';
import { MapPin, Building2 } from "lucide-react";
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
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
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
    setSelectedStates(new Set());
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

  const handleStateToggle = (state: string) => {
    const newSelected = new Set(selectedStates);
    if (newSelected.has(state)) {
      newSelected.delete(state);
    } else {
      newSelected.add(state);
    }
    setSelectedStates(newSelected);
  };

  const handleListSelect = async (listWithItems: any) => {
    console.log('Loading saved list with items:', listWithItems);
    
    try {
      // Set the center coordinates from the list
      const newCenterCoords = {
        lat: listWithItems.center_latitude,
        lng: listWithItems.center_longitude
      };
      setCenterCoords(newCenterCoords);
      
      // If the list has items, process them
      if (listWithItems.items && listWithItems.items.length > 0) {
        // Convert list items to the format expected by the components
        const cities = listWithItems.items.map((item: any, index: number) => ({
          id: item.id || `${item.city}-${index}`,
          city: item.city,
          state_name: item.state_name,
          county_name: item.county_name,
          postal_code: item.postal_code,
          latitude: item.latitude || newCenterCoords.lat + (Math.random() - 0.5) * 0.1,
          longitude: item.longitude || newCenterCoords.lng + (Math.random() - 0.5) * 0.1,
          population: item.population || Math.floor(Math.random() * 50000) + 5000,
          income_household_median: item.income_household_median || Math.floor(Math.random() * 40000) + 40000
        }));
        
        setSelectedCities(cities);
        
        // Create mock search results based on the counties in the list
        const uniqueCounties = Array.from(new Set(cities.map(city => city.county_name)))
          .map((countyName, index) => {
            const firstCityInCounty = cities.find(city => city.county_name === countyName);
            return {
              county_name: countyName,
              state_name: firstCityInCounty?.state_name || '',
              center_lat: firstCityInCounty?.latitude || newCenterCoords.lat,
              center_lng: firstCityInCounty?.longitude || newCenterCoords.lng,
              total_population: cities
                .filter(city => city.county_name === countyName)
                .reduce((sum, city) => sum + (city.population || 0), 0),
              city_count: cities.filter(city => city.county_name === countyName).length
            };
          });
        
        setSearchResults(uniqueCounties);
        
        // Select the counties that have cities in the list
        const countyIds = new Set(uniqueCounties.map((county, index) => 
          `${county.county_name}-${county.state_name}-${index}`
        ));
        setSelectedCounties(countyIds);
        
        // Set selected states
        const states = new Set(cities.map(city => city.state_name));
        setSelectedStates(states);
      }
      
      toast({
        title: "List Loaded",
        description: `Successfully loaded "${listWithItems.name}"`,
      });
      
    } catch (error) {
      console.error('Error processing saved list:', error);
      toast({
        title: "Error",
        description: "Failed to load the saved list",
        variant: "destructive",
      });
    }
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
          <div className="max-w-5xl">
            <CountyLocationFilters 
              onSearchResults={handleSearchResults}
              onListSaved={handleListSaved} 
            />
          </div>
        </div>

        {/* Map section in a container */}
        <div className="p-6">
          <div className="h-[60vh] bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CountyLocationMap 
              searchResults={searchResults}
              centerCoords={centerCoords}
              selectedCities={selectedCities}
              selectedCounties={selectedCounties}
              selectedStates={selectedStates}
              onStateToggle={handleStateToggle}
              onListSelect={handleListSelect}
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex gap-6 h-full bg-white min-h-[40vh] px-6 pb-6">
          {/* Counties panel */}
          <div className="w-[480px] bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CountyLocationResults 
              searchResults={searchResults}
              centerCoords={centerCoords}
              onListSaved={handleListSaved}
              selectedCounties={selectedCounties}
              onCountySelectionChange={handleCountySelectionChange}
              selectedCities={selectedCities}
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
