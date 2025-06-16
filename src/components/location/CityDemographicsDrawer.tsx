
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
        .from('location_data')
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
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="font-semibold text-xs">{value}</p>
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
                  {renderDataPoint("State", city.state_name)}
                  {renderDataPoint("Median Age", city.age_median ? `${parseFloat(city.age_median).toFixed(1)} years` : null)}
                  {renderDataPoint("Latitude", city.latitude ? parseFloat(city.latitude).toFixed(4) : null)}
                  {renderDataPoint("Longitude", city.longitude ? parseFloat(city.longitude).toFixed(4) : null)}
                  {renderDataPoint("Timezone", city.timezone)}
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
                  {renderDataPoint("Median Household", formatCurrency(city.income_household_median))}
                  {renderDataPoint("Six Figure", formatPercentage(city.income_household_six_figure))}
                  {renderDataPoint("Military", formatPercentage(city.military))}
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
                  {renderDataPoint("Rent (Median)", formatCurrency(city.rent_median))}
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
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default CityDemographicsDrawer;
