
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
    <div className="bg-neutral-800 p-6 rounded-lg mb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-300 h-4 w-4" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 text-neutral-50 placeholder:text-stone-300"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px] bg-zinc-950 border-zinc-800 text-neutral-50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
              <SelectItem value="archived">Archived Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="w-[200px] bg-zinc-950 border-zinc-800 text-neutral-50">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm border-zinc-700 bg-zinc-950 text-stone-300">
            {totalResults} campaign{totalResults !== 1 ? 's' : ''} found
          </Badge>
          
          {searchTerm && (
            <Badge variant="secondary" className="text-sm bg-zinc-800 text-stone-300 border-zinc-700">
              Search: "{searchTerm}"
            </Badge>
          )}
          
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="text-sm bg-zinc-800 text-stone-300 border-zinc-700">
              Status: {statusFilter}
            </Badge>
          )}
          
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="text-sm bg-zinc-800 text-stone-300 border-zinc-700">
              Category: {categories.find(c => c.id === categoryFilter)?.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
