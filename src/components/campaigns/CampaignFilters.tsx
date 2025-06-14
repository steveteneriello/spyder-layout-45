
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
    <div style={{ backgroundColor: '#1e293b' }} className="p-6 rounded-lg mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#cbd5e1' }} />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              style={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#475569', 
                color: '#f8fafc'
              }}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger 
              className="w-[180px]" 
              style={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#475569', 
                color: '#f8fafc' 
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
              <SelectItem value="all" style={{ color: '#f8fafc' }}>All Campaigns</SelectItem>
              <SelectItem value="active" style={{ color: '#f8fafc' }}>Active Only</SelectItem>
              <SelectItem value="inactive" style={{ color: '#f8fafc' }}>Inactive Only</SelectItem>
              <SelectItem value="archived" style={{ color: '#f8fafc' }}>Archived Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger 
              className="w-[200px]" 
              style={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#475569', 
                color: '#f8fafc' 
              }}
            >
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
              <SelectItem value="all" style={{ color: '#f8fafc' }}>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id} style={{ color: '#f8fafc' }}>
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
              borderColor: '#475569', 
              backgroundColor: '#0f172a', 
              color: '#cbd5e1' 
            }}
          >
            {totalResults} campaign{totalResults !== 1 ? 's' : ''} found
          </div>
          
          {searchTerm && (
            <div 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#334155', 
                color: '#cbd5e1' 
              }}
            >
              Search: "{searchTerm}"
            </div>
          )}
          
          {statusFilter !== 'all' && (
            <div 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#334155', 
                color: '#cbd5e1' 
              }}
            >
              Status: {statusFilter}
            </div>
          )}
          
          {categoryFilter !== 'all' && (
            <div 
              className="text-sm px-2 py-1 rounded"
              style={{ 
                backgroundColor: '#334155', 
                color: '#cbd5e1' 
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
