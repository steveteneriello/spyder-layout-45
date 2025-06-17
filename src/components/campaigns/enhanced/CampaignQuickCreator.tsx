import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Target, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Hash,
  Plus,
  X,
  Copy,
  Settings,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { DatePicker } from "@/components/ui/date-picker";
import type { Campaign } from '@/hooks/useCampaignManagement';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category_id: string;
  defaultSettings: Partial<Campaign>;
  suggestedKeywords: string[];
  suggestedBudget: number;
}

interface CampaignQuickCreatorProps {
  categories: Category[];
  onSave: (campaign: Partial<Campaign>) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'plumbing-emergency',
    name: 'Emergency Plumbing',
    description: 'Target urgent plumbing needs with high-intent keywords',
    category_id: '1',
    defaultSettings: {
      status: 'active',
      settings: {
        bidStrategy: 'automated',
        dailyBudget: 150,
        adRotation: 'optimize',
        deliveryMethod: 'accelerated'
      }
    },
    suggestedKeywords: ['emergency plumber', 'plumbing repair', 'burst pipe', '24 hour plumber'],
    suggestedBudget: 150
  },
  {
    id: 'hvac-maintenance',
    name: 'HVAC Maintenance',
    description: 'Seasonal HVAC maintenance and service campaigns',
    category_id: '2',
    defaultSettings: {
      status: 'active',
      settings: {
        bidStrategy: 'manual',
        dailyBudget: 100,
        adRotation: 'optimize',
        deliveryMethod: 'standard'
      }
    },
    suggestedKeywords: ['hvac maintenance', 'air conditioning service', 'furnace repair', 'ac tune up'],
    suggestedBudget: 100
  },
  {
    id: 'electrical-repair',
    name: 'Electrical Repair',
    description: 'Electrical repair and installation services',
    category_id: '3',
    defaultSettings: {
      status: 'active',
      settings: {
        bidStrategy: 'automated',
        dailyBudget: 120,
        adRotation: 'optimize',
        deliveryMethod: 'standard'
      }
    },
    suggestedKeywords: ['electrician', 'electrical repair', 'outlet installation', 'circuit breaker'],
    suggestedBudget: 120
  }
];

export function CampaignQuickCreator({ categories, onSave, onClose, isOpen }: CampaignQuickCreatorProps) {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    category_id: '',
    status: 'draft',
    settings: {
      bidStrategy: 'automated',
      dailyBudget: 100,
      adRotation: 'optimize',
      deliveryMethod: 'standard'
    },
    keywordTargeting: {
      keywords: [],
      negativeKeywords: [],
      matchTypes: {}
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [negativeKeywordInput, setNegativeKeywordInput] = useState('');
  const [useAdvancedSettings, setUseAdvancedSettings] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    if (selectedTemplate) {
      setCampaignData(prev => ({
        ...prev,
        ...selectedTemplate.defaultSettings,
        category_id: selectedTemplate.category_id,
        name: selectedTemplate.name,
        description: selectedTemplate.description
      }));
      setKeywords(selectedTemplate.suggestedKeywords);
    }
  }, [selectedTemplate]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const finalCampaignData = {
      ...campaignData,
      keywordTargeting: {
        keywords,
        negativeKeywords,
        matchTypes: keywords.reduce((acc, keyword) => ({
          ...acc,
          [keyword]: 'broad' as const
        }), {})
      }
    };
    onSave(finalCampaignData);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addNegativeKeyword = () => {
    if (negativeKeywordInput.trim() && !negativeKeywords.includes(negativeKeywordInput.trim())) {
      setNegativeKeywords([...negativeKeywords, negativeKeywordInput.trim()]);
      setNegativeKeywordInput('');
    }
  };

  const removeNegativeKeyword = (keyword: string) => {
    setNegativeKeywords(negativeKeywords.filter(k => k !== keyword));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Campaign Quick Creator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create campaigns in minutes with our guided workflow
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-0.5 w-16 mx-2 ${
                    i + 1 < step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
                <p className="text-muted-foreground">
                  Start with a pre-configured template or create from scratch
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Custom Template */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    !selectedTemplate ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTemplate(null)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">Custom Campaign</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create a campaign from scratch with your own settings
                    </p>
                  </CardContent>
                </Card>

                {/* Template Options */}
                {CAMPAIGN_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        <h4 className="font-medium">{template.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          ${template.suggestedBudget}/day
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.suggestedKeywords.length} keywords
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Campaign Details</h3>
                <p className="text-muted-foreground">
                  Set up the basic information for your campaign
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name *</Label>
                    <Input
                      id="campaign-name"
                      value={campaignData.name || ''}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={campaignData.category_id || ''}
                      onValueChange={(value) => setCampaignData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
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

                  <div>
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      value={campaignData.status || 'draft'}
                      onValueChange={(value: 'active' | 'paused' | 'draft') => 
                        setCampaignData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={campaignData.description || ''}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign goals and target audience"
                    className="mt-1 h-32"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Keywords & Targeting */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Keywords & Targeting</h3>
                <p className="text-muted-foreground">
                  Define your keyword targeting strategy
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Keywords */}
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Target Keywords
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Enter keyword"
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <Button onClick={addKeyword} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeKeyword(keyword)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Negative Keywords */}
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Negative Keywords
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={negativeKeywordInput}
                        onChange={(e) => setNegativeKeywordInput(e.target.value)}
                        placeholder="Enter negative keyword"
                        onKeyPress={(e) => e.key === 'Enter' && addNegativeKeyword()}
                      />
                      <Button onClick={addNegativeKeyword} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {negativeKeywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="flex items-center gap-1">
                        {keyword}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeNegativeKeyword(keyword)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Budget & Settings */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Budget & Settings</h3>
                <p className="text-muted-foreground">
                  Configure your campaign budget and bidding strategy
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="daily-budget" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Daily Budget
                    </Label>
                    <Input
                      id="daily-budget"
                      type="number"
                      value={campaignData.settings?.dailyBudget || 100}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          dailyBudget: Number(e.target.value)
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bid-strategy">Bidding Strategy</Label>
                    <Select
                      value={campaignData.settings?.bidStrategy || 'automated'}
                      onValueChange={(value: 'manual' | 'automated') => 
                        setCampaignData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, bidStrategy: value }
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automated">Automated Bidding</SelectItem>
                        <SelectItem value="manual">Manual Bidding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Advanced Settings</Label>
                    <Switch
                      checked={useAdvancedSettings}
                      onCheckedChange={setUseAdvancedSettings}
                    />
                  </div>

                  {useAdvancedSettings && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div>
                        <Label htmlFor="ad-rotation">Ad Rotation</Label>
                        <Select
                          value={campaignData.settings?.adRotation || 'optimize'}
                          onValueChange={(value: 'optimize' | 'rotate') => 
                            setCampaignData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, adRotation: value }
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="optimize">Optimize for clicks</SelectItem>
                            <SelectItem value="rotate">Rotate evenly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="delivery-method">Delivery Method</Label>
                        <Select
                          value={campaignData.settings?.deliveryMethod || 'standard'}
                          onValueChange={(value: 'standard' | 'accelerated') => 
                            setCampaignData(prev => ({
                              ...prev,
                              settings: { ...prev.settings, deliveryMethod: value }
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="accelerated">Accelerated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={step === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
            </div>

            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleFinish} className="bg-primary text-primary-foreground">
                <Zap className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
