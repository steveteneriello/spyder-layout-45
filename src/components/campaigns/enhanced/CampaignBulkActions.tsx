import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Archive, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  CheckSquare,
  Square,
  Download,
  Upload,
  Tag,
  AlertTriangle
} from 'lucide-react';
import { Campaign } from '@/hooks/useCampaignManagement';
import { useToast } from "@/hooks/use-toast";

interface CampaignBulkActionsProps {
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onSelectionChange: (campaignIds: string[]) => void;
  onBulkUpdate: (campaignIds: string[], updates: Partial<Campaign>) => Promise<void>;
  onDuplicate: (campaignId: string, newName: string) => Promise<void>;
  onArchive: (campaignIds: string[]) => Promise<void>;
  onRestore: (campaignIds: string[]) => Promise<void>;
  onDelete: (campaignIds: string[]) => Promise<void>;
  onExport?: (campaignIds: string[]) => void;
  className?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive';
  requiresConfirmation: boolean;
  confirmationTitle: string;
  confirmationDescription: string;
  action: (campaignIds: string[]) => Promise<void> | void;
  isEnabled: (campaigns: Campaign[]) => boolean;
}

export const CampaignBulkActions: React.FC<CampaignBulkActionsProps> = ({
  campaigns,
  selectedCampaigns,
  onSelectionChange,
  onBulkUpdate,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  onExport,
  className = ''
}) => {
  const { toast } = useToast();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<BulkAction | null>(null);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<Campaign['status']>('active');

  const selectedCampaignObjects = campaigns.filter(c => selectedCampaigns.includes(c.id));
  const allSelected = campaigns.length > 0 && selectedCampaigns.length === campaigns.length;
  const someSelected = selectedCampaigns.length > 0 && selectedCampaigns.length < campaigns.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(campaigns.map(c => c.id));
    }
  };

  const handleAction = async (action: BulkAction) => {
    if (selectedCampaigns.length === 0) return;

    if (action.requiresConfirmation) {
      setConfirmationAction(action);
    } else {
      await executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction) => {
    setIsActionLoading(true);
    try {
      await action.action(selectedCampaigns);
      toast({
        title: "Success",
        description: `${action.label} completed successfully for ${selectedCampaigns.length} campaign(s).`
      });
      onSelectionChange([]); // Clear selection after action
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action.label.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
      setConfirmationAction(null);
    }
  };

  const handleStatusChange = async () => {
    if (selectedCampaigns.length === 0) return;

    setIsActionLoading(true);
    try {
      await onBulkUpdate(selectedCampaigns, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Updated status to ${newStatus} for ${selectedCampaigns.length} campaign(s).`
      });
      onSelectionChange([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
      setShowStatusChangeDialog(false);
    }
  };

  const bulkActions: BulkAction[] = [
    {
      id: 'status-change',
      label: 'Change Status',
      icon: <Tag className="h-4 w-4" />,
      variant: 'default',
      requiresConfirmation: false,
      confirmationTitle: '',
      confirmationDescription: '',
      action: () => setShowStatusChangeDialog(true),
      isEnabled: (campaigns) => campaigns.length > 0
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      variant: 'secondary',
      requiresConfirmation: true,
      confirmationTitle: 'Archive Campaigns',
      confirmationDescription: `Are you sure you want to archive ${selectedCampaigns.length} campaign(s)? Archived campaigns can be restored later.`,
      action: onArchive,
      isEnabled: (campaigns) => campaigns.some(c => c.status !== 'archived')
    },
    {
      id: 'restore',
      label: 'Restore',
      icon: <RotateCcw className="h-4 w-4" />,
      variant: 'default',
      requiresConfirmation: false,
      confirmationTitle: '',
      confirmationDescription: '',
      action: onRestore,
      isEnabled: (campaigns) => campaigns.some(c => c.status === 'archived')
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      requiresConfirmation: true,
      confirmationTitle: 'Delete Campaigns',
      confirmationDescription: `Are you sure you want to permanently delete ${selectedCampaigns.length} campaign(s)? This action cannot be undone. Only draft campaigns can be deleted.`,
      action: onDelete,
      isEnabled: (campaigns) => campaigns.every(c => c.status === 'draft')
    }
  ];

  const enabledActions = bulkActions.filter(action => action.isEnabled(selectedCampaignObjects));

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Selection Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all campaigns"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedCampaigns.length === 0 ? (
                    `${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}`
                  ) : (
                    `${selectedCampaigns.length} of ${campaigns.length} selected`
                  )}
                </span>
              </div>

              {selectedCampaigns.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCampaigns.length} selected
                </Badge>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedCampaigns.length > 0 && (
              <div className="flex items-center gap-2">
                {enabledActions.slice(0, 3).map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant}
                    size="sm"
                    onClick={() => handleAction(action)}
                    disabled={isActionLoading}
                    className="text-xs"
                  >
                    {action.icon}
                    <span className="ml-1 hidden sm:inline">{action.label}</span>
                  </Button>
                ))}

                {enabledActions.length > 3 && (
                  <Select>
                    <SelectTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">More</span>
                      </Button>
                    </SelectTrigger>
                    <SelectContent>
                      {enabledActions.slice(3).map((action) => (
                        <SelectItem
                          key={action.id}
                          value={action.id}
                          onSelect={() => handleAction(action)}
                        >
                          <div className="flex items-center gap-2">
                            {action.icon}
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {onExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExport(selectedCampaigns)}
                    disabled={isActionLoading}
                    className="text-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Export</span>
                  </Button>
                )}

                <Separator orientation="vertical" className="h-6" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Selected Campaign Details */}
          {selectedCampaigns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {selectedCampaignObjects.slice(0, 5).map((campaign) => (
                  <Badge key={campaign.id} variant="outline" className="text-xs">
                    {campaign.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectionChange(selectedCampaigns.filter(id => id !== campaign.id))}
                      className="ml-1 p-0 h-3 w-3 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
                {selectedCampaignObjects.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedCampaignObjects.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmationAction} onOpenChange={() => setConfirmationAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {confirmationAction?.confirmationTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction?.confirmationDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmationAction && executeAction(confirmationAction)}
              disabled={isActionLoading}
              className={confirmationAction?.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isActionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Dialog */}
      <AlertDialog open={showStatusChangeDialog} onOpenChange={setShowStatusChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Campaign Status</AlertDialogTitle>
            <AlertDialogDescription>
              Select the new status for {selectedCampaigns.length} selected campaign(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Campaign['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
