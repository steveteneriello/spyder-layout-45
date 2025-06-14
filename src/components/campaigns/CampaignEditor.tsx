
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
    return <div className="text-center py-8" style={{ color: '#f8fafc' }}>Loading campaign...</div>;
  }

  return (
    <div className="space-y-6">
      <Card style={{ backgroundColor: '#1e293b', borderColor: '#475569' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#f8fafc' }}>
            Campaign Editor
            {campaign && (
              <span className="font-normal" style={{ color: '#cbd5e1' }}>
                - {campaign.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keywords" className="w-full">
            <TabsList style={{ backgroundColor: '#0f172a', borderColor: '#475569' }}>
              <TabsTrigger value="keywords" style={{ color: '#f8fafc' }}>Keywords</TabsTrigger>
              <TabsTrigger value="details" style={{ color: '#f8fafc' }}>Campaign Details</TabsTrigger>
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
