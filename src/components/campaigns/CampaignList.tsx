
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Archive, RefreshCw } from 'lucide-react';
import { CampaignActions } from './CampaignActions';
import { useCampaignStatus } from '@/hooks/useCampaignStatus';

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
  const { campaignStatuses, toggleCampaignStatus, loading: statusLoading } = useCampaignStatus();

  const getStatusBadgeClasses = (status: string, isActive: boolean) => {
    if (status === 'archived') return 'bg-slate-500 text-slate-100 border-slate-500';
    if (!isActive) return 'bg-slate-500 text-slate-100 border-slate-500';
    return 'campaign-accent text-white border-current';
  };

  const getStatusText = (status: string, isActive: boolean) => {
    if (status === 'archived') return 'Archived';
    if (!isActive) return 'Paused';
    return 'Active';
  };

  const getCampaignActiveStatus = (campaign: Campaign) => {
    const status = campaignStatuses[campaign.id];
    return status?.active ?? campaign.is_active ?? false;
  };

  const handleToggleStatus = async (campaignId: string, currentStatus: boolean) => {
    await toggleCampaignStatus(campaignId, !currentStatus);
    // Refresh campaigns after status change
    onRefresh();
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6 rounded-lg campaign-secondary-bg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold campaign-primary-text">Campaigns</h2>
          <div className="flex gap-2">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              disabled
              className="campaign-border campaign-secondary-text"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={onAddCampaign} 
              size="sm" 
              disabled
              className="campaign-button-blue text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className="flex flex-col gap-6 rounded-xl border py-6 shadow-sm campaign-card-bg campaign-border"
            >
              <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div className="animate-pulse">
                  <div className="h-4 rounded w-3/4 mb-2 bg-current opacity-20"></div>
                  <div className="h-6 rounded w-1/2 mb-2 bg-current opacity-20"></div>
                  <div className="h-3 rounded w-full bg-current opacity-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 rounded-lg campaign-secondary-bg">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold campaign-primary-text">Campaigns</h2>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            className="campaign-border campaign-secondary-text hover:campaign-card-bg hover:campaign-primary-text"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={onAddCampaign} 
            size="sm"
            className="campaign-button-blue text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col gap-6 rounded-xl border py-12 shadow-sm text-center campaign-card-bg campaign-border">
          <div className="px-6">
            <div className="text-sm mb-2 campaign-secondary-text">No campaigns found</div>
            <div className="text-lg font-semibold mb-4 campaign-primary-text">Get started by creating your first campaign</div>
            <Button 
              onClick={onAddCampaign}
              className="campaign-button-blue text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const isActive = getCampaignActiveStatus(campaign);
            const statusClasses = getStatusBadgeClasses(campaign.status, isActive);
            return (
              <div
                key={campaign.id}
                className={`flex flex-col gap-6 rounded-xl border py-6 shadow-sm cursor-pointer hover:shadow-md hover:border-opacity-80 transition-all duration-200 @container/card campaign-card-bg campaign-border ${
                  selectedCampaignId === campaign.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onSelectCampaign(campaign.id)}
              >
                <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <Switch 
                        checked={isActive}
                        onCheckedChange={() => handleToggleStatus(campaign.id, isActive)}
                        disabled={statusLoading}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                      <div className="flex-1">
                        <div className="text-sm mb-1 campaign-secondary-text">
                          {campaign.category?.name || 'Uncategorized'}
                        </div>
                        <div className="text-lg font-semibold mb-2 line-clamp-2 campaign-primary-text">
                          {campaign.name}
                        </div>
                        {campaign.description && (
                          <div className="text-sm line-clamp-2 mb-2 campaign-secondary-text">
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`ml-2 shrink-0 px-2 py-1 rounded text-xs font-medium border ${statusClasses}`}>
                      {getStatusText(campaign.status, isActive)}
                    </div>
                  </div>
                </div>
                
                <div className="flex px-6 flex-col items-start gap-1.5 text-sm">
                  <div className="flex justify-between items-center w-full">
                    <div className="campaign-secondary-text">
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
                        className="h-8 w-8 p-0 campaign-secondary-text"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <CampaignActions 
                        campaignId={campaign.id}
                        campaignName={campaign.name}
                        currentStatus={campaign.status}
                        onEdit={() => onEditCampaign(campaign.id)}
                        onRefresh={onRefresh}
                      />
                    </div>
                  </div>
                  <div className="text-xs campaign-secondary-text">
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
