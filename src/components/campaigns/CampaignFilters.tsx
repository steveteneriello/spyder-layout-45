
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { useCampaignCategories } from '@/hooks/useCampaignCategories';

interface CampaignFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  totalResults: number;
}

export function CampaignFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  totalResults
}: CampaignFiltersProps) {
  const { categories } = useCampaignCategories();

  return (
    <div className="p-6 rounded-lg mb-6 campaign-secondary-bg">
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 campaign-secondary-text" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 campaign-card-bg campaign-border campaign-primary-text"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px] campaign-card-bg campaign-border campaign-primary-text">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="campaign-card-bg campaign-border">
              <SelectItem value="all" className="campaign-primary-text">All Campaigns</SelectItem>
              <SelectItem value="active" className="campaign-primary-text">Active Only</SelectItem>
              <SelectItem value="inactive" className="campaign-primary-text">Inactive Only</SelectItem>
              <SelectItem value="archived" className="campaign-primary-text">Archived Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[200px] campaign-card-bg campaign-border campaign-primary-text">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="campaign-card-bg campaign-border">
              <SelectItem value="all" className="campaign-primary-text">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="campaign-primary-text">
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm px-2 py-1 rounded border campaign-border campaign-card-bg campaign-secondary-text">
            {totalResults} campaign{totalResults !== 1 ? 's' : ''} found
          </div>
          
          {searchTerm && (
            <div className="text-sm px-2 py-1 rounded campaign-accent campaign-card-bg campaign-secondary-text">
              Search: "{searchTerm}"
            </div>
          )}
          
          {statusFilter !== 'all' && (
            <div className="text-sm px-2 py-1 rounded campaign-card-bg campaign-secondary-text">
              Status: {statusFilter}
            </div>
          )}
          
          {categoryFilter !== 'all' && (
            <div className="text-sm px-2 py-1 rounded campaign-card-bg campaign-secondary-text">
              Category: {categories.find(c => c.id === categoryFilter)?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
