
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Archive, Trash2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CampaignActionsProps {
  campaignId: string;
  campaignName: string;
  currentStatus: string;
  onEdit: () => void;
  onRefresh: () => void;
}

export function CampaignActions({ 
  campaignId, 
  campaignName, 
  currentStatus, 
  onEdit, 
  onRefresh 
}: CampaignActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaign_manager_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        console.error('Error deleting campaign:', error);
        toast({
          title: "Error",
          description: "Failed to delete campaign. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Campaign deleted",
        description: `"${campaignName}" has been permanently deleted.`,
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('campaign_manager_campaigns')
        .update({ 
          status: 'archived',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) {
        console.error('Error archiving campaign:', error);
        toast({
          title: "Error",
          description: "Failed to archive campaign. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Campaign archived",
        description: `"${campaignName}" has been archived.`,
      });

      onRefresh();
    } catch (error) {
      console.error('Error archiving campaign:', error);
      toast({
        title: "Error",
        description: "Failed to archive campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowArchiveDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0 border-border hover:bg-accent hover:text-accent-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-popover border-border text-popover-foreground"
        >
          <DropdownMenuItem 
            onClick={onEdit}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Edit Campaign
          </DropdownMenuItem>
          
          {currentStatus !== 'archived' && (
            <DropdownMenuItem 
              onClick={() => setShowArchiveDialog(true)}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Campaign
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator className="bg-border" />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="cursor-pointer text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Campaign
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to permanently delete "{campaignName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={loading}
              className="border-border hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Campaign</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to archive "{campaignName}"? Archived campaigns can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={loading}
              className="border-border hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchive}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
