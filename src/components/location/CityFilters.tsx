
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

interface CityFiltersProps {
  populationRange: [number, number];
  incomeRange: [number, number];
  homeValueRange: [number, number];
  onPopulationChange: (range: [number, number]) => void;
  onIncomeChange: (range: [number, number]) => void;
  onHomeValueChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

const CityFilters: React.FC<CityFiltersProps> = ({
  populationRange,
  incomeRange,
  homeValueRange,
  onPopulationChange,
  onIncomeChange,
  onHomeValueChange,
  onClearFilters
}) => {
  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'K';
    }
    return value.toLocaleString();
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return '$' + (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">City Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            <FilterX className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Population Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Population: {formatNumber(populationRange[0])} - {formatNumber(populationRange[1])}
          </Label>
          <Slider
            value={populationRange}
            onValueChange={(value) => onPopulationChange(value as [number, number])}
            min={0}
            max={1000000}
            step={1000}
            className="w-full"
          />
        </div>

        {/* Median Income Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Median Income: {formatCurrency(incomeRange[0])} - {formatCurrency(incomeRange[1])}
          </Label>
          <Slider
            value={incomeRange}
            onValueChange={(value) => onIncomeChange(value as [number, number])}
            min={0}
            max={200000}
            step={1000}
            className="w-full"
          />
        </div>

        {/* Home Value Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">
            Home Value: {formatCurrency(homeValueRange[0])} - {formatCurrency(homeValueRange[1])}
          </Label>
          <Slider
            value={homeValueRange}
            onValueChange={(value) => onHomeValueChange(value as [number, number])}
            min={0}
            max={1000000}
            step={5000}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CityFilters;
