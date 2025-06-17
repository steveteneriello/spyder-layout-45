import React, { useState, useEffect } from 'react';
import { useDebugLogger } from '@/components/debug/DebugPanel';
import { useCampaignCategories } from '@/hooks/useCampaignCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Info, Save, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CampaignDetailsProps {
  campaignData: {
    name: string;
    type: 'client' | 'market' | 'prospect' | 'data';
    assignment: string;
    assignmentId: string;
    network: 'google' | 'bing';
    targetingType: 'local' | 'regional' | 'timezone';
    savedConfig: string;
    category: string;
    startDate: string;
    endDate: string;
    noEndDate: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'bi-monthly' | 'specific';
    runTime: string;
    worker: string;
    adhocKeywords: string;
  };
  handleInputChange: (field: string, value: any) => void;
  onContinue: () => void;
}

// Sample data - in real implementation, these would come from API
const CAMPAIGN_TYPES = [
  { value: 'client', label: 'Client Campaign', description: 'Campaign for specific client' },
  { value: 'market', label: 'Market Research', description: 'Market analysis campaign' },
  { value: 'prospect', label: 'Prospect Campaign', description: 'Lead generation campaign' },
  { value: 'data', label: 'Data Collection', description: 'Data gathering campaign' }
];

const NETWORKS = [
  { value: 'google', label: 'Google Ads', description: 'Google advertising network' },
  { value: 'bing', label: 'Microsoft Ads', description: 'Bing advertising network' }
];

const TARGETING_TYPES = [
  { value: 'local', label: 'Local Targeting', description: 'Target specific cities/regions' },
  { value: 'regional', label: 'Regional Targeting', description: 'Target broader geographic areas' },
  { value: 'timezone', label: 'Timezone Targeting', description: 'Target by timezone' }
];

const SAVED_CONFIGS = [
  { value: 'none', label: 'Create New Configuration' },
  { value: 'template-1', label: 'Standard Local Services Template' },
  { value: 'template-2', label: 'High-Volume Regional Template' },
  { value: 'template-3', label: 'Competitive Analysis Template' }
];

interface Assignment {
  id: string;
  name: string;
  type: string;
}

export default function CampaignDetails({ campaignData, handleInputChange, onContinue }: CampaignDetailsProps) {
  const debug = useDebugLogger('CampaignDetails');
  const { categories, loading: categoriesLoading } = useCampaignCategories();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    debug.info('CampaignDetails step loaded', { campaignData });
  }, []);

  useEffect(() => {
    if (campaignData.type) {
      fetchAssignments();
    }
  }, [campaignData.type]);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      let tableName = '';
      let nameField = 'name';
      
      switch (campaignData.type) {
        case 'client':
          tableName = 'admin_advertisers';
          nameField = 'company_name';
          break;
        case 'market':
          tableName = 'admin_markets';
          nameField = 'name';
          break;
        case 'prospect':
        case 'data':
          // For now, use sample data for these types
          setAssignments([
            { id: 'prospect-1', name: 'Sample Prospect Campaign', type: campaignData.type },
            { id: 'data-1', name: 'Sample Data Collection', type: campaignData.type }
          ]);
          setLoadingAssignments(false);
          return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(`id, ${nameField}`)
        .limit(50);

      if (error) {
        debug.error('Error fetching assignments', { error, tableName });
        setAssignments([]);
        return;
      }

      const mappedAssignments: Assignment[] = (data || []).map(item => ({
        id: item.id.toString(),
        name: item[nameField] || 'Unnamed',
        type: campaignData.type
      }));

      setAssignments(mappedAssignments);
      debug.info('Assignments fetched successfully', { count: mappedAssignments.length, type: campaignData.type });
      
    } catch (error) {
      debug.error('Error in fetchAssignments', { error });
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const validateStep = (): boolean => {
    const errors: string[] = [];
    
    if (!campaignData.name.trim()) {
      errors.push('Campaign name is required');
    }
    
    if (!campaignData.assignment) {
      errors.push('Assignment selection is required');
    }
    
    if (!campaignData.category) {
      errors.push('Category selection is required');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinue = () => {
    debug.info('Attempting to continue from CampaignDetails');
    
    if (validateStep()) {
      debug.info('CampaignDetails validation passed', { campaignData });
      onContinue();
    } else {
      debug.warn('CampaignDetails validation failed', { validationErrors });
    }
  };

  const handleSaveDraft = async () => {
    debug.info('Saving campaign draft from CampaignDetails', { campaignData });
    
    try {
      // Create a campaign draft in the database
      const draftData = {
        name: campaignData.name || 'Untitled Campaign',
        description: `Draft campaign - ${campaignData.type} type`,
        status: 'draft',
        campaign_type: campaignData.type === 'client' ? 'advertiser' : 'market',
        category_id: campaignData.category ? parseInt(campaignData.category) : null,
        advertiser_id: campaignData.type === 'client' ? campaignData.assignmentId : null,
        market_id: campaignData.type === 'market' ? parseInt(campaignData.assignmentId) : null,
        settings: {
          network: campaignData.network,
          targetingType: campaignData.targetingType,
          savedConfig: campaignData.savedConfig,
          startDate: campaignData.startDate,
          endDate: campaignData.endDate,
          noEndDate: campaignData.noEndDate,
          frequency: campaignData.frequency,
          runTime: campaignData.runTime,
          worker: campaignData.worker,
          adhocKeywords: campaignData.adhocKeywords
        }
      };

      const { data, error } = await supabase
        .from('campaign_manager_campaigns')
        .upsert(draftData, { onConflict: 'id' })
        .select('id')
        .single();

      if (error) {
        debug.error('Error saving campaign draft', { error });
        return;
      }

      debug.info('Campaign draft saved successfully', { campaignId: data.id });
      
      // Update the campaign data with the saved ID
      if (data.id) {
        handleInputChange('id', data.id);
      }
      
    } catch (error) {
      debug.error('Error in handleSaveDraft', { error });
    }
  };

  const getAssignmentsForType = () => {
    return assignments;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-background">
      {/* Step Description */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-blue-900 mb-1">Campaign Details</h3>
          <p className="text-sm text-blue-700">
            Configure the basic settings for your campaign including name, type, and target assignment.
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900 mb-2">Please fix the following issues:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Name */}
        <div className="md:col-span-2">
          <Label htmlFor="campaign-name" className="text-foreground font-medium">
            Campaign Name *
          </Label>
          <Input
            id="campaign-name"
            value={campaignData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a descriptive campaign name"
            className="mt-2 bg-background border-border text-foreground"
          />
        </div>

        {/* Campaign Type */}
        <div>
          <Label htmlFor="campaign-type" className="text-foreground font-medium">
            Campaign Type *
          </Label>
          <Select value={campaignData.type} onValueChange={(value) => {
            handleInputChange('type', value);
            // Reset assignment when type changes
            handleInputChange('assignment', '');
            handleInputChange('assignmentId', '');
          }}>
            <SelectTrigger className="mt-2 bg-background border-border text-foreground">
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {CAMPAIGN_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment */}
        <div>
          <Label htmlFor="assignment" className="text-foreground font-medium">
            Assignment *
          </Label>
          <Select 
            value={campaignData.assignmentId} 
            onValueChange={(value) => {
              const assignment = getAssignmentsForType().find(a => a.id === value);
              handleInputChange('assignmentId', value);
              handleInputChange('assignment', assignment?.name || '');
            }}
            disabled={loadingAssignments || !campaignData.type}
          >
            <SelectTrigger className="mt-2 bg-background border-border text-foreground">
              <SelectValue placeholder={
                loadingAssignments ? "Loading assignments..." : 
                !campaignData.type ? "Select campaign type first" :
                "Select assignment"
              } />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {loadingAssignments ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : (
                getAssignmentsForType().map(assignment => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Network */}
        <div>
          <Label htmlFor="network" className="text-foreground font-medium">
            Advertising Network
          </Label>
          <Select value={campaignData.network} onValueChange={(value) => handleInputChange('network', value)}>
            <SelectTrigger className="mt-2 bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {NETWORKS.map(network => (
                <SelectItem key={network.value} value={network.value}>
                  <div>
                    <div className="font-medium">{network.label}</div>
                    <div className="text-xs text-muted-foreground">{network.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Targeting Type */}
        <div>
          <Label htmlFor="targeting-type" className="text-foreground font-medium">
            Targeting Type
          </Label>
          <Select value={campaignData.targetingType} onValueChange={(value) => handleInputChange('targetingType', value)}>
            <SelectTrigger className="mt-2 bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {TARGETING_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category" className="text-foreground font-medium">
            Category *
          </Label>
          <Select 
            value={campaignData.category} 
            onValueChange={(value) => handleInputChange('category', value)}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="mt-2 bg-background border-border text-foreground">
              <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : (
                categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Saved Configuration */}
        <div>
          <Label htmlFor="saved-config" className="text-foreground font-medium">
            Template Configuration
          </Label>
          <Select value={campaignData.savedConfig} onValueChange={(value) => handleInputChange('savedConfig', value)}>
            <SelectTrigger className="mt-2 bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border">
              {SAVED_CONFIGS.map(config => (
                <SelectItem key={config.value} value={config.value}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="border-border text-foreground hover:bg-accent"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <span className="text-xs text-muted-foreground">Auto-saved 2 minutes ago</span>
        </div>
        
        <Button
          onClick={handleContinue}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
        >
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Step Summary */}
      {campaignData.name && campaignData.assignment && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-900 text-sm font-medium">Step Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-green-700">Campaign:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {campaignData.name}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700">Type:</span>
              <span className="font-medium text-green-900">
                {CAMPAIGN_TYPES.find(t => t.value === campaignData.type)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700">Assignment:</span>
              <span className="font-medium text-green-900">{campaignData.assignment}</span>
            </div>
            {campaignData.category && (
              <div className="flex items-center justify-between">
                <span className="text-green-700">Category:</span>
                <span className="font-medium text-green-900">
                  {categories.find(c => c.id.toString() === campaignData.category)?.name || campaignData.category}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
