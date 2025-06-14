
import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleManagementTable } from './ScheduleManagementTable';
import { OperationsMonitoring } from './OperationsMonitoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

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

const API_BASE_URL = 'https://krmwphqhlzscnuxwxvkz.supabase.co/functions/v1/scrapi-oxylabs-scheduler';

export default function OxylabsSchedulerDashboard() {
  const [schedules, setSchedules] = useState<OxylabsSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<OxylabsSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'schedules' | 'operations'>('schedules');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/dashboard?limit=${limit}&offset=${offset}`;
      console.log('Fetching data from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      setSchedules(result.schedules || []);
      setTotalCount(result.total_count || 0);
      setFilteredSchedules(result.schedules || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      // Set empty data on error to prevent UI issues
      setSchedules([]);
      setFilteredSchedules([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleSchedule = async (scheduleId: string, currentState: boolean) => {
    try {
      console.log('Toggling schedule:', scheduleId, currentState);
      
      const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}/state`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle schedule');
      }

      const result = await response.json();
      console.log('Toggle schedule result:', result);

      // Refresh the data after toggle
      await fetchData();
      
      toast({
        title: 'Schedule Update Queued',
        description: 'The schedule has been queued for activation/deactivation and will be updated shortly.',
      });
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle schedule',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      console.log('Deleting schedule:', scheduleId);
      
      const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete schedule');
      }

      const result = await response.json();
      console.log('Delete schedule result:', result);

      // Refresh the data after deletion
      await fetchData();
      
      toast({
        title: 'Schedule Deletion Queued',
        description: 'The schedule has been queued for deletion and will be removed shortly.',
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete schedule',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleViewRuns = (scheduleId: string) => {
    console.log('View runs for schedule:', scheduleId);
    toast({
      title: 'View Runs',
      description: `View runs action for schedule ${scheduleId} is not implemented yet.`,
    });
  };

  const handleViewDetails = (scheduleId: string) => {
    console.log('View details for schedule:', scheduleId);
    toast({
      title: 'View Details',
      description: `View details action for schedule ${scheduleId} is not implemented yet.`,
    });
  };

  const handleViewJobs = (scheduleId: string) => {
    console.log('View jobs for schedule:', scheduleId);
    toast({
      title: 'View Jobs',
      description: `View jobs action for schedule ${scheduleId} is not implemented yet.`,
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filtered = schedules.filter(schedule =>
        schedule.job_name?.toLowerCase().includes(term.toLowerCase()) ||
        schedule.schedule_name?.toLowerCase().includes(term.toLowerCase()) ||
        schedule.oxylabs_schedule_id?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredSchedules(filtered);
    } else {
      setFilteredSchedules(schedules);
    }
  };

  const refetch = async () => {
    await fetchData();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Section */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Oxylabs Scheduler Dashboard</h2>
        <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="campaign-card-bg campaign-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium campaign-primary-text">Total Schedules</CardTitle>
              <CardDescription className="campaign-secondary-text">
                Total number of active and inactive schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold campaign-primary-text">{totalCount}</div>
            </CardContent>
          </Card>

          <Card className="campaign-card-bg campaign-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium campaign-primary-text">Active Schedules</CardTitle>
              <CardDescription className="campaign-secondary-text">
                Number of schedules currently active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold campaign-primary-text">
                {schedules.filter(schedule => schedule.active).length}
              </div>
            </CardContent>
          </Card>

          <Card className="campaign-card-bg campaign-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium campaign-primary-text">Inactive Schedules</CardTitle>
              <CardDescription className="campaign-secondary-text">
                Number of schedules currently inactive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold campaign-primary-text">
                {schedules.filter(schedule => !schedule.active).length}
              </div>
            </CardContent>
          </Card>

          <Card className="campaign-card-bg campaign-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium campaign-primary-text">Unmanaged Schedules</CardTitle>
              <CardDescription className="campaign-secondary-text">
                Schedules not fully managed by this system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold campaign-primary-text">
                {schedules.filter(schedule => schedule.management_status === 'unmanaged').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="text-sm text-destructive">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="schedules" className="space-y-4" onValueChange={(value) => setActiveTab(value as 'schedules' | 'operations')}>
          <TabsList>
            <TabsTrigger value="schedules" className="data-[state=active]:text-primary">Schedules</TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:text-primary">Operations</TabsTrigger>
          </TabsList>
          
          <div className="border rounded-md p-4 campaign-card-bg campaign-border">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold campaign-primary-text">Manage Schedules</h3>
                <p className="text-sm text-muted-foreground">
                  View, edit, and manage your Oxylabs schedules.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pr-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0"
                      onClick={() => handleSearch('')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 text-gray-500"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <TabsContent value="schedules">
            <ScheduleManagementTable
              schedules={filteredSchedules}
              loading={isLoading}
              onToggleSchedule={handleToggleSchedule}
              onViewRuns={handleViewRuns}
              onViewDetails={handleViewDetails}
              onViewJobs={handleViewJobs}
              onDeleteSchedule={handleDeleteSchedule}
            />
          </TabsContent>

          <TabsContent value="operations">
            <OperationsMonitoring />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
