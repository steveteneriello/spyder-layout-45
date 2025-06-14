
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignList } from './CampaignList';
import { CampaignEditor } from './CampaignEditor';
import { CampaignForm } from './CampaignForm';
import { useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type View = 'list' | 'editor' | 'form';

export function CampaignDesigner() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState('campaigns');
  const { campaigns, loading, refetch } = useCampaigns();
  const { toast } = useToast();

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
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setActiveTab('campaigns');
  };

  const handleSaveCampaign = async (data: any) => {
    try {
      const { error } = await supabase
        .from('campaign_manager_campaigns')
        .insert({
          name: data.name,
          description: data.description,
          campaign_type: data.campaign_type,
          budget: data.budget,
          start_date: data.start_date,
          end_date: data.end_date,
          status: 'draft'
        });

      if (error) {
        console.error('Error creating campaign:', error);
        toast({
          title: "Error",
          description: "Failed to create campaign. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });

      refetch();
      handleBackToList();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (currentView === 'form') {
    return (
      <CampaignForm 
        onBack={handleBackToList}
        onSave={handleSaveCampaign}
      />
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
