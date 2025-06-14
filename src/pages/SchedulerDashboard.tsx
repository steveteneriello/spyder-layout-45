
import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Play,
  Pause,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Link2,
  Settings,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download,
  Plus,
  X
} from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { ScheduleManagementTable } from '@/components/scheduler/ScheduleManagementTable';

// Types
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

interface ScheduleRun {
  run_id: number;
  success_rate: number;
  jobs: Array<{
    id: string;
    result_status: string;
    created_at: string;
  }>;
  created_at: string;
}

interface DashboardStats {
  total_schedules: number;
  active_schedules: number;
  unmanaged_schedules: number;
  total_jobs_24h: number;
  avg_success_rate: number;
}

// API client with improved debugging
class OxylabsSchedulerAPI {
  private baseUrl: string;
  private headers: HeadersInit;
  private debugMode: boolean = true;
  private onLog: (message: string, data?: any) => void;

  constructor(supabaseUrl: string, supabaseAnonKey: string, onLog: (message: string, data?: any) => void) {
    this.baseUrl = `${supabaseUrl}/functions/v1/scrapi-oxylabs-scheduler`;
    this.headers = {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    };
    this.onLog = onLog;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    this.onLog(`Making request to: ${url}`, options);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...options.headers }
      });
      
      this.onLog(`Response status: ${response.status}`, {
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const responseText = await response.text();
      this.onLog(`Response body: ${responseText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      try {
        return JSON.parse(responseText);
      } catch (e) {
        this.onLog('Failed to parse JSON', e);
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      this.onLog('Request failed', error);
      throw error;
    }
  }

  async testConnection() {
    return this.makeRequest('/health');
  }

  async syncSchedules() {
    return this.makeRequest('/sync');
  }

  async mapUnmanaged() {
    return this.makeRequest('/map-unmanaged');
  }

  async getSchedule(scheduleId: string) {
    return this.makeRequest(`/schedule/${scheduleId}`);
  }

  async getScheduleRuns(scheduleId: string) {
    return this.makeRequest(`/schedule/${scheduleId}/runs`);
  }

  async getScheduleJobs(scheduleId: string) {
    return this.makeRequest(`/schedule/${scheduleId}/jobs`);
  }

  async setScheduleState(scheduleId: string, active: boolean) {
    return this.makeRequest(`/schedule/${scheduleId}/state`, {
      method: 'PUT',
      body: JSON.stringify({ active })
    });
  }

  async getDashboard() {
    return this.makeRequest('/dashboard');
  }

  async createFromJob(jobId: string, scheduleId: string) {
    return this.makeRequest('/create-from-job', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, schedule_id: scheduleId })
    });
  }
}

// Main Dashboard Component
function OxylabsSchedulerDashboard() {
  const [schedules, setSchedules] = useState<OxylabsSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<OxylabsSchedule | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState<any>(null);
  const [scheduleRuns, setScheduleRuns] = useState<any[]>([]);
  const [scheduleJobs, setScheduleJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_schedules: 0,
    active_schedules: 0,
    unmanaged_schedules: 0,
    total_jobs_24h: 0,
    avg_success_rate: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'unmanaged'>('all');
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);
  const [debugMode, setDebugMode] = useState(true);
  const [apiLogs, setApiLogs] = useState<string[]>([]);

  // Add logging function
  const logAPI = (message: string, data?: any) => {
    const logEntry = `[${new Date().toISOString()}] ${message} ${data ? JSON.stringify(data, null, 2) : ''}`;
    console.log(logEntry);
    if (debugMode) {
      setApiLogs(prev => [...prev.slice(-9), logEntry]);
    }
  };

  // Initialize API client
  const api = new OxylabsSchedulerAPI(
    'https://krmwphqhlzscnuxwxvkz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU',
    logAPI
  );

  // Test connection function
  const testConnection = async () => {
    try {
      logAPI('Testing connection...');
      const result = await api.testConnection();
      addNotification('success', 'Connection test successful!');
      logAPI('Connection test result', result);
    } catch (error) {
      addNotification('error', `Connection test failed: ${error.message}`);
      logAPI('Connection test failed', error);
    }
  };

  // Load dashboard data
  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      logAPI('Loading dashboard...');
      const data = await api.getDashboard();
      
      // Transform the data to match our interface
      const transformedSchedules = (data.schedules || []).map((schedule: any) => ({
        id: schedule.id,
        oxylabs_schedule_id: schedule.oxylabs_schedule_id,
        active: schedule.active || false,
        cron_expression: schedule.cron_expression || '',
        next_run_at: schedule.next_run_at || '',
        end_time: schedule.end_time || '',
        job_name: schedule.job_name,
        schedule_name: schedule.schedule_name,
        items_count: schedule.items_count || 0,
        stats: schedule.stats || { total_job_count: 0, job_result_outcomes: [] },
        management_status: schedule.management_status || 'unmanaged',
        last_synced_at: schedule.last_synced_at || ''
      }));
      
      setSchedules(transformedSchedules);
      
      // Calculate stats
      const totalSchedules = transformedSchedules.length;
      const activeSchedules = transformedSchedules.filter((s: any) => s.active).length;
      const unmanagedSchedules = transformedSchedules.filter((s: any) => s.management_status === 'unmanaged').length;
      const totalJobs24h = data.recent_runs?.length || 0;
      const avgSuccessRate = totalSchedules > 0 ? transformedSchedules.reduce((acc: number, s: any) => {
        const successOutcome = s.stats?.job_result_outcomes?.find((o: any) => o.status === 'done');
        return acc + (successOutcome?.ratio || 0);
      }, 0) / totalSchedules : 0;

      setStats({
        total_schedules: totalSchedules,
        active_schedules: activeSchedules,
        unmanaged_schedules: unmanagedSchedules,
        total_jobs_24h: totalJobs24h,
        avg_success_rate: avgSuccessRate
      });
      
      logAPI('Dashboard loaded successfully', data);
    } catch (error) {
      addNotification('error', `Failed to load dashboard: ${error.message}`);
      logAPI('Failed to load dashboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync with Oxylabs
  const syncSchedules = async () => {
    setIsSyncing(true);
    try {
      logAPI('Starting sync...');
      const result = await api.syncSchedules();
      addNotification('success', `Synced ${result.synced || 0} schedules successfully`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', `Failed to sync schedules: ${error.message}`);
      logAPI('Sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Map unmanaged schedules
  const mapUnmanagedSchedules = async () => {
    try {
      logAPI('Mapping unmanaged schedules...');
      const result = await api.mapUnmanaged();
      const mappedCount = result.mappings?.filter((m: any) => m.success).length || 0;
      addNotification('success', `Mapped ${mappedCount} unmanaged schedules`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', `Failed to map unmanaged schedules: ${error.message}`);
    }
  };

  // Toggle schedule state
  const toggleScheduleState = async (scheduleId: string, currentState: boolean) => {
    try {
      await api.setScheduleState(scheduleId, !currentState);
      addNotification('success', `Schedule ${currentState ? 'deactivated' : 'activated'} successfully`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', `Failed to update schedule state: ${error.message}`);
    }
  };

  // Load schedule details
  const loadScheduleDetails = async (scheduleId: string) => {
    try {
      const details = await api.getSchedule(scheduleId);
      setScheduleDetails(details);
      addNotification('info', `Loaded details for schedule ${scheduleId}`);
    } catch (error) {
      addNotification('error', `Failed to load schedule details: ${error.message}`);
    }
  };

  // Load schedule runs
  const loadScheduleRuns = async (scheduleId: string) => {
    try {
      const runs = await api.getScheduleRuns(scheduleId);
      setScheduleRuns(runs.results || []);
      addNotification('info', `Loaded ${runs.results?.length || 0} runs for schedule ${scheduleId}`);
    } catch (error) {
      addNotification('error', `Failed to load schedule runs: ${error.message}`);
    }
  };

  // Load schedule jobs
  const loadScheduleJobs = async (scheduleId: string) => {
    try {
      const jobs = await api.getScheduleJobs(scheduleId);
      setScheduleJobs(jobs.results || []);
      addNotification('info', `Loaded ${jobs.results?.length || 0} jobs for schedule ${scheduleId}`);
    } catch (error) {
      addNotification('error', `Failed to load schedule jobs: ${error.message}`);
    }
  };

  // Add notification
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.job_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.oxylabs_schedule_id.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && schedule.active) ||
                         (filterStatus === 'inactive' && !schedule.active) ||
                         (filterStatus === 'unmanaged' && schedule.management_status === 'unmanaged');
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    logAPI('Component mounted, loading dashboard...');
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen campaign-page-bg">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg transition-all ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Debug Panel */}
      {debugMode && (
        <div className="fixed bottom-4 left-4 w-96 bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">API Debug Log</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setApiLogs([])} 
                className="text-red-400 hover:text-red-300"
              >
                Clear
              </button>
              <button 
                onClick={() => setDebugMode(false)} 
                className="text-gray-400 hover:text-gray-300"
              >
                Hide
              </button>
            </div>
          </div>
          {apiLogs.map((log, i) => (
            <div key={i} className="mb-1 break-words">{log}</div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="campaign-card-bg campaign-border border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold campaign-primary-text">Oxylabs Scheduler Management</h1>
              <p className="text-sm campaign-secondary-text mt-1">Manage and monitor your Oxylabs scheduled scraping jobs</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Test Connection
              </button>
              <button
                onClick={mapUnmanagedSchedules}
                className="px-4 py-2 campaign-button-blue text-white rounded-lg hover:campaign-button-blue transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={stats.unmanaged_schedules === 0}
              >
                <Link2 className="w-4 h-4" />
                Map Unmanaged ({stats.unmanaged_schedules})
              </button>
              <button
                onClick={syncSchedules}
                disabled={isSyncing}
                className="px-4 py-2 campaign-button-blue text-white rounded-lg hover:campaign-button-blue transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync Schedules
              </button>
              {!debugMode && (
                <button
                  onClick={() => setDebugMode(true)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Show Debug
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="campaign-card-bg rounded-lg p-4 campaign-border border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm campaign-secondary-text">Total Schedules</p>
                <p className="text-2xl font-bold mt-1 campaign-primary-text">{stats.total_schedules}</p>
              </div>
              <Calendar className="w-8 h-8 campaign-accent" />
            </div>
          </div>
          
          <div className="campaign-card-bg rounded-lg p-4 campaign-border border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm campaign-secondary-text">Active</p>
                <p className="text-2xl font-bold mt-1 campaign-primary-text">{stats.active_schedules}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="campaign-card-bg rounded-lg p-4 campaign-border border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm campaign-secondary-text">Unmanaged</p>
                <p className="text-2xl font-bold mt-1 campaign-primary-text">{stats.unmanaged_schedules}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="campaign-card-bg rounded-lg p-4 campaign-border border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm campaign-secondary-text">Jobs (24h)</p>
                <p className="text-2xl font-bold mt-1 campaign-primary-text">{stats.total_jobs_24h}</p>
              </div>
              <Clock className="w-8 h-8 campaign-button-blue" />
            </div>
          </div>
          
          <div className="campaign-card-bg rounded-lg p-4 campaign-border border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm campaign-secondary-text">Success Rate</p>
                <p className="text-2xl font-bold mt-1 campaign-primary-text">{(stats.avg_success_rate * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-4">
        <div className="campaign-card-bg rounded-lg p-4 campaign-border border">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 campaign-secondary-text" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 campaign-card-bg campaign-primary-text campaign-border"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 campaign-secondary-text" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 campaign-card-bg campaign-primary-text campaign-border"
              >
                <option value="all">All Schedules</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="unmanaged">Unmanaged Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Management Table */}
      <div className="px-6 pb-6">
        <ScheduleManagementTable
          schedules={filteredSchedules}
          loading={isLoading}
          onToggleSchedule={toggleScheduleState}
          onViewRuns={loadScheduleRuns}
          onViewDetails={loadScheduleDetails}
          onViewJobs={loadScheduleJobs}
        />
      </div>
    </div>
  );
}

const menuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Settings', section: 'Main' },
  { title: 'Theme', path: '/theme', icon: 'Settings', section: 'Settings' }
];

export default function SchedulerDashboard() {
  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <h1 className="text-lg font-semibold text-white">Scheduler Dashboard</h1>
        </div>
      }
      category={
        <SideCategory 
          section="Main" 
          items={menuItems.filter(item => item.section === 'Main')} 
        />
      }
      menuItems={menuItems}
    >
      <OxylabsSchedulerDashboard />
    </SidebarLayout>
  );
}
