
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
      return { color: 'bg-gray-800 text-gray-300 border-gray-700', text: 'Inactive' };
    }
    if (schedule.management_status === 'unmanaged') {
      return { color: 'bg-yellow-900 text-yellow-300 border-yellow-800', text: 'Unmanaged' };
    }
    const successRate = schedule.stats?.job_result_outcomes?.find((o: any) => o.status === 'done')?.ratio || 0;
    if (successRate < 0.5) {
      return { color: 'bg-red-900 text-red-300 border-red-800', text: 'Poor Performance' };
    }
    return { color: 'bg-green-900 text-green-300 border-green-800', text: 'Healthy' };
  };

  const getOperationStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'processing': return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'completed': return 'bg-green-900 text-green-300 border-green-700';
      case 'failed': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg transition-all border ${
              notification.type === 'success' ? 'bg-green-900 border-green-700 text-green-100' :
              notification.type === 'error' ? 'bg-red-900 border-red-700 text-red-100' :
              notification.type === 'warning' ? 'bg-yellow-900 border-yellow-700 text-yellow-100' :
              'bg-blue-900 border-blue-700 text-blue-100'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Oxylabs Scheduler</h1>
              <p className="text-sm text-gray-400 mt-1">Manage scheduled scraping operations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={mapUnmanaged}
                className="px-4 py-2 bg-blue-900 text-blue-100 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 border border-blue-700"
                disabled={queueStats.total === 0}
              >
                <Settings className="w-4 h-4" />
                Map Unmanaged
              </button>
              <button
                onClick={syncSchedules}
                disabled={isSyncing}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
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
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Schedules</p>
                <p className="text-2xl font-bold text-white mt-1">{schedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Queue Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-yellow-400">{queueStats.pending}</span>
                  <span className="text-sm text-gray-400">pending</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Processing</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{queueStats.processing}</p>
              </div>
              <Loader2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{queueStats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{queueStats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="border-b border-gray-700">
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
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-700 text-gray-300 py-1 px-2 rounded-full text-xs">
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
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedSchedules.size > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {selectedSchedules.size} schedule{selectedSchedules.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={bulkActivate}
                        disabled={isProcessingBulk}
                        className="px-3 py-1 bg-green-900 text-green-100 rounded border border-green-700 hover:bg-green-800 transition-colors text-sm disabled:opacity-50"
                      >
                        <Play className="w-3 h-3 inline mr-1" />
                        Activate
                      </button>
                      <button
                        onClick={bulkDeactivate}
                        disabled={isProcessingBulk}
                        className="px-3 py-1 bg-yellow-900 text-yellow-100 rounded border border-yellow-700 hover:bg-yellow-800 transition-colors text-sm disabled:opacity-50"
                      >
                        <Pause className="w-3 h-3 inline mr-1" />
                        Deactivate
                      </button>
                      <button
                        onClick={bulkDelete}
                        disabled={isProcessingBulk}
                        className="px-3 py-1 bg-red-900 text-red-100 rounded border border-red-700 hover:bg-red-800 transition-colors text-sm disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedSchedules(new Set())}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded border border-gray-600 hover:bg-gray-600 transition-colors text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedules Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center text-gray-400 hover:text-white"
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Next Run
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading schedules...
                        </td>
                      </tr>
                    ) : paginatedSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
                            className={`hover:bg-gray-750 transition-colors ${isSelected ? 'bg-gray-750' : ''}`}
                          >
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleSelectSchedule(schedule.oxylabs_schedule_id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-white">
                                  {schedule.job_name || 'Unnamed Schedule'}
                                </div>
                                <div className="text-sm text-gray-400">
                                  ID: {schedule.oxylabs_schedule_id}
                                </div>
                                <div className="text-xs text-gray-500">
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
                              <div className="text-sm text-gray-300">
                                {schedule.next_run_at ? (
                                  <>
                                    <div>{formatRelativeTime(schedule.next_run_at)}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(schedule.next_run_at).toLocaleDateString()}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-500">Not scheduled</span>
                                )}
                              </div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      successRate > 0.8 ? 'bg-green-500' :
                                      successRate > 0.5 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${successRate * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-8">
                                  {(successRate * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {schedule.items_count || 0} items
                              </div>
                            </td>
                            
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleScheduleState(schedule.oxylabs_schedule_id, schedule.active)}
                                  className={`p-1 rounded transition-colors ${
                                    schedule.active 
                                      ? 'text-gray-400 hover:text-yellow-400' 
                                      : 'text-gray-400 hover:text-green-400'
                                  }`}
                                  title={schedule.active ? 'Deactivate' : 'Activate'}
                                >
                                  {schedule.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                
                                <button
                                  onClick={() => deleteSchedule(schedule.oxylabs_schedule_id, schedule.job_name || 'Unnamed')}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors">
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
                <div className="bg-gray-750 px-4 py-3 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSchedules.length)} of {filteredSchedules.length} schedules
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Operation Queue</h3>
              <p className="text-sm text-gray-400">Current and pending operations</p>
            </div>
            
            <div className="divide-y divide-gray-700">
              {operations
                .filter(op => ['pending', 'processing'].includes(op.status))
                .slice(0, 20)
                .map(operation => (
                <div key={operation.id} className="p-4 flex items-center justify-between hover:bg-gray-750">
                  <div className="flex items-center gap-3">
                    {getOperationStatusIcon(operation.status)}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {operation.operation_type.charAt(0).toUpperCase() + operation.operation_type.slice(1)} Schedule
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {operation.oxylabs_schedule_id}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded mt-1 border ${getOperationStatusColor(operation.status)}`}>
                        {operation.status_description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      {operation.status === 'processing' ? 'Processing...' : 'Waiting in queue'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(operation.requested_at)}
                    </div>
                    {operation.retry_count > 0 && (
                      <div className="text-xs text-yellow-400">
                        Retry #{operation.retry_count}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {operations.filter(op => ['pending', 'processing'].includes(op.status)).length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No pending operations</p>
                  <p className="text-xs text-gray-500 mt-1">Operations will appear here when queued</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Operation History</h3>
              <p className="text-sm text-gray-400">Recent completed and failed operations</p>
            </div>
            
            <div className="divide-y divide-gray-700">
              {operations
                .filter(op => ['completed', 'failed'].includes(op.status))
                .slice(0, 20)
                .map(operation => (
                <div key={operation.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getOperationStatusIcon(operation.status)}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {operation.operation_type.charAt(0).toUpperCase() + operation.operation_type.slice(1)} Schedule
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {operation.oxylabs_schedule_id}
                      </div>
                      {operation.last_error && (
                        <div className="text-xs text-red-400 mt-1">
                          Error: {operation.last_error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-300">{operation.status_description}</div>
                    <div className="text-xs text-gray-500">
                      {operation.completed_at ? formatRelativeTime(operation.completed_at) : formatRelativeTime(operation.requested_at)}
                    </div>
                  </div>
                </div>
              ))}
              
              {operations.filter(op => ['completed', 'failed'].includes(op.status)).length === 0 && (
                <div className="p-8 text-center text-gray-400">
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
