import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useTheme } from 'next-themes';
import {
  RefreshCw, Play, Pause, Trash2, CheckSquare, Square, 
  Search, ChevronLeft, ChevronRight, Clock, CheckCircle,
  XCircle, Loader2, AlertTriangle, Activity, Filter,
  Users, Calendar, BarChart3, Settings, Sun, Moon, Minus
} from 'lucide-react';
import { parseCronExpression, formatDateWithTimezone, getCronBreakdown } from './utils/scheduleUtils';

interface Schedule {
  id: string;
  oxylabs_schedule_id: string;
  active: boolean;
  job_name?: string;
  schedule_name?: string;
  items_count: number;
  cron_expression: string;
  next_run_at?: string;
  end_time?: string;
  created_at?: string;
  success_rate?: number;
  management_status: 'managed' | 'unmanaged' | 'deleted';
  last_synced_at?: string;
}

interface Operation {
  id: string;
  schedule_id: string;
  operation_type: 'delete' | 'activate' | 'deactivate' | 'create';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_by: string;
  requested_at: string;
  started_at?: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  job_name?: string;
  processing_duration_seconds?: number;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

// Theme utility function
const getThemeClasses = (theme: string) => ({
  background: theme === 'light' ? 'bg-white' : 'bg-[#0E1117]',
  secondaryBackground: theme === 'light' ? 'bg-[#FBFCFD]' : 'bg-[#161B22]',
  tertiaryBackground: theme === 'light' ? 'bg-[#F8F9FA]' : 'bg-[#21262D]',
  hoverBackground: theme === 'light' ? 'bg-[#F1F3F5]' : 'bg-[#30363D]',
  
  border: theme === 'light' ? 'border-[#E1E8ED]' : 'border-[#30363D]',
  secondaryBorder: theme === 'light' ? 'border-[#EAEEF2]' : 'border-[#21262D]',
  focusBorder: theme === 'light' ? 'border-[#3182CE]' : 'border-[#388BFD]',
  
  text: theme === 'light' ? 'text-[#1A202C]' : 'text-[#F0F6FC]',
  textSecondary: theme === 'light' ? 'text-[#4A5568]' : 'text-[#7D8590]',
  textTertiary: theme === 'light' ? 'text-[#718096]' : 'text-[#656D76]',
  
  primaryButton: theme === 'light' ? 'bg-[#3182CE] hover:bg-[#2C5282]' : 'bg-[#388BFD] hover:bg-[#1F6FEB]',
  secondaryButton: theme === 'light' ? 'bg-white hover:bg-[#F1F3F5]' : 'bg-[#21262D] hover:bg-[#30363D]',
  
  successBg: theme === 'light' ? 'bg-[#C6F6D5]' : 'bg-[#1A4E2F]',
  successText: theme === 'light' ? 'text-[#22543D]' : 'text-[#3FB950]',
  successBorder: theme === 'light' ? 'border-[#38A169]' : 'border-[#2EA043]',
  
  warningBg: theme === 'light' ? 'bg-[#FFF5CC]' : 'bg-[#1C1611]',
  warningText: theme === 'light' ? 'text-[#744210]' : 'text-[#D29922]',
  warningBorder: theme === 'light' ? 'border-[#DD6B20]' : 'border-[#D29922]',
  
  errorBg: theme === 'light' ? 'bg-[#FED7D7]' : 'bg-[#1C0F0F]',
  errorText: theme === 'light' ? 'text-[#742A2A]' : 'text-[#F85149]',
  errorBorder: theme === 'light' ? 'border-[#E53E3E]' : 'border-[#F85149]',
  
  processingBg: theme === 'light' ? 'bg-[#EBF8FF]' : 'bg-[#1E293B]',
  processingText: theme === 'light' ? 'text-[#2A4365]' : 'text-[#388BFD]',
  processingBorder: theme === 'light' ? 'border-[#3182CE]' : 'border-[#388BFD]',
  
  inactiveBg: theme === 'light' ? 'bg-[#F7FAFC]' : 'bg-[#21262D]',
  inactiveText: theme === 'light' ? 'text-[#4A5568]' : 'text-[#7D8590]',
  inactiveBorder: theme === 'light' ? 'border-[#E1E8ED]' : 'border-[#30363D]',
  
  notificationSuccess: theme === 'light' ? 'bg-[#F0FFF4] border-[#38A169] text-[#22543D]' : 'bg-[#0D1B0D] border-[#2EA043] text-[#3FB950]',
  notificationError: theme === 'light' ? 'bg-[#FED7D7] border-[#E53E3E] text-[#742A2A]' : 'bg-[#1C0F0F] border-[#F85149] text-[#F85149]',
  notificationWarning: theme === 'light' ? 'bg-[#FFFAF0] border-[#DD6B20] text-[#744210]' : 'bg-[#1C1611] border-[#D29922] text-[#D29922]',
  notificationInfo: theme === 'light' ? 'bg-[#EBF8FF] border-[#3182CE] text-[#2A4365]' : 'bg-[#161B22] border-[#388BFD] text-[#388BFD]',
});

const OxylabsSchedulerDashboard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const classes = getThemeClasses(theme || 'dark');

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'queue' | 'history'>('schedules');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'unmanaged'>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [loadLimit, setLoadLimit] = useState(2000);

  const [autoRefresh, setAutoRefresh] = useState(true);

  // API client with enhanced error handling
  const api = {
    async call(endpoint: string, options: RequestInit = {}) {
      console.log(`🔥 FRONTEND: Calling ${endpoint}`);
      
      const response = await fetch(
        `https://krmwphqhlzscnuxwxvkz.supabase.co/functions/v1/scrapi-oxylabs-scheduler${endpoint}`,
        {
          ...options,
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        }
      );

      console.log(`🔥 FRONTEND: Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`🔥 FRONTEND: Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`🔥 FRONTEND: Response data:`, data);
      return data;
    },

    async getDashboard(search = '', status = 'all', limit = 2000) {
      const params = new URLSearchParams({
        search,
        status,
        limit: limit.toString(),
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      return this.call(`/dashboard?${params}`);
    },

    async getOperations(status?: string, timeframe = '7d') {
      const params = new URLSearchParams({ timeframe });
      if (status && status !== 'all') params.append('status', status);
      return this.call(`/operations?${params}`);
    },

    async queueScheduleDelete(scheduleId: string) {
      console.log(`🔥 FRONTEND: Queueing delete for ${scheduleId}`);
      return this.call(`/schedule/${scheduleId}`, { method: 'DELETE' });
    },

    async queueScheduleStateChange(scheduleId: string, active: boolean) {
      console.log(`🔥 FRONTEND: Queueing state change for ${scheduleId}, active: ${active}`);
      return this.call(`/schedule/${scheduleId}/state`, {
        method: 'PUT',
        body: JSON.stringify({ active }),
      });
    },

    async syncSchedules() {
      return this.call('/sync');
    },

    async healthCheck() {
      return this.call('/health');
    }
  };

  // Notification system
  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // Load dashboard data and operations
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Load schedules
      const dashboardData = await api.getDashboard(searchTerm, statusFilter, loadLimit);
      setSchedules(dashboardData.schedules || []);
      setTotalCount(dashboardData.total_count || 0);
      setLoadedCount(dashboardData.schedules?.length || 0);
      setIsLimited(dashboardData.schedules?.length >= loadLimit && dashboardData.total_count > loadLimit);

      // Load operations
      const operationsData = await api.getOperations();
      setOperations(operationsData.operations || []);
      setQueueStats(operationsData.queue_stats || { pending: 0, processing: 0, completed: 0, failed: 0 });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      addNotification('error', 'Failed to load schedules and operations');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, loadLimit]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboard]);

  const toggleSelectAll = () => {
    if (selectedSchedules.size === schedules.length) {
      setSelectedSchedules(new Set());
    } else {
      setSelectedSchedules(new Set(schedules.map(s => s.oxylabs_schedule_id)));
    }
  };

  const toggleSelectSchedule = (id: string) => {
    setSelectedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedSchedules.size === 0) return;
    
    setIsProcessingBulk(true);
    try {
      for (const scheduleId of selectedSchedules) {
        const schedule = schedules.find(s => s.oxylabs_schedule_id === scheduleId);
        if (!schedule) continue;

        if (action === 'activate' || action === 'deactivate') {
          await toggleScheduleState(scheduleId, action === 'deactivate');
        } else if (action === 'delete') {
          await deleteSchedule(scheduleId, schedule.job_name || schedule.schedule_name || 'Unnamed Schedule');
        }
      }
      setSelectedSchedules(new Set());
      addNotification('success', `Bulk ${action} completed for ${selectedSchedules.size} schedules`);
      loadDashboard();
    } catch (error) {
      console.error(`Failed to ${action} schedules:`, error);
      addNotification('error', `Failed to ${action} schedules`);
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const toggleScheduleState = async (scheduleId: string, currentState: boolean) => {
    try {
      await api.queueScheduleStateChange(scheduleId, !currentState);
      addNotification('success', `Schedule ${!currentState ? 'activated' : 'deactivated'}`);
      loadDashboard();
    } catch (error) {
      console.error('Failed to toggle schedule state:', error);
      addNotification('error', 'Failed to update schedule state');
    }
  };

  const deleteSchedule = async (scheduleId: string, scheduleName: string) => {
    if (!window.confirm(`Are you sure you want to delete schedule "${scheduleName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.queueScheduleDelete(scheduleId);
      addNotification('success', `Schedule "${scheduleName}" deleted`);
      loadDashboard();
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      addNotification('error', 'Failed to delete schedule');
    }
  };

  // Status badge helper
  const getStatusBadge = (schedule: Schedule) => {
    if (!schedule.active) {
      return { color: 'border-gray-400 text-gray-600', text: 'Inactive', icon: <Pause className="w-3 h-3" /> };
    }
    if (schedule.management_status === 'unmanaged') {
      return { color: 'border-red-500 text-red-600', text: 'Unmanaged', icon: <AlertTriangle className="w-3 h-3" /> };
    }
    if (schedule.management_status === 'deleted') {
      return { color: 'border-gray-500 text-gray-500', text: 'Deleted', icon: <XCircle className="w-3 h-3" /> };
    }
    if (schedule.success_rate !== undefined && schedule.success_rate < 0.5) {
      return { color: 'border-yellow-500 text-yellow-600', text: 'Poor Performance', icon: <Activity className="w-3 h-3" /> };
    }
    return { color: 'border-green-500 text-green-600', text: 'Healthy', icon: <CheckCircle className="w-3 h-3" /> };
  };

  // Format next run time
  const formatNextRun = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) return 'Overdue';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 30) return `${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  const isAllSelected = schedules.length > 0 && selectedSchedules.size === schedules.length;
  const isPartiallySelected = selectedSchedules.size > 0 && selectedSchedules.size < schedules.length;

  return (
    <div className={`p-4 ${classes.background} min-h-screen`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className={`${classes.text} text-xl font-semibold`}>Oxylabs Scheduler Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded ${classes.secondaryBackground} hover:${classes.hoverBackground} transition-colors`}
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={loadDashboard}
            className={`p-2 rounded ${classes.secondaryBackground} hover:${classes.hoverBackground} transition-colors`}
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`px-3 py-2 rounded border ${classes.border} ${classes.text} ${classes.background} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={`px-3 py-2 rounded border ${classes.border} ${classes.text} ${classes.background} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="unmanaged">Unmanaged</option>
        </select>
        <label className={`${classes.text} flex items-center gap-1 select-none`}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={() => setAutoRefresh(!autoRefresh)}
          />
          Auto Refresh
        </label>
      </div>

      {/* Bulk Actions Bar */}
      {selectedSchedules.size > 0 && (
        <div className={`${classes.secondaryBackground} rounded-lg border ${classes.border} p-4 mb-4`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${classes.text}`}>
              {selectedSchedules.size} of {schedules.length} schedule{selectedSchedules.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={isProcessingBulk}
                className={`px-3 py-1 rounded border ${classes.border} ${classes.text} hover:${classes.hoverBackground} flex items-center gap-1`}
              >
                <Play className="w-3 h-3" />
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                disabled={isProcessingBulk}
                className={`px-3 py-1 rounded border ${classes.border} ${classes.text} hover:${classes.hoverBackground} flex items-center gap-1`}
              >
                <Pause className="w-3 h-3" />
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessingBulk}
                className={`px-3 py-1 rounded border ${classes.errorBorder} ${classes.errorText} hover:${classes.errorBg} flex items-center gap-1`}
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin mx-auto mb-2" />
          <p className={classes.textSecondary}>Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto mb-2 w-10 h-10 text-yellow-500" />
          <p className={classes.textSecondary}>No schedules found.</p>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded border ${classes.border}`}>
          <table className="min-w-full border-collapse">
            <thead className={`${classes.secondaryBackground} border-b ${classes.border}`}>
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <button
                    onClick={toggleSelectAll}
                    className={`${classes.textSecondary} hover:${classes.text} relative`}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : isPartiallySelected ? (
                      <div className="relative">
                        <Square className="w-4 h-4" />
                        <Minus className="w-3 h-3 absolute top-0.5 left-0.5" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Schedule</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Status</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Items</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Schedule Details</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Next Run</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Start Date</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>End Date</th>
                <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Success Rate</th>
                <th className={`px-4 py-3 text-center ${classes.text} font-medium text-sm`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`${classes.background} divide-y ${classes.secondaryBorder}`}>
              {schedules.map(schedule => {
                const status = getStatusBadge(schedule);
                const isSelected = selectedSchedules.has(schedule.oxylabs_schedule_id);
                const cronBreakdown = getCronBreakdown(schedule.cron_expression);
                
                return (
                  <tr
                    key={schedule.oxylabs_schedule_id}
                    className={`hover:${classes.secondaryBackground} transition-colors ${
                      isSelected ? `${classes.secondaryBackground} border-l-2 ${classes.focusBorder}` : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelectSchedule(schedule.oxylabs_schedule_id)}
                        className={`${classes.textSecondary} hover:${classes.text}`}
                      >
                        {isSelected ? 
                          <CheckSquare className="w-4 h-4" /> : 
                          <Square className="w-4 h-4" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`${classes.text} font-medium text-sm`}>
                          {schedule.job_name || schedule.schedule_name || 'Unnamed Schedule'}
                        </span>
                        <span className={`${classes.textSecondary} text-xs`}>
                          ID: {schedule.oxylabs_schedule_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        {status.icon && <span className="w-3 h-3">{status.icon}</span>}
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`${classes.text} text-sm`}>
                        {schedule.items_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`${classes.text} text-sm font-medium`}>
                          {cronBreakdown?.frequency || 'Unknown'}
                        </span>
                        {cronBreakdown?.dayOfWeek && (
                          <span className={`${classes.textSecondary} text-xs`}>
                            {cronBreakdown.dayOfWeek}
                          </span>
                        )}
                        {cronBreakdown?.dayOfMonth && (
                          <span className={`${classes.textSecondary} text-xs`}>
                            {cronBreakdown.dayOfMonth} of month
                          </span>
                        )}
                        {cronBreakdown?.time && (
                          <span className={`${classes.textSecondary} text-xs`}>
                            at {cronBreakdown.time}
                          </span>
                        )}
                        <span className={`${classes.textTertiary} text-xs font-mono mt-1`}>
                          {schedule.cron_expression}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`${classes.textSecondary} text-sm`}>
                          {formatNextRun(schedule.next_run_at)}
                        </span>
                        {schedule.next_run_at && (
                          <span className={`${classes.textTertiary} text-xs`}>
                            {new Date(schedule.next_run_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`${classes.textSecondary} text-sm`}>
                        {schedule.created_at ? 
                          new Date(schedule.created_at).toLocaleDateString() : 
                          'N/A'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`${classes.textSecondary} text-sm`}>
                        {schedule.end_time ? 
                          new Date(schedule.end_time).toLocaleDateString() : 
                          'No end date'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`${classes.text} text-sm`}>
                        {schedule.success_rate !== undefined ? 
                          `${(schedule.success_rate * 100).toFixed(1)}%` : 
                          'N/A'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleScheduleState(schedule.oxylabs_schedule_id, schedule.active)}
                          className={`p-1 ${classes.textSecondary} hover:${classes.text} transition-colors`}
                          title={schedule.active ? 'Deactivate' : 'Activate'}
                        >
                          {schedule.active ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                          }
                        </button>
                        
                        <button
                          onClick={() => deleteSchedule(
                            schedule.oxylabs_schedule_id, 
                            schedule.job_name || schedule.schedule_name || 'Unnamed Schedule'
                          )}
                          className={`p-1 ${classes.textSecondary} hover:${theme === 'light' ? 'text-[#E53E3E]' : 'text-[#F85149]'} transition-colors`}
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={`max-w-xs rounded p-3 shadow-lg border ${
              note.type === 'success' ? classes.notificationSuccess :
              note.type === 'error' ? classes.notificationError :
              note.type === 'warning' ? classes.notificationWarning :
              classes.notificationInfo
            }`}
          >
            {note.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OxylabsSchedulerDashboard;
