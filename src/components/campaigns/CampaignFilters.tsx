
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
    <div style={{ backgroundColor: '#444444' }} className="p-6 rounded-lg mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#B0B0B0' }} />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              style={{ 
                backgroundColor: '#121212', 
                borderColor: '#444444', 
                color: '#E0E0E0'
              }}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger 
              className="w-[180px]" 
              style={{ 
                backgroundColor: '#121212', 
                borderColor: '#444444', 
                color: '#E0E0E0' 
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#121212', borderColor: '#444444' }}>
              <SelectItem value="all" style={{ color: '#E0E0E0' }}>All Campaigns</SelectItem>
              <SelectItem value="active" style={{ color: '#E0E0E0' }}>Active Only</SelectItem>
              <SelectItem value="inactive" style={{ color: '#E0E0E0' }}>Inactive Only</SelectItem>
              <SelectItem value="archived" style={{ color: '#E0E0E0' }}>Archived Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger 
              className="w-[200px]" 
              style={{ 
                backgroundColor: '#121212', 
                borderColor: '#444444', 
                color: '#E0E0E0' 
              }}
            >
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#121212', borderColor: '#444444' }}>
              <SelectItem value="all" style={{ color: '#E0E0E0' }}>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} style={{ color: '#E0E0E0' }}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div 
            className="text-sm px-2 py-1 rounded border"
            style={{ 
              borderColor: '#444444', 
              backgroundColor: '#121212', 
              color: '#B0B0B0' 
            }}
          >
            {totalResults} campaign{totalResults !== 1 ? 's' : ''} found
          </div>
          
          {searchTerm && (
            <div 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#444444', 
                color: '#B0B0B0' 
              }}
            >
              Search: "{searchTerm}"
            </div>
          )}
          
          {statusFilter !== 'all' && (
            <div 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#444444', 
                color: '#B0B0B0' 
              }}
            >
              Status: {statusFilter}
            </div>
          )}
          
          {categoryFilter !== 'all' && (
            <div 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#444444', 
                color: '#B0B0B0' 
              }}
            >
              Category: {categories.find(c => c.id === categoryFilter)?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
