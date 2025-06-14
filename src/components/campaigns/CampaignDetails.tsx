
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useCampaignDetails } from '@/hooks/useCampaignDetails';
import { useCampaignStatus } from '@/hooks/useCampaignStatus';
import { Calendar, DollarSign, Target, Building, MapPin } from 'lucide-react';

interface CampaignDetailsProps {
  campaignId: string;
}

export function CampaignDetails({ campaignId }: CampaignDetailsProps) {
  const { campaign, loading } = useCampaignDetails(campaignId);
  const { campaignStatuses, toggleCampaignStatus, loading: statusLoading } = useCampaignStatus();

  if (loading) {
    return <div className="text-center py-8">Loading campaign details...</div>;
  }

  if (!campaign) {
    return <div className="text-center py-8 text-muted-foreground">Campaign not found</div>;
  }

  const status = campaignStatuses[campaignId];
  const isActive = status?.active ?? false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {campaign.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch 
                checked={isActive}
                onCheckedChange={() => toggleCampaignStatus(campaignId, !isActive)}
                disabled={statusLoading}
              />
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : 'Paused'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {campaign.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm">{campaign.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Campaign Type</h3>
                <Badge variant="outline" className="text-sm">
                  {campaign.campaign_type === 'advertiser' ? 'Advertiser Campaign' : 'Market Campaign'}
                </Badge>
              </div>

              {campaign.category && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Category</h3>
                  <p className="text-sm">{campaign.category.name}</p>
                  {campaign.category.description && (
                    <p className="text-xs text-muted-foreground mt-1">{campaign.category.description}</p>
                  )}
                </div>
              )}

              {campaign.campaign_type === 'advertiser' && campaign.advertiser && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Advertiser
                  </h3>
                  <p className="text-sm">{campaign.advertiser.advertiser_name}</p>
                </div>
              )}

              {campaign.campaign_type === 'market' && campaign.market && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Market
                  </h3>
                  <p className="text-sm">{campaign.market.market}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {campaign.budget && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Budget
                  </h3>
                  <p className="text-sm font-mono">${campaign.budget.toLocaleString()}</p>
                </div>
              )}

              {(campaign.start_date || campaign.end_date) && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Campaign Period
                  </h3>
                  <div className="text-sm space-y-1">
                    {campaign.start_date && (
                      <p>Start: {new Date(campaign.start_date).toLocaleDateString()}</p>
                    )}
                    {campaign.end_date && (
                      <p>End: {new Date(campaign.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                <Badge variant="outline" className="text-sm">
                  {campaign.status}
                </Badge>
              </div>
            </div>
          </div>

          {campaign.target_locations && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Target Locations</h3>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-auto">{JSON.stringify(campaign.target_locations, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
