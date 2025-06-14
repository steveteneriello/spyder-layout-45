
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
  const getStatusBadgeClasses = (status: string, isActive: boolean) => {
    if (status === 'archived') return { backgroundColor: '#444444', color: '#B0B0B0', borderColor: '#444444' };
    if (!isActive) return { backgroundColor: '#444444', color: '#B0B0B0', borderColor: '#444444' };
    return { backgroundColor: '#888888', color: '#E0E0E0', borderColor: '#888888' };
  };

  const getStatusText = (status: string, isActive: boolean) => {
    if (status === 'archived') return 'Archived';
    if (!isActive) return 'Inactive';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6 rounded-lg" style={{ backgroundColor: '#444444' }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold" style={{ color: '#E0E0E0' }}>Campaigns</h2>
          <div className="flex gap-2">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              disabled
              style={{ borderColor: '#444444', color: '#B0B0B0' }}
              className="hover:bg-[#444444]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={onAddCampaign} 
              size="sm" 
              disabled
              style={{ backgroundColor: '#888888', color: '#E0E0E0' }}
              className="hover:bg-[#444444]"
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
              className="flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
              style={{ backgroundColor: '#121212', borderColor: '#444444' }}
            >
              <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div className="animate-pulse">
                  <div style={{ backgroundColor: '#444444' }} className="h-4 rounded w-3/4 mb-2"></div>
                  <div style={{ backgroundColor: '#444444' }} className="h-6 rounded w-1/2 mb-2"></div>
                  <div style={{ backgroundColor: '#444444' }} className="h-3 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 rounded-lg" style={{ backgroundColor: '#444444' }}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: '#E0E0E0' }}>Campaigns</h2>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            style={{ borderColor: '#444444', color: '#B0B0B0' }}
            className="hover:bg-[#444444] hover:text-[#E0E0E0]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={onAddCampaign} 
            size="sm"
            style={{ backgroundColor: '#888888', color: '#E0E0E0' }}
            className="hover:bg-[#B0B0B0]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div 
          className="flex flex-col gap-6 rounded-xl border py-12 shadow-sm text-center"
          style={{ backgroundColor: '#121212', borderColor: '#444444' }}
        >
          <div className="px-6">
            <div className="text-sm mb-2" style={{ color: '#B0B0B0' }}>No campaigns found</div>
            <div className="text-lg font-semibold mb-4" style={{ color: '#E0E0E0' }}>Get started by creating your first campaign</div>
            <Button 
              onClick={onAddCampaign}
              style={{ backgroundColor: '#888888', color: '#E0E0E0' }}
              className="hover:bg-[#B0B0B0]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const statusStyles = getStatusBadgeClasses(campaign.status, campaign.is_active);
            return (
              <div
                key={campaign.id}
                className={`flex flex-col gap-6 rounded-xl border py-6 shadow-sm cursor-pointer hover:shadow-md hover:border-opacity-80 transition-all duration-200 @container/card ${
                  selectedCampaignId === campaign.id ? 'ring-2' : ''
                }`}
                style={{ 
                  backgroundColor: '#121212', 
                  borderColor: '#444444',
                  ...(selectedCampaignId === campaign.id && { '--tw-ring-color': '#888888' })
                }}
                onClick={() => onSelectCampaign(campaign.id)}
              >
                <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm mb-1" style={{ color: '#B0B0B0' }}>
                        {campaign.category?.name || 'Uncategorized'}
                      </div>
                      <div className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: '#E0E0E0' }}>
                        {campaign.name}
                      </div>
                      {campaign.description && (
                        <div className="text-sm line-clamp-2 mb-2" style={{ color: '#B0B0B0' }}>
                          {campaign.description}
                        </div>
                      )}
                    </div>
                    <div
                      className="ml-2 shrink-0 px-2 py-1 rounded text-xs font-medium border"
                      style={statusStyles}
                    >
                      {getStatusText(campaign.status, campaign.is_active)}
                    </div>
                  </div>
                </div>
                
                <div className="flex px-6 flex-col items-start gap-1.5 text-sm">
                  <div className="flex justify-between items-center w-full">
                    <div style={{ color: '#B0B0B0' }}>
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
                        className="h-8 w-8 p-0"
                        style={{ color: '#B0B0B0' }}
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
                  {campaign.budget && (
                    <div className="text-xs" style={{ color: '#B0B0B0' }}>
                      Budget: <span style={{ color: '#E0E0E0' }} className="font-medium">${campaign.budget.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="text-xs" style={{ color: '#B0B0B0' }}>
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
