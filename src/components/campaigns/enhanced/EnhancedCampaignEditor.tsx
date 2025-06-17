import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye, Settings, Target, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Campaign } from '@/hooks/useCampaignManagement';
import { useToast } from "@/hooks/use-toast";

interface EnhancedCampaignEditorProps {
  campaign: Campaign | null;
  mode: 'create' | 'edit' | 'duplicate';
  categories: Array<{ id: string; name: string; }>;
  onSave: (campaign: Campaign) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

interface StepStatus {
  completed: boolean;
  hasErrors: boolean;
  data?: any;
}

interface EditorState {
  campaignData: Partial<Campaign>;
  steps: {
    details: StepStatus;
    locations: StepStatus;
    keywords: StepStatus;
    schedule: StepStatus;
  };
  activeTab: string;
  isDirty: boolean;
  isSaving: boolean;
}

const EDITOR_TABS = [
  { id: 'details', label: 'Campaign Details', icon: Settings, stepKey: 'details' },
  { id: 'locations', label: 'Location Targeting', icon: MapPin, stepKey: 'locations' },
  { id: 'keywords', label: 'Keywords', icon: Target, stepKey: 'keywords' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, stepKey: 'schedule' },
  { id: 'preview', label: 'Preview', icon: Eye, stepKey: null }
] as const;

export const EnhancedCampaignEditor: React.FC<EnhancedCampaignEditorProps> = ({
  campaign,
  mode,
  categories,
  onSave,
  onCancel,
  className = ''
}) => {
  const { toast } = useToast();

  const [state, setState] = useState<EditorState>({
    campaignData: campaign ? { ...campaign } : {
      name: '',
      category_id: '',
      description: '',
      status: 'draft'
    },
    steps: {
      details: { completed: !!campaign?.name, hasErrors: false },
      locations: { completed: !!campaign?.locationTargeting, hasErrors: false },
      keywords: { completed: false, hasErrors: false },
      schedule: { completed: false, hasErrors: false }
    },
    activeTab: 'details',
    isDirty: false,
    isSaving: false
  });

  useEffect(() => {
    debug.info('Enhanced Campaign Editor mounted', { mode, campaignId: campaign?.id });
    return () => debug.info('Enhanced Campaign Editor unmounted');
  }, []);

  useEffect(() => {
    if (campaign) {
      setState(prev => ({
        ...prev,
        campaignData: { ...campaign },
        steps: {
          details: { completed: !!campaign.name, hasErrors: false },
          locations: { completed: !!campaign.locationTargeting, hasErrors: false },
          keywords: { completed: false, hasErrors: false },
          schedule: { completed: !!campaign.scheduleConfig, hasErrors: false }
        }
      }));
    }
  }, [campaign]);

  const updateCampaignData = (updates: Partial<Campaign>) => {
    setState(prev => ({
      ...prev,
      campaignData: { ...prev.campaignData, ...updates },
      isDirty: true
    }));
  };

  const updateStepStatus = (stepKey: keyof EditorState['steps'], status: Partial<StepStatus>) => {
    setState(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepKey]: { ...prev.steps[stepKey], ...status }
      }
    }));
  };

  const handleStepContinue = (stepKey: keyof EditorState['steps'], data?: any) => {
    debug.info('Step continue', { stepKey, data });
    
    updateStepStatus(stepKey, { completed: true, hasErrors: false, data });
    
    // Auto-advance to next tab
    const currentIndex = EDITOR_TABS.findIndex(tab => tab.stepKey === stepKey);
    if (currentIndex >= 0 && currentIndex < EDITOR_TABS.length - 1) {
      setState(prev => ({ ...prev, activeTab: EDITOR_TABS[currentIndex + 1].id }));
    }
  };

  const handleSave = async () => {
    debug.info('Saving campaign', { mode, data: state.campaignData });
    
    if (!state.campaignData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, activeTab: 'details' }));
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const campaignToSave: Campaign = {
        id: campaign?.id || `campaign_${Date.now()}`,
        name: state.campaignData.name!,
        category_id: state.campaignData.category_id || '',
        description: state.campaignData.description,
        status: state.campaignData.status || 'draft',
        created_at: campaign?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...state.campaignData
      };

      await onSave(campaignToSave);
      
      setState(prev => ({ ...prev, isDirty: false }));
      
      toast({
        title: "Success",
        description: `Campaign ${mode === 'create' ? 'created' : 'updated'} successfully`
      });
      
      debug.info('Campaign saved successfully', { id: campaignToSave.id });
    } catch (error) {
      debug.error('Failed to save campaign', { error });
      toast({
        title: "Error",
        description: `Failed to ${mode} campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const getTabIcon = (tab: typeof EDITOR_TABS[number], stepStatus?: StepStatus) => {
    const Icon = tab.icon;
    if (tab.stepKey && stepStatus?.completed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <Icon className="h-4 w-4" />;
  };

  const getCompletedStepsCount = () => {
    return Object.values(state.steps).filter(step => step.completed).length;
  };

  const getTotalStepsCount = () => {
    return Object.keys(state.steps).length;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Create Campaign' : mode === 'duplicate' ? 'Duplicate Campaign' : 'Edit Campaign'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">
                {state.campaignData.name || 'Untitled Campaign'}
              </p>
              <Badge variant="outline" className="text-xs">
                {getCompletedStepsCount()} / {getTotalStepsCount()} steps completed
              </Badge>
              {state.isDirty && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={state.isSaving || !state.isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {state.isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={state.isSaving || !state.campaignData.name?.trim()}
          >
            {state.isSaving ? 'Saving...' : mode === 'create' ? 'Create Campaign' : 'Update Campaign'}
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Card className="bg-card border-border">
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="grid w-full grid-cols-5 bg-muted border-border">
            {EDITOR_TABS.map((tab) => {
              const stepStatus = tab.stepKey ? state.steps[tab.stepKey as keyof EditorState['steps']] : undefined;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  {getTabIcon(tab, stepStatus)}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Campaign Details Tab */}
          <TabsContent value="details" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Campaign Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={state.campaignData.name || ''}
                      onChange={(e) => updateCampaignData({ name: e.target.value })}
                      placeholder="Enter campaign name"
                      className="bg-background border-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="campaign-category">Category *</Label>
                    <Select 
                      value={state.campaignData.category_id || ''} 
                      onValueChange={(value) => updateCampaignData({ category_id: value })}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="campaign-description">Description</Label>
                  <Textarea
                    id="campaign-description"
                    value={state.campaignData.description || ''}
                    onChange={(e) => updateCampaignData({ description: e.target.value })}
                    placeholder="Enter campaign description"
                    className="bg-background border-border"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleStepContinue('details')}
                    disabled={!state.campaignData.name || !state.campaignData.category_id}
                    className="bg-primary text-primary-foreground"
                  >
                    Continue to Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Targeting Tab */}
          <TabsContent value="locations" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Targeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Location Targeting</h3>
                  <p className="text-muted-foreground mb-4">
                    Location targeting features will be integrated here.
                  </p>
                  <Button 
                    onClick={() => handleStepContinue('locations')}
                    className="bg-primary text-primary-foreground"
                  >
                    Continue to Keywords
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keywords Tab */}
          <TabsContent value="keywords" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keyword Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Keyword Selection</h3>
                  <p className="text-muted-foreground mb-4">
                    Keyword research and selection features will be integrated here.
                  </p>
                  <Button 
                    onClick={() => handleStepContinue('keywords')}
                    className="bg-primary text-primary-foreground"
                  >
                    Continue to Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Schedule Configuration</h3>
                  <p className="text-muted-foreground mb-4">
                    Campaign scheduling and budget features will be integrated here.
                  </p>
                  <Button 
                    onClick={() => handleStepContinue('schedule')}
                    className="bg-primary text-primary-foreground"
                  >
                    Continue to Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Campaign Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <h4 className="font-medium text-foreground mb-2">Campaign Details</h4>
                    <p className="text-sm text-muted-foreground">Name: {state.campaignData.name || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground">Description: {state.campaignData.description || 'None'}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={onCancel}
                      className="border-border text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="bg-primary text-primary-foreground"
                      disabled={state.isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {state.isSaving ? 'Saving...' : (mode === 'create' ? 'Create Campaign' : 'Update Campaign')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Campaign Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Campaign Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">{state.campaignData.name || 'Untitled Campaign'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2">
                          {categories.find(c => c.id === state.campaignData.category_id)?.name || 'None selected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {state.campaignData.status}
                        </Badge>
                      </div>
                      {state.campaignData.description && (
                        <div>
                          <span className="text-muted-foreground">Description:</span>
                          <p className="ml-2 mt-1">{state.campaignData.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Configuration</h3>
                    <div className="space-y-2 text-sm">
                      {state.campaignData.locationTargeting && (
                        <div>
                          <span className="text-muted-foreground">Locations:</span>
                          <span className="ml-2">
                            {state.campaignData.locationTargeting.included.length} selected
                          </span>
                        </div>
                      )}
                      {state.campaignData.settings?.dailyBudget && (
                        <div>
                          <span className="text-muted-foreground">Daily Budget:</span>
                          <span className="ml-2 font-medium">${state.campaignData.settings.dailyBudget}</span>
                        </div>
                      )}
                      {state.campaignData.settings?.maxCpc && (
                        <div>
                          <span className="text-muted-foreground">Max CPC:</span>
                          <span className="ml-2">${state.campaignData.settings.maxCpc}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Ready to {mode === 'create' ? 'create' : 'update'} this campaign?
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={state.isSaving}>
                      {state.isSaving ? 'Saving...' : mode === 'create' ? 'Create Campaign' : 'Update Campaign'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
