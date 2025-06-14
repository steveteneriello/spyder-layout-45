
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Target, Calendar, DollarSign, Plus } from 'lucide-react';
import { useCampaignStatus } from '@/hooks/useCampaignStatus';
import { CampaignActions } from './CampaignActions';

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
  onAddCampaign?: () => void;
  onEditCampaign?: (campaignId: string) => void;
  onRefresh?: () => void;
}

export function CampaignList({ 
  campaigns, 
  loading, 
  onSelectCampaign, 
  selectedCampaignId, 
  onAddCampaign,
  onEditCampaign,
  onRefresh = () => {}
}: CampaignListProps) {
  const { campaignStatuses, toggleCampaignStatus, loading: statusLoading } = useCampaignStatus();

  console.log('CampaignList - campaigns:', campaigns, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Campaign Button */}
      {onAddCampaign && (
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Your Campaigns</h2>
          <Button onClick={onAddCampaign} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Campaign
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => {
          const status = campaignStatuses[campaign.id];
          const isActive = status?.active ?? false;
          const isArchived = campaign.status === 'archived';

          return (
            <Card 
              key={campaign.id} 
              className={`cursor-pointer transition-all hover:shadow-md dark:hover:shadow-lg border bg-card ${
                selectedCampaignId === campaign.id 
                  ? 'ring-2 ring-primary border-primary shadow-md' 
                  : 'border-border hover:border-primary/50'
              } ${isArchived ? 'opacity-75' : ''}`}
              onClick={() => onSelectCampaign(campaign.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <CardTitle className="text-lg text-card-foreground">{campaign.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isArchived && (
                      <Switch 
                        checked={isActive}
                        onCheckedChange={(checked) => toggleCampaignStatus(campaign.id, checked)}
                        disabled={statusLoading}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <Badge variant={isArchived ? 'outline' : isActive ? 'default' : 'secondary'}>
                      {isArchived ? 'Archived' : isActive ? 'Active' : 'Paused'}
                    </Badge>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CampaignActions
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                        currentStatus={campaign.status}
                        onEdit={() => onEditCampaign?.(campaign.id)}
                        onRefresh={onRefresh}
                      />
                    </div>
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
                    <Badge variant="outline" className="text-xs border-border bg-background">
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
                  className="w-full mt-3 border-border hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditCampaign) {
                      onEditCampaign(campaign.id);
                    } else {
                      onSelectCampaign(campaign.id);
                    }
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
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-foreground">No campaigns found</h3>
            <p className="mb-4">Create your first campaign to get started.</p>
            {onAddCampaign && (
              <Button onClick={onAddCampaign} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add New Campaign
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
