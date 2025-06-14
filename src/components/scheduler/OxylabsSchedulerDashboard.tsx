// Enhanced dark mode dashboard with bulk operations and queue management

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Play, Pause, Trash2, CheckSquare, Square, 
  ChevronLeft, ChevronRight, Search, Filter, AlertTriangle,
  Clock, CheckCircle2, XCircle, Loader2, MoreHorizontal,
  Settings, Eye, History, Activity, Calendar
} from 'lucide-react';

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
  stats: any;
  management_status: 'managed' | 'unmanaged';
  last_synced_at: string;
}

interface ScheduleOperation {
  id: string;
  oxylabs_schedule_id: string;
  operation_type: 'delete' | 'activate' | 'deactivate';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_by: string;
  requested_at: string;
  completed_at?: string;
  retry_count: number;
  last_error?: string;
  status_description: string;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

// API Client
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

  async getDashboard() {
    const response = await fetch(`${this.baseUrl}/dashboard`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  async getOperations(limit = 50, status?: string) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append('status', status);
    
    const response = await fetch(`${this.baseUrl}/operations?${params}`, {
      method: 'GET',
      headers: this.headers
    });
    return response.json();
  }

  // Enhanced API client with better error handling
  async queueScheduleStateChange(scheduleId: string, active: boolean) {
    console.log(`🔥 FRONTEND: Calling state change API for ${scheduleId}, active: ${active}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/schedule/${scheduleId}/state`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ active })
      });

      console.log(`🔥 FRONTEND: Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`🔥 FRONTEND: Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`🔥 FRONTEND: Success response:`, result);
      return result;
    } catch (error) {
      console.error(`🔥 FRONTEND: Exception in queueScheduleStateChange:`, error);
      throw error;
    }
  }

  async queueScheduleDelete(scheduleId: string) {
    console.log(`🔥 FRONTEND: Calling delete API for ${scheduleId}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: this.headers
      });

      console.log(`🔥 FRONTEND: Delete response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`🔥 FRONTEND: Delete error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`🔥 FRONTEND: Delete success response:`, result);
      return result;
    } catch (error) {
      console.error(`🔥 FRONTEND: Exception in queueScheduleDelete:`, error);
      throw error;
    }
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
}

// Main Dashboard Component
export default function OxylabsSchedulerDashboard() {
  // State
  const [schedules, setSchedules] = useState<OxylabsSchedule[]>([]);
  const [operations, setOperations] = useState<ScheduleOperation[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });

  // Selection and pagination
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'unmanaged'>('all');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'queue' | 'history'>('schedules');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>>([]);

  // Initialize API
  const api = new OxylabsSchedulerAPI(
    'https://krmwphqhlzscnuxwxvkz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybXdwaHFobHpzY251eHd4dmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzExMjUsImV4cCI6MjA2NDcwNzEyNX0.k5fDJWwqMdqd9XQgWuDGwcJbwUuL8U-mF7NhiJxY4eU'
  );

  // Notification helper
  const addNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Data loading
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashboardData, operationsData] = await Promise.all([
        api.getDashboard(),
        api.getOperations(100)
      ]);

      if (dashboardData.success) {
        setSchedules(dashboardData.schedules || []);
      }

      if (operationsData.success) {
        setOperations(operationsData.operations || []);
        setQueueStats(operationsData.queue_stats || {
          pending: 0, processing: 0, completed: 0, failed: 0, total: 0
        });
      }
    } catch (error) {
      addNotification('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [api, addNotification]);

  // Auto-refresh
  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadDashboard]);

  // Filtering and pagination
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = !searchTerm || 
      schedule.job_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.oxylabs_schedule_id.includes(searchTerm);
    
    const matchesFilter = statusFilter === 'all' ||
      (statusFilter === 'active' && schedule.active) ||
      (statusFilter === 'inactive' && !schedule.active) ||
      (statusFilter === 'unmanaged' && schedule.management_status === 'unmanaged');
    
    return matchesSearch && matchesFilter;
  });

  // Selection helpers
  const isAllSelected = selectedSchedules.size === filteredSchedules.length && filteredSchedules.length > 0;
  const isIndeterminate = selectedSchedules.size > 0 && selectedSchedules.size < filteredSchedules.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSchedules(new Set());
    } else {
      setSelectedSchedules(new Set(filteredSchedules.map(s => s.oxylabs_schedule_id)));
    }
  };

  const toggleSelectSchedule = (scheduleId: string) => {
    const newSelected = new Set(selectedSchedules);
    if (newSelected.has(scheduleId)) {
      newSelected.delete(scheduleId);
    } else {
      newSelected.add(scheduleId);
    }
    setSelectedSchedules(newSelected);
  };

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  // Enhanced bulk operations with better error handling
  const bulkActivate = async () => {
    if (selectedSchedules.size === 0) return;
    
    console.log(`🔥 FRONTEND: Bulk activate ${selectedSchedules.size} schedules`);
    setIsProcessingBulk(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const scheduleId of selectedSchedules) {
      try {
        console.log(`🔥 FRONTEND: Activating schedule ${scheduleId}`);
        const result = await api.queueScheduleStateChange(scheduleId, true);
        
        if (result.success) {
          successCount++;
          console.log(`🔥 FRONTEND: Successfully queued activation for ${scheduleId}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error(`🔥 FRONTEND: Failed to activate ${scheduleId}:`, error);
        errorCount++;
        errors.push(`${scheduleId}: ${error.message}`);
      }
    }

    setIsProcessingBulk(false);
    setSelectedSchedules(new Set());
    
    if (successCount > 0) {
      addNotification('success', `Queued ${successCount} schedules for activation`);
    }
    if (errorCount > 0) {
      addNotification('error', `Failed to queue ${errorCount} schedules. Check console for details.`);
      console.error(`🔥 FRONTEND: Bulk activation errors:`, errors);
    }
    
    setTimeout(loadDashboard, 1000);
  };

  const bulkDeactivate = async () => {
    if (selectedSchedules.size === 0) return;
    
    console.log(`🔥 FRONTEND: Bulk deactivate ${selectedSchedules.size} schedules`);
    setIsProcessingBulk(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const scheduleId of selectedSchedules) {
      try {
        console.log(`🔥 FRONTEND: Deactivating schedule ${scheduleId}`);
        const result = await api.queueScheduleStateChange(scheduleId, false);
        
        if (result.success) {
          successCount++;
          console.log(`🔥 FRONTEND: Successfully queued deactivation for ${scheduleId}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error(`🔥 FRONTEND: Failed to deactivate ${scheduleId}:`, error);
        errorCount++;
        errors.push(`${scheduleId}: ${error.message}`);
      }
    }

    setIsProcessingBulk(false);
    setSelectedSchedules(new Set());
    
    if (successCount > 0) {
      addNotification('success', `Queued ${successCount} schedules for deactivation`);
    }
    if (errorCount > 0) {
      addNotification('error', `Failed to queue ${errorCount} schedules. Check console for details.`);
      console.error(`🔥 FRONTEND: Bulk deactivation errors:`, errors);
    }
    
    setTimeout(loadDashboard, 1000);
  };

  const bulkDelete = async () => {
    if (selectedSchedules.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedSchedules.size} schedules? This action cannot be undone.`)) {
      return;
    }
    
    console.log(`🔥 FRONTEND: Bulk delete ${selectedSchedules.size} schedules`);
    setIsProcessingBulk(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const scheduleId of selectedSchedules) {
      try {
        console.log(`🔥 FRONTEND: Deleting schedule ${scheduleId}`);
        const result = await api.queueScheduleDelete(scheduleId);
        
        if (result.success) {
          successCount++;
          console.log(`🔥 FRONTEND: Successfully queued deletion for ${scheduleId}`);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error(`🔥 FRONTEND: Failed to delete ${scheduleId}:`, error);
        errorCount++;
        errors.push(`${scheduleId}: ${error.message}`);
      }
    }

    setIsProcessingBulk(false);
    setSelectedSchedules(new Set());
    
    if (successCount > 0) {
      addNotification('success', `Queued ${successCount} schedules for deletion`);
    }
    if (errorCount > 0) {
      addNotification('error', `Failed to queue ${errorCount} schedules. Check console for details.`);
      console.error(`🔥 FRONTEND: Bulk deletion errors:`, errors);
    }
    
    setTimeout(loadDashboard, 1000);
  };

  // Individual operations with enhanced error handling
  const toggleScheduleState = async (scheduleId: string, currentState: boolean) => {
    console.log(`🔥 FRONTEND: Toggle state for ${scheduleId}, current: ${currentState}`);
    
    try {
      const result = await api.queueScheduleStateChange(scheduleId, !currentState);
      
      if (result.success) {
        addNotification('success', `Schedule ${currentState ? 'deactivation' : 'activation'} queued successfully`);
        console.log(`🔥 FRONTEND: Operation queued successfully`);
        setTimeout(loadDashboard, 1000);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error(`🔥 FRONTEND: Toggle state error:`, error);
      addNotification('error', `Failed to queue operation: ${error.message}`);
    }
  };

  const deleteSchedule = async (scheduleId: string, scheduleName: string) => {
    console.log(`🔥 FRONTEND: Delete schedule ${scheduleId} (${scheduleName})`);
    
    if (!confirm(`Delete "${scheduleName}"? This action cannot be undone.`)) return;
    
    try {
      const result = await api.queueScheduleDelete(scheduleId);
      
      if (result.success) {
        addNotification('success', 'Schedule deletion queued successfully');
        console.log(`🔥 FRONTEND: Delete operation queued successfully`);
        setTimeout(loadDashboard, 1000);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error(`🔥 FRONTEND: Delete error:`, error);
      addNotification('error', `Failed to queue deletion: ${error.message}`);
    }
  };

  // Sync operations
  const syncSchedules = async () => {
    setIsSyncing(true);
    try {
      const result = await api.syncSchedules();
      addNotification('success', `Synced ${result.synced || 0} schedules`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', 'Failed to sync schedules');
    } finally {
      setIsSyncing(false);
    }
  };

  const mapUnmanaged = async () => {
    try {
      const result = await api.mapUnmanaged();
      const mapped = result.mappings?.filter((m: any) => m.success).length || 0;
      addNotification('success', `Mapped ${mapped} unmanaged schedules`);
      await loadDashboard();
    } catch (error) {
      addNotification('error', 'Failed to map unmanaged schedules');
    }
  };

  // Utility functions
  const getStatusBadge = (schedule: OxylabsSchedule) => {
    if (!schedule.active) {
      return { color: 'bg-[#161B22] text-[#7D8590] border-[#30363D]', text: 'Inactive' };
    }
    if (schedule.management_status === 'unmanaged') {
      return { color: 'bg-[#1C1611] text-[#D29922] border-[#D29922]', text: 'Unmanaged' };
    }
    const successRate = schedule.stats?.job_result_outcomes?.find((o: any) => o.status === 'done')?.ratio || 0;
    if (successRate < 0.5) {
      return { color: 'bg-[#1C0F0F] text-[#F85149] border-[#F85149]', text: 'Poor Performance' };
    }
    return { color: 'bg-[#1A4E2F] text-[#3FB950] border-[#2EA043]', text: 'Healthy' };
  };

  const getOperationStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-[#D29922]" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-[#388BFD] animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />;
      case 'failed': return <XCircle className="w-4 h-4 text-[#F85149]" />;
      default: return <Clock className="w-4 h-4 text-[#7D8590]" />;
    }
  };

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#1F2937] text-[#D29922] border-[#D29922]';
      case 'processing': return 'bg-[#1E293B] text-[#388BFD] border-[#388BFD]';
      case 'completed': return 'bg-[#1A4E2F] text-[#3FB950] border-[#2EA043]';
      case 'failed': return 'bg-[#1C0F0F] text-[#F85149] border-[#F85149]';
      default: return 'bg-[#161B22] text-[#7D8590] border-[#30363D]';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0F6FC]">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg transition-all border ${
              notification.type === 'success' ? 'bg-[#0D1B0D] border-[#2EA043] text-[#3FB950]' :
              notification.type === 'error' ? 'bg-[#1C0F0F] border-[#F85149] text-[#F85149]' :
              notification.type === 'warning' ? 'bg-[#1C1611] border-[#D29922] text-[#D29922]' :
              'bg-[#1E293B] border-[#388BFD] text-[#388BFD]'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-[#161B22] border-b border-[#30363D]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F6FC]">Oxylabs Scheduler</h1>
              <p className="text-sm text-[#7D8590] mt-1">Manage scheduled scraping operations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={mapUnmanaged}
                className="px-4 py-2 bg-[#388BFD] hover:bg-[#1F6FEB] text-white rounded-lg transition-colors flex items-center gap-2 border border-[#388BFD]"
                disabled={queueStats.total === 0}
              >
                <Settings className="w-4 h-4" />
                Map Unmanaged
              </button>
              <button
                onClick={syncSchedules}
                disabled={isSyncing}
                className="px-4 py-2 bg-[#21262D] border border-[#30363D] text-[#F0F6FC] rounded-lg hover:bg-[#30363D] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#161B22] rounded-lg p-4 border border-[#30363D]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7D8590]">Total Schedules</p>
                <p className="text-2xl font-bold text-[#F0F6FC] mt-1">{schedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#656D76]" />
            </div>
          </div>
          
          <div className="bg-[#161B22] rounded-lg p-4 border border-[#30363D]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7D8590]">Queue Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-[#D29922]">{queueStats.pending}</span>
                  <span className="text-sm text-[#7D8590]">pending</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-[#D29922]" />
            </div>
          </div>
          
          <div className="bg-[#161B22] rounded-lg p-4 border border-[#30363D]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7D8590]">Processing</p>
                <p className="text-2xl font-bold text-[#388BFD] mt-1">{queueStats.processing}</p>
              </div>
              <Loader2 className="w-8 h-8 text-[#388BFD]" />
            </div>
          </div>
          
          <div className="bg-[#161B22] rounded-lg p-4 border border-[#30363D]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7D8590]">Completed</p>
                <p className="text-2xl font-bold text-[#3FB950] mt-1">{queueStats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-[#3FB950]" />
            </div>
          </div>
          
          <div className="bg-[#161B22] rounded-lg p-4 border border-[#30363D]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#7D8590]">Failed</p>
                <p className="text-2xl font-bold text-[#F85149] mt-1">{queueStats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-[#F85149]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="border-b border-[#30363D]">
          <nav className="flex space-x-8">
            {[
              { id: 'schedules', label: 'Schedules', count: schedules.length },
              { id: 'queue', label: 'Queue', count: queueStats.pending + queueStats.processing },
              { id: 'history', label: 'History', count: queueStats.completed + queueStats.failed }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#388BFD] text-[#388BFD]'
                    : 'border-transparent text-[#7D8590] hover:text-[#F0F6FC]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-[#21262D] text-[#7D8590] py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {activeTab === 'schedules' && (
          <>
            {/* Controls */}
            <div className="bg-[#161B22] rounded-lg p-4 border border-[#30363D] mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7D8590]" />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#0E1117] border border-[#30363D] rounded-lg text-[#F0F6FC] placeholder-[#656D76] focus:outline-none focus:border-[#388BFD]"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-[#0E1117] border border-[#30363D] rounded-lg text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                >
                  <option value="all">All Schedules</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                  <option value="unmanaged">Unmanaged Only</option>
                </select>

                {/* Items per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-4 py-2 bg-[#0E1117] border border-[#30363D] rounded-lg text-[#F0F6FC] focus:outline-none focus:border-[#388BFD]"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedSchedules.size > 0 && (
                <div className="mt-4 pt-4 border-t border-[#30363D]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#7D8590]">
                      {selectedSchedules.size} schedule{selectedSchedules.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={bulkActivate}
                        disabled={isProcessingBulk}
                        className="px-3 py-1 bg-[#1A4E2F] text-[#3FB950] rounded border border-[#2EA043] hover:bg-[#2EA043] hover:text-white transition-colors text-sm disabled:opacity-50"
                      >
                        <Play className="w-3 h-3 inline mr-1" />
                        Activate
                      </button>
                      <button
                        onClick={bulkDeactivate}
                        disabled={isProcessingBulk}
                        className="px-3 py-1 bg-[#1F2937] text-[#D29922] rounded border border-[#D29922] hover:bg-[#D29922] hover:text-white transition-colors text-sm disabled:opacity-50"
                      >
                        <Pause className="w-3 h-3 inline mr-1" />
                        Deactivate
                      </button>
                      <button
                        onClick={bulkDelete}
                        disabled={isProcessingBulk}
                        className="px-3 py-1 bg-[#1C0F0F] text-[#F85149] rounded border border-[#F85149] hover:bg-[#F85149] hover:text-white transition-colors text-sm disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedSchedules(new Set())}
                        className="px-3 py-1 bg-[#21262D] text-[#7D8590] rounded border border-[#30363D] hover:bg-[#30363D] transition-colors text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedules Table */}
            <div className="bg-[#161B22] rounded-lg border border-[#30363D] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#21262D] border-b border-[#30363D]">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center text-[#7D8590] hover:text-[#F0F6FC]"
                        >
                          {isAllSelected ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : isIndeterminate ? (
                            <Square className="w-4 h-4 fill-current" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#7D8590] uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#7D8590] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#7D8590] uppercase tracking-wider">
                        Next Run
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#7D8590] uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#7D8590] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262D]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#7D8590]">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading schedules...
                        </td>
                      </tr>
                    ) : paginatedSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#7D8590]">
                          No schedules found
                        </td>
                      </tr>
                    ) : (
                      paginatedSchedules.map((schedule) => {
                        const status = getStatusBadge(schedule);
                        const isSelected = selectedSchedules.has(schedule.oxylabs_schedule_id);
                        const successRate = schedule.stats?.job_result_outcomes?.find((o: any) => o.status === 'done')?.ratio || 0;
                        
                        return (
                          <tr 
                            key={schedule.oxylabs_schedule_id} 
                            className={`hover:bg-[#21262D] transition-colors ${isSelected ? 'bg-[#21262D]' : ''}`}
                          >
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleSelectSchedule(schedule.oxylabs_schedule_id)}
                                className="text-[#7D8590] hover:text-[#F0F6FC]"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-[#388BFD]" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-[#F0F6FC]">
                                  {schedule.job_name || 'Unnamed Schedule'}
                                </div>
                                <div className="text-sm text-[#7D8590]">
                                  ID: {schedule.oxylabs_schedule_id}
                                </div>
                                <div className="text-xs text-[#656D76]">
                                  {schedule.cron_expression}
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                {status.text}
                              </span>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div className="text-sm text-[#F0F6FC]">
                                {schedule.next_run_at ? (
                                  <>
                                    <div>{formatRelativeTime(schedule.next_run_at)}</div>
                                    <div className="text-xs text-[#656D76]">
                                      {new Date(schedule.next_run_at).toLocaleDateString()}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-[#656D76]">Not scheduled</span>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-[#21262D] rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      successRate > 0.8 ? 'bg-[#3FB950]' :
                                      successRate > 0.5 ? 'bg-[#D29922]' :
                                      'bg-[#F85149]'
                                    }`}
                                    style={{ width: `${successRate * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-[#7D8590] w-8">
                                  {(successRate * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-xs text-[#656D76] mt-1">
                                {schedule.items_count || 0} items
                              </div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleScheduleState(schedule.oxylabs_schedule_id, schedule.active)}
                                  className={`p-1 rounded transition-colors ${
                                    schedule.active 
                                      ? 'text-[#7D8590] hover:text-[#D29922]' 
                                      : 'text-[#7D8590] hover:text-[#3FB950]'
                                  }`}
                                  title={schedule.active ? 'Deactivate' : 'Activate'}
                                >
                                  {schedule.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                
                                <button
                                  onClick={() => deleteSchedule(schedule.oxylabs_schedule_id, schedule.job_name || 'Unnamed')}
                                  className="p-1 text-[#7D8590] hover:text-[#F85149] transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <button className="p-1 text-[#7D8590] hover:text-[#F0F6FC] transition-colors">
                                  <MoreHorizontal className="w-4 h-4" />
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-[#21262D] px-4 py-3 border-t border-[#30363D]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#7D8590]">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSchedules.length)} of {filteredSchedules.length} schedules
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-[#7D8590] hover:text-[#F0F6FC] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="text-sm text-[#7D8590]">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-[#7D8590] hover:text-[#F0F6FC] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'queue' && (
          <div className="bg-[#161B22] rounded-lg border border-[#30363D]">
            <div className="p-4 border-b border-[#30363D]">
              <h3 className="text-lg font-medium text-[#F0F6FC]">Operation Queue</h3>
              <p className="text-sm text-[#7D8590]">Current and pending operations</p>
            </div>
            
            <div className="divide-y divide-[#21262D]">
              {operations
                .filter(op => ['pending', 'processing'].includes(op.status))
                .slice(0, 20)
                .map(operation => (
                <div key={operation.id} className="p-4 flex items-center justify-between hover:bg-[#21262D]">
                  <div className="flex items-center gap-3">
                    {getOperationStatusIcon(operation.status)}
                    <div>
                      <div className="text-sm font-medium text-[#F0F6FC]">
                        {operation.operation_type.charAt(0).toUpperCase() + operation.operation_type.slice(1)} Schedule
                      </div>
                      <div className="text-xs text-[#7D8590]">
                        ID: {operation.oxylabs_schedule_id}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded mt-1 border ${getOperationStatusColor(operation.status)}`}>
                        {operation.status_description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-[#F0F6FC]">
                      {operation.status === 'processing' ? 'Processing...' : 'Waiting in queue'}
                    </div>
                    <div className="text-xs text-[#656D76]">
                      {formatRelativeTime(operation.requested_at)}
                    </div>
                    {operation.retry_count > 0 && (
                      <div className="text-xs text-[#D29922]">
                        Retry #{operation.retry_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {operations.filter(op => ['pending', 'processing'].includes(op.status)).length === 0 && (
                <div className="p-8 text-center text-[#7D8590]">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No pending operations</p>
                  <p className="text-xs text-[#656D76] mt-1">Operations will appear here when queued</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-[#161B22] rounded-lg border border-[#30363D]">
            <div className="p-4 border-b border-[#30363D]">
              <h3 className="text-lg font-medium text-[#F0F6FC]">Operation History</h3>
              <p className="text-sm text-[#7D8590]">Recent completed and failed operations</p>
            </div>
            
            <div className="divide-y divide-[#21262D]">
              {operations
                .filter(op => ['completed', 'failed'].includes(op.status))
                .slice(0, 20)
                .map(operation => (
                <div key={operation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getOperationStatusIcon(operation.status)}
                    <div>
                      <div className="text-sm font-medium text-[#F0F6FC]">
                        {operation.operation_type.charAt(0).toUpperCase() + operation.operation_type.slice(1)} Schedule
                      </div>
                      <div className="text-xs text-[#7D8590]">
                        ID: {operation.oxylabs_schedule_id}
                      </div>
                      {operation.last_error && (
                        <div className="text-xs text-[#F85149] mt-1">
                          Error: {operation.last_error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-[#F0F6FC]">{operation.status_description}</div>
                    <div className="text-xs text-[#656D76]">
                      {operation.completed_at ? formatRelativeTime(operation.completed_at) : formatRelativeTime(operation.requested_at)}
                    </div>
                  </div>
                </div>
              ))}
              
              {operations.filter(op => ['completed', 'failed'].includes(op.status)).length === 0 && (
                <div className="p-8 text-center text-[#7D8590]">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No operation history</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
