
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
      const table = type === 'positive' ? 'campaign_manager_keywords' : 'campaign_manager_negative_keywords';
      
      const { error } = await supabase
        .from(table)
        .insert({
          campaign_id: campaignId,
          keyword,
          match_type: matchType
        });

      if (error) {
        console.error(`Error adding ${type} keyword:`, error);
        return;
      }

      // Refresh keywords
      fetchKeywords();
    } catch (error) {
      console.error(`Error adding ${type} keyword:`, error);
    }
  };

  const removeKeyword = async (keywordId: string, type: 'positive' | 'negative') => {
    try {
      const table = type === 'positive' ? 'campaign_manager_keywords' : 'campaign_manager_negative_keywords';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', keywordId);

      if (error) {
        console.error(`Error removing ${type} keyword:`, error);
        return;
      }

      // Refresh keywords
      fetchKeywords();
    } catch (error) {
      console.error(`Error removing ${type} keyword:`, error);
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
