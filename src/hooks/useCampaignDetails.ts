
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignDetails(campaignId: string) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
    }
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_manager_campaigns')
        .select(`
          *,
          category:campaign_manager_categories!fk_campaigns_category(*),
          advertiser:admin_advertisers(*),
          market:admin_markets(*)
        `)
        .eq('id', campaignId)
        .single();

      if (error) {
        console.error('Error fetching campaign details:', error);
        return;
      }

      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    } finally {
      setLoading(false);
    }
  };

  return { campaign, loading, refetch: fetchCampaignDetails };
}
