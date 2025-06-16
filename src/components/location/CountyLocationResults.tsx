
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Save, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CountyDemographicsDrawer from "./CountyDemographicsDrawer";

interface CountyLocationResultsProps {
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  onListSaved: () => void;
  selectedCounties: Set<string>;
  onCountySelectionChange: (countyId: string, checked: boolean) => void;
  selectedCities?: any[];
}

const CountyLocationResults: React.FC<CountyLocationResultsProps> = ({
  searchResults,
  centerCoords,
  onListSaved,
  selectedCounties,
  onCountySelectionChange,
  selectedCities = []
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const { toast } = useToast();

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    
    return Math.round(value).toLocaleString();
  };

  const handleSaveList = async () => {
    setIsSaving(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = sessionData?.session?.user;
      if (!user) {
        toast({
          title: "Not signed in",
          description: "You must be signed in to save a list.",
          variant: "destructive",
        });
        return;
      }

      const selectedCountyData = searchResults.filter((county, index) => {
        const countyId = `${county.county_name}-${county.state_name}`;
        return selectedCounties.has(countyId);
      });

      if (selectedCountyData.length === 0 && selectedCities.length === 0) {
        toast({
          title: "No locations selected",
          description: "Please select at least one county or city to save.",
          variant: "destructive",
        });
        return;
      }

      const listName = prompt("Enter a name for your list:", "My Location List");
      if (!listName) {
        toast({
          title: "List name required",
          description: "Please enter a name for your list.",
          variant: "destructive",
        });
        return;
      }

      // Calculate center coordinates - use first county if available, otherwise first city
      let centerLat, centerLng, centerCity;
      if (selectedCountyData.length > 0) {
        centerLat = selectedCountyData[0].center_lat;
        centerLng = selectedCountyData[0].center_lng;
        centerCity = selectedCountyData[0].county_name;
      } else if (selectedCities.length > 0) {
        centerLat = selectedCities[0].latitude;
        centerLng = selectedCities[0].longitude;
        centerCity = selectedCities[0].city;
      } else {
        centerLat = centerCoords?.lat || 39.8283;
        centerLng = centerCoords?.lng || -98.5795;
        centerCity = "United States";
      }

      // Create the location list
      const { data: listData, error: listError } = await supabase
        .from('location_lists')
        .insert([
          {
            name: listName,
            description: `List with ${selectedCountyData.length} counties and ${selectedCities.length} cities`,
            location_count: selectedCountyData.length + selectedCities.length,
            center_city: centerCity,
            center_latitude: centerLat,
            center_longitude: centerLng,
            radius_miles: 50,
            filters: {
              counties: selectedCountyData.length,
              cities: selectedCities.length
            },
            created_by: user.id,
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (listError) throw listError;

      console.log('Created list:', listData);

      // Prepare items to insert
      const itemsToInsert = [];

      // Add counties to location_list_items
      selectedCountyData.forEach((county) => {
        itemsToInsert.push({
          list_id: listData.id,
          location_data_id: county.id || crypto.randomUUID(), // Generate UUID if not present
          city: county.county_name,
          state_name: county.state_name,
          county_name: county.county_name,
          postal_code: null,
          latitude: county.center_lat,
          longitude: county.center_lng,
          distance_miles: county.distance_miles || null,
          country: 'United States'
        });
      });

      // Add cities to location_list_items
      selectedCities.forEach((city) => {
        itemsToInsert.push({
          list_id: listData.id,
          location_data_id: city.id || crypto.randomUUID(), // Generate UUID if not present
          city: city.city,
          state_name: city.state_name,
          county_name: city.county_name,
          postal_code: city.postal_code || null,
          latitude: city.latitude,
          longitude: city.longitude,
          distance_miles: null,
          country: 'United States'
        });
      });

      console.log('Items to insert:', itemsToInsert);

      // Insert all items
      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('location_list_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error inserting items:', itemsError);
          throw itemsError;
        }
      }

      toast({
        title: "Success",
        description: `Location list "${listName}" saved successfully with ${itemsToInsert.length} locations!`,
      });
      onListSaved();
    } catch (error: any) {
      console.error("Error saving location list:", error);
      toast({
        title: "Error",
        description: `Failed to save location list: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCountyClick = (county: any) => {
    setSelectedCounty(county);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedCounty(null);
  };

  const handleCheckboxChange = (countyId: string, checked: boolean) => {
    onCountySelectionChange(countyId, checked);
  };

  const totalSelectedItems = selectedCounties.size + selectedCities.length;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Modernized header with gradient */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 mr-2 inline-block text-slate-500" />
          <h2 className="text-xl font-semibold tracking-wide text-slate-900">
            Counties
          </h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
            {searchResults.length}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition border-0 shadow-sm hover:shadow-md hover:scale-[1.01]"
          onClick={handleSaveList}
          disabled={isSaving || totalSelectedItems === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save List ({totalSelectedItems})
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {searchResults.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <MapPin className="mx-auto w-8 h-8 mb-2 text-slate-300" />
            <p className="font-medium">No counties to display</p>
            <p className="text-sm text-slate-400">Search for a location to see counties</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((county, index) => {
              const countyId = `${county.county_name}-${county.state_name}`;
              const isSelected = selectedCounties.has(countyId);
              
              return (
                <Card 
                  key={countyId} 
                  className={`relative transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01] mx-1 ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 ring-inset bg-blue-50 border-blue-200' 
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                  onClick={() => handleCheckboxChange(countyId, !isSelected)}
                >
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCheckboxChange(countyId, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold text-slate-900 leading-tight mb-1">
                            {county.county_name} County
                          </CardTitle>
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                            {county.state_name} • {county.distance_miles} miles
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCountyClick(county);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-4 px-5">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Population</span>
                        <span className="font-semibold text-slate-900">{formatNumber(county.total_population)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Cities</span>
                        <span className="font-semibold text-slate-900">{county.city_count || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Med. Income</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(county.avg_income_household_median)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Home Value</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(county.avg_home_value)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <CountyDemographicsDrawer 
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        county={selectedCounty}
      />
    </div>
  );
};

export default CountyLocationResults;
