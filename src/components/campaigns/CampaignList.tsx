
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Target, Calendar, DollarSign } from 'lucide-react';
import { useCampaignStatus } from '@/hooks/useCampaignStatus';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  campaign_type: 'advertiser' | 'market';
  budget?: number;
  start_date?: string;
  end_date?: string;
  category?: {
    name: string;
  };
  advertiser?: {
    advertiser_name: string;
  };
  market?: {
    market: string;
  };
}

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
  onSelectCampaign: (campaignId: string) => void;
  selectedCampaignId: string | null;
}

export function CampaignList({ campaigns, loading, onSelectCampaign, selectedCampaignId }: CampaignListProps) {
  const { campaignStatuses, toggleCampaignStatus, loading: statusLoading } = useCampaignStatus();

  console.log('CampaignList - campaigns:', campaigns, 'loading:', loading);

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((campaign) => {
        const status = campaignStatuses[campaign.id];
        const isActive = status?.active ?? false;

        return (
          <Card 
            key={campaign.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCampaignId === campaign.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectCampaign(campaign.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={isActive}
                    onCheckedChange={() => toggleCampaignStatus(campaign.id, !isActive)}
                    disabled={statusLoading}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {campaign.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {campaign.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {campaign.campaign_type === 'advertiser' ? 'Advertiser' : 'Market'}
                  </Badge>
                  {campaign.category && (
                    <span className="text-muted-foreground">{campaign.category.name}</span>
                  )}
                </div>

                {campaign.campaign_type === 'advertiser' && campaign.advertiser && (
                  <div className="text-sm text-muted-foreground">
                    Advertiser: {campaign.advertiser.advertiser_name}
                  </div>
                )}

                {campaign.campaign_type === 'market' && campaign.market && (
                  <div className="text-sm text-muted-foreground">
                    Market: {campaign.market.market}
                  </div>
                )}

                {campaign.budget && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    Budget: ${campaign.budget.toLocaleString()}
                  </div>
                )}

                {campaign.start_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(campaign.start_date).toLocaleDateString()}
                    {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCampaign(campaign.id);
                }}
              >
                Edit Campaign
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {campaigns.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          No campaigns found. Create your first campaign to get started.
        </div>
      )}
    </div>
  );
}
