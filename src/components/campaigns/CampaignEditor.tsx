
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignKeywords } from './CampaignKeywords';
import { CampaignDetails } from './CampaignDetails';
import { useCampaignDetails } from '@/hooks/useCampaignDetails';

interface CampaignEditorProps {
  campaignId: string;
}

export function CampaignEditor({ campaignId }: CampaignEditorProps) {
  const { campaign, loading } = useCampaignDetails(campaignId);

  if (loading) {
    return <div className="text-center py-8 campaign-primary-text">Loading campaign...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="campaign-secondary-bg campaign-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 campaign-primary-text">
            Campaign Editor
            {campaign && (
              <span className="font-normal campaign-secondary-text">
                - {campaign.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keywords" className="w-full">
            <TabsList className="campaign-card-bg campaign-border">
              <TabsTrigger value="keywords" className="campaign-primary-text">Keywords</TabsTrigger>
              <TabsTrigger value="details" className="campaign-primary-text">Campaign Details</TabsTrigger>
            </TabsList>

            <TabsContent value="keywords" className="space-y-4">
              <CampaignKeywords campaignId={campaignId} />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <CampaignDetails campaignId={campaignId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
