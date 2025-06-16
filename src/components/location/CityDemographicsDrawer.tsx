
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CityDemographicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cityId: string | null;
}

const CityDemographicsDrawer: React.FC<CityDemographicsDrawerProps> = ({ isOpen, onClose, cityId }) => {
  const [city, setCity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && cityId) {
      fetchCityData();
    }
  }, [isOpen, cityId]);

  const fetchCityData = async () => {
    if (!cityId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('city_demographics')
        .select('*')
        .eq('id', cityId)
        .single();

      if (error) throw error;
      setCity(data);
    } catch (error) {
      console.error('Error fetching city data:', error);
      toast({
        title: "Error",
        description: "Failed to load city demographics",
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

  if (!city && !isLoading) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{city?.city}, {city?.state_name}</SheetTitle>
          <SheetDescription>
            Comprehensive demographic information and statistics
          </SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="mt-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-900 border-t-transparent"></div>
          </div>
        ) : city ? (
          <div className="mt-6 overflow-y-auto space-y-4">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {renderDataPoint("Population", formatNumber(city.population))}
                  {renderDataPoint("County", city.county_name)}
                  {renderDataPoint("ZIP Code", city.postal_code)}
                  {renderDataPoint("Median Age", city.age_median ? `${parseFloat(city.age_median).toFixed(1)} years` : null)}
                  {renderDataPoint("Latitude", city.latitude?.toFixed(4), "font-mono text-xs")}
                  {renderDataPoint("Longitude", city.longitude?.toFixed(4), "font-mono text-xs")}
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
                  {renderDataPoint("Male", formatPercentage(city.male))}
                  {renderDataPoint("Female", formatPercentage(city.female))}
                  {renderDataPoint("Under 10", formatPercentage(city.age_under_10))}
                  {renderDataPoint("Over 65", formatPercentage(city.age_over_65))}
                  {renderDataPoint("Married", formatPercentage(city.married))}
                  {renderDataPoint("Divorced", formatPercentage(city.divorced))}
                  {renderDataPoint("Never Married", formatPercentage(city.never_married))}
                  {renderDataPoint("Widowed", formatPercentage(city.widowed))}
                  {renderDataPoint("Family Size", formatNumber(city.family_size))}
                  {renderDataPoint("Dual Income", formatPercentage(city.family_dual_income))}
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
                  {renderDataPoint("Median Household", formatCurrency(city.income_household_median))}
                  {renderDataPoint("Median Individual", formatCurrency(city.income_individual_median))}
                  {renderDataPoint("Six Figure", formatPercentage(city.income_household_six_figure))}
                  {renderDataPoint("Under $5K", formatPercentage(city.income_household_under_5))}
                  {renderDataPoint("$5K-$10K", formatPercentage(city.income_household_5_to_10))}
                  {renderDataPoint("$10K-$15K", formatPercentage(city.income_household_10_to_15))}
                  {renderDataPoint("$15K-$20K", formatPercentage(city.income_household_15_to_20))}
                  {renderDataPoint("$20K-$25K", formatPercentage(city.income_household_20_to_25))}
                  {renderDataPoint("$25K-$35K", formatPercentage(city.income_household_25_to_35))}
                  {renderDataPoint("$35K-$50K", formatPercentage(city.income_household_35_to_50))}
                  {renderDataPoint("$50K-$75K", formatPercentage(city.income_household_50_to_75))}
                  {renderDataPoint("$75K-$100K", formatPercentage(city.income_household_75_to_100))}
                  {renderDataPoint("$100K-$150K", formatPercentage(city.income_household_100_to_150))}
                  {renderDataPoint("$150K+", formatPercentage(city.income_household_150_over))}
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
                  {renderDataPoint("Total Units", formatNumber(city.housing_units))}
                  {renderDataPoint("Home Value", formatCurrency(city.home_value))}
                  {renderDataPoint("Home Ownership", formatPercentage(city.home_ownership))}
                  {renderDataPoint("Owner Occupied", formatPercentage(city.housing_owner_occupied_pct))}
                  {renderDataPoint("Renter Occupied", formatPercentage(city.housing_renter_occupied_pct))}
                  {renderDataPoint("Vacant Units", formatPercentage(city.housing_vacant_pct))}
                  {renderDataPoint("Rent (Median)", formatCurrency(city.rent_median))}
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
                  {renderDataPoint("White", formatPercentage(city.race_white_pct))}
                  {renderDataPoint("Black", formatPercentage(city.race_black_pct))}
                  {renderDataPoint("Asian", formatPercentage(city.race_asian_pct))}
                  {renderDataPoint("Hispanic/Latino", formatPercentage(city.race_hispanic_pct))}
                  {renderDataPoint("Native American", formatPercentage(city.race_native_pct))}
                  {renderDataPoint("Other", formatPercentage(city.race_other_pct))}
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
                  {renderDataPoint("Unemployment Rate", formatPercentage(city.unemployment_rate))}
                  {renderDataPoint("Labor Force", formatNumber(city.labor_force))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              {city.population && (
                <Badge variant="secondary" className="text-xs">
                  Population: {formatNumber(city.population)}
                </Badge>
              )}
              {city.county_name && (
                <Badge variant="secondary" className="text-xs">
                  County: {city.county_name}
                </Badge>
              )}
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
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default CityDemographicsDrawer;
