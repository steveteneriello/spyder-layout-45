import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Settings, Plus, Activity, CheckCircle, AlertCircle, BarChart3, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGlobalTheme } from "@/contexts/GlobalThemeContext";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import { SchedulerThemeDebug } from "@/components/theme/ThemeDebugSection";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { SideCategory } from '@/components/navigation/SideCategory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScrapiJob {
  id: string;
  name: string;
  description: string | null;
  keywords: any[];
  search_engine: string;
  cron_expression: string | null;
  timezone: string;
  is_active: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
  keyword_count?: number;
}

interface ScrapiBatch {
  id: string;
  job_id: string;
  status: string;
  oxylabs_batch_id: string | null;
  gcs_path_pattern: string | null;
  total_queries: number;
  completed_queries: number;
  failed_queries: number;
  error_message: string | null;
  retry_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  job?: { name: string };
  progress_percentage?: number;
}

interface SystemStatus {
  jobs: {
    total: number;
    active: number;
    inactive: number;
  };
  batches: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  results: {
    total: number;
  };
  performance_24h: {
    total_queries: number;
    successful_queries: number;
    failed_queries: number;
    success_rate_percentage: number;
  };
}

const SchedulerDashboard = () => {
  const { debugSettings, actualTheme } = useGlobalTheme();
  const { getSections } = useMenuConfig();
  const menuSections = getSections();
  const { toast } = useToast();
  
  // State management
  const [jobs, setJobs] = useState<ScrapiJob[]>([]);
  const [batches, setBatches] = useState<ScrapiBatch[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // API Base URL - update this to your Supabase project
  const API_BASE = 'https://your-project.supabase.co/functions/v1/scrapi-manager';

  useEffect(() => {
    loadDashboardData();
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    if (!refreshing) setIsLoading(true);
    try {
      const [jobsRes, batchesRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/jobs`),
        fetch(`${API_BASE}/batches?limit=50`),
        fetch(`${API_BASE}/status`)
      ]);

      if (!jobsRes.ok || !batchesRes.ok || !statusRes.ok) {
        throw new Error('Failed to fetch data from SCRAPI API');
      }

      const [jobsData, batchesData, statusData] = await Promise.all([
        jobsRes.json(),
        batchesRes.json(), 
        statusRes.json()
      ]);

      setJobs(jobsData.jobs || []);
      setBatches(batchesData.batches || []);
      setSystemStatus(statusData);

      toast({
        title: "Data Updated",
        description: "SCRAPI dashboard data refreshed successfully",
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load SCRAPI dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const triggerJob = async (jobId: string, jobName: string) => {
    try {
      const response = await fetch(`${API_BASE}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      });
      
      if (response.ok) {
        toast({
          title: "Job Triggered",
          description: `Successfully triggered job: ${jobName}`,
        });
        loadDashboardData();
      } else {
        throw new Error('Failed to trigger job');
      }
    } catch (error) {
      console.error('Failed to trigger job:', error);
      toast({
        title: "Error",
        description: "Failed to trigger job",
        variant: "destructive",
      });
    }
  };

  const testScheduler = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${API_BASE}/test-scheduler`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Scheduler Tested",
          description: "SCRAPI scheduler test completed successfully",
        });
        loadDashboardData();
      } else {
        throw new Error('Scheduler test failed');
      }
    } catch (error) {
      console.error('Failed to test scheduler:', error);
      toast({
        title: "Error",
        description: "Failed to test SCRAPI scheduler",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter and search functionality
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'active') return matchesSearch && job.is_active;
    if (statusFilter === 'inactive') return matchesSearch && !job.is_active;
    if (statusFilter === 'scheduled') return matchesSearch && job.next_run_at;
    return matchesSearch;
  });

  // Calculate statistics
  const schedulerStats = [
    {
      title: 'Active Jobs',
      value: jobs.filter(j => j.is_active).length.toString(),
      change: '+' + Math.max(1, Math.floor(jobs.filter(j => j.is_active).length * 0.1)),
      trend: 'up',
      icon: Activity,
      color: 'text-green-600',
      description: 'Currently enabled',
    },
    {
      title: 'Scheduled',
      value: jobs.filter(j => j.next_run_at).length.toString(),
      change: '+' + Math.max(1, jobs.filter(j => j.next_run_at).length),
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600',
      description: 'Waiting to execute',
    },
    {
      title: 'Completed Today',
      value: batches.filter(b => b.status === 'completed').length.toString(),
      change: '+' + Math.max(1, batches.filter(b => b.status === 'completed').length),
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Successfully finished',
    },
    {
      title: 'Failed/Retry',
      value: batches.filter(b => b.status === 'failed').length.toString(),
      change: '-' + batches.filter(b => b.status === 'failed').length,
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600',
      description: 'Need attention',
    },
  ];

  // Calculate batch statistics
  const batchStats = {
    pending: batches.filter(b => b.status === 'pending').length,
    processing: batches.filter(b => b.status === 'processing').length,
    completed: batches.filter(b => b.status === 'completed').length,
    failed: batches.filter(b => b.status === 'failed').length
  };

  // Recent jobs for sidebar
  const recentJobs = jobs.slice(0, 4).map(job => ({
    id: job.id,
    name: job.name,
    status: job.is_active ? 'scheduled' : 'paused',
    nextRun: job.next_run_at ? new Date(job.next_run_at).toLocaleTimeString() : 'Manual',
    frequency: job.cron_expression || 'Manual trigger',
    type: job.search_engine === 'google_ads' ? 'Google Ads Scraping' : 
          job.search_engine === 'bing_ads' ? 'Bing Ads Scraping' : 
          job.search_engine === 'google' ? 'Google SERP Scraping' : 'SERP Analysis',
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success-bg text-success border border-success-border';
      case 'scheduled': return 'bg-info-bg text-info border border-info-border';
      case 'completed': return 'bg-muted text-muted-foreground border border-border';
      case 'paused': return 'bg-warning-bg text-warning border border-warning-border';
      case 'failed': return 'bg-error-bg text-error border border-error-border';
      default: return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3" />;
      case 'scheduled': return <Clock className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'failed': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Loading SCRAPI data...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory
              key={section.name}
              title={section.name}
              items={section.items}
            />
          ))}
        </div>
      }
      menuItems={[]} // Legacy prop, keep empty
      nav={
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-primary-foreground">SCRAPI</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/20">
              <Activity className="h-3 w-3 mr-1" />
              {jobs.filter(j => j.is_active).length} Active
            </Badge>
          </div>
        </div>
      }
      footer={
        <div className="text-xs text-primary-foreground/60 text-center">
          <p>{jobs.length} SCRAPI jobs</p>
        </div>
      }
    >
      <div className="flex-1 bg-background text-foreground min-h-screen">
        {/* Theme Debug Section */}
        {debugSettings.showThemeDebug && (
          <div className="p-6 pb-0">
            <SchedulerThemeDebug />
          </div>
        )}

        {/* Page header */}
        <div className="bg-gradient-to-r from-background to-card border-border border-b shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-wide text-foreground">SCRAPI Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Streamlined Oxylabs SERP scraping system
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {setRefreshing(true); loadDashboardData();}}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild>
                <a href="/scheduler/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </a>
              </Button>
            </div>
          </div>

          {/* Stats Grid - 4 cards in one row */}
          <div className="grid grid-cols-4 gap-6">
            {schedulerStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-card border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                      <Badge 
                        variant={stat.trend === 'up' ? 'default' : stat.trend === 'down' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </h3>
                      <p className="text-sm font-medium text-foreground">
                        {stat.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex gap-6 h-full bg-background min-h-[40vh] px-6 pb-6">
          {/* Main Jobs Panel */}
          <div className="flex-1 bg-card border-border border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                SCRAPI Job Manager
              </CardTitle>
              <CardDescription>
                Manage and monitor your SERP scraping jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Controls Section */}
              <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded"
                    />
                    Auto Refresh
                  </label>
                </div>
              </div>

              {/* Batch Statistics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-warning-bg border border-warning-border rounded-lg">
                  <div className="text-2xl font-bold text-warning">{batchStats.pending}</div>
                  <div className="text-sm text-warning">Pending</div>
                </div>
                <div className="p-3 bg-info-bg border border-info-border rounded-lg">
                  <div className="text-2xl font-bold text-info">{batchStats.processing}</div>
                  <div className="text-sm text-info">Processing</div>
                </div>
                <div className="p-3 bg-success-bg border border-success-border rounded-lg">
                  <div className="text-2xl font-bold text-success">{batchStats.completed}</div>
                  <div className="text-sm text-success">Completed</div>
                </div>
                <div className="p-3 bg-error-bg border border-error-border rounded-lg">
                  <div className="text-2xl font-bold text-error">{batchStats.failed}</div>
                  <div className="text-sm text-error">Failed</div>
                </div>
              </div>

              {/* Jobs List */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-foreground">SCRAPI Jobs ({filteredJobs.length})</h4>
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-muted/50 rounded-lg border hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{job.name}</h4>
                        <p className="text-xs text-muted-foreground">{job.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.keywords?.length || 0} keywords • {job.search_engine}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${
                        job.is_active 
                          ? 'bg-success-bg text-success border-success-border' 
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {job.is_active ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        <span>{job.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Schedule: {job.cron_expression || 'Manual'}</span>
                      </div>
                      {job.next_run_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Next: {new Date(job.next_run_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerJob(job.id, job.name)}
                        className="w-full"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Trigger Now
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredJobs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No SCRAPI jobs found{searchTerm && ` matching "${searchTerm}"`}.</p>
                  </div>
                )}
              </div>

              {/* Test Scheduler Button */}
              <div className="mt-6">
                <Button 
                  onClick={testScheduler} 
                  disabled={refreshing}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Test SCRAPI Scheduler
                </Button>
              </div>
            </CardContent>
          </div>

          {/* Recent Jobs Sidebar */}
          <div className="w-[400px] bg-card border-border border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                Recent Jobs
              </CardTitle>
              <CardDescription>
                Latest SCRAPI scheduling activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="p-3 bg-muted/50 rounded-lg border-border border hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {job.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {job.type}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="capitalize">{job.status}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Next: {job.nextRun}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{job.frequency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SchedulerDashboard;