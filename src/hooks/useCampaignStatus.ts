
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignStatus() {
  const [campaignStatuses, setCampaignStatuses] = useState<Record<string, { active: boolean }>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCampaignStatuses();
  }, []);

  const fetchCampaignStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_manager_campaign_status')
        .select('campaign_id, active');

      if (error) {
        console.error('Error fetching campaign statuses:', error);
        return;
      }

      const statusMap = (data || []).reduce((acc, status) => {
        acc[status.campaign_id] = { active: status.active };
        return acc;
      }, {} as Record<string, { active: boolean }>);

      setCampaignStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching campaign statuses:', error);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, active: boolean) => {
    setLoading(true);
    try {
      // First try to update existing record
      const { data: existingData, error: selectError } = await supabase
        .from('campaign_manager_campaign_status')
        .select('id')
        .eq('campaign_id', campaignId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing status:', selectError);
        return;
      }

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('campaign_manager_campaign_status')
          .update({
            active,
            last_updated: new Date().toISOString()
          })
          .eq('campaign_id', campaignId);

        if (error) {
          console.error('Error updating campaign status:', error);
          return;
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('campaign_manager_campaign_status')
          .insert({
            campaign_id: campaignId,
            active,
            last_updated: new Date().toISOString()
          });

        if (error) {
          console.error('Error inserting campaign status:', error);
          return;
        }
      }

      setCampaignStatuses(prev => ({
        ...prev,
        [campaignId]: { active }
      }));
    } catch (error) {
      console.error('Error updating campaign status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { campaignStatuses, toggleCampaignStatus, loading };
}
