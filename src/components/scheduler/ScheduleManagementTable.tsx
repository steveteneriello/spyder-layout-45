
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Pause,
  MoreVertical,
  Eye,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface OxylabsSchedule {
  id: string;
  oxylabs_schedule_id: string;
  active: boolean;
  cron_expression: string;
  next_run_at: string;
  end_time: string;
  job_name?: string;
  schedule_name?: string;
  items_count: number;
  stats: {
    total_job_count: number;
    job_result_outcomes: Array<{
      status: string;
      job_count: number;
      ratio: number;
    }>;
  };
  management_status: 'managed' | 'unmanaged';
  last_synced_at: string;
}

interface ScheduleManagementTableProps {
  schedules: OxylabsSchedule[];
  loading: boolean;
  onToggleSchedule: (scheduleId: string, currentState: boolean) => Promise<void>;
  onViewRuns: (scheduleId: string) => void;
  onViewDetails: (scheduleId: string) => void;
  onViewJobs: (scheduleId: string) => void;
}

export function ScheduleManagementTable({
  schedules,
  loading,
  onToggleSchedule,
  onViewRuns,
  onViewDetails,
  onViewJobs
}: ScheduleManagementTableProps) {
  const parseCronExpression = (cron: string) => {
    if (!cron) return 'No schedule';
    
    const parts = cron.split(' ');
    if (parts.length !== 5) return cron;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return `Daily at ${hour}:${minute.padStart(2, '0')}`;
    } else if (dayOfWeek !== '*') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `Weekly on ${days[parseInt(dayOfWeek)]} at ${hour}:${minute.padStart(2, '0')}`;
    }
    return cron;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (schedule: OxylabsSchedule) => {
    if (!schedule.active) {
      return { variant: 'secondary' as const, text: 'Inactive', icon: Pause };
    }
    if (schedule.management_status === 'unmanaged') {
      return { variant: 'destructive' as const, text: 'Unmanaged', icon: AlertCircle };
    }
    const successRate = schedule.stats?.job_result_outcomes?.find(o => o.status === 'done')?.ratio || 0;
    if (successRate < 0.5) {
      return { variant: 'destructive' as const, text: 'Poor Performance', icon: TrendingDown };
    }
    return { variant: 'default' as const, text: 'Healthy', icon: CheckCircle };
  };

  const getSuccessRate = (schedule: OxylabsSchedule) => {
    const doneOutcome = schedule.stats?.job_result_outcomes?.find(o => o.status === 'done');
    return doneOutcome ? (doneOutcome.ratio * 100).toFixed(1) + '%' : '0%';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 campaign-card-bg rounded-lg border campaign-border">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2 campaign-primary-text">No Schedules Found</h3>
        <p className="text-sm campaign-secondary-text mb-4">
          No Oxylabs schedules are currently available. Try syncing with Oxylabs to fetch the latest schedules.
        </p>
      </div>
    );
  }

  return (
    <div className="campaign-card-bg rounded-lg border campaign-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="campaign-secondary-bg">
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Schedule Pattern</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total Jobs</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Management</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => {
            const status = getStatusBadge(schedule);
            const StatusIcon = status.icon;
            
            return (
              <TableRow key={schedule.id} className="hover:campaign-secondary-bg">
                <TableCell>
                  <Switch
                    checked={schedule.active}
                    onCheckedChange={() => onToggleSchedule(schedule.oxylabs_schedule_id, schedule.active)}
                    className="data-[state=checked]:bg-green-600"
                  />
                </TableCell>
                
                <TableCell>
                  <div>
                    <div className="font-medium campaign-primary-text">
                      {schedule.job_name || schedule.schedule_name || 'Unnamed Schedule'}
                    </div>
                    <div className="text-xs campaign-secondary-text">
                      ID: {schedule.oxylabs_schedule_id}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 campaign-secondary-text" />
                    <span className="text-sm campaign-primary-text">
                      {parseCronExpression(schedule.cron_expression)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm campaign-primary-text">
                    {schedule.items_count || 0}
                  </span>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm campaign-primary-text">
                    {schedule.stats?.total_job_count || 0}
                  </span>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-sm campaign-primary-text">
                      {getSuccessRate(schedule)}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-xs campaign-secondary-text">
                    {formatDate(schedule.next_run_at)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge variant={status.variant} className="flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {status.text}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="campaign-card-bg campaign-border">
                      <DropdownMenuItem 
                        onClick={() => onViewDetails(schedule.oxylabs_schedule_id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onViewRuns(schedule.oxylabs_schedule_id)}
                        className="flex items-center gap-2"
                      >
                        <Activity className="h-4 w-4" />
                        View Runs
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onViewJobs(schedule.oxylabs_schedule_id)}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        View Jobs
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onToggleSchedule(schedule.oxylabs_schedule_id, schedule.active)}
                        className="flex items-center gap-2"
                      >
                        {schedule.active ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
