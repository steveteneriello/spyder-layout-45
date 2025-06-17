import React, { useState, useEffect } from 'react';
import { useDebugLogger } from '@/components/debug/DebugPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Save, ArrowRight, AlertCircle, MapPin, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import CountyLocationFilters from "@/components/location/CountyLocationFilters";
import CountyLocationResults from "@/components/location/CountyLocationResults";
import CountyLocationMap from "@/components/location/CountyLocationMap";
import CountyCitiesTable from "@/components/location/CountyCitiesTable";

interface LocationSelectionProps {
  campaignData: {
    name: string;
    type: 'client' | 'market' | 'prospect' | 'data';
    assignment: string;
    assignmentId: string;
    network: 'google' | 'bing';
    targetingType: 'local' | 'regional' | 'timezone';
    savedConfig: string;
    category: string;
    startDate: string;
    endDate: string;
    noEndDate: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'bi-monthly' | 'specific';
    runTime: string;
    worker: string;
    adhocKeywords: string;
  };
  handleInputChange: (field: string, value: any) => void;
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  onContinue: () => void;
}

export default function LocationSelection({ 
  campaignData, 
  handleInputChange, 
  selectedLocations, 
  setSelectedLocations, 
  onContinue 
}: LocationSelectionProps) {
  const debug = useDebugLogger('LocationSelection');
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [centerCoords, setCenterCoords] = useState<{lat: number; lng: number} | null>(null);
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set());
  const [selectedCities, setSelectedCities] = useState<any[]>([]);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());

  useEffect(() => {
    debug.info('LocationSelection step loaded', { 
      campaignData, 
      selectedLocations,
      targetingType: campaignData.targetingType 
    });

    // Load previously selected locations if any
    if (selectedLocations.length > 0) {
      loadPreviousSelections();
    }
  }, []);

  const loadPreviousSelections = () => {
    const counties = new Set<string>();
    const cities: any[] = [];

    selectedLocations.forEach(location => {
      if (location.startsWith('county:')) {
        counties.add(location.replace('county:', ''));
      } else if (location.startsWith('city:')) {
        // Parse city data - this would need to be enhanced with actual city data
        const cityId = location.replace('city:', '');
        cities.push({ id: cityId }); // Simplified for now
      }
    });

    setSelectedCounties(counties);
    setSelectedCities(cities);
  };

  const validateStep = (): boolean => {
    const errors: string[] = [];
    
    const totalSelected = selectedCounties.size + selectedCities.length;
    if (totalSelected === 0) {
      errors.push('Please select at least one location (county or city)');
    }

    if (campaignData.targetingType === 'local' && totalSelected > 50) {
      errors.push('Local targeting supports maximum 50 locations');
    }

    if (campaignData.targetingType === 'regional' && totalSelected > 100) {
      errors.push('Regional targeting supports maximum 100 locations');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinue = () => {
    debug.info('Attempting to continue from LocationSelection');
    
    if (validateStep()) {
      // Combine counties and cities into selectedLocations array
      const locationIds: string[] = [];
      
      // Add county IDs
      selectedCounties.forEach(countyId => {
        locationIds.push(`county:${countyId}`);
      });
      
      // Add city IDs
      selectedCities.forEach(city => {
        locationIds.push(`city:${city.city}-${city.state_name}`);
      });
      
      setSelectedLocations(locationIds);
      
      debug.info('LocationSelection validation passed', { 
        selectedCounties: Array.from(selectedCounties),
        selectedCities: selectedCities.length,
        totalLocations: locationIds.length 
      });
      
      onContinue();
    } else {
      debug.warn('LocationSelection validation failed', { validationErrors });
    }
  };

  const handleSaveDraft = async () => {
    debug.info('Saving location selection draft');
    
    // Save the current location selections to the campaign data
    const locationIds: string[] = [];
    selectedCounties.forEach(countyId => locationIds.push(`county:${countyId}`));
    selectedCities.forEach(city => locationIds.push(`city:${city.city}-${city.state_name}`));
    
    handleInputChange('selectedLocations', locationIds);
    
    // TODO: Save to database if campaign ID exists
    toast({
      title: "Draft Saved",
      description: `Saved ${locationIds.length} selected locations`,
    });
  };

  const handleSearchResults = (results: any[], coords: {lat: number; lng: number} | null) => {
    setSearchResults(results);
    setCenterCoords(coords);
    debug.info('Search results updated', { resultCount: results.length, coords });
  };

  const handleCountySelectionChange = (countyId: string, checked: boolean) => {
    const newSelected = new Set(selectedCounties);
    if (checked) {
      newSelected.add(countyId);
    } else {
      newSelected.delete(countyId);
    }
    setSelectedCounties(newSelected);
    
    // Clear city selections when county selection changes
    setSelectedCities([]);
    
    debug.info('County selection changed', { countyId, checked, totalSelected: newSelected.size });
  };

  const handleSelectedCitiesChange = (cities: any[]) => {
    setSelectedCities(cities);
    debug.info('City selection changed', { cityCount: cities.length });
  };

  const handleStateToggle = (state: string) => {
    const newSelected = new Set(selectedStates);
    if (newSelected.has(state)) {
      newSelected.delete(state);
    } else {
      newSelected.add(state);
    }
    setSelectedStates(newSelected);
    debug.info('State toggle', { state, selected: newSelected.has(state) });
  };

  const getTargetingDescription = () => {
    switch (campaignData.targetingType) {
      case 'local':
        return 'Target specific cities and counties for local market penetration (max 50 locations)';
      case 'regional':
        return 'Target broader geographic areas across multiple states (max 100 locations)';
      case 'timezone':
        return 'Target locations within specific timezones for optimal ad scheduling';
      default:
        return 'Select your target locations for this campaign';
    }
  };

  const getTotalSelected = () => selectedCounties.size + selectedCities.length;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-background">
      {/* Step Description */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-900 mb-1">Choose Target Locations</h3>
          <p className="text-sm text-blue-700">
            {getTargetingDescription()}
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900 mb-2">Please fix the following issues:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-primary text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location Selection Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Counties Selected:</span>
            <Badge variant="secondary">{selectedCounties.size}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Cities Selected:</span>
            <Badge variant="secondary">{selectedCities.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Locations:</span>
            <Badge variant={getTotalSelected() > 0 ? "default" : "outline"}>
              {getTotalSelected()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Targeting Type:</span>
            <Badge variant="outline">{campaignData.targetingType}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Location Search and Selection Interface */}
      <div className="space-y-6">
        {/* Search Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground text-lg font-medium">
              Search & Filter Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountyLocationFilters 
              onSearchResults={handleSearchResults}
              onListSaved={() => debug.info('List saved from LocationSelection')} 
            />
          </CardContent>
        </Card>

        {/* Map Visualization */}
        {searchResults.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg font-medium flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] bg-card rounded-lg overflow-hidden">
                <CountyLocationMap 
                  searchResults={searchResults}
                  centerCoords={centerCoords}
                  selectedCities={selectedCities}
                  selectedCounties={selectedCounties}
                  selectedStates={selectedStates}
                  onStateToggle={handleStateToggle}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Selection Tables */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Counties Selection */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-lg font-medium flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  County Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto">
                  <CountyLocationResults 
                    searchResults={searchResults}
                    centerCoords={centerCoords}
                    onListSaved={() => debug.info('County list saved')}
                    selectedCounties={selectedCounties}
                    onCountySelectionChange={handleCountySelectionChange}
                    selectedCities={selectedCities}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cities Selection */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground text-lg font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  City Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto">
                  <CountyCitiesTable 
                    selectedCounties={selectedCounties}
                    searchResults={searchResults}
                    onSelectedCitiesChange={handleSelectedCitiesChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && (
          <Card className="bg-muted/50 border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Locations Found
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                Use the search filters above to find counties and cities for your campaign targeting.
                You can search by state, city name, or demographic criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-border text-foreground hover:bg-accent"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <span className="text-xs text-muted-foreground">
            {getTotalSelected()} location{getTotalSelected() !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <Button
          onClick={handleContinue}
          disabled={getTotalSelected() === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
        >
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
