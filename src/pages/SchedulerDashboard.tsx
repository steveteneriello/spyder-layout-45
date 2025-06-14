
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

// API client
class OxylabsSchedulerAPI {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.baseUrl = `${supabaseUrl}/functions/v1/scrapi-oxylabs-scheduler`;
    this.headers = {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json'
    };
  }

  async syncSchedules() {
    const response = await fetch(`${this.baseUrl}/sync`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async mapUnmanaged() {
    const response = await fetch(`${this.baseUrl}/map-unmanaged`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async getSchedule(scheduleId: string) {
    const response = await fetch(`${this.baseUrl}/schedule/${scheduleId}`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async setScheduleState(scheduleId: string, active: boolean) {
    const response = await fetch(`${this.baseUrl}/schedule/${scheduleId}/state`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ active })
    });
    return response.json();
  }

  async getDashboard() {
    const response = await fetch(`${this.baseUrl}/dashboard`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async createFromJob(jobId: string, scheduleId: string) {
    const response = await fetch(`${this.baseUrl}/create-from-job`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ job_id: jobId, schedule_id: scheduleId })
    });
    return response.json();
  }
}

// Main Dashboard Component
function OxylabsSchedulerDashboard() {
  const [schedules, setSchedules] = useState<OxylabsSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<OxylabsSchedule | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState<any>(null);
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

  // Initialize API client
  const api = new OxylabsSchedulerAPI(
    'https://krmwphqhlzscnuxwxvkz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU'
  );

  // Load dashboard data
  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboard();
      setSchedules(data.schedules || []);
      
      // Calculate stats
      const totalSchedules = data.schedules.length;
      const activeSchedules = data.schedules.filter((s: OxylabsSchedule) => s.active).length;
      const unmanagedSchedules = data.schedules.filter((s: OxylabsSchedule) => s.management_status === 'unmanaged').length;
      const totalJobs24h = data.recent_runs?.length || 0;
      const avgSuccessRate = data.schedules.reduce((acc: number, s: OxylabsSchedule) => {
        const successOutcome = s.stats?.job_result_outcomes?.find(o => o.status === 'done');
        return acc + (successOutcome?.ratio || 0);
      }, 0) / (totalSchedules || 1);

      setStats({
        total_schedules: totalSchedules,
        active_schedules: activeSchedules,
        unmanaged_schedules: unmanagedSchedules,
        total_jobs_24h: totalJobs24h,
        avg_success_rate: avgSuccessRate
      });
    } catch (error) {
      addNotification('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync with Oxylabs
  const syncSchedules = async () => {
    setIsSyncing(true);
    try {
      const result = await api.syncSchedules();
      addNotification('success', `Synced ${result.synced} schedules successfully`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', 'Failed to sync schedules');
    } finally {
      setIsSyncing(false);
    }
  };

  // Map unmanaged schedules
  const mapUnmanagedSchedules = async () => {
    try {
      const result = await api.mapUnmanaged();
      const mappedCount = result.mappings?.filter((m: any) => m.success).length || 0;
      addNotification('success', `Mapped ${mappedCount} unmanaged schedules`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', 'Failed to map unmanaged schedules');
    }
  };

  // Toggle schedule state
  const toggleScheduleState = async (scheduleId: string, currentState: boolean) => {
    try {
      await api.setScheduleState(scheduleId, !currentState);
      addNotification('success', `Schedule ${currentState ? 'deactivated' : 'activated'} successfully`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', 'Failed to update schedule state');
    }
  };

  // Load schedule details
  const loadScheduleDetails = async (scheduleId: string) => {
    try {
      const details = await api.getSchedule(scheduleId);
      setScheduleDetails(details);
    } catch (error) {
      addNotification('error', 'Failed to load schedule details');
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

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.job_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.oxylabs_schedule_id.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && schedule.active) ||
                         (filterStatus === 'inactive' && !schedule.active) ||
                         (filterStatus === 'unmanaged' && schedule.management_status === 'unmanaged');
    
    return matchesSearch && matchesFilter;
  });

  // Parse cron expression to human readable
  const parseCronExpression = (cron: string) => {
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (schedule: OxylabsSchedule) => {
    if (!schedule.active) {
      return { color: 'bg-gray-100 text-gray-700', icon: Pause, text: 'Inactive' };
    }
    if (schedule.management_status === 'unmanaged') {
      return { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, text: 'Unmanaged' };
    }
    const successRate = schedule.stats?.job_result_outcomes?.find(o => o.status === 'done')?.ratio || 0;
    if (successRate < 0.5) {
      return { color: 'bg-red-100 text-red-700', icon: TrendingDown, text: 'Poor Performance' };
    }
    return { color: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Healthy' };
  };

  useEffect(() => {
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

      {/* Schedules Table */}
      <div className="px-6 pb-6">
        <div className="campaign-card-bg rounded-lg campaign-border border overflow-hidden">
          <table className="w-full">
            <thead className="campaign-secondary-bg campaign-border border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium campaign-secondary-text uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium campaign-secondary-text uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium campaign-secondary-text uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium campaign-secondary-text uppercase tracking-wider">
                  Next Run
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium campaign-secondary-text uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium campaign-secondary-text uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y campaign-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center campaign-secondary-text">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading schedules...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center campaign-secondary-text">
                    No schedules found
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => {
                  const status = getStatusBadge(schedule);
                  const StatusIcon = status.icon;
                  const successRate = schedule.stats?.job_result_outcomes?.find(o => o.status === 'done')?.ratio || 0;
                  
                  return (
                    <tr key={schedule.id} className="hover:campaign-secondary-bg">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium campaign-primary-text">
                            {schedule.job_name || 'Unnamed Schedule'}
                          </div>
                          <div className="text-sm campaign-secondary-text">
                            ID: {schedule.oxylabs_schedule_id}
                          </div>
                          {schedule.schedule_name && (
                            <div className="text-sm campaign-secondary-text">
                              {schedule.schedule_name}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.text}
                        </span>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div className="font-medium campaign-primary-text">{parseCronExpression(schedule.cron_expression)}</div>
                          <div className="campaign-secondary-text">{schedule.cron_expression}</div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {schedule.next_run_at ? (
                            <>
                              <div className="campaign-primary-text">{formatDate(schedule.next_run_at)}</div>
                              {schedule.end_time && (
                                <div className="campaign-secondary-text">
                                  Ends: {formatDate(schedule.end_time)}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="campaign-secondary-text">-</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                successRate > 0.8 ? 'bg-green-500' :
                                successRate > 0.5 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${successRate * 100}%` }}
                            />
                          </div>
                          <span className="text-sm campaign-secondary-text">
                            {(successRate * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-xs campaign-secondary-text mt-1">
                          {schedule.stats?.total_job_count || 0} total jobs
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              loadScheduleDetails(schedule.oxylabs_schedule_id);
                            }}
                            className="p-1 campaign-secondary-text hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleScheduleState(schedule.oxylabs_schedule_id, schedule.active)}
                            className={`p-1 transition-colors ${
                              schedule.active 
                                ? 'campaign-secondary-text hover:text-red-600' 
                                : 'campaign-secondary-text hover:text-green-600'
                            }`}
                            title={schedule.active ? 'Deactivate' : 'Activate'}
                          >
                            {schedule.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          
                          <button
                            className="p-1 campaign-secondary-text hover:campaign-primary-text transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Details Modal */}
      {selectedSchedule && scheduleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="campaign-card-bg rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 campaign-border border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold campaign-primary-text">Schedule Details</h2>
                <button
                  onClick={() => {
                    setSelectedSchedule(null);
                    setScheduleDetails(null);
                  }}
                  className="p-1 hover:campaign-secondary-bg rounded"
                >
                  <X className="w-5 h-5 campaign-primary-text" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold mb-3 campaign-primary-text">Basic Information</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm campaign-secondary-text">Schedule ID</dt>
                      <dd className="text-sm font-medium campaign-primary-text">{scheduleDetails.schedule.schedule_id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm campaign-secondary-text">Status</dt>
                      <dd className="text-sm font-medium campaign-primary-text">
                        {scheduleDetails.schedule.active ? 'Active' : 'Inactive'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm campaign-secondary-text">Items Count</dt>
                      <dd className="text-sm font-medium campaign-primary-text">{scheduleDetails.schedule.items_count}</dd>
                    </div>
                    <div>
                      <dt className="text-sm campaign-secondary-text">Next Run</dt>
                      <dd className="text-sm font-medium campaign-primary-text">
                        {formatDate(scheduleDetails.schedule.next_run_at)}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                {/* Recent Runs */}
                {scheduleDetails.recent_runs && scheduleDetails.recent_runs.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 campaign-primary-text">Recent Runs</h3>
                    <div className="space-y-2">
                      {scheduleDetails.recent_runs.map((run: ScheduleRun) => (
                        <div key={run.run_id} className="campaign-border border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium campaign-primary-text">Run #{run.run_id}</span>
                              <span className="text-sm campaign-secondary-text ml-2">
                                {formatDate(run.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${
                                run.success_rate >= 0.8 ? 'text-green-600' :
                                run.success_rate >= 0.5 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {(run.success_rate * 100).toFixed(0)}% success
                              </span>
                              <span className="text-sm campaign-secondary-text">
                                ({run.jobs.length} jobs)
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Performance Stats */}
                {scheduleDetails.schedule.stats && (
                  <div>
                    <h3 className="font-semibold mb-3 campaign-primary-text">Performance Statistics</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm campaign-secondary-text">Total Jobs</span>
                          <span className="text-sm font-medium campaign-primary-text">
                            {scheduleDetails.schedule.stats.total_job_count}
                          </span>
                        </div>
                      </div>
                      
                      {scheduleDetails.schedule.stats.job_result_outcomes?.map((outcome: any) => (
                        <div key={outcome.status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm campaign-secondary-text capitalize">{outcome.status}</span>
                            <span className="text-sm font-medium campaign-primary-text">
                              {outcome.job_count} ({(outcome.ratio * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                outcome.status === 'done' ? 'bg-green-500' :
                                outcome.status === 'pending' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${outcome.ratio * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
