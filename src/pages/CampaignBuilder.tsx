import React, { useState, useEffect } from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';

// CACHE BUSTER v7 - NO DEBUG LOGGER ANYWHERE

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Layers, 
  Target, 
  Plus, 
  Activity,
  AlertCircle,
  Settings,
  Filter,
  Zap,
  Bookmark
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useToast } from "@/hooks/use-toast";

// Enhanced Components
import { useCampaignManagement, type Campaign, type CampaignFilters } from '@/hooks/useCampaignManagement';
import { CampaignSearchFilters } from '@/components/campaigns/enhanced/CampaignSearchFilters';
import { CampaignBulkActions } from '@/components/campaigns/enhanced/CampaignBulkActions';
import { EnhancedCampaignList } from '@/components/campaigns/enhanced/EnhancedCampaignList';
import { EnhancedCampaignEditor } from '@/components/campaigns/enhanced/EnhancedCampaignEditor';
import { CampaignQuickCreator } from '@/components/campaigns/enhanced/CampaignQuickCreator';
import { CampaignAnalyticsDashboard } from '@/components/campaigns/enhanced/CampaignAnalyticsDashboard';
import { CampaignTemplateManager } from '@/components/campaigns/enhanced/CampaignTemplateManager';

// Types
interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Stats {
  activeCampaigns: number;
  totalCategories: number;
  totalKeywords: number;
  totalNegativeKeywords: number;
}

function CampaignBuilderPage() {
  const { actualTheme } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const { toast } = useToast();
  
  const allMenuItems = getMenuItems();
  const menuSections = getSections();

  // Enhanced Campaign Management
  const {
    campaigns,
    categories,
    isLoading,
    error,
    stats,
    filters,
    selectedCampaigns,
    currentCampaign,
    setFilters,
    setSelectedCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    archiveCampaign,
    restoreCampaign,
    bulkUpdateStatus,
    bulkArchive,
    bulkDelete,
    exportCampaigns,
    searchCampaigns,
    refreshData
  } = useCampaignManagement();

  // State
  const [activeTab, setActiveTab] = useState<string>('campaigns');
  const [showEditor, setShowEditor] = useState(false);
  const [showQuickCreator, setShowQuickCreator] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30d');

  // Event Handlers
  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowEditor(true);
  };

  const handleQuickCreate = () => {
    setShowQuickCreator(true);
  };

  const handleQuickCreateSave = async (campaignData: Partial<Campaign>) => {
    try {
      await createCampaign(campaignData);
      toast({
        title: "Success",
        description: "Campaign created successfully"
      });
      setShowQuickCreator(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create campaign',
        variant: "destructive"
      });
    }
  };

  const handleUseTemplate = (template: any) => {
    // Apply template data to a new campaign
    setEditingCampaign(null);
    // Pre-populate the editor with template data
    setShowEditor(true);
    toast({
      title: "Template Applied",
      description: `Template "${template.name}" loaded for editing`
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowEditor(true);
  };

  const handleSaveCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, campaignData);
        toast({
          title: "Success",
          description: "Campaign updated successfully"
        });
      } else {
        await createCampaign(campaignData);
        toast({
          title: "Success", 
          description: "Campaign created successfully"
        });
      }
      setShowEditor(false);
      setEditingCampaign(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save campaign',
        variant: "destructive"
      });
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
      toast({
        title: "Success",
        description: "Campaign deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete campaign',
        variant: "destructive"
      });
    }
  };

  const handleBulkAction = async (action: string, campaignIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          await bulkUpdateStatus(campaignIds, 'active');
          break;
        case 'pause':
          await bulkUpdateStatus(campaignIds, 'paused');
          break;
        case 'archive':
          await bulkArchive(campaignIds);
          break;
        case 'delete':
          await bulkDelete(campaignIds);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      setSelectedCampaigns([]);
      toast({
        title: "Success",
        description: `Bulk ${action} completed successfully`
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : `Failed to ${action} campaigns`,
        variant: "destructive"
      });
    }
  };

  // Load initial data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              showText={true}
              className="flex items-center gap-3 text-primary-foreground"
            />
          </div>
          <Badge variant="outline" className="text-primary-foreground border-primary-foreground/20">
            {actualTheme}
          </Badge>
        </div>
      }
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory 
              key={section.name}
              section={section.name} 
              items={section.items} 
            />
          ))}
        </div>
      }
      menuItems={allMenuItems}
    >
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Campaign Builder
            </h1>
            <p className="text-muted-foreground">
              Enhanced campaign management system - Ready for integration
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Campaigns</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.activeCampaigns}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categories</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.totalCategories}</p>
                  </div>
                  <div className="h-12 w-12 bg-secondary/10 flex items-center justify-center rounded-lg">
                    <Layers className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Campaigns</p>
                    <p className="text-3xl font-semibold text-card-foreground">{campaigns.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-accent/10 flex items-center justify-center rounded-lg">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Keywords</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.totalKeywords}</p>
                  </div>
                  <div className="h-12 w-12 bg-muted/10 flex items-center justify-center rounded-lg">
                    <Filter className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <h3 className="font-medium text-destructive">Error</h3>
                    <p className="text-destructive/80">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Enhanced Campaign Management Interface */
            <div className="space-y-6">
              {/* Campaign Editor Modal */}
              {showEditor && (
                <EnhancedCampaignEditor
                  campaign={editingCampaign}
                  categories={categories}
                  onSave={handleSaveCampaign}
                  onClose={() => {
                    setShowEditor(false);
                    setEditingCampaign(null);
                  }}
                />
              )}

              {/* Campaign Quick Creator */}
              <CampaignQuickCreator
                categories={categories}
                onSave={handleQuickCreateSave}
                onClose={() => setShowQuickCreator(false)}
                isOpen={showQuickCreator}
              />

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 bg-muted border-border">
                  <TabsTrigger value="campaigns" className="text-foreground">
                    Campaigns ({campaigns.length})
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="text-foreground">
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="text-foreground">
                    Categories ({categories.length})
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-foreground">
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="campaigns" className="space-y-6">
                  {/* Campaign Header Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Campaign Management</h2>
                      <p className="text-muted-foreground">Create, manage, and optimize your campaigns</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        onClick={handleCreateCampaign} 
                        className="border-border"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Advanced Creator
                      </Button>
                      <Button 
                        onClick={handleQuickCreate} 
                        className="bg-primary text-primary-foreground"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Quick Create
                      </Button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <CampaignSearchFilters
                    filters={filters}
                    categories={categories}
                    onFiltersChange={setFilters}
                    onSearch={searchCampaigns}
                  />

                  {/* Bulk Actions */}
                  {selectedCampaigns.length > 0 && (
                    <CampaignBulkActions
                      selectedCount={selectedCampaigns.length}
                      onAction={handleBulkAction}
                      onExport={() => exportCampaigns(selectedCampaigns)}
                      onClearSelection={() => setSelectedCampaigns([])}
                    />
                  )}

                  {/* Campaign List */}
                  <EnhancedCampaignList
                    campaigns={campaigns}
                    categories={categories}
                    selectedCampaigns={selectedCampaigns}
                    onSelectionChange={setSelectedCampaigns}
                    onEdit={handleEditCampaign}
                    onDelete={handleDeleteCampaign}
                    onDuplicate={duplicateCampaign}
                    onArchive={archiveCampaign}
                    onRestore={restoreCampaign}
                  />
                </TabsContent>
                
                <TabsContent value="templates" className="space-y-6">
                  <CampaignTemplateManager
                    onUseTemplate={handleUseTemplate}
                    onCreateFromCampaign={(campaign) => {
                      // Future enhancement: create template from existing campaign
                      toast({
                        title: "Feature Coming Soon",
                        description: "Create templates from existing campaigns will be available soon."
                      });
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="categories" className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Category Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {categories.map((category) => (
                          <div key={category.id} className="p-3 rounded-lg border border-border bg-muted/50">
                            <h4 className="font-medium text-foreground">{category.name}</h4>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <CampaignAnalyticsDashboard
                    campaigns={campaigns}
                    dateRange={analyticsDateRange}
                    onDateRangeChange={setAnalyticsDateRange}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

export default CampaignBuilderPage;