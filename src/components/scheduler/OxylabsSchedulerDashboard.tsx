
import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Play, Pause, Trash2, CheckSquare, Square, 
  Search, Clock, CheckCircle,
  XCircle, Loader2, AlertTriangle, Activity, Filter,
  Calendar, Sun, Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface Schedule {
  id: string;
  oxylabs_schedule_id: string;
  active: boolean;
  job_name?: string;
  schedule_name?: string;
  items_count: number;
  cron_expression: string;
  next_run_at?: string;
  success_rate?: number;
  management_status: 'managed' | 'unmanaged' | 'deleted';
  created_at: string;
  last_synced_at?: string;
}

interface Operation {
  id: string;
  oxylabs_schedule_id: string;
  operation_type: 'delete' | 'activate' | 'deactivate' | 'create';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_by: string;
  requested_at: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
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
const getThemeClasses = (theme: string | undefined) => ({
  // Backgrounds
  background: theme === 'light' ? 'bg-white' : 'bg-[#0E1117]',
  secondaryBackground: theme === 'light' ? 'bg-[#FBFCFD]' : 'bg-[#161B22]',
  tertiaryBackground: theme === 'light' ? 'bg-[#F8F9FA]' : 'bg-[#21262D]',
  hoverBackground: theme === 'light' ? 'bg-[#F1F3F5]' : 'bg-[#30363D]',
  
  // Borders
  border: theme === 'light' ? 'border-[#E1E8ED]' : 'border-[#30363D]',
  secondaryBorder: theme === 'light' ? 'border-[#EAEEF2]' : 'border-[#21262D]',
  focusBorder: theme === 'light' ? 'border-[#3182CE]' : 'border-[#388BFD]',
  
  // Text
  text: theme === 'light' ? 'text-[#1A202C]' : 'text-[#F0F6FC]',
  textSecondary: theme === 'light' ? 'text-[#4A5568]' : 'text-[#7D8590]',
  textTertiary: theme === 'light' ? 'text-[#718096]' : 'text-[#656D76]',
  
  // Buttons
  primaryButton: theme === 'light' ? 'bg-[#3182CE] hover:bg-[#2C5282]' : 'bg-[#388BFD] hover:bg-[#1F6FEB]',
  secondaryButton: theme === 'light' ? 'bg-white hover:bg-[#F1F3F5]' : 'bg-[#21262D] hover:bg-[#30363D]',
  
  // Status colors
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
  
  // Notifications
  notificationSuccess: theme === 'light' ? 'bg-[#F0FFF4] border-[#38A169] text-[#22543D]' : 'bg-[#0D1B0D] border-[#2EA043] text-[#3FB950]',
  notificationError: theme === 'light' ? 'bg-[#FED7D7] border-[#E53E3E] text-[#742A2A]' : 'bg-[#1C0F0F] border-[#F85149] text-[#F85149]',
  notificationWarning: theme === 'light' ? 'bg-[#FFFAF0] border-[#DD6B20] text-[#744210]' : 'bg-[#1C1611] border-[#D29922] text-[#D29922]',
  notificationInfo: theme === 'light' ? 'bg-[#EBF8FF] border-[#3182CE] text-[#2A4365]' : 'bg-[#161B22] border-[#388BFD] text-[#388BFD]',
});

const OxylabsSchedulerDashboard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const classes = getThemeClasses(theme);

  // State management
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, processing: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'queue' | 'history'>('schedules');
  
  // Filtering and loading state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'unmanaged'>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLimited, setIsLimited] = useState(false);
  const [loadLimit, setLoadLimit] = useState(2000);

  // Auto-refresh
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

  // Helper functions for better time formatting
  const formatCronExpression = (cron: string) => {
    if (!cron) return 'N/A';
    
    // Common cron patterns to human readable
    const patterns: { [key: string]: string } = {
      '0 0 * * *': 'Daily at midnight',
      '0 9 * * *': 'Daily at 9:00 AM',
      '0 18 * * *': 'Daily at 6:00 PM',
      '0 0 * * 0': 'Weekly on Sunday',
      '0 0 1 * *': 'Monthly on 1st',
      '*/5 * * * *': 'Every 5 minutes',
      '*/15 * * * *': 'Every 15 minutes',
      '0 */6 * * *': 'Every 6 hours',
      '0 0 */7 * *': 'Every 7 days'
    };
    
    return patterns[cron] || cron;
  };

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatNextRun = (dateString: string) => {
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

  // Notification system
  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Load dashboard data with configurable limits
  const loadDashboard = useCallback(async (search = searchTerm, status = statusFilter, limit = loadLimit) => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔥 FRONTEND: Loading dashboard, search: "${search}", status: ${status}, limit: ${limit}`);
      
      const [dashboardData, operationsData] = await Promise.all([
        api.getDashboard(search, status, limit),
        api.getOperations(undefined, '7d')
      ]);

      console.log('🔥 FRONTEND: Dashboard data loaded:', dashboardData);
      console.log('🔥 FRONTEND: Operations data loaded:', operationsData);

      setSchedules(dashboardData.schedules || []);
      setOperations(operationsData.operations || []);
      setQueueStats(operationsData.queue_stats || { pending: 0, processing: 0, completed: 0, failed: 0 });
      setTotalCount(dashboardData.total_count || 0);
      setLoadedCount(dashboardData.loaded_count || dashboardData.schedules?.length || 0);
      setIsLimited(dashboardData.is_limited || false);
      
    } catch (error) {
      console.error('🔥 FRONTEND: Dashboard load error:', error);
      addNotification('error', `Failed to load dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Set empty data on error to prevent UI issues
      setSchedules([]);
      setOperations([]);
      setQueueStats({ pending: 0, processing: 0, completed: 0, failed: 0 });
      setTotalCount(0);
      setLoadedCount(0);
      setIsLimited(false);
    } finally {
      setLoading(false);
    }
  }, [loading, searchTerm, statusFilter, loadLimit]);

  // Handle search and filter changes
  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    loadDashboard(newSearchTerm, statusFilter);
  };

  const handleStatusFilter = (newStatus: typeof statusFilter) => {
    setStatusFilter(newStatus);
    loadDashboard(searchTerm, newStatus);
  };

  // All schedules are displayed (no pagination)
  const filteredSchedules = schedules;

  // Individual operations with enhanced error handling
  const toggleScheduleState = async (scheduleId: string, currentState: boolean) => {
    console.log(`🔥 FRONTEND: Toggle state for ${scheduleId}, current: ${currentState}`);
    
    try {
      const result = await api.queueScheduleStateChange(scheduleId, !currentState);
      
      if (result.success) {
        addNotification('success', `Schedule ${!currentState ? 'activation' : 'deactivation'} queued successfully`);
        console.log(`🔥 FRONTEND: State change queued`);
        setTimeout(() => loadDashboard(), 1000);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`🔥 FRONTEND: State change error:`, error);
      addNotification('error', `Failed to queue state change: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteSchedule = async (scheduleId: string, scheduleName: string) => {
    if (!confirm(`Are you sure you want to delete "${scheduleName}"? This action cannot be undone.`)) {
      return;
    }

    console.log(`🔥 FRONTEND: Delete schedule ${scheduleId}`);
    
    try {
      const result = await api.queueScheduleDelete(scheduleId);
      
      if (result.success) {
        addNotification('success', 'Schedule deletion queued successfully');
        console.log(`🔥 FRONTEND: Delete queued`);
        setTimeout(() => loadDashboard(), 1000);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`🔥 FRONTEND: Delete error:`, error);
      addNotification('error', `Failed to queue deletion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced bulk operations with better error handling
  const bulkActivate = async () => {
    if (selectedSchedules.size === 0) return;
    
    console.log(`🔥 FRONTEND: Bulk activate ${selectedSchedules.size} schedules`);
    setIsProcessingBulk(true);
    
    try {
      const results = await Promise.allSettled(
        Array.from(selectedSchedules).map(scheduleId => 
          api.queueScheduleStateChange(scheduleId, true)
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (succeeded > 0) {
        addNotification('success', `${succeeded} schedule activations queued successfully`);
      }
      if (failed > 0) {
        addNotification('error', `${failed} schedule activations failed`);
      }

      setSelectedSchedules(new Set());
      setTimeout(() => loadDashboard(), 1000);
    } catch (error) {
      console.error('🔥 FRONTEND: Bulk activate error:', error);
      addNotification('error', 'Bulk activation failed');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const bulkDeactivate = async () => {
    if (selectedSchedules.size === 0) return;
    
    console.log(`🔥 FRONTEND: Bulk deactivate ${selectedSchedules.size} schedules`);
    setIsProcessingBulk(true);
    
    try {
      const results = await Promise.allSettled(
        Array.from(selectedSchedules).map(scheduleId => 
          api.queueScheduleStateChange(scheduleId, false)
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (succeeded > 0) {
        addNotification('success', `${succeeded} schedule deactivations queued successfully`);
      }
      if (failed > 0) {
        addNotification('error', `${failed} schedule deactivations failed`);
      }

      setSelectedSchedules(new Set());
      setTimeout(() => loadDashboard(), 1000);
    } catch (error) {
      console.error('🔥 FRONTEND: Bulk deactivate error:', error);
      addNotification('error', 'Bulk deactivation failed');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedSchedules.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedSchedules.size} schedules? This action cannot be undone.`)) {
      return;
    }
    
    console.log(`🔥 FRONTEND: Bulk delete ${selectedSchedules.size} schedules`);
    setIsProcessingBulk(true);
    
    try {
      const results = await Promise.allSettled(
        Array.from(selectedSchedules).map(scheduleId => 
          api.queueScheduleDelete(scheduleId)
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (succeeded > 0) {
        addNotification('success', `${succeeded} schedule deletions queued successfully`);
      }
      if (failed > 0) {
        addNotification('error', `${failed} schedule deletions failed`);
      }

      setSelectedSchedules(new Set());
      setTimeout(() => loadDashboard(), 1000);
    } catch (error) {
      console.error('🔥 FRONTEND: Bulk delete error:', error);
      addNotification('error', 'Bulk deletion failed');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  // Selection management with true "select all"
  const toggleSelectAll = () => {
    if (selectedSchedules.size === filteredSchedules.length && filteredSchedules.length > 0) {
      setSelectedSchedules(new Set()); // Deselect all
    } else {
      setSelectedSchedules(new Set(filteredSchedules.map(s => s.oxylabs_schedule_id))); // Select ALL schedules
    }
  };

  const selectAllVisible = () => {
    setSelectedSchedules(new Set(filteredSchedules.map(s => s.oxylabs_schedule_id)));
  };

  const selectAllMatching = async () => {
    // Select all schedules that match current filters (even those not visible)
    try {
      const allMatchingData = await api.getDashboard(searchTerm, statusFilter);
      const allMatchingIds = allMatchingData.schedules?.map((s: Schedule) => s.oxylabs_schedule_id) || [];
      setSelectedSchedules(new Set(allMatchingIds));
      addNotification('info', `Selected ${allMatchingIds.length} schedules matching current filters`);
    } catch (error) {
      addNotification('error', 'Failed to select all matching schedules');
    }
  };

  const toggleSelectSchedule = (scheduleId: string) => {
    const newSelection = new Set(selectedSchedules);
    if (newSelection.has(scheduleId)) {
      newSelection.delete(scheduleId);
    } else {
      newSelection.add(scheduleId);
    }
    setSelectedSchedules(newSelection);
  };

  // Status helpers
  const getStatusBadge = (schedule: Schedule) => {
    // Check if there's a pending operation for this schedule
    const pendingOp = operations.find(op => 
      op.oxylabs_schedule_id === schedule.oxylabs_schedule_id && 
      ['pending', 'processing'].includes(op.status)
    );

    if (pendingOp) {
      if (pendingOp.status === 'pending') {
        return {
          color: `${classes.warningBg} ${classes.warningText} ${classes.warningBorder}`,
          text: `${pendingOp.operation_type} pending`,
          icon: <Clock className="w-3 h-3" />
        };
      } else {
        return {
          color: `${classes.processingBg} ${classes.processingText} ${classes.processingBorder}`,
          text: `${pendingOp.operation_type} processing`,
          icon: <Loader2 className="w-3 h-3 animate-spin" />
        };
      }
    }

    // Regular status
    if (schedule.active) {
      return {
        color: `${classes.successBg} ${classes.successText} ${classes.successBorder}`,
        text: 'Active',
        icon: <CheckCircle className="w-3 h-3" />
      };
    } else {
      return {
        color: `${classes.inactiveBg} ${classes.inactiveText} ${classes.inactiveBorder}`,
        text: 'Inactive',
        icon: <Pause className="w-3 h-3" />
      };
    }
  };

  const getOperationStatusIcon = (status: string) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'pending': return <Clock className={`${iconClass} ${theme === 'light' ? 'text-[#DD6B20]' : 'text-[#D29922]'}`} />;
      case 'processing': return <Loader2 className={`${iconClass} ${theme === 'light' ? 'text-[#3182CE]' : 'text-[#388BFD]'} animate-spin`} />;
      case 'completed': return <CheckCircle className={`${iconClass} ${theme === 'light' ? 'text-[#38A169]' : 'text-[#3FB950]'}`} />;
      case 'failed': return <XCircle className={`${iconClass} ${theme === 'light' ? 'text-[#E53E3E]' : 'text-[#F85149]'}`} />;
      default: return <AlertTriangle className={`${iconClass} ${classes.textTertiary}`} />;
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    loadDashboard();
    
    if (autoRefresh) {
      const interval = setInterval(() => loadDashboard(), 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadDashboard]);

  return (
    <div className={`min-h-screen ${classes.background} ${classes.text}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${classes.text}`}>Oxylabs Scheduler</h1>
            <p className={`${classes.textSecondary} mt-1`}>Manage your scraping schedules with queue-based operations</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-lg border transition-colors ${classes.secondaryButton} ${classes.border} ${classes.textSecondary} hover:${classes.text}`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                autoRefresh 
                  ? `${classes.successBg} ${classes.successBorder} ${classes.successText}` 
                  : `${classes.secondaryButton} ${classes.border} ${classes.textSecondary} hover:${classes.text}`
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => loadDashboard()}
              disabled={loading}
              className={`px-4 py-2 ${classes.primaryButton} rounded-lg border ${classes.focusBorder} text-white text-sm font-medium transition-colors disabled:opacity-50`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.type === 'success' ? classes.notificationSuccess :
                  notification.type === 'error' ? classes.notificationError :
                  notification.type === 'warning' ? classes.notificationWarning :
                  classes.notificationInfo
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{notification.message}</span>
                  <button
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    className="ml-4 text-current opacity-70 hover:opacity-100"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Queue Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${classes.secondaryBackground} border ${classes.border} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${classes.textSecondary} text-sm font-medium`}>Pending</p>
                <p className={`text-2xl font-bold ${theme === 'light' ? 'text-[#DD6B20]' : 'text-[#D29922]'}`}>{queueStats.pending}</p>
              </div>
              <Clock className={`w-8 h-8 ${theme === 'light' ? 'text-[#DD6B20]' : 'text-[#D29922]'}`} />
            </div>
          </div>
          
          <div className={`${classes.secondaryBackground} border ${classes.border} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${classes.textSecondary} text-sm font-medium`}>Processing</p>
                <p className={`text-2xl font-bold ${theme === 'light' ? 'text-[#3182CE]' : 'text-[#388BFD]'}`}>{queueStats.processing}</p>
              </div>
              <Loader2 className={`w-8 h-8 ${theme === 'light' ? 'text-[#3182CE]' : 'text-[#388BFD]'} animate-spin`} />
            </div>
          </div>
          
          <div className={`${classes.secondaryBackground} border ${classes.border} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${classes.textSecondary} text-sm font-medium`}>Completed</p>
                <p className={`text-2xl font-bold ${theme === 'light' ? 'text-[#38A169]' : 'text-[#3FB950]'}`}>{queueStats.completed}</p>
              </div>
              <CheckCircle className={`w-8 h-8 ${theme === 'light' ? 'text-[#38A169]' : 'text-[#3FB950]'}`} />
            </div>
          </div>
          
          <div className={`${classes.secondaryBackground} border ${classes.border} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${classes.textSecondary} text-sm font-medium`}>Failed</p>
                <p className={`text-2xl font-bold ${theme === 'light' ? 'text-[#E53E3E]' : 'text-[#F85149]'}`}>{queueStats.failed}</p>
              </div>
              <XCircle className={`w-8 h-8 ${theme === 'light' ? 'text-[#E53E3E]' : 'text-[#F85149]'}`} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`${classes.secondaryBackground} border ${classes.border} rounded-lg`}>
          {/* Tab Navigation */}
          <div className={`flex border-b ${classes.border}`}>
            {(['schedules', 'queue', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? `${classes.text} border-b-2 ${classes.focusBorder} ${classes.tertiaryBackground}` 
                    : `${classes.textSecondary} hover:${classes.text} hover:${classes.tertiaryBackground}`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Schedules Tab */}
          {activeTab === 'schedules' && (
            <div className="p-6">
              {/* Controls Row */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${classes.textSecondary}`} />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 ${classes.background} border ${classes.border} rounded-lg ${classes.text} placeholder-${classes.textTertiary} focus:outline-none focus:${classes.focusBorder}`}
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${classes.textSecondary}`} />
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value as any)}
                    className={`pl-10 pr-8 py-2 ${classes.background} border ${classes.border} rounded-lg ${classes.text} focus:outline-none focus:${classes.focusBorder} appearance-none`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="unmanaged">Unmanaged</option>
                  </select>
                </div>

                {/* Summary and Load More */}
                <div className={`px-4 py-2 ${classes.tertiaryBackground} border ${classes.border} rounded-lg flex items-center justify-between`}>
                  <span className={`${classes.text} text-sm font-medium`}>
                    {loadedCount} of {totalCount} schedules loaded
                    {isLimited && (
                      <span className={`${classes.textSecondary} ml-2`}>
                        (limited to {loadLimit})
                      </span>
                    )}
                  </span>
                  
                  {isLimited && (
                    <div className="flex items-center gap-2">
                      <select
                        value={loadLimit}
                        onChange={(e) => {
                          const newLimit = Number(e.target.value);
                          setLoadLimit(newLimit);
                          loadDashboard(searchTerm, statusFilter, newLimit);
                        }}
                        className={`px-3 py-1 ${classes.background} border ${classes.border} rounded text-sm ${classes.text} focus:outline-none focus:${classes.focusBorder}`}
                      >
                        <option value={1000}>Load 1,000</option>
                        <option value={2000}>Load 2,000</option>
                        <option value={5000}>Load 5,000</option>
                        <option value={10000}>Load All (10,000+)</option>
                      </select>
                      
                      <button
                        onClick={() => loadDashboard(searchTerm, statusFilter, 10000)}
                        className={`px-3 py-1 ${classes.primaryButton} text-white rounded text-sm font-medium transition-colors`}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load All'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Bulk Actions */}
              {selectedSchedules.size > 0 && (
                <div className={`mb-6 p-4 ${classes.tertiaryBackground} border ${classes.border} rounded-lg`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`${classes.text} font-medium`}>
                          {selectedSchedules.size} schedule{selectedSchedules.size !== 1 ? 's' : ''} selected
                        </span>
                        <button
                          onClick={() => setSelectedSchedules(new Set())}
                          className={`${classes.textSecondary} hover:${classes.text} text-sm`}
                        >
                          Clear selection
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={bulkActivate}
                          disabled={isProcessingBulk}
                          className={`px-3 py-1.5 ${classes.successBg} hover:${classes.successBg}/80 ${classes.successText} border ${classes.successBorder} rounded text-sm font-medium transition-colors disabled:opacity-50`}
                        >
                          <Play className="w-4 h-4 inline mr-1" />
                          Activate
                        </button>
                        
                        <button
                          onClick={bulkDeactivate}
                          disabled={isProcessingBulk}
                          className={`px-3 py-1.5 ${classes.secondaryButton} ${classes.textSecondary} border ${classes.border} rounded text-sm font-medium transition-colors disabled:opacity-50`}
                        >
                          <Pause className="w-4 h-4 inline mr-1" />
                          Deactivate
                        </button>
                        
                        <button
                          onClick={bulkDelete}
                          disabled={isProcessingBulk}
                          className={`px-3 py-1.5 ${classes.errorBg} hover:${classes.errorBg}/80 ${classes.errorText} border ${classes.errorBorder} rounded text-sm font-medium transition-colors disabled:opacity-50`}
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete All Selected
                        </button>
                      </div>
                    </div>
                    
                    {/* Additional selection options */}
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        onClick={selectAllVisible}
                        className={`${classes.textSecondary} hover:${classes.text} underline`}
                      >
                        Select all visible ({filteredSchedules.length})
                      </button>
                      <span className={classes.textSecondary}>•</span>
                      <button
                        onClick={selectAllMatching}
                        className={`${classes.textSecondary} hover:${classes.text} underline`}
                      >
                        Select all matching filters ({totalCount})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedules Table */}
              <div className={`border ${classes.border} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${classes.secondaryBackground} border-b ${classes.border}`}>
                      <tr>
                        <th className="w-12 px-4 py-3 text-left">
                          <button
                            onClick={toggleSelectAll}
                            className={`${classes.textSecondary} hover:${classes.text}`}
                          >
                            {selectedSchedules.size === filteredSchedules.length && filteredSchedules.length > 0 ? 
                              <CheckSquare className="w-4 h-4" /> : 
                              <Square className="w-4 h-4" />
                            }
                          </button>
                        </th>
                        <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Schedule</th>
                        <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Status</th>
                        <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Items</th>
                        <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Cron</th>
                        <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Next Run</th>
                        <th className={`px-4 py-3 text-left ${classes.text} font-medium text-sm`}>Success Rate</th>
                        <th className={`px-4 py-3 text-center ${classes.text} font-medium text-sm`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${classes.background} divide-y ${classes.secondaryBorder}`}>
                      {filteredSchedules.map(schedule => {
                        const status = getStatusBadge(schedule);
                        const isSelected = selectedSchedules.has(schedule.oxylabs_schedule_id);
                        
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
                                <span className={`${classes.textSecondary} text-sm font-mono`}>
                                  {formatCronExpression(schedule.cron_expression)}
                                </span>
                                {schedule.cron_expression && formatCronExpression(schedule.cron_expression) !== schedule.cron_expression && (
                                  <span className={`${classes.textTertiary} text-xs`}>
                                    {schedule.cron_expression}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className={`${classes.textSecondary} text-sm`}>
                                  {formatNextRun(schedule.next_run_at)}
                                </span>
                                {schedule.next_run_at && (
                                  <span className={`${classes.textTertiary} text-xs`}>
                                    {new Date(schedule.next_run_at).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`${classes.text} text-sm`}>
                                {schedule.success_rate ? 
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

                {filteredSchedules.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <Calendar className={`w-12 h-12 ${classes.textSecondary} mx-auto mb-4`} />
                    <h3 className={`${classes.text} font-medium mb-2`}>No schedules found</h3>
                    <p className={`${classes.textSecondary} text-sm`}>
                      {searchTerm || statusFilter !== 'all' ? 
                        'Try adjusting your search criteria.' : 
                        'Create your first schedule to get started.'
                      }
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="p-12 text-center">
                    <Loader2 className={`w-8 h-8 ${classes.textSecondary} mx-auto mb-2 animate-spin`} />
                    <p className={`${classes.textSecondary} text-sm`}>Loading schedules...</p>
                  </div>
                )}
              </div>

              {/* Summary Information */}
              <div className="mt-6 text-center">
                <div className={`${classes.textSecondary} text-sm`}>
                  Showing {loadedCount} of {totalCount} schedules
                  {searchTerm || statusFilter !== 'all' ? ' matching current filters' : ''}
                  {isLimited && (
                    <span className={`${classes.errorText} ml-2`}>
                      • Limited view - use "Load All" to see all {totalCount} records
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="p-6">
              <h3 className={`${classes.text} font-medium mb-4`}>Pending & Processing Operations</h3>
              
              <div className="space-y-4">
                {operations
                  .filter(op => ['pending', 'processing'].includes(op.status))
                  .map(operation => (
                  <div key={operation.id} className={`p-4 flex items-center justify-between ${classes.tertiaryBackground} border ${classes.border} rounded-lg`}>
                    <div className="flex items-center gap-4">
                      {getOperationStatusIcon(operation.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`${classes.text} font-medium capitalize`}>{operation.operation_type}</span>
                          <span className={classes.textSecondary}>•</span>
                          <span className={`${classes.textSecondary} text-sm`}>{operation.oxylabs_schedule_id}</span>
                        </div>
                        <div className={`${classes.textSecondary} text-sm`}>
                          {operation.job_name && (
                            <span>{operation.job_name} • </span>
                          )}
                          Requested {formatRelativeTime(operation.requested_at)}
                          {operation.retry_count > 0 && (
                            <span> • Retry {operation.retry_count}/{operation.max_retries}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        operation.status === 'pending' 
                          ? `${classes.warningBg} ${classes.warningText} border ${classes.warningBorder}`
                          : `${classes.processingBg} ${classes.processingText} border ${classes.processingBorder}`
                      }`}>
                        {operation.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {operations.filter(op => ['pending', 'processing'].includes(op.status)).length === 0 && (
                  <div className="p-8 text-center">
                    <CheckCircle className={`w-8 h-8 ${theme === 'light' ? 'text-[#38A169]' : 'text-[#3FB950]'} mx-auto mb-2`} />
                    <p className={`${classes.text} font-medium`}>All caught up!</p>
                    <p className={`${classes.textSecondary} text-sm`}>No pending operations in the queue</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-6">
              <h3 className={`${classes.text} font-medium mb-4`}>Recent Operations</h3>
              
              <div className="space-y-4">
                {operations
                  .filter(op => ['completed', 'failed'].includes(op.status))
                  .map(operation => (
                  <div key={operation.id} className={`p-4 flex items-center justify-between ${classes.tertiaryBackground} border ${classes.border} rounded-lg`}>
                    <div className="flex items-center gap-4">
                      {getOperationStatusIcon(operation.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`${classes.text} font-medium capitalize`}>{operation.operation_type}</span>
                          <span className={classes.textSecondary}>•</span>
                          <span className={`${classes.textSecondary} text-sm`}>{operation.oxylabs_schedule_id}</span>
                        </div>
                        <div className={`${classes.textSecondary} text-sm`}>
                          {operation.job_name && (
                            <span>{operation.job_name} • </span>
                          )}
                          {operation.status === 'completed' ? 'Completed' : 'Failed'} {' '}
                          {formatRelativeTime(operation.completed_at || operation.failed_at || operation.requested_at)}
                          {operation.processing_duration_seconds && (
                            <span> • {operation.processing_duration_seconds.toFixed(1)}s</span>
                          )}
                        </div>
                        {operation.error_message && (
                          <div className={`${theme === 'light' ? 'text-[#E53E3E]' : 'text-[#F85149]'} text-sm mt-1`}>
                            Error: {operation.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        operation.status === 'completed' 
                          ? `${classes.successBg} ${classes.successText} border ${classes.successBorder}`
                          : `${classes.errorBg} ${classes.errorText} border ${classes.errorBorder}`
                      }`}>
                        {operation.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {operations.filter(op => ['completed', 'failed'].includes(op.status)).length === 0 && (
                  <div className="p-8 text-center">
                    <Activity className={`w-8 h-8 ${classes.textSecondary} mx-auto mb-2`} />
                    <p className={`${classes.text} font-medium`}>No operation history</p>
                    <p className={`${classes.textSecondary} text-sm`}>Operations will appear here once they complete</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OxylabsSchedulerDashboard;
