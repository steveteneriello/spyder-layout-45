
import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CountyDemographicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  county: any;
}

const CountyDemographicsDrawer: React.FC<CountyDemographicsDrawerProps> = ({ isOpen, onClose, county }) => {
  if (!county) return null;

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
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{county.county_name} County, {county.state_name}</DrawerTitle>
          <DrawerDescription>
            Comprehensive demographic information and statistics
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Population</p>
                  <p className="text-lg font-semibold">{formatNumber(county.total_population)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cities</p>
                  <p className="text-lg font-semibold">{county.city_count || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="text-lg font-semibold">{county.distance_miles?.toFixed(1)} miles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Age</p>
                  <p className="text-lg font-semibold">{county.avg_age_median ? `${county.avg_age_median.toFixed(1)} years` : 'N/A'}</p>
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
                  <p className="text-lg font-semibold">{formatCurrency(county.avg_income_household_median)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Median Home Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(county.avg_home_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bachelor's Degree or Higher</p>
                  <p className="text-lg font-semibold">{formatPercentage(county.education_bachelors_pct)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Race & Ethnicity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Race & Ethnicity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">White</p>
                  <p className="text-lg font-semibold">{formatPercentage(county.race_white_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Black</p>
                  <p className="text-lg font-semibold">{formatPercentage(county.race_black_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Asian</p>
                  <p className="text-lg font-semibold">{formatPercentage(county.race_asian_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hispanic/Latino</p>
                  <p className="text-lg font-semibold">{formatPercentage(county.race_hispanic_pct)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              Distance: {county.distance_miles?.toFixed(1)} miles
            </Badge>
            <Badge variant="secondary">
              Population: {formatNumber(county.total_population)}
            </Badge>
            {county.avg_income_household_median && (
              <Badge variant="secondary">
                Income: {formatCurrency(county.avg_income_household_median)}
              </Badge>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CountyDemographicsDrawer;
