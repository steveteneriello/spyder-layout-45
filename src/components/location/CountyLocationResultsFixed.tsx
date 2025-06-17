import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Save, Info } from "lucide-react";

interface CountyLocationResultsProps {
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  onListSaved: () => void;
  selectedCounties: Set<string>;
  onCountySelectionChange: (countyId: string, checked: boolean) => void;
  selectedCities?: any[];
}

const CountyLocationResultsFixed: React.FC<CountyLocationResultsProps> = ({
  searchResults,
  centerCoords,
  onListSaved,
  selectedCounties,
  onCountySelectionChange,
  selectedCities = []
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCountyId, setSelectedCountyId] = useState<string | null>(null);

  const handleSaveList = async () => {
    if (selectedCounties.size === 0) {
      console.log('No counties selected to save');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving list with counties:', Array.from(selectedCounties));
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('List saved successfully');
      onListSaved();
    } catch (error) {
      console.error('Error saving list:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCountyInfoClick = (countyId: string) => {
    setSelectedCountyId(countyId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Counties Found ({searchResults.length})
            </CardTitle>
            {selectedCounties.size > 0 && (
              <Button 
                onClick={handleSaveList}
                disabled={isSaving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save List'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full pr-4">
            <div className="space-y-3">
              {searchResults.map((county, index) => (
                <div
                  key={county.id || index}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`county-${county.id || index}`}
                    checked={selectedCounties.has(county.id || county.name)}
                    onCheckedChange={(checked) => {
                      onCountySelectionChange(county.id || county.name, checked as boolean);
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">
                          {county.name}, {county.state}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Population: {county.population}</span>
                          <span>Area: {county.area}</span>
                          <span>Density: {county.density}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCountyInfoClick(county.id || county.name)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {searchResults.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No counties found. Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {selectedCounties.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{selectedCounties.size}</span> counties selected
              </div>
              <Button 
                onClick={handleSaveList}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Selection'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CountyLocationResultsFixed;
