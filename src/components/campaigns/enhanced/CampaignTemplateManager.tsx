import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Bookmark, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Star,
  Users,
  Zap,
  Building,
  FileText,
  Target,
  DollarSign
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Campaign } from '@/hooks/useCampaignManagement';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  isPublic: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  template_data: Partial<Campaign>;
  tags: string[];
}

interface CampaignTemplateManagerProps {
  onUseTemplate: (template: CampaignTemplate) => void;
  onCreateFromCampaign?: (campaign: Campaign) => void;
}

const SAMPLE_TEMPLATES: CampaignTemplate[] = [
  {
    id: '1',
    name: 'Emergency Plumbing Services',
    description: 'High-converting template for emergency plumbing services with optimized keywords and bidding strategy',
    category: 'Plumbing',
    isDefault: true,
    isPublic: true,
    usage_count: 45,
    created_by: 'System',
    created_at: '2024-01-15',
    template_data: {
      settings: {
        bidStrategy: 'automated',
        dailyBudget: 150,
        adRotation: 'optimize',
        deliveryMethod: 'accelerated'
      },
      keywordTargeting: {
        keywords: ['emergency plumber', 'plumbing repair', 'burst pipe', '24 hour plumber'],
        negativeKeywords: ['DIY', 'how to', 'free'],
        matchTypes: {}
      }
    },
    tags: ['emergency', 'high-intent', 'local-services']
  },
  {
    id: '2',
    name: 'HVAC Seasonal Maintenance',
    description: 'Perfect for seasonal HVAC campaigns with maintenance focus and budget optimization',
    category: 'HVAC',
    isDefault: true,
    isPublic: true,
    usage_count: 32,
    created_by: 'System',
    created_at: '2024-02-20',
    template_data: {
      settings: {
        bidStrategy: 'manual',
        dailyBudget: 100,
        adRotation: 'optimize',
        deliveryMethod: 'standard'
      },
      keywordTargeting: {
        keywords: ['hvac maintenance', 'air conditioning service', 'furnace repair', 'ac tune up'],
        negativeKeywords: ['install', 'new system', 'replacement'],
        matchTypes: {}
      }
    },
    tags: ['seasonal', 'maintenance', 'cost-effective']
  },
  {
    id: '3',
    name: 'Premium Roofing Services',
    description: 'High-budget template for premium roofing contractors targeting quality-focused customers',
    category: 'Roofing',
    isDefault: false,
    isPublic: true,
    usage_count: 18,
    created_by: 'John Smith',
    created_at: '2024-03-10',
    template_data: {
      settings: {
        bidStrategy: 'automated',
        dailyBudget: 200,
        adRotation: 'optimize',
        deliveryMethod: 'standard'
      },
      keywordTargeting: {
        keywords: ['premium roofing', 'roof replacement', 'quality roofer', 'roofing contractor'],
        negativeKeywords: ['cheap', 'discount', 'DIY'],
        matchTypes: {}
      }
    },
    tags: ['premium', 'high-budget', 'quality-focus']
  },
  {
    id: '4',
    name: 'Local Electrical Repair',
    description: 'Optimized for local electrical contractors with balanced budget and targeting',
    category: 'Electrical',
    isDefault: false,
    isPublic: false,
    usage_count: 7,
    created_by: 'You',
    created_at: '2024-04-05',
    template_data: {
      settings: {
        bidStrategy: 'automated',
        dailyBudget: 120,
        adRotation: 'optimize',
        deliveryMethod: 'standard'
      },
      keywordTargeting: {
        keywords: ['electrician', 'electrical repair', 'outlet installation', 'circuit breaker'],
        negativeKeywords: ['wholesale', 'parts only', 'supplies'],
        matchTypes: {}
      }
    },
    tags: ['local', 'balanced', 'electrical']
  }
];

export function CampaignTemplateManager({ onUseTemplate, onCreateFromCampaign }: CampaignTemplateManagerProps) {
  const [templates, setTemplates] = useState<CampaignTemplate[]>(SAMPLE_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: '',
    tags: ''
  });
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const handleUseTemplate = (template: CampaignTemplate) => {
    onUseTemplate(template);
    toast({
      title: "Template Applied",
      description: `Template "${template.name}" has been applied to your campaign.`
    });
  };

  const handleCreateTemplate = () => {
    const template: CampaignTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      isDefault: false,
      isPublic: false,
      usage_count: 0,
      created_by: 'You',
      created_at: new Date().toISOString().split('T')[0],
      template_data: {
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
      },
      tags: newTemplate.tags.split(',').map(t => t.trim()).filter(t => t)
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: '', description: '', category: '', tags: '' });
    setShowCreateDialog(false);
    
    toast({
      title: "Template Created",
      description: `Template "${template.name}" has been created successfully.`
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "Template has been deleted successfully."
    });
  };

  const handleDuplicateTemplate = (template: CampaignTemplate) => {
    const duplicated: CampaignTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usage_count: 0,
      created_by: 'You',
      created_at: new Date().toISOString().split('T')[0],
      isPublic: false
    };

    setTemplates([...templates, duplicated]);
    toast({
      title: "Template Duplicated",
      description: `Template "${duplicated.name}" has been created.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Campaign Templates</h2>
          <p className="text-muted-foreground">Save time with pre-configured campaign templates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Input
                  id="template-category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Plumbing, HVAC, Electrical"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe when to use this template"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                <Input
                  id="template-tags"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., emergency, local, premium"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="max-w-sm"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {template.isDefault && (
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  )}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {template.isPublic ? (
                    <Users className="h-4 w-4 text-green-500" />
                  ) : (
                    <Building className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{template.category}</Badge>
                <Badge variant="outline" className="text-xs">
                  {template.usage_count} uses
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.description}
              </p>
              
              {/* Template Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span>Daily Budget: ${template.template_data.settings?.dailyBudget || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Target className="h-3 w-3" />
                  <span>
                    {template.template_data.keywordTargeting?.keywords?.length || 0} keywords
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-3 w-3" />
                  <span>
                    {template.template_data.settings?.bidStrategy || 'automated'} bidding
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  by {template.created_by}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {template.created_by === 'You' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="bg-primary text-primary-foreground"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Templates Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Create your first template to get started.'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
