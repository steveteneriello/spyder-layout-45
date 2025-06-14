
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignKeywords } from './CampaignKeywords';
import { CampaignDetails } from './CampaignDetails';

interface CampaignEditorProps {
  campaignId: string;
}

export function CampaignEditor({ campaignId }: CampaignEditorProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="keywords" className="w-full">
            <TabsList>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="details">Campaign Details</TabsTrigger>
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
