
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
    if (status === 'archived') return { backgroundColor: '#475569', color: '#cbd5e1', borderColor: '#475569' };
    if (!isActive) return { backgroundColor: '#475569', color: '#cbd5e1', borderColor: '#475569' };
    return { backgroundColor: '#64748b', color: '#f8fafc', borderColor: '#64748b' };
  };

  const getStatusText = (status: string, isActive: boolean) => {
    if (status === 'archived') return 'Archived';
    if (!isActive) return 'Inactive';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6 rounded-lg" style={{ backgroundColor: '#1e293b' }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold" style={{ color: '#f8fafc' }}>Campaigns</h2>
          <div className="flex gap-2">
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm" 
              disabled
              style={{ borderColor: '#475569', color: '#cbd5e1' }}
              className="hover:bg-[#334155]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={onAddCampaign} 
              size="sm" 
              disabled
              style={{ backgroundColor: '#3b82f6', color: '#f8fafc' }}
              className="hover:bg-[#2563eb]"
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
              style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}
            >
              <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                <div className="animate-pulse">
                  <div style={{ backgroundColor: '#475569' }} className="h-4 rounded w-3/4 mb-2"></div>
                  <div style={{ backgroundColor: '#475569' }} className="h-6 rounded w-1/2 mb-2"></div>
                  <div style={{ backgroundColor: '#475569' }} className="h-3 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 rounded-lg" style={{ backgroundColor: '#1e293b' }}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: '#f8fafc' }}>Campaigns</h2>
        <div className="flex gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            style={{ borderColor: '#475569', color: '#cbd5e1' }}
            className="hover:bg-[#334155] hover:text-[#f8fafc]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={onAddCampaign} 
            size="sm"
            style={{ backgroundColor: '#3b82f6', color: '#f8fafc' }}
            className="hover:bg-[#2563eb]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Campaign
          </Button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div 
          className="flex flex-col gap-6 rounded-xl border py-12 shadow-sm text-center"
          style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}
        >
          <div className="px-6">
            <div className="text-sm mb-2" style={{ color: '#cbd5e1' }}>No campaigns found</div>
            <div className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Get started by creating your first campaign</div>
            <Button 
              onClick={onAddCampaign}
              style={{ backgroundColor: '#3b82f6', color: '#f8fafc' }}
              className="hover:bg-[#2563eb]"
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
                  backgroundColor: '#0f172a', 
                  borderColor: '#475569',
                  ...(selectedCampaignId === campaign.id && { '--tw-ring-color': '#3b82f6' })
                }}
                onClick={() => onSelectCampaign(campaign.id)}
              >
                <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm mb-1" style={{ color: '#cbd5e1' }}>
                        {campaign.category?.name || 'Uncategorized'}
                      </div>
                      <div className="text-lg font-semibold mb-2 line-clamp-2" style={{ color: '#f8fafc' }}>
                        {campaign.name}
                      </div>
                      {campaign.description && (
                        <div className="text-sm line-clamp-2 mb-2" style={{ color: '#cbd5e1' }}>
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
                    <div style={{ color: '#cbd5e1' }}>
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
                        style={{ color: '#cbd5e1' }}
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
                    <div className="text-xs" style={{ color: '#cbd5e1' }}>
                      Budget: <span style={{ color: '#f8fafc' }} className="font-medium">${campaign.budget.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="text-xs" style={{ color: '#cbd5e1' }}>
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
