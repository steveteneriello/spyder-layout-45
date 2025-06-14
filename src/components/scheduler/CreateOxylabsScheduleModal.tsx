
import React, { useState } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateScheduleModalProps {
  isOpen: boolean;
  jobId: string;
  scheduleId: string;
  jobName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOxylabsScheduleModal({
  isOpen,
  jobId,
  scheduleId,
  jobName,
  onClose,
  onSuccess
}: CreateScheduleModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [testMode, setTestMode] = useState(true);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(
        `https://krmwphqhlzscnuxwxvkz.supabase.co/functions/v1/scrapi-oxylabs-scheduler/create-from-job`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            job_id: jobId,
            schedule_id: scheduleId,
            end_date: endDate || undefined,
            test_mode: testMode
          })
        }
      );

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="campaign-card-bg campaign-border max-w-md">
        <DialogHeader>
          <DialogTitle className="campaign-primary-text">Create Oxylabs Schedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm campaign-secondary-text">
              Create an Oxylabs schedule for job: <span className="font-medium campaign-primary-text">{jobName}</span>
            </p>
          </div>

          <div>
            <Label htmlFor="endDate" className="campaign-primary-text">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="campaign-card-bg campaign-border campaign-primary-text"
            />
            <p className="text-xs campaign-secondary-text mt-1">
              Leave empty for no end date
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="testMode"
              checked={testMode}
              onCheckedChange={(checked) => setTestMode(checked as boolean)}
            />
            <Label htmlFor="testMode" className="text-sm campaign-primary-text">
              Test mode (limited runs)
            </Label>
          </div>
          <p className="text-xs campaign-secondary-text">
            Recommended for first-time setup
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> This will create billable jobs in Oxylabs. 
              Test with a small dataset first.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
