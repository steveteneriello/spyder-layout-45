import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Calendar,
  Tag,
  Activity,
  Settings,
  SlidersHorizontal
} from 'lucide-react';
import { Campaign, CampaignFilters } from '@/hooks/useCampaignManagement';

interface CampaignSearchFiltersProps {
  filters: CampaignFilters;
  onUpdateFilter: (key: keyof CampaignFilters, value: any) => void;
  onResetFilters: () => void;
  categories: Array<{ id: string; name: string; }>;
  className?: string;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultOpen: boolean;
}

const FILTER_SECTIONS: FilterSection[] = [
  { id: 'search', title: 'Search', icon: <Search className="h-4 w-4" />, defaultOpen: true },
  { id: 'status', title: 'Status', icon: <Activity className="h-4 w-4" />, defaultOpen: true },
  { id: 'categories', title: 'Categories', icon: <Tag className="h-4 w-4" />, defaultOpen: false },
  { id: 'dates', title: 'Date Ranges', icon: <Calendar className="h-4 w-4" />, defaultOpen: false },
  { id: 'advanced', title: 'Advanced', icon: <Settings className="h-4 w-4" />, defaultOpen: false }
];

const STATUS_OPTIONS: Array<{ value: Campaign['status']; label: string; color: string; }> = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'archived', label: 'Archived', color: 'bg-red-100 text-red-800 border-red-200' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Last Modified' },
  { value: 'status', label: 'Status' }
];

export const CampaignSearchFilters: React.FC<CampaignSearchFiltersProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  categories,
  className = ''
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(FILTER_SECTIONS.filter(s => s.defaultOpen).map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getActiveFilterCount = (): number => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.createdDateRange) count++;
    if (filters.lastModifiedRange) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.keywordCount) count++;
    return count;
  };

  const clearFilter = (filterKey: keyof CampaignFilters) => {
    switch (filterKey) {
      case 'search':
        onUpdateFilter('search', '');
        break;
      case 'status':
        onUpdateFilter('status', []);
        break;
      case 'categories':
        onUpdateFilter('categories', []);
        break;
      case 'createdDateRange':
        onUpdateFilter('createdDateRange', null);
        break;
      case 'lastModifiedRange':
        onUpdateFilter('lastModifiedRange', null);
        break;
      case 'assignedTo':
        onUpdateFilter('assignedTo', []);
        break;
      case 'keywordCount':
        onUpdateFilter('keywordCount', null);
        break;
    }
  };

  const handleStatusToggle = (status: Campaign['status']) => {
    const currentStatuses = filters.status;
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onUpdateFilter('status', newStatuses);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(c => c !== categoryId)
      : [...currentCategories, categoryId];
    onUpdateFilter('categories', newCategories);
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              disabled={activeFilterCount === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="space-y-4">
          {/* Search Section */}
          <Collapsible open={openSections.has('search')} onOpenChange={() => toggleSection('search')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto font-normal">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Search</span>
                  {filters.search && (
                    <Badge variant="outline" className="text-xs ml-2">
                      Active
                    </Badge>
                  )}
                </div>
                {openSections.has('search') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={filters.search}
                    onChange={(e) => onUpdateFilter('search', e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                  />
                  {filters.search && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                      onClick={() => clearFilter('search')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Status Section */}
          <Collapsible open={openSections.has('status')} onOpenChange={() => toggleSection('status')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto font-normal">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status</span>
                  {filters.status.length > 0 && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {filters.status.length}
                    </Badge>
                  )}
                </div>
                {openSections.has('status') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2">
                {STATUS_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <Label 
                      htmlFor={`status-${option.value}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Badge className={`text-xs ${option.color}`}>
                        {option.label}
                      </Badge>
                    </Label>
                  </div>
                ))}
                {filters.status.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('status')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear status filters
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Categories Section */}
          <Collapsible open={openSections.has('categories')} onOpenChange={() => toggleSection('categories')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto font-normal">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Categories</span>
                  {filters.categories.length > 0 && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {filters.categories.length}
                    </Badge>
                  )}
                </div>
                {openSections.has('categories') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">No categories available</p>
                )}
                {filters.categories.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('categories')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear category filters
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Date Ranges Section */}
          <Collapsible open={openSections.has('dates')} onOpenChange={() => toggleSection('dates')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto font-normal">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Ranges</span>
                  {(filters.createdDateRange || filters.lastModifiedRange) && (
                    <Badge variant="outline" className="text-xs ml-2">
                      Active
                    </Badge>
                  )}
                </div>
                {openSections.has('dates') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Created Date</Label>
                  <DatePickerWithRange
                    value={filters.createdDateRange}
                    onChange={(range) => onUpdateFilter('createdDateRange', range)}
                    className="w-full"
                  />
                  {filters.createdDateRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('createdDateRange')}
                      className="text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      Clear created date
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Last Modified</Label>
                  <DatePickerWithRange
                    value={filters.lastModifiedRange}
                    onChange={(range) => onUpdateFilter('lastModifiedRange', range)}
                    className="w-full"
                  />
                  {filters.lastModifiedRange && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('lastModifiedRange')}
                      className="text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      Clear modified date
                    </Button>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Advanced Section */}
          <Collapsible open={openSections.has('advanced')} onOpenChange={() => toggleSection('advanced')}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2 h-auto font-normal">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sorting & Advanced</span>
                </div>
                {openSections.has('advanced') ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-4">
                {/* Sort Options */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Sort By</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => onUpdateFilter('sortBy', value)}
                    >
                      <SelectTrigger className="flex-1 bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => onUpdateFilter('sortOrder', value)}
                    >
                      <SelectTrigger className="w-24 bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="asc">A-Z</SelectItem>
                        <SelectItem value="desc">Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Keyword Count Filter */}
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Keyword Count Range</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.keywordCount?.min || ''}
                      onChange={(e) => {
                        const min = parseInt(e.target.value) || 0;
                        const current = filters.keywordCount || { min: 0, max: 1000 };
                        onUpdateFilter('keywordCount', { ...current, min });
                      }}
                      className="flex-1 bg-background border-border text-foreground"
                      min="0"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.keywordCount?.max || ''}
                      onChange={(e) => {
                        const max = parseInt(e.target.value) || 1000;
                        const current = filters.keywordCount || { min: 0, max: 1000 };
                        onUpdateFilter('keywordCount', { ...current, max });
                      }}
                      className="flex-1 bg-background border-border text-foreground"
                      min="0"
                    />
                  </div>
                  {filters.keywordCount && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter('keywordCount')}
                      className="text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      Clear keyword count filter
                    </Button>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
