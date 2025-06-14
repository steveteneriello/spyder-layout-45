
import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trash2 } from 'lucide-react';

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

interface ScheduleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: OxylabsSchedule | null;
  onConfirm: () => void;
  loading: boolean;
}

export function ScheduleDeleteDialog({
  open,
  onOpenChange,
  schedule,
  onConfirm,
  loading
}: ScheduleDeleteDialogProps) {
  if (!schedule) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">Delete Schedule</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="space-y-2">
              <div className="font-medium text-sm">
                {schedule.job_name || schedule.schedule_name || 'Unnamed Schedule'}
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {schedule.oxylabs_schedule_id}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{schedule.items_count} items</span>
                <span>{schedule.stats?.total_job_count || 0} total jobs</span>
                <Badge variant={schedule.active ? 'default' : 'secondary'} className="text-xs">
                  {schedule.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Deleting this schedule will permanently remove it from Oxylabs and stop all future executions.
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-3 w-3" />
                Delete Schedule
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
