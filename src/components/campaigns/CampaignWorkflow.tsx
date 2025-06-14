
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CampaignKeywords } from './CampaignKeywords';
import { ArrowLeft, Save, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useCampaignCategories } from '@/hooks/useCampaignCategories';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CampaignWorkflowProps {
  onBack: () => void;
}

interface CampaignData {
  name: string;
  description: string;
  campaign_type: 'advertiser' | 'market';
  category_id: string;
}

export function CampaignWorkflow({ onBack }: CampaignWorkflowProps) {
  const [step1Open, setStep1Open] = useState(true);
  const [step2Open, setStep2Open] = useState(false);
  const [step1Complete, setStep1Complete] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CampaignData>({
    name: '',
    description: '',
    campaign_type: 'market',
    category_id: '',
  });

  const { categories } = useCampaignCategories();
  const { toast } = useToast();

  const handleStep1Submit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Campaign name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_manager_campaigns')
        .insert({
          name: formData.name,
          description: formData.description,
          campaign_type: formData.campaign_type,
          category_id: formData.category_id || null,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating campaign:', error);
        toast({
          title: "Error",
          description: "Failed to create campaign. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setCampaignId(data.id);
      setStep1Complete(true);
      setStep1Open(false);
      setStep2Open(true);

      toast({
        title: "Success",
        description: "Campaign details saved! Now add your keywords.",
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeCampaign = async () => {
    if (!campaignId) return;

    try {
      const { error } = await supabase
        .from('campaign_manager_campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) {
        console.error('Error finalizing campaign:', error);
        toast({
          title: "Error",
          description: "Failed to finalize campaign.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Campaign created and activated successfully!",
      });

      onBack();
    } catch (error) {
      console.error('Error finalizing campaign:', error);
      toast({
        title: "Error",
        description: "Failed to finalize campaign.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
      </div>

      {/* Step 1: Campaign Details */}
      <Card>
        <Collapsible open={step1Open} onOpenChange={setStep1Open}>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                {step1Complete ? (
                  <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full text-white text-sm font-medium">
                    1
                  </div>
                )}
                <CardTitle>Campaign Details</CardTitle>
              </div>
              {step1Open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter campaign name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign_type">Campaign Type</Label>
                  <Select 
                    value={formData.campaign_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value as 'advertiser' | 'market' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Campaign</SelectItem>
                      <SelectItem value="advertiser">Advertiser Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  placeholder="Enter campaign description" 
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleStep1Submit} disabled={loading || step1Complete}>
                  {loading ? 'Saving...' : step1Complete ? 'Completed' : 'Save & Continue'}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Step 2: Keywords */}
      <Card>
        <Collapsible open={step2Open} onOpenChange={setStep2Open}>
          <CollapsibleTrigger className="w-full" disabled={!step1Complete}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-white text-sm font-medium ${
                  step1Complete ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  2
                </div>
                <CardTitle className={step1Complete ? '' : 'text-gray-400'}>
                  Add Keywords
                </CardTitle>
              </div>
              {step2Open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {campaignId ? (
                <div className="space-y-6">
                  <CampaignKeywords campaignId={campaignId} />
                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onBack}>
                      Save as Draft
                    </Button>
                    <Button onClick={handleFinalizeCampaign} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Finalize Campaign
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Complete step 1 to add keywords</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
