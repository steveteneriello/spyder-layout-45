import { useState, useEffect, useCallback } from 'react';

// Types
export interface Campaign {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
  archived_at?: string;
  template_id?: string;
  settings?: CampaignSettings;
  locationTargeting?: LocationTargeting;
  keywordTargeting?: KeywordTargeting;
  scheduleConfig?: ScheduleConfig;
  budgetConfig?: BudgetConfig;
}

export interface CampaignSettings {
  bidStrategy: 'manual' | 'automated';
  maxCpc?: number;
  dailyBudget?: number;
  targetCpa?: number;
  targetRoas?: number;
  adRotation: 'optimize' | 'rotate';
  deliveryMethod: 'standard' | 'accelerated';
}

export interface KeywordTargeting {
  keywords: string[];
  negativeKeywords: string[];
  matchTypes: Record<string, 'broad' | 'phrase' | 'exact'>;
}

export interface ScheduleConfig {
  startDate: string;
  endDate?: string;
  timezone: string;
  dayParting?: {
    [key: string]: { start: string; end: string; }[];
  };
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
}

export interface BudgetConfig {
  totalBudget?: number;
  dailyBudget: number;
  bidAdjustments?: Record<string, number>;
}

export interface LocationTargeting {
  included: string[];
  excluded: string[];
  radius?: number;
  radiusUnit?: 'miles' | 'kilometers';
}

export interface CampaignFilters {
  search: string;
  status: Campaign['status'][];
  categories: string[];
  createdDateRange: [Date, Date] | null;
  lastModifiedRange: [Date, Date] | null;
  assignedTo: string[];
  keywordCount: { min: number; max: number; } | null;
  sortBy: keyof Campaign;
  sortOrder: 'asc' | 'desc';
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  settings: Partial<CampaignSettings>;
  locationTargeting?: Partial<LocationTargeting>;
  keywordTargeting?: Partial<KeywordTargeting>;
  scheduleConfig?: Partial<ScheduleConfig>;
  budgetConfig?: Partial<BudgetConfig>;
  isPublic: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Campaign CRUD Hook
export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample data for development (replace with real API calls)
  const SAMPLE_CAMPAIGNS: Campaign[] = [
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
      name: 'Drain Cleaning Campaign',
      category_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      description: 'Targeted drain cleaning services campaign',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      settings: {
        bidStrategy: 'manual',
        maxCpc: 15.00,
        dailyBudget: 200,
        adRotation: 'optimize',
        deliveryMethod: 'standard'
      },
      locationTargeting: {
        included: ['us-ca-la', 'us-ca-sf'],
        excluded: [],
        radius: 25,
        radiusUnit: 'miles'
      }
    },
    {
      id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
      name: 'Emergency Plumbing',
      category_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      description: 'Campaign for emergency plumbing services',
      status: 'draft',
      created_at: '2024-01-16T10:00:00Z',
      updated_at: '2024-01-16T10:00:00Z'
    },
    {
      id: 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
      name: 'Summer AC Maintenance',
      category_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      description: 'Seasonal campaign for AC maintenance services',
      status: 'paused',
      created_at: '2024-01-17T10:00:00Z',
      updated_at: '2024-01-17T10:00:00Z'
    },
    {
      id: 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
      name: 'Archived Electrical Campaign',
      category_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      description: 'Old electrical services campaign',
      status: 'archived',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-18T10:00:00Z',
      archived_at: '2024-01-18T10:00:00Z'
    }
  ];

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, this would be:
      // const { data, error } = await supabase
      //   .from('campaign_manager_campaigns')
      //   .select('*')
      //   .order('updated_at', { ascending: false });
      
      setCampaigns(SAMPLE_CAMPAIGNS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load campaigns';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create campaign
  const createCampaign = useCallback(async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCampaign: Campaign = {
        id: `campaign_${Date.now()}`,
        name: campaignData.name || 'Untitled Campaign',
        category_id: campaignData.category_id || '',
        description: campaignData.description,
        status: campaignData.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...campaignData
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      
      return newCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      throw new Error(errorMessage);
    }
  }, []);

  // Update campaign
  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedCampaign = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { ...campaign, ...updatedCampaign }
            : campaign
        )
      );
      
      const updated = campaigns.find(c => c.id === id);
      if (!updated) throw new Error('Campaign not found');
      
      return { ...updated, ...updatedCampaign };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign';
      throw new Error(errorMessage);
    }
  }, [campaigns]);

  // Duplicate campaign
  const duplicateCampaign = useCallback(async (id: string, newName?: string): Promise<Campaign> => {
    try {
      const originalCampaign = campaigns.find(c => c.id === id);
      if (!originalCampaign) {
        throw new Error('Campaign not found');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duplicatedCampaign: Campaign = {
        ...originalCampaign,
        id: `campaign_${Date.now()}`,
        name: newName || `${originalCampaign.name} (Copy)`,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: undefined
      };

      setCampaigns(prev => [duplicatedCampaign, ...prev]);
      
      return duplicatedCampaign;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate campaign';
      throw new Error(errorMessage);
    }
  }, [campaigns]);

  // Archive campaign
  const archiveCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const archivedAt = new Date().toISOString();
      
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { 
                ...campaign, 
                status: 'archived' as const,
                archived_at: archivedAt,
                updated_at: archivedAt
              }
            : campaign
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive campaign';
      throw new Error(errorMessage);
    }
  }, []);

  // Restore campaign
  const restoreCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === id 
            ? { 
                ...campaign, 
                status: 'draft' as const,
                archived_at: undefined,
                updated_at: new Date().toISOString()
              }
            : campaign
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore campaign';
      throw new Error(errorMessage);
    }
  }, []);

  // Delete campaign
  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
      throw new Error(errorMessage);
    }
  }, []);

  // Bulk update campaigns
  const bulkUpdateCampaigns = useCallback(async (ids: string[], updates: Partial<Campaign>): Promise<void> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      setCampaigns(prev => 
        prev.map(campaign => 
          ids.includes(campaign.id) 
            ? { ...campaign, ...updateData }
            : campaign
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk update campaigns';
      throw new Error(errorMessage);
    }
  }, []);

  // Initialize campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return {
    campaigns,
    isLoading,
    error,
    loadCampaigns,
    createCampaign,
    updateCampaign,
    duplicateCampaign,
    archiveCampaign,
    restoreCampaign,
    deleteCampaign,
    bulkUpdateCampaigns
  };
};

// Campaign Filters Hook
export const useCampaignFilters = () => {
  const [filters, setFilters] = useState<CampaignFilters>({
    search: '',
    status: [],
    categories: [],
    createdDateRange: null,
    lastModifiedRange: null,
    assignedTo: [],
    keywordCount: null,
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });

  const updateFilter = useCallback((key: keyof CampaignFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      categories: [],
      createdDateRange: null,
      lastModifiedRange: null,
      assignedTo: [],
      keywordCount: null,
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
  }, []);

  // Filter campaigns based on current filters
  const filterCampaigns = useCallback((campaigns: Campaign[]) => {
    let filtered = [...campaigns];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.description?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(campaign => filters.status.includes(campaign.status));
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(campaign => filters.categories.includes(campaign.category_id));
    }

    // Date range filters
    if (filters.createdDateRange) {
      const [start, end] = filters.createdDateRange;
      filtered = filtered.filter(campaign => {
        const createdDate = new Date(campaign.created_at || '');
        return createdDate >= start && createdDate <= end;
      });
    }

    if (filters.lastModifiedRange) {
      const [start, end] = filters.lastModifiedRange;
      filtered = filtered.filter(campaign => {
        const modifiedDate = new Date(campaign.updated_at || '');
        return modifiedDate >= start && modifiedDate <= end;
      });
    }

    // Sort campaigns
    filtered.sort((a, b) => {
      const aVal = a[filters.sortBy] || '';
      const bVal = b[filters.sortBy] || '';
      
      if (filters.sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filterCampaigns
  };
};

// Main Campaign Management Hook - Combines all functionality
export const useCampaignManagement = () => {
  // Use individual hooks
  const campaignHook = useCampaigns();
  const filtersHook = useCampaignFilters();
  
  // Additional state for comprehensive management
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [categories] = useState([
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Plumbing', description: 'Plumbing services' },
    { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'HVAC', description: 'Heating and cooling' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Electrical', description: 'Electrical services' },
    { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Roofing', description: 'Roofing and repairs' }
  ]);
  
  // Computed stats
  const stats = {
    activeCampaigns: campaignHook.campaigns.filter(c => c.status === 'active').length,
    totalCategories: categories.length,
    totalKeywords: campaignHook.campaigns.reduce((acc, c) => acc + (c.keywordTargeting?.keywords.length || 0), 0),
    totalNegativeKeywords: campaignHook.campaigns.reduce((acc, c) => acc + (c.keywordTargeting?.negativeKeywords.length || 0), 0)
  };

  // Enhanced campaign operations
  const createCampaign = useCallback(async (campaignData: Partial<Campaign>) => {
    return campaignHook.createCampaign(campaignData);
  }, [campaignHook.createCampaign]);

  const updateCampaign = useCallback(async (id: string, campaignData: Partial<Campaign>) => {
    return campaignHook.updateCampaign(id, campaignData);
  }, [campaignHook.updateCampaign]);

  const deleteCampaign = useCallback(async (id: string) => {
    return campaignHook.deleteCampaign(id);
  }, [campaignHook.deleteCampaign]);

  const duplicateCampaign = useCallback(async (id: string, newName?: string) => {
    return campaignHook.duplicateCampaign(id, newName);
  }, [campaignHook.duplicateCampaign]);

  const archiveCampaign = useCallback(async (id: string) => {
    return campaignHook.archiveCampaign(id);
  }, [campaignHook.archiveCampaign]);

  const restoreCampaign = useCallback(async (id: string) => {
    return campaignHook.restoreCampaign(id);
  }, [campaignHook.restoreCampaign]);

  // Bulk operations
  const bulkUpdateStatus = useCallback(async (campaignIds: string[], status: Campaign['status']) => {
    try {
      for (const id of campaignIds) {
        await updateCampaign(id, { status });
      }
      // Refresh data after bulk operation
      await campaignHook.loadCampaigns();
    } catch (error) {
      throw error;
    }
  }, [updateCampaign, campaignHook.loadCampaigns]);

  const bulkArchive = useCallback(async (campaignIds: string[]) => {
    try {
      for (const id of campaignIds) {
        await archiveCampaign(id);
      }
      await campaignHook.loadCampaigns();
    } catch (error) {
      throw error;
    }
  }, [archiveCampaign, campaignHook.loadCampaigns]);

  const bulkDelete = useCallback(async (campaignIds: string[]) => {
    try {
      for (const id of campaignIds) {
        await deleteCampaign(id);
      }
      await campaignHook.loadCampaigns();
    } catch (error) {
      throw error;
    }
  }, [deleteCampaign, campaignHook.loadCampaigns]);

  // Export functionality
  const exportCampaigns = useCallback(async (campaignIds?: string[], format: 'csv' | 'json' = 'csv') => {
    const campaignsToExport = campaignIds 
      ? campaignHook.campaigns.filter(c => campaignIds.includes(c.id))
      : campaignHook.campaigns;

    if (format === 'json') {
      const dataStr = JSON.stringify(campaignsToExport, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const headers = ['ID', 'Name', 'Category', 'Status', 'Created', 'Updated'];
      const csvData = [
        headers.join(','),
        ...campaignsToExport.map(c => [
          c.id,
          `"${c.name}"`,
          c.category_id,
          c.status,
          c.created_at,
          c.updated_at
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [campaignHook.campaigns]);

  // Search functionality
  const searchCampaigns = useCallback(async (query: string) => {
    filtersHook.updateFilter('search', query);
    return filtersHook.filterCampaigns(campaignHook.campaigns);
  }, [filtersHook.updateFilter, filtersHook.filterCampaigns, campaignHook.campaigns]);

  // Refresh data - use loadCampaigns as the refresh function
  const refreshData = useCallback(async () => {
    await campaignHook.loadCampaigns();
  }, [campaignHook.loadCampaigns]);

  return {
    // Data
    campaigns: campaignHook.campaigns,
    categories,
    isLoading: campaignHook.isLoading,
    error: campaignHook.error,
    stats,
    filters: filtersHook.filters,
    selectedCampaigns,
    currentCampaign,
    
    // Filter operations
    setFilters: filtersHook.updateFilter,
    setSelectedCampaigns,
    
    // CRUD operations
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    archiveCampaign,
    restoreCampaign,
    
    // Bulk operations
    bulkUpdateStatus,
    bulkArchive,
    bulkDelete,
    
    // Utility operations
    exportCampaigns,
    searchCampaigns,
    refreshData
  };
};
