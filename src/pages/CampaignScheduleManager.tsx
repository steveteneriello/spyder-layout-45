import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  Clock,
  Target,
  Tag,
  Building,
  Globe,
  Activity,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';

// Types
interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  jobType: 'lead-generation' | 'brand-monitoring' | 'competitor-analysis' | 'market-research';
  industry: string;
  tier: 'basic' | 'premium' | 'enterprise';
}

interface Campaign {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  keywords: string[];
  status: 'active' | 'paused' | 'draft';
  locationTargeting?: string[];
}

interface ScheduledJob {
  id: string;
  clientId: string;
  campaignId: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'queued';
  percentComplete: number;
  nextRun: string;
  lastRun: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  totalAdsFound: number;
  market?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  estimatedCompletion?: string;
  errorCount: number;
  successfulRuns: number;
  totalRuns: number;
  avgExecutionTime: number; // in minutes
}

// Mock Data
const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'John Smith',
    company: 'Acme Plumbing',
    email: 'john@acmeplumbing.com',
    jobType: 'lead-generation',
    industry: 'Home Services',
    tier: 'premium'
  },
  {
    id: 'client-2',
    name: 'Sarah Johnson',
    company: 'Elite HVAC',
    email: 'sarah@elitehvac.com',
    jobType: 'competitor-analysis',
    industry: 'Home Services',
    tier: 'enterprise'
  },
  {
    id: 'client-3',
    name: 'Mike Davis',
    company: 'Pro Electric',
    email: 'mike@proelectric.com',
    jobType: 'brand-monitoring',
    industry: 'Home Services',
    tier: 'basic'
  },
  {
    id: 'client-4',
    name: 'Lisa Chen',
    company: 'TechSolutions Inc',
    email: 'lisa@techsolutions.com',
    jobType: 'market-research',
    industry: 'Technology',
    tier: 'enterprise'
  }
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Emergency Plumbing Services',
    categoryId: 'plumbing',
    categoryName: 'Plumbing',
    keywords: ['emergency plumber', '24 hour plumbing', 'burst pipe repair'],
    status: 'active',
    locationTargeting: ['Los Angeles', 'San Diego']
  },
  {
    id: 'camp-2',
    name: 'HVAC Maintenance Campaign',
    categoryId: 'hvac',
    categoryName: 'HVAC',
    keywords: ['ac repair', 'heating service', 'hvac maintenance'],
    status: 'active',
    locationTargeting: ['Phoenix', 'Tucson']
  },
  {
    id: 'camp-3',
    name: 'Electrical Services',
    categoryId: 'electrical',
    categoryName: 'Electrical',
    keywords: ['electrician near me', 'electrical repair', 'panel upgrade'],
    status: 'active',
    locationTargeting: ['Seattle', 'Portland']
  }
];

const MOCK_JOBS: ScheduledJob[] = [
  {
    id: 'job-1',
    clientId: 'client-1',
    campaignId: 'camp-1',
    name: 'Acme Plumbing - Emergency Services Scraping',
    status: 'running',
    percentComplete: 68,
    nextRun: '2024-06-18T02:00:00Z',
    lastRun: '2024-06-17T02:00:00Z',
    frequency: 'daily',
    totalAdsFound: 1247,
    market: 'Los Angeles Metro',
    priority: 'high',
    createdAt: '2024-06-10T10:00:00Z',
    estimatedCompletion: '2024-06-18T04:30:00Z',
    errorCount: 2,
    successfulRuns: 45,
    totalRuns: 47,
    avgExecutionTime: 120
  },
  {
    id: 'job-2',
    clientId: 'client-2',
    campaignId: 'camp-2',
    name: 'Elite HVAC - Competitor Analysis',
    status: 'queued',
    percentComplete: 0,
    nextRun: '2024-06-18T06:00:00Z',
    lastRun: '2024-06-17T06:00:00Z',
    frequency: 'daily',
    totalAdsFound: 892,
    market: 'Phoenix Metro',
    priority: 'medium',
    createdAt: '2024-06-12T14:30:00Z',
    errorCount: 0,
    successfulRuns: 30,
    totalRuns: 30,
    avgExecutionTime: 95
  },
  {
    id: 'job-3',
    clientId: 'client-3',
    campaignId: 'camp-3',
    name: 'Pro Electric - Brand Monitoring',
    status: 'paused',
    percentComplete: 42,
    nextRun: '2024-06-19T08:00:00Z',
    lastRun: '2024-06-16T08:00:00Z',
    frequency: 'weekly',
    totalAdsFound: 334,
    market: 'Seattle Metro',
    priority: 'low',
    createdAt: '2024-06-08T09:15:00Z',
    errorCount: 1,
    successfulRuns: 8,
    totalRuns: 9,
    avgExecutionTime: 75
  },
  {
    id: 'job-4',
    clientId: 'client-4',
    campaignId: 'camp-1',
    name: 'TechSolutions - Market Research',
    status: 'completed',
    percentComplete: 100,
    nextRun: '2024-06-20T10:00:00Z',
    lastRun: '2024-06-17T10:00:00Z',
    frequency: 'monthly',
    totalAdsFound: 2156,
    priority: 'urgent',
    createdAt: '2024-05-15T11:00:00Z',
    errorCount: 0,
    successfulRuns: 12,
    totalRuns: 12,
    avgExecutionTime: 180
  },
  {
    id: 'job-5',
    clientId: 'client-1',
    campaignId: 'camp-2',
    name: 'Acme Plumbing - HVAC Lead Gen',
    status: 'failed',
    percentComplete: 15,
    nextRun: '2024-06-18T12:00:00Z',
    lastRun: '2024-06-17T12:00:00Z',
    frequency: 'daily',
    totalAdsFound: 67,
    market: 'San Diego Metro',
    priority: 'high',
    createdAt: '2024-06-16T16:45:00Z',
    errorCount: 5,
    successfulRuns: 2,
    totalRuns: 7,
    avgExecutionTime: 45
  }
];

// Status Badge Component
const StatusBadge: React.FC<{ status: string; theme: any }> = ({ status, theme }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return { icon: PlayCircle, text: 'Running', class: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'paused':
        return { icon: PauseCircle, text: 'Paused', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'completed':
        return { icon: CheckCircle, text: 'Completed', class: 'bg-green-100 text-green-800 border-green-200' };
      case 'failed':
        return { icon: XCircle, text: 'Failed', class: 'bg-red-100 text-red-800 border-red-200' };
      case 'queued':
        return { icon: Clock, text: 'Queued', class: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { icon: AlertCircle, text: 'Unknown', class: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${config.class}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};

// Priority Badge Component
const PriorityBadge: React.FC<{ priority: string; theme: any }> = ({ priority, theme }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { text: 'Urgent', class: 'bg-red-100 text-red-800 border-red-200' };
      case 'high':
        return { text: 'High', class: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'medium':
        return { text: 'Medium', class: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'low':
        return { text: 'Low', class: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { text: 'Normal', class: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge variant="outline" className={`text-xs ${config.class}`}>
      {config.text}
    </Badge>
  );
};

// Job Row Component
const JobRow: React.FC<{
  job: ScheduledJob;
  client: Client;
  campaign: Campaign;
  theme: any;
  onEdit: (job: ScheduledJob) => void;
  onDelete: (jobId: string) => void;
  onToggleStatus: (jobId: string) => void;
}> = ({ job, client, campaign, theme, onEdit, onDelete, onToggleStatus }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Soon';
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const getJobTypeIcon = (jobType: string) => {
    switch (jobType) {
      case 'lead-generation': return Users;
      case 'brand-monitoring': return Eye;
      case 'competitor-analysis': return TrendingUp;
      case 'market-research': return Globe;
      default: return Activity;
    }
  };

  const JobTypeIcon = getJobTypeIcon(client.jobType);

  return (
    <div className={`p-4 border ${theme.border} rounded-lg hover:${theme.cardBackground} transition-colors`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Job Info */}
        <div className="lg:col-span-3">
          <div className="flex items-start gap-3">
            <JobTypeIcon className={`h-5 w-5 ${theme.textSecondary} mt-0.5`} />
            <div>
              <h3 className={`font-medium ${theme.text} mb-1`}>{job.name}</h3>
              <div className="flex items-center gap-2 text-sm">
                <StatusBadge status={job.status} theme={theme} />
                <PriorityBadge priority={job.priority} theme={theme} />
              </div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Building className={`h-4 w-4 ${theme.textSecondary}`} />
            <span className={`font-medium ${theme.text} text-sm`}>{client.company}</span>
          </div>
          <p className={`text-xs ${theme.textSecondary}`}>{client.name}</p>
          <Badge variant="outline" className="text-xs mt-1">
            {client.jobType.replace('-', ' ')}
          </Badge>
        </div>

        {/* Progress */}
        <div className="lg:col-span-1">
          <div className="text-center">
            <div className={`text-sm font-medium ${theme.text} mb-1`}>
              {job.percentComplete}%
            </div>
            <Progress value={job.percentComplete} className="h-2" />
          </div>
        </div>

        {/* Timing */}
        <div className="lg:col-span-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Clock className={`h-3 w-3 ${theme.textSecondary}`} />
              <span className={theme.textSecondary}>Next: {formatRelativeTime(job.nextRun)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Activity className={`h-3 w-3 ${theme.textSecondary}`} />
              <span className={theme.textSecondary}>Last: {formatDate(job.lastRun)}</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className={`font-medium ${theme.text}`}>{job.totalAdsFound.toLocaleString()}</div>
              <div className={theme.textSecondary}>Ads Found</div>
            </div>
            <div className="text-center">
              <div className={`font-medium ${theme.text}`}>{job.successfulRuns}/{job.totalRuns}</div>
              <div className={theme.textSecondary}>Success Rate</div>
            </div>
          </div>
        </div>

        {/* Campaign & Market */}
        <div className="lg:col-span-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Target className={`h-3 w-3 ${theme.textSecondary}`} />
              <span className={`${theme.text} font-medium`}>{campaign.name}</span>
            </div>
            {job.market && (
              <div className="flex items-center gap-2 text-xs">
                <MapPin className={`h-3 w-3 ${theme.textSecondary}`} />
                <span className={theme.textSecondary}>{job.market}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(job.id)}
              className={`${theme.border} ${theme.text}`}
            >
              {job.status === 'running' ? <PauseCircle className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(job)}
              className={`${theme.border} ${theme.text}`}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(job.id)}
              className={`${theme.border} text-red-500 hover:bg-red-50`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Tag className={`h-3 w-3 ${theme.textSecondary}`} />
          <span className={`text-xs ${theme.textSecondary}`}>Keywords:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {campaign.keywords.slice(0, 3).map((keyword, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {campaign.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{campaign.keywords.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function ScheduleManager() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const allMenuItems = getMenuItems();
  const menuSections = getSections();

  // State
  const [jobs, setJobs] = useState<ScheduledJob[]>(MOCK_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('nextRun');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);

  const clients = MOCK_CLIENTS;
  const campaigns = MOCK_CAMPAIGNS;

  // Helper functions
  const getClient = (clientId: string) => clients.find(c => c.id === clientId);
  const getCampaign = (campaignId: string) => campaigns.find(c => c.id === campaignId);

  // Filtered and sorted jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const client = getClient(job.clientId);
      const campaign = getCampaign(job.campaignId);
      
      const matchesSearch = !searchTerm || 
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client?.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.market?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
      const matchesClient = clientFilter === 'all' || job.clientId === clientFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesClient;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof ScheduledJob];
      let bValue: any = b[sortField as keyof ScheduledJob];

      // Handle special sorting cases
      if (sortField === 'client') {
        aValue = getClient(a.clientId)?.company || '';
        bValue = getClient(b.clientId)?.company || '';
      } else if (sortField === 'campaign') {
        aValue = getCampaign(a.campaignId)?.name || '';
        bValue = getCampaign(b.campaignId)?.name || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, priorityFilter, clientFilter, sortField, sortDirection, clients, campaigns]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleJobStatus = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const newStatus = job.status === 'running' ? 'paused' : 'running';
        return { ...job, status: newStatus };
      }
      return job;
    }));
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const handleEditJob = (job: ScheduledJob) => {
    console.log('Edit job:', job);
  };

  // Stats calculations
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const runningJobs = jobs.filter(j => j.status === 'running').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;
    const totalAdsFound = jobs.reduce((sum, job) => sum + job.totalAdsFound, 0);
    
    return {
      totalJobs,
      runningJobs,
      completedJobs,
      failedJobs,
      totalAdsFound
    };
  }, [jobs]);

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              showText={true}
              className="flex items-center gap-3 text-primary-foreground"
            />
          </div>
          <Badge variant="outline" className="text-primary-foreground border-primary-foreground/20">
            {actualTheme}
          </Badge>
        </div>
      }
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory 
              key={section.name}
              section={section.name} 
              items={section.items} 
            />
          ))}
        </div>
      }
      menuItems={allMenuItems}
    >
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>
              Schedule Manager
            </h1>
            <p className={`${currentTheme.textSecondary}`}>
              Monitor and manage all active jobs from campaign builder
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Total Jobs</p>
                    <p className={`text-2xl font-semibold ${currentTheme.text}`}>{stats.totalJobs}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Running</p>
                    <p className={`text-2xl font-semibold ${currentTheme.text}`}>{stats.runningJobs}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Completed</p>
                    <p className={`text-2xl font-semibold ${currentTheme.text}`}>{stats.completedJobs}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Failed</p>
                    <p className={`text-2xl font-semibold ${currentTheme.text}`}>{stats.failedJobs}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${currentTheme.textSecondary} mb-1`}>Total Ads</p>
                    <p className={`text-2xl font-semibold ${currentTheme.text}`}>{stats.totalAdsFound.toLocaleString()}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className={`${currentTheme.cardBackground} ${currentTheme.border} mb-6`}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <Label className={`${currentTheme.text} mb-2 block`}>Search</Label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${currentTheme.textSecondary}`} />
                    <Input
                      placeholder="Search jobs, clients, campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 ${currentTheme.cardBackground} ${currentTheme.border} ${currentTheme.text}`}
                    />
                  </div>
                </div>

                <div>
                  <Label className={`${currentTheme.text} mb-2 block`}>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className={`${currentTheme.cardBackground} ${currentTheme.border} ${currentTheme.text}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="queued">Queued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={`${currentTheme.text} mb-2 block`}>Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className={`${currentTheme.cardBackground} ${currentTheme.border} ${currentTheme.text}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={`${currentTheme.text} mb-2 block`}>Client</Label>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className={`${currentTheme.cardBackground} ${currentTheme.border} ${currentTheme.text}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className={`${currentTheme.text} mb-2 block`}>Sort By</Label>
                  <Select value={sortField} onValueChange={setSortField}>
                    <SelectTrigger className={`${currentTheme.cardBackground} ${currentTheme.border} ${currentTheme.text}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
                      <SelectItem value="nextRun">Next Run</SelectItem>
                      <SelectItem value="lastRun">Last Run</SelectItem>
                      <SelectItem value="percentComplete">Progress</SelectItem>
                      <SelectItem value="totalAdsFound">Ads Found</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="campaign">Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort(sortField)}
                    className={`${currentTheme.border} ${currentTheme.text}`}
                  >
                    {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                      setClientFilter('all');
                      setSortField('nextRun');
                      setSortDirection('asc');
                    }}
                    className={`${currentTheme.border} ${currentTheme.text}`}
                  >
                    Clear Filters
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <Card className={`${currentTheme.cardBackground} ${currentTheme.border}`}>
            <CardHeader>
              <CardTitle className={`${currentTheme.text} flex items-center gap-2`}>
                <Calendar className="h-5 w-5" />
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className={`ml-2 ${currentTheme.textSecondary}`}>Loading jobs...</span>
                </div>
              ) : filteredAndSortedJobs.length === 0 ? (
                <div className={`text-center py-12 ${currentTheme.textSecondary}`}>
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No jobs found</p>
                  <p>Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {filteredAndSortedJobs.map((job) => {
                    const client = getClient(job.clientId);
                    const campaign = getCampaign(job.campaignId);
                    
                    if (!client || !campaign) return null;
                    
                    return (
                      <JobRow
                        key={job.id}
                        job={job}
                        client={client}
                        campaign={campaign}
                        theme={currentTheme}
                        onEdit={handleEditJob}
                        onDelete={handleDeleteJob}
                        onToggleStatus={handleToggleJobStatus}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}