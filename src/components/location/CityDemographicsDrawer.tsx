
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CityDemographicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  city: any;
}

const CityDemographicsDrawer: React.FC<CityDemographicsDrawerProps> = ({ isOpen, onClose, city }) => {
  if (!city) return null;

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || value === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return value.toLocaleString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{city.city}, {city.state_name}</SheetTitle>
          <SheetDescription>
            Comprehensive demographic information and statistics
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 overflow-y-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Population</p>
                  <p className="text-lg font-semibold">{formatNumber(city.population)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">County</p>
                  <p className="text-lg font-semibold">{city.county_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ZIP Code</p>
                  <p className="text-lg font-semibold">{city.postal_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Age</p>
                  <p className="text-lg font-semibold">{city.age_median ? `${city.age_median.toFixed(1)} years` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Latitude</p>
                  <p className="text-sm font-mono">{city.latitude?.toFixed(4) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Longitude</p>
                  <p className="text-sm font-mono">{city.longitude?.toFixed(4) || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income & Housing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Income & Housing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Median Household Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(city.income_household_median)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Home Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(city.home_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Population: {formatNumber(city.population)}
            </Badge>
            <Badge variant="secondary">
              County: {city.county_name}
            </Badge>
            {city.income_household_median && (
              <Badge variant="secondary">
                Income: {formatCurrency(city.income_household_median)}
              </Badge>
            )}
            {city.postal_code && (
              <Badge variant="secondary">
                ZIP: {city.postal_code}
              </Badge>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CityDemographicsDrawer;
