import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountyLocationResultsProps {
  searchResults: any[];
  centerCoords: {lat: number; lng: number} | null;
  onListSaved: () => void;
  selectedCounties: Set<string>;
  onCountySelectionChange: (countyId: string, checked: boolean) => void;
  selectedCities?: any[];
}

const CountyLocationResultsMinimal: React.FC<CountyLocationResultsProps> = ({
  searchResults,
  selectedCounties
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>County Location Results (Minimal)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Found {searchResults.length} results.
        </p>
        <p className="text-muted-foreground">
          Selected counties: {selectedCounties.size}
        </p>
      </CardContent>
    </Card>
  );
};

export default CountyLocationResultsMinimal;
