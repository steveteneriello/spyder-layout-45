
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BulkDeleteDialog } from './BulkDeleteDialog';
import { Play, Pause, Trash2, Minus } from 'lucide-react';

interface Schedule {
  id: string;
  oxylabs_schedule_id: string;
  active: boolean;
  job_name?: string;
  schedule_name?: string;
}

interface BulkSelectionBarProps {
  selectedSchedules: Set<string>;
  currentPageSchedules: Schedule[];
  allFilteredSchedules: Schedule[];
  statusFilter: string;
  onSelectAll: () => void;
  onSelectAllFiltered: () => void;
  onClearSelection: () => void;
  onBulkAction: (action: 'activate' | 'deactivate' | 'delete') => Promise<void>;
  isProcessing: boolean;
}

export function BulkSelectionBar({
  selectedSchedules,
  currentPageSchedules,
  allFilteredSchedules,
  statusFilter,
  onSelectAll,
  onSelectAllFiltered,
  onClearSelection,
  onBulkAction,
  isProcessing
}: BulkSelectionBarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const selectedCount = selectedSchedules.size;
  const currentPageCount = currentPageSchedules.length;
  const totalFilteredCount = allFilteredSchedules.length;
  
  const isAllCurrentPageSelected = currentPageCount > 0 && 
    currentPageSchedules.every(schedule => selectedSchedules.has(schedule.oxylabs_schedule_id));
  
  const isAllFilteredSelected = totalFilteredCount > 0 && 
    allFilteredSchedules.every(schedule => selectedSchedules.has(schedule.oxylabs_schedule_id));

  const isPartiallySelected = selectedCount > 0 && !isAllCurrentPageSelected;

  const getStatusText = () => {
    switch (statusFilter) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'unmanaged': return 'unmanaged';
      default: return '';
    }
  };

  const handleBulkDelete = async () => {
    await onBulkAction('delete');
    setDeleteDialogOpen(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Checkbox
                  checked={isAllCurrentPageSelected}
                  onCheckedChange={isAllCurrentPageSelected ? onClearSelection : onSelectAll}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                {isPartiallySelected && !isAllCurrentPageSelected && (
                  <Minus className="w-3 h-3 absolute top-0.5 left-0.5 text-primary pointer-events-none" />
                )}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedCount} of {totalFilteredCount} schedule{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Show option to select all filtered schedules if not all are selected */}
            {isAllCurrentPageSelected && !isAllFilteredSelected && totalFilteredCount > currentPageCount && (
              <button
                onClick={onSelectAllFiltered}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Select all {totalFilteredCount} {getStatusText()} schedules
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('activate')}
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('deactivate')}
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              Deactivate
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <BulkDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        selectedCount={selectedCount}
        onConfirm={handleBulkDelete}
        loading={isProcessing}
      />
    </>
  );
}
