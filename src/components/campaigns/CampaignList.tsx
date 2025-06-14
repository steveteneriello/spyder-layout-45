
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Archive, RefreshCw } from 'lucide-react';
import { CampaignActions } from './CampaignActions';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  is_active: boolean;
  budget?: number;
  category?: {
    id: string;
    name: string;
  };
  advertiser?: {
    id: string;
    name: string;
  };
  market?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
  onSelectCampaign: (campaignId: string) => void;
  selectedCampaignId: string | null;
  onAddCampaign: () => void;
  onEditCampaign: (campaignId: string) => void;
  onRefresh: () => void;
}

export function CampaignList({
  campaigns,
  loading,
  onSelectCampaign,
  selectedCampaignId,
  onAddCampaign,
  onEditCampaign,
  onRefresh
}: CampaignListProps) {
  const getStatusBadgeVariant = (status: string, isActive: boolean) => {
    if (status === 'archived') return 'secondary';
    if (!isActive) return 'destructive';
    return 'default';
  };

  const getStatusText = (status: string, isActive: boolean) => {
    if (status === 'archived') return 'Archived';
    if (!isActive) return 'Inactive';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Campaigns</h2>
          <div className="flex gap-2">
            <Button onClick={onRefresh} variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={onAddCampaign} size="sm" disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
              <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Campaigns</h2>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" className="border-border hover:bg-accent hover:text-accent-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onAddCampaign} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-12 shadow-sm text-center">
          <div className="px-6">
            <div className="text-muted-foreground text-sm mb-2">No campaigns found</div>
            <div className="text-lg font-semibold mb-4">Get started by creating your first campaign</div>
            <Button onClick={onAddCampaign} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
                selectedCampaignId === campaign.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectCampaign(campaign.id)}
            >
              <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-muted-foreground text-sm mb-1">
                      {campaign.category?.name || 'Uncategorized'}
                    </div>
                    <div className="text-lg font-semibold mb-2 line-clamp-2">
                      {campaign.name}
                    </div>
                    {campaign.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {campaign.description}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={getStatusBadgeVariant(campaign.status, campaign.is_active)}
                    className="ml-2 shrink-0"
                  >
                    {getStatusText(campaign.status, campaign.is_active)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex px-6 flex-col items-start gap-1.5 text-sm">
                <div className="flex justify-between items-center w-full">
                  <div className="text-muted-foreground">
                    {campaign.advertiser?.name && (
                      <span>Advertiser: {campaign.advertiser.name}</span>
                    )}
                    {campaign.market?.name && (
                      <span className="ml-2">Market: {campaign.market.name}</span>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCampaign(campaign.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <CampaignActions campaignId={campaign.id} />
                  </div>
                </div>
                {campaign.budget && (
                  <div className="text-muted-foreground text-xs">
                    Budget: ${campaign.budget.toLocaleString()}
                  </div>
                )}
                <div className="text-muted-foreground text-xs">
                  Created: {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
