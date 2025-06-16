
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CountyDemographicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  countyId: string | null;
}

const CountyDemographicsDrawer: React.FC<CountyDemographicsDrawerProps> = ({ isOpen, onClose, countyId }) => {
  const [county, setCounty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && countyId) {
      fetchCountyData();
    }
  }, [isOpen, countyId]);

  const fetchCountyData = async () => {
    if (!countyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('county_demographics')
        .select('*')
        .eq('id', countyId)
        .single();

      if (error) throw error;
      setCounty(data);
    } catch (error) {
      console.error('Error fetching county data:', error);
      toast({
        title: "Error",
        description: "Failed to load county demographics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | string | null | undefined) => {
    if (!value || value === 0 || value === '0') return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return null;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(numValue);
  };

  const formatPercentage = (value: number | string | null | undefined) => {
    if (!value || value === '0') return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return null;
    return `${numValue.toFixed(1)}%`;
  };

  const formatNumber = (value: number | string | null | undefined) => {
    if (!value || value === '0') return null;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return null;
    return numValue.toLocaleString();
  };

  const renderDataPoint = (label: string, value: string | null, className?: string) => {
    if (!value) return null;
    return (
      <div className={className}>
        <p className="text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    );
  };

  if (!county && !isLoading) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{county?.county_name} County, {county?.state_name}</SheetTitle>
          <SheetDescription>
            Comprehensive demographic information and statistics
          </SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="mt-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-900 border-t-transparent"></div>
          </div>
        ) : county ? (
          <div className="mt-6 overflow-y-auto space-y-4">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {renderDataPoint("Population", formatNumber(county.total_population))}
                  {renderDataPoint("Cities", county.city_count?.toString())}
                  {renderDataPoint("Distance", county.distance_miles ? `${county.distance_miles.toFixed(1)} miles` : null)}
                  {renderDataPoint("Median Age", county.avg_age_median ? `${county.avg_age_median.toFixed(1)} years` : null)}
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Demographics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {renderDataPoint("Male", formatPercentage(county.male))}
                  {renderDataPoint("Female", formatPercentage(county.female))}
                  {renderDataPoint("Under 10", formatPercentage(county.age_under_10))}
                  {renderDataPoint("Over 65", formatPercentage(county.age_over_65))}
                  {renderDataPoint("Married", formatPercentage(county.married))}
                  {renderDataPoint("Divorced", formatPercentage(county.divorced))}
                  {renderDataPoint("Never Married", formatPercentage(county.never_married))}
                  {renderDataPoint("Widowed", formatPercentage(county.widowed))}
                  {renderDataPoint("Family Size", formatNumber(county.family_size))}
                  {renderDataPoint("Dual Income", formatPercentage(county.family_dual_income))}
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
                  {renderDataPoint("Median Household", formatCurrency(county.avg_income_household_median))}
                  {renderDataPoint("Median Individual", formatCurrency(county.income_individual_median))}
                  {renderDataPoint("Six Figure", formatPercentage(county.income_household_six_figure))}
                  {renderDataPoint("Under $5K", formatPercentage(county.income_household_under_5))}
                  {renderDataPoint("$5K-$10K", formatPercentage(county.income_household_5_to_10))}
                  {renderDataPoint("$10K-$15K", formatPercentage(county.income_household_10_to_15))}
                  {renderDataPoint("$15K-$20K", formatPercentage(county.income_household_15_to_20))}
                  {renderDataPoint("$20K-$25K", formatPercentage(county.income_household_20_to_25))}
                  {renderDataPoint("$25K-$35K", formatPercentage(county.income_household_25_to_35))}
                  {renderDataPoint("$35K-$50K", formatPercentage(county.income_household_35_to_50))}
                  {renderDataPoint("$50K-$75K", formatPercentage(county.income_household_50_to_75))}
                  {renderDataPoint("$75K-$100K", formatPercentage(county.income_household_75_to_100))}
                  {renderDataPoint("$100K-$150K", formatPercentage(county.income_household_100_to_150))}
                  {renderDataPoint("$150K+", formatPercentage(county.income_household_150_over))}
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
                  {renderDataPoint("Total Units", formatNumber(county.housing_units))}
                  {renderDataPoint("Home Value", formatCurrency(county.avg_home_value))}
                  {renderDataPoint("Home Ownership", formatPercentage(county.home_ownership))}
                  {renderDataPoint("Owner Occupied", formatPercentage(county.housing_owner_occupied_pct))}
                  {renderDataPoint("Renter Occupied", formatPercentage(county.housing_renter_occupied_pct))}
                  {renderDataPoint("Vacant Units", formatPercentage(county.housing_vacant_pct))}
                  {renderDataPoint("Rent (Median)", formatCurrency(county.rent_median))}
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
                  {renderDataPoint("White", formatPercentage(county.race_white_pct))}
                  {renderDataPoint("Black", formatPercentage(county.race_black_pct))}
                  {renderDataPoint("Asian", formatPercentage(county.race_asian_pct))}
                  {renderDataPoint("Hispanic/Latino", formatPercentage(county.race_hispanic_pct))}
                  {renderDataPoint("Native American", formatPercentage(county.race_native_pct))}
                  {renderDataPoint("Other", formatPercentage(county.race_other_pct))}
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
                  {renderDataPoint("Unemployment Rate", formatPercentage(county.unemployment_rate))}
                  {renderDataPoint("Labor Force", formatNumber(county.labor_force))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              {county.total_population && (
                <Badge variant="secondary" className="text-xs">
                  Population: {formatNumber(county.total_population)}
                </Badge>
              )}
              {county.distance_miles && (
                <Badge variant="secondary" className="text-xs">
                  Distance: {county.distance_miles.toFixed(1)} miles
                </Badge>
              )}
              {county.avg_income_household_median && (
                <Badge variant="secondary" className="text-xs">
                  Income: {formatCurrency(county.avg_income_household_median)}
                </Badge>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default CountyDemographicsDrawer;
