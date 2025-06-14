
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignKeywords(campaignId: string) {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      fetchKeywords();
    }
  }, [campaignId]);

  const fetchKeywords = async () => {
    try {
      console.log('Fetching keywords for campaign:', campaignId);
      
      // Fetch positive keywords with stats
      const { data: keywordData, error: keywordError } = await supabase
        .from('campaign_manager_keywords')
        .select(`
          *,
          stats:campaign_manager_keyword_stats(*)
        `)
        .eq('campaign_id', campaignId);

      if (keywordError) {
        console.error('Error fetching keywords:', keywordError);
      } else {
        console.log('Fetched keywords:', keywordData);
        // Process keywords to include latest stats
        const processedKeywords = (keywordData || []).map(keyword => ({
          ...keyword,
          stats: keyword.stats?.[0] || null
        }));
        setKeywords(processedKeywords);
      }

      // Fetch negative keywords
      const { data: negativeData, error: negativeError } = await supabase
        .from('campaign_manager_negative_keywords')
        .select('*')
        .eq('campaign_id', campaignId);

      if (negativeError) {
        console.error('Error fetching negative keywords:', negativeError);
      } else {
        console.log('Fetched negative keywords:', negativeData);
        setNegativeKeywords(negativeData || []);
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = async (keyword: string, matchType: string, type: 'positive' | 'negative') => {
    try {
      console.log('Adding keyword:', { keyword, matchType, type, campaignId });
      
      const table = type === 'positive' ? 'campaign_manager_keywords' : 'campaign_manager_negative_keywords';
      
      const { data, error } = await supabase
        .from(table)
        .insert({
          campaign_id: campaignId,
          keyword: keyword.trim(),
          match_type: matchType
        })
        .select();

      if (error) {
        console.error(`Error adding ${type} keyword:`, error);
        throw error;
      }

      console.log(`Successfully added ${type} keyword:`, data);
      
      // Refresh keywords to show the new addition
      await fetchKeywords();
    } catch (error) {
      console.error(`Error adding ${type} keyword:`, error);
      throw error;
    }
  };

  const removeKeyword = async (keywordId: string, type: 'positive' | 'negative') => {
    try {
      console.log('Removing keyword:', { keywordId, type });
      
      const table = type === 'positive' ? 'campaign_manager_keywords' : 'campaign_manager_negative_keywords';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', keywordId);

      if (error) {
        console.error(`Error removing ${type} keyword:`, error);
        throw error;
      }

      console.log(`Successfully removed ${type} keyword`);
      
      // Refresh keywords
      await fetchKeywords();
    } catch (error) {
      console.error(`Error removing ${type} keyword:`, error);
      throw error;
    }
  };

  return {
    keywords,
    negativeKeywords,
    addKeyword,
    removeKeyword,
    loading,
    refetch: fetchKeywords
  };
}
