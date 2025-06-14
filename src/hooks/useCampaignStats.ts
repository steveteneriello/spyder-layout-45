
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignStats() {
  const [stats, setStats] = useState({
    totalActiveCampaigns: 0,
    totalCategories: 0,
    totalKeywords: 0,
    totalNegativeKeywords: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total active campaigns
      const { count: activeCampaigns } = await supabase
        .from('campaign_manager_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total categories
      const { count: categories } = await supabase
        .from('campaign_manager_categories')
        .select('*', { count: 'exact', head: true });

      // Get total keywords
      const { count: keywords } = await supabase
        .from('campaign_manager_keywords')
        .select('*', { count: 'exact', head: true });

      // Get total negative keywords
      const { count: negativeKeywords } = await supabase
        .from('campaign_manager_negative_keywords')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalActiveCampaigns: activeCampaigns || 0,
        totalCategories: categories || 0,
        totalKeywords: keywords || 0,
        totalNegativeKeywords: negativeKeywords || 0
      });
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}
