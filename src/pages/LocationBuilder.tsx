
import React, { useState, useEffect } from 'react';
import { MapPin, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGlobalTheme } from "@/contexts/GlobalThemeContext";
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { LocationBuilderThemeDebug } from "@/components/theme/ThemeDebugSection";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { SideCategory } from '@/components/navigation/SideCategory';
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
  const { debugSettings } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const allMenuItems = getMenuItems();
  const menuSections = getSections();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading county data...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      menuItems={allMenuItems}
      nav={
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-primary-foreground">Tools</h1>
          </div>
        </div>
      }
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory 
              key={section.name} 
              section={section.name} 
              items={section.items} 
            />
          ))}
        </div>
      }
      footer={
        <div className="text-xs text-primary-foreground/60 text-center">
          <p>{savedLists.length} saved lists</p>
        </div>
      }
    >
      <div className="h-full bg-background">
        {/* Theme Debug Section */}
        {debugSettings.showThemeDebug && (
          <div className="p-6 pb-0">
            <LocationBuilderThemeDebug />
          </div>
        )}

        {/* Page header with title and search */}
        <div className="bg-gradient-to-r from-background to-card border-b border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold tracking-wide text-foreground">Location List Builder</h1>
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
          <div className="h-[60vh] bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CountyLocationMap 
              searchResults={searchResults}
              centerCoords={centerCoords}
              selectedCities={selectedCities}
              selectedCounties={selectedCounties}
              selectedStates={selectedStates}
              onStateToggle={handleStateToggle}
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex gap-6 h-full bg-background min-h-[40vh] px-6 pb-6">
          {/* Counties panel */}
          <div className="w-[480px] bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
          <div className="flex-1 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
