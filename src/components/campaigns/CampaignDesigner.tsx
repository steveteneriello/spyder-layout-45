
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignList } from './CampaignList';
import { CampaignEditor } from './CampaignEditor';
import { CampaignWorkflow } from './CampaignWorkflow';
import { useCampaigns } from '@/hooks/useCampaigns';

type View = 'list' | 'editor' | 'workflow';

export function CampaignDesigner() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState('campaigns');
  const { campaigns, loading, refetch } = useCampaigns();

  console.log('CampaignDesigner - campaigns:', campaigns, 'loading:', loading);

  const handleSelectCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setCurrentView('list');
  };

  const handleEditCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveTab('editor');
    setCurrentView('editor');
  };

  const handleAddCampaign = () => {
    setCurrentView('workflow');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setActiveTab('campaigns');
    refetch();
  };

  if (currentView === 'workflow') {
    return (
      <CampaignWorkflow onBack={handleBackToList} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaign Designer</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="editor" disabled={!selectedCampaignId}>
            Campaign Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignList 
            campaigns={campaigns}
            loading={loading}
            onSelectCampaign={handleSelectCampaign}
            selectedCampaignId={selectedCampaignId}
            onAddCampaign={handleAddCampaign}
            onEditCampaign={handleEditCampaign}
          />
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedCampaignId && (
            <CampaignEditor campaignId={selectedCampaignId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
