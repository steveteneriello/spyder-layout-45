
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScheduleDeleteDialog } from './ScheduleDeleteDialog';
import {
  MoreVertical,
  Eye,
  Activity,
  Calendar,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';

interface OxylabsSchedule {
  id: string;
  oxylabs_schedule_id: string;
  active: boolean;
  job_name?: string;
  schedule_name?: string;
  items_count: number;
  stats: {
    total_job_count: number;
  };
}

interface ScheduleActionsProps {
  schedule: OxylabsSchedule;
  onToggleSchedule: (scheduleId: string, currentState: boolean) => Promise<void>;
  onViewDetails: (scheduleId: string) => void;
  onViewRuns: (scheduleId: string) => void;
  onViewJobs: (scheduleId: string) => void;
  onDelete: (scheduleId: string) => Promise<void>;
}

export function ScheduleActions({
  schedule,
  onToggleSchedule,
  onViewDetails,
  onViewRuns,
  onViewJobs,
  onDelete
}: ScheduleActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const handleToggleSchedule = async () => {
    setActionLoading(true);
    try {
      await onToggleSchedule(schedule.oxylabs_schedule_id, schedule.active);
      toast({
        title: schedule.active ? 'Schedule Deactivated' : 'Schedule Activated',
        description: `${schedule.job_name || schedule.schedule_name || 'Schedule'} has been ${schedule.active ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update schedule status.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await onDelete(schedule.oxylabs_schedule_id);
      setDeleteDialogOpen(false);
      toast({
        title: 'Schedule Deleted',
        description: `${schedule.job_name || schedule.schedule_name || 'Schedule'} has been queued for deletion.`,
      });
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-muted"
            disabled={actionLoading}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => onViewDetails(schedule.oxylabs_schedule_id)}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewRuns(schedule.oxylabs_schedule_id)}
            className="cursor-pointer"
          >
            <Activity className="mr-2 h-4 w-4" />
            View Runs
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewJobs(schedule.oxylabs_schedule_id)}
            className="cursor-pointer"
          >
            <Calendar className="mr-2 h-4 w-4" />
            View Jobs
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleToggleSchedule}
            disabled={actionLoading}
            className="cursor-pointer"
          >
            {schedule.active ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            disabled={actionLoading}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ScheduleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        schedule={schedule}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </>
  );
}
