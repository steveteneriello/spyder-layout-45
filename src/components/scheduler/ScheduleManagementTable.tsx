import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScheduleActions } from './ScheduleActions';
import { parseCronExpression, formatDateWithTimezone } from './utils/scheduleUtils';
import {
  Play,
  Pause,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Trash2,
  Minus,
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
  allSchedules: OxylabsSchedule[];
  loading: boolean;
  onToggleSchedule: (scheduleId: string, currentState: boolean) => Promise<void>;
  onViewRuns: (scheduleId: string) => void;
  onViewDetails: (scheduleId: string) => void;
  onViewJobs: (scheduleId: string) => void;
  onDeleteSchedule: (scheduleId: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

export function ScheduleManagementTable({
  schedules,
  allSchedules,
  loading,
  onToggleSchedule,
  onViewRuns,
  onViewDetails,
  onViewJobs,
  onDeleteSchedule
}: ScheduleManagementTableProps) {
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadge = (schedule: OxylabsSchedule) => {
    if (!schedule.active) {
      return { variant: 'secondary' as const, text: 'Inactive', icon: Pause };
    }
    if (schedule.management_status === 'unmanaged') {
      return { variant: 'destructive' as const, text: 'Unmanaged', icon: AlertCircle };
    }
    const successRate = schedule.stats?.job_result_outcomes?.find(o => o.status === 'done')?.ratio || 0;
    if (successRate < 0.5) {
      return { variant: 'destructive' as const, text: 'Poor Performance', icon: TrendingUp };
    }
    return { variant: 'default' as const, text: 'Healthy', icon: CheckCircle };
  };

  const getSuccessRate = (schedule: OxylabsSchedule) => {
    try {
      const doneOutcome = schedule.stats?.job_result_outcomes?.find(o => o.status === 'done');
      return doneOutcome ? (doneOutcome.ratio * 100).toFixed(1) + '%' : '0%';
    } catch (error) {
      console.error('Error calculating success rate:', error);
      return 'N/A';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(schedules.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSchedules = schedules.slice(startIndex, endIndex);

  // Select all logic now works with ALL schedules, not just current page
  const isAllSelected = allSchedules.length > 0 && selectedSchedules.length === allSchedules.length;
  const isPartiallySelected = selectedSchedules.length > 0 && selectedSchedules.length < allSchedules.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSchedules(allSchedules.map(s => s.oxylabs_schedule_id));
    } else {
      setSelectedSchedules([]);
    }
  };

  const handleSelectSchedule = (scheduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSchedules(prev => [...prev, scheduleId]);
    } else {
      setSelectedSchedules(prev => prev.filter(id => id !== scheduleId));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedSchedules.length === 0) return;
    
    setBulkActionLoading(true);
    try {
      for (const scheduleId of selectedSchedules) {
        const schedule = allSchedules.find(s => s.oxylabs_schedule_id === scheduleId);
        if (!schedule) continue;

        if (action === 'activate' || action === 'deactivate') {
          await onToggleSchedule(scheduleId, action === 'deactivate');
        } else if (action === 'delete') {
          await onDeleteSchedule(scheduleId);
        }
      }
      setSelectedSchedules([]);
    } catch (error) {
      console.error(`Failed to ${action} schedules:`, error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => goToPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => goToPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => goToPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => goToPage(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 campaign-secondary-bg rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 campaign-card-bg rounded-lg border campaign-border">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 campaign-accent" />
        <h3 className="text-lg font-medium mb-2 campaign-primary-text">No Schedules Found</h3>
        <p className="text-sm campaign-secondary-text mb-4">
          No Oxylabs schedules are currently available. Try syncing with Oxylabs to fetch the latest schedules.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedSchedules.length > 0 && (
        <div className="campaign-card-bg rounded-lg border campaign-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm campaign-primary-text">
              {selectedSchedules.length} of {allSchedules.length} schedule{selectedSchedules.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                disabled={bulkActionLoading}
                className="flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkActionLoading}
                className="flex items-center gap-1"
              >
                <Pause className="w-3 h-3" />
                Deactivate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="campaign-card-bg rounded-lg border campaign-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="campaign-secondary-bg border-campaign-border">
              <TableHead className="w-12">
                <div className="relative">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  {isPartiallySelected && !isAllSelected && (
                    <Minus className="w-3 h-3 absolute top-0.5 left-0.5 text-primary" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-12 campaign-primary-text">Status</TableHead>
              <TableHead className="campaign-primary-text">Schedule</TableHead>
              <TableHead className="campaign-primary-text">Schedule Pattern</TableHead>
              <TableHead className="campaign-primary-text">Items</TableHead>
              <TableHead className="campaign-primary-text">Total Jobs</TableHead>
              <TableHead className="campaign-primary-text">Success Rate</TableHead>
              <TableHead className="campaign-primary-text">Next Run</TableHead>
              <TableHead className="campaign-primary-text">Management</TableHead>
              <TableHead className="w-20 campaign-primary-text">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSchedules.map((schedule) => {
              const status = getStatusBadge(schedule);
              const StatusIcon = status.icon;
              const isSelected = selectedSchedules.includes(schedule.oxylabs_schedule_id);
              
              return (
                <TableRow key={schedule.id} className="hover:campaign-secondary-bg border-campaign-border">
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleSelectSchedule(schedule.oxylabs_schedule_id, checked as boolean)
                      }
                    />
                  </TableCell>
                  
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
                        {parseCronExpression(schedule.cron_expression, 'UTC')}
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
                      {formatDateWithTimezone(schedule.next_run_at, 'UTC')}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      {status.text}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <ScheduleActions
                      schedule={schedule}
                      onToggleSchedule={onToggleSchedule}
                      onViewDetails={onViewDetails}
                      onViewRuns={onViewRuns}
                      onViewJobs={onViewJobs}
                      onDelete={onDeleteSchedule}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm campaign-secondary-text">
            Showing {startIndex + 1} to {Math.min(endIndex, schedules.length)} of {schedules.length} schedules
            {selectedSchedules.length > 0 && (
              <span className="ml-2 campaign-primary-text">
                ({selectedSchedules.length} selected across all pages)
              </span>
            )}
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
