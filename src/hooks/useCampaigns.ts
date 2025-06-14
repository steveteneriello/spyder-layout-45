
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignFilters {
  searchTerm?: string;
  statusFilter?: string;
  categoryFilter?: string;
  page?: number;
  pageSize?: number;
}

export function useCampaigns(filters: CampaignFilters = {}) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const {
    searchTerm = '',
    statusFilter = 'all',
    categoryFilter = 'all',
    page = 1,
    pageSize = 12
  } = filters;

  useEffect(() => {
    fetchCampaigns();
  }, [searchTerm, statusFilter, categoryFilter, page, pageSize]);

  const fetchCampaigns = async () => {
    try {
      console.log('Fetching campaigns with filters:', filters);
      setLoading(true);

      let query = supabase
        .from('campaign_manager_campaigns')
        .select(`
          *,
          category:campaign_manager_categories!fk_campaigns_category(*),
          advertiser:admin_advertisers(*),
          market:admin_markets(*)
        `, { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false);
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching campaigns:', error);
        return;
      }

      console.log('Campaigns fetched:', data, 'Total count:', count);
      setCampaigns(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    campaigns, 
    loading, 
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
    refetch: fetchCampaigns 
  };
}
