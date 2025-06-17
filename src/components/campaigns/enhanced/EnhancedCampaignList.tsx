import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreVertical, 
  Edit, 
  Copy, 
  Archive, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  Grid3X3,
  List,
  Eye,
  Calendar,
  Target,
  MapPin,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Campaign } from '@/hooks/useCampaignManagement';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EnhancedCampaignListProps {
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onSelectionChange: (campaignIds: string[]) => void;
  onEdit: (campaign: Campaign) => void;
  onDuplicate: (campaignId: string, newName: string) => Promise<void>;
  onArchive: (campaignId: string) => Promise<void>;
  onRestore: (campaignId: string) => Promise<void>;
  onDelete: (campaignId: string) => Promise<void>;
  onStatusChange: (campaignId: string, status: Campaign['status']) => Promise<void>;
  categories: Array<{ id: string; name: string; }>;
  className?: string;
}

type ViewMode = 'grid' | 'table';

interface StatusBadgeProps {
  status: Campaign['status'];
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return { 
          icon: Play, 
          text: 'Active', 
          class: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800' 
        };
      case 'paused':
        return { 
          icon: Pause, 
          text: 'Paused', 
          class: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800' 
        };
      case 'draft':
        return { 
          icon: Clock, 
          text: 'Draft', 
          class: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700' 
        };
      case 'archived':
        return { 
          icon: Archive, 
          text: 'Archived', 
          class: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800' 
        };
      default:
        return { 
          icon: Clock, 
          text: 'Unknown', 
          class: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700' 
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${config.class} ${className}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};

export const EnhancedCampaignList: React.FC<EnhancedCampaignListProps> = ({
  campaigns,
  selectedCampaigns,
  onSelectionChange,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  onStatusChange,
  categories,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
  };

  const handleCampaignSelect = (campaignId: string) => {
    const isSelected = selectedCampaigns.includes(campaignId);
    if (isSelected) {
      onSelectionChange(selectedCampaigns.filter(id => id !== campaignId));
    } else {
      onSelectionChange([...selectedCampaigns, campaignId]);
    }
  };

  const handleAction = async (
    action: () => Promise<void>, 
    campaignId: string, 
    actionName: string
  ) => {
    setActionLoading(campaignId);
    try {
      debug.log(`Executing ${actionName}`, { campaignId });
      await action();
      debug.log(`${actionName} completed successfully`, { campaignId });
    } catch (error) {
      debug.error(`${actionName} failed`, { campaignId, error });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return formatDate(dateString);
  };

  if (campaigns.length === 0) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Target className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Get started by creating your first campaign or adjust your filters to see existing campaigns.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <Card 
              key={campaign.id} 
              className={`bg-card border-border hover:shadow-md transition-all duration-200 cursor-pointer ${
                selectedCampaigns.includes(campaign.id) ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => onEdit(campaign)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={() => handleCampaignSelect(campaign.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={campaign.status} />
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(campaign.category_id)}
                        </Badge>
                      </div>
                      <CardTitle className="text-base text-card-foreground line-clamp-2">
                        {campaign.name}
                      </CardTitle>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(campaign); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAction(() => onDuplicate(campaign.id, `${campaign.name} (Copy)`), campaign.id, 'Duplicate');
                        }}
                        disabled={actionLoading === campaign.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {campaign.status === 'archived' ? (
                        <DropdownMenuItem 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleAction(() => onRestore(campaign.id), campaign.id, 'Restore');
                          }}
                          disabled={actionLoading === campaign.id}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleAction(() => onArchive(campaign.id), campaign.id, 'Archive');
                          }}
                          disabled={actionLoading === campaign.id}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'draft' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleAction(() => onDelete(campaign.id), campaign.id, 'Delete');
                            }}
                            disabled={actionLoading === campaign.id}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {campaign.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {campaign.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  {/* Location Info */}
                  {campaign.locationTargeting && campaign.locationTargeting.included.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {campaign.locationTargeting.included.length} location{campaign.locationTargeting.included.length !== 1 ? 's' : ''}
                        {campaign.locationTargeting.radius && ` • ${campaign.locationTargeting.radius} ${campaign.locationTargeting.radiusUnit}`}
                      </span>
                    </div>
                  )}

                  {/* Budget Info */}
                  {campaign.settings?.dailyBudget && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>
                        ${campaign.settings.dailyBudget}/day
                        {campaign.settings.maxCpc && ` • Max CPC: $${campaign.settings.maxCpc}`}
                      </span>
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Created {formatDate(campaign.created_at || '')}</span>
                    </div>
                    <span>Updated {formatRelativeTime(campaign.updated_at || '')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Table View
  return (
    <div className={`space-y-4 ${className}`}>
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {campaigns.length} Campaign{campaigns.length !== 1 ? 's' : ''}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Layout */}
      <Card className="bg-card border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={campaigns.length > 0 && selectedCampaigns.length === campaigns.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectionChange(campaigns.map(c => c.id));
                    } else {
                      onSelectionChange([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow 
                key={campaign.id}
                className={`cursor-pointer hover:bg-muted/50 ${
                  selectedCampaigns.includes(campaign.id) ? 'bg-muted/30' : ''
                }`}
                onClick={() => onEdit(campaign)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedCampaigns.includes(campaign.id)}
                    onCheckedChange={() => handleCampaignSelect(campaign.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-foreground">{campaign.name}</div>
                    {campaign.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {campaign.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {getCategoryName(campaign.category_id)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(campaign.created_at || '')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeTime(campaign.updated_at || '')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(campaign); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAction(() => onDuplicate(campaign.id, `${campaign.name} (Copy)`), campaign.id, 'Duplicate');
                        }}
                        disabled={actionLoading === campaign.id}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {campaign.status === 'archived' ? (
                        <DropdownMenuItem 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleAction(() => onRestore(campaign.id), campaign.id, 'Restore');
                          }}
                          disabled={actionLoading === campaign.id}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleAction(() => onArchive(campaign.id), campaign.id, 'Archive');
                          }}
                          disabled={actionLoading === campaign.id}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'draft' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleAction(() => onDelete(campaign.id), campaign.id, 'Delete');
                            }}
                            disabled={actionLoading === campaign.id}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
