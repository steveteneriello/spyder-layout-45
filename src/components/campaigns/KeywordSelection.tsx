import React from 'react';
import { useDebugLogger } from '@/components/debug/DebugPanel';

interface KeywordSelectionProps {
  campaignData: {
    category: string;
    adhocKeywords: string;
  };
  handleInputChange: (field: string, value: any) => void;
  selectedCampaigns: number[];
  setSelectedCampaigns: (campaigns: number[]) => void;
  selectedKeywords: number[];
  setSelectedKeywords: (keywords: number[]) => void;
  onContinue: () => void;
}

const KeywordSelection: React.FC<KeywordSelectionProps> = ({
  campaignData,
  handleInputChange,
  selectedCampaigns,
  setSelectedCampaigns,
  selectedKeywords,
  setSelectedKeywords,
  onContinue
}) => {
  const debug = useDebugLogger('KeywordSelection');

  // Sample data - will be replaced with database calls
  const campaigns = [
    { id: 1, name: 'Water Heater Services', keywords: 12, category: 'plumbing' },
    { id: 2, name: 'Emergency Plumbing', keywords: 8, category: 'plumbing' },
    { id: 3, name: 'Drain Cleaning', keywords: 15, category: 'plumbing' },
    { id: 4, name: 'Build Custom Campaign', keywords: 0, category: 'custom' }
  ];

  const keywords = [
    { id: 1, text: 'water heater repair', volume: '2.9K', cpc: '$12', competition: 'High' },
    { id: 2, text: 'water heater replacement', volume: '1.8K', cpc: '$15', competition: 'High' },
    { id: 3, text: 'tankless water heater', volume: '3.2K', cpc: '$18', competition: 'Med' },
    { id: 4, text: 'water heater installation', volume: '2.1K', cpc: '$14', competition: 'High' },
    { id: 5, text: 'hot water heater repair', volume: '1.5K', cpc: '$13', competition: 'Med' }
  ];

  const toggleCampaign = (campaignId: number) => {
    const newSelection = selectedCampaigns.includes(campaignId) 
      ? selectedCampaigns.filter(id => id !== campaignId)
      : [...selectedCampaigns, campaignId];
    
    debug.debug('Campaign selection changed', { campaignId, newSelection });
    setSelectedCampaigns(newSelection);
  };

  const toggleKeyword = (keywordId: number) => {
    const newSelection = selectedKeywords.includes(keywordId) 
      ? selectedKeywords.filter(id => id !== keywordId)
      : [...selectedKeywords, keywordId];
    
    debug.debug('Keyword selection changed', { keywordId, newSelection });
    setSelectedKeywords(newSelection);
  };

  const handleFieldChange = (field: string, value: any) => {
    debug.debug('Keyword field changed', { field, value });
    handleInputChange(field, value);
  };

  const handleContinue = () => {
    debug.info('Keyword selection completed', { 
      selectedCampaigns, 
      selectedKeywords, 
      adhocKeywords: campaignData.adhocKeywords 
    });
    onContinue();
  };

  return (
    <div className="p-4 sm:p-6 bg-card">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
        <select
          value={campaignData.category}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background border border-border text-foreground"
        >
          <option value="plumbing">Plumbing</option>
          <option value="hvac">HVAC</option>
          <option value="roofing">Roofing</option>
          <option value="electrical">Electrical</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 h-80 sm:h-96">
        <div className="bg-muted rounded-lg p-4 overflow-y-auto border border-border">
          <h4 className="font-medium mb-4 text-foreground">Predefined Campaigns</h4>
          <div className="space-y-3">
            {campaigns.map(campaign => (
              <div
                key={campaign.id}
                onClick={() => toggleCampaign(campaign.id)}
                className={`p-4 bg-card border rounded-lg cursor-pointer transition-all ${
                  selectedCampaigns.includes(campaign.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="font-medium text-foreground">{campaign.name}</div>
                <div className="text-sm text-muted-foreground">{campaign.keywords} keywords</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-4 overflow-y-auto border border-border">
          <h4 className="font-medium mb-4 text-foreground">Keywords</h4>
          <div className="space-y-2">
            {keywords.map(keyword => (
              <div
                key={keyword.id}
                onClick={() => toggleKeyword(keyword.id)}
                className={`p-3 bg-card border rounded-lg cursor-pointer transition-all ${
                  selectedKeywords.includes(keyword.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="font-medium text-sm text-foreground">{keyword.text}</div>
                  <div className="flex gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <span>Vol: {keyword.volume}</span>
                    <span>CPC: {keyword.cpc}</span>
                    <span>Comp: {keyword.competition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2 text-foreground">
          Additional Ad-hoc Keywords (comma separated)
        </label>
        <input
          type="text"
          value={campaignData.adhocKeywords}
          onChange={(e) => handleFieldChange('adhocKeywords', e.target.value)}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background border border-border text-foreground placeholder:text-muted-foreground"
          placeholder="Enter custom keywords..."
        />
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-muted-foreground">
          {selectedCampaigns.length} campaign{selectedCampaigns.length !== 1 ? 's' : ''}, {selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''} selected
        </div>
        <button 
          onClick={handleContinue}
          disabled={selectedCampaigns.length === 0 && selectedKeywords.length === 0 && !campaignData.adhocKeywords}
          className="px-4 py-2 bg-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default KeywordSelection;
