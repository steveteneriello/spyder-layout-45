
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

  const formatCurrency = (value: number | string | null | undefined) => {
    if (!value || value === 0 || value === '0') return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(numValue);
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    if (!value || value === '0') return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(1)}%`;
  };

  const formatNumber = (value: number | string | null | undefined) => {
    if (!value || value === '0') return 'N/A';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return numValue.toLocaleString();
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
        
        <div className="mt-6 overflow-y-auto space-y-4">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Population</p>
                  <p className="font-semibold">{formatNumber(city.population)}</p>
                </div>
                <div>
                  <p className="text-gray-500">County</p>
                  <p className="font-semibold">{city.county_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">ZIP Code</p>
                  <p className="font-semibold">{city.postal_code || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Median Age</p>
                  <p className="font-semibold">{city.age_median ? `${parseFloat(city.age_median).toFixed(1)} years` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Latitude</p>
                  <p className="font-mono text-xs">{city.latitude?.toFixed(4) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Longitude</p>
                  <p className="font-mono text-xs">{city.longitude?.toFixed(4) || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Age Demographics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Age Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Under 10</p>
                  <p className="font-semibold">{formatPercentage(city.age_under_10)}</p>
                </div>
                <div>
                  <p className="text-gray-500">10-19</p>
                  <p className="font-semibold">{formatPercentage(city.age_10_to_19)}</p>
                </div>
                <div>
                  <p className="text-gray-500">18-24</p>
                  <p className="font-semibold">{formatPercentage(city.age_18_to_24)}</p>
                </div>
                <div>
                  <p className="text-gray-500">20s</p>
                  <p className="font-semibold">{formatPercentage(city.age_20s)}</p>
                </div>
                <div>
                  <p className="text-gray-500">30s</p>
                  <p className="font-semibold">{formatPercentage(city.age_30s)}</p>
                </div>
                <div>
                  <p className="text-gray-500">40s</p>
                  <p className="font-semibold">{formatPercentage(city.age_40s)}</p>
                </div>
                <div>
                  <p className="text-gray-500">50s</p>
                  <p className="font-semibold">{formatPercentage(city.age_50s)}</p>
                </div>
                <div>
                  <p className="text-gray-500">60s</p>
                  <p className="font-semibold">{formatPercentage(city.age_60s)}</p>
                </div>
                <div>
                  <p className="text-gray-500">70s</p>
                  <p className="font-semibold">{formatPercentage(city.age_70s)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Over 65</p>
                  <p className="font-semibold">{formatPercentage(city.age_over_65)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Over 80</p>
                  <p className="font-semibold">{formatPercentage(city.age_over_80)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Over 18</p>
                  <p className="font-semibold">{formatPercentage(city.age_over_18)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gender & Marital Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Demographics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Male</p>
                  <p className="font-semibold">{formatPercentage(city.male)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Female</p>
                  <p className="font-semibold">{formatPercentage(city.female)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Married</p>
                  <p className="font-semibold">{formatPercentage(city.married)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Divorced</p>
                  <p className="font-semibold">{formatPercentage(city.divorced)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Never Married</p>
                  <p className="font-semibold">{formatPercentage(city.never_married)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Widowed</p>
                  <p className="font-semibold">{formatPercentage(city.widowed)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Family Size</p>
                  <p className="font-semibold">{formatNumber(city.family_size)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dual Income</p>
                  <p className="font-semibold">{formatPercentage(city.family_dual_income)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Income Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Median Household</p>
                  <p className="font-semibold">{formatCurrency(city.income_household_median)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Median Individual</p>
                  <p className="font-semibold">{formatCurrency(city.income_individual_median)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Six Figure</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_six_figure)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Under $5K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_under_5)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$5K-$10K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_5_to_10)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$10K-$15K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_10_to_15)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$15K-$20K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_15_to_20)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$20K-$25K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_20_to_25)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$25K-$35K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_25_to_35)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$35K-$50K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_35_to_50)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$50K-$75K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_50_to_75)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$75K-$100K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_75_to_100)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$100K-$150K</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_100_to_150)}</p>
                </div>
                <div>
                  <p className="text-gray-500">$150K+</p>
                  <p className="font-semibold">{formatPercentage(city.income_household_150_over)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Housing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Housing</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Total Units</p>
                  <p className="font-semibold">{formatNumber(city.housing_units)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Home Value</p>
                  <p className="font-semibold">{formatCurrency(city.home_value)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Home Ownership</p>
                  <p className="font-semibold">{formatPercentage(city.home_ownership)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Owner Occupied</p>
                  <p className="font-semibold">{formatPercentage(city.housing_owner_occupied_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Renter Occupied</p>
                  <p className="font-semibold">{formatPercentage(city.housing_renter_occupied_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vacant Units</p>
                  <p className="font-semibold">{formatPercentage(city.housing_vacant_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rent (Median)</p>
                  <p className="font-semibold">{formatCurrency(city.rent_median)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Race & Ethnicity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Race & Ethnicity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">White</p>
                  <p className="font-semibold">{formatPercentage(city.race_white_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Black</p>
                  <p className="font-semibold">{formatPercentage(city.race_black_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Asian</p>
                  <p className="font-semibold">{formatPercentage(city.race_asian_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Hispanic/Latino</p>
                  <p className="font-semibold">{formatPercentage(city.race_hispanic_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Native American</p>
                  <p className="font-semibold">{formatPercentage(city.race_native_pct)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Other</p>
                  <p className="font-semibold">{formatPercentage(city.race_other_pct)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Employment</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500">Unemployment Rate</p>
                  <p className="font-semibold">{formatPercentage(city.unemployment_rate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Labor Force</p>
                  <p className="font-semibold">{formatNumber(city.labor_force)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Population: {formatNumber(city.population)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              County: {city.county_name}
            </Badge>
            {city.income_household_median && (
              <Badge variant="secondary" className="text-xs">
                Income: {formatCurrency(city.income_household_median)}
              </Badge>
            )}
            {city.postal_code && (
              <Badge variant="secondary" className="text-xs">
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
