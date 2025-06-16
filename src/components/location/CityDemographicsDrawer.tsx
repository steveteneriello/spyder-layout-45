
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
                <div>
                  <p className="text-sm text-gray-500">Per Capita Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(city.income_per_capita)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rent (Median)</p>
                  <p className="text-lg font-semibold">{formatCurrency(city.rent_median)}</p>
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
                  <p className="text-lg font-semibold">{formatPercentage(city.education_bachelors_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">High School Graduate</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.education_high_school_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Graduate Degree</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.education_graduate_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Less than High School</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.education_less_than_high_school_pct)}</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">White</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.race_white_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Black</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.race_black_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Asian</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.race_asian_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hispanic/Latino</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.race_hispanic_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Native American</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.race_native_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Other</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.race_other_pct)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Unemployment Rate</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.unemployment_rate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Labor Force</p>
                  <p className="text-lg font-semibold">{formatNumber(city.labor_force)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Age Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Under 18</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.age_under_18_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">18-34</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.age_18_34_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">35-64</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.age_35_64_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">65 and Over</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.age_65_over_pct)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Housing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Housing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Housing Units</p>
                  <p className="text-lg font-semibold">{formatNumber(city.housing_units)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner Occupied</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.housing_owner_occupied_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Renter Occupied</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.housing_renter_occupied_pct)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vacant Units</p>
                  <p className="text-lg font-semibold">{formatPercentage(city.housing_vacant_pct)}</p>
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
            {city.education_bachelors_pct && (
              <Badge variant="secondary">
                College: {formatPercentage(city.education_bachelors_pct)}
              </Badge>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CityDemographicsDrawer;
