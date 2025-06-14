
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignList } from './CampaignList';
import { CampaignEditor } from './CampaignEditor';
import { useCampaigns } from '@/hooks/useCampaigns';

export function CampaignDesigner() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const { campaigns, loading } = useCampaigns();

  console.log('CampaignDesigner - campaigns:', campaigns, 'loading:', loading);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaign Designer</h1>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
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
            onSelectCampaign={setSelectedCampaignId}
            selectedCampaignId={selectedCampaignId}
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
