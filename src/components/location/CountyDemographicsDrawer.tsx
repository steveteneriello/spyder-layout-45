
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
        .from('location_data')
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
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="font-semibold text-xs">{value}</p>
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
                  {renderDataPoint("Population", formatNumber(county.population))}
                  {renderDataPoint("State", county.state_name)}
                  {renderDataPoint("Median Age", county.age_median ? `${parseFloat(county.age_median).toFixed(1)} years` : null)}
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
                  {renderDataPoint("Median Household", formatCurrency(county.income_household_median))}
                  {renderDataPoint("Six Figure", formatPercentage(county.income_household_six_figure))}
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
                  {renderDataPoint("Home Value", formatCurrency(county.home_value))}
                  {renderDataPoint("Home Ownership", formatPercentage(county.home_ownership))}
                  {renderDataPoint("Rent (Median)", formatCurrency(county.rent_median))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2">
              {county.population && (
                <Badge variant="secondary" className="text-xs">
                  Population: {formatNumber(county.population)}
                </Badge>
              )}
              {county.county_name && (
                <Badge variant="secondary" className="text-xs">
                  County: {county.county_name}
                </Badge>
              )}
              {county.income_household_median && (
                <Badge variant="secondary" className="text-xs">
                  Income: {formatCurrency(county.income_household_median)}
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
