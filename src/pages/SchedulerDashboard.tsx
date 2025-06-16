import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import OxylabsSchedulerDashboard from '@/components/scheduler/OxylabsSchedulerDashboard';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Activity,
  CheckCircle,
  AlertCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

// Mock scheduler stats data
const schedulerStats = [
  {
    title: 'Active Jobs',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Activity,
    color: 'text-green-600',
    description: 'Currently running',
  },
  {
    title: 'Scheduled',
    value: '67',
    change: '+12',
    trend: 'up',
    icon: Clock,
    color: 'text-blue-600',
    description: 'Waiting to execute',
  },
  {
    title: 'Completed Today',
    value: '142',
    change: '+28',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600',
    description: 'Successfully finished',
  },
  {
    title: 'Failed/Retry',
    value: '3',
    change: '-2',
    trend: 'down',
    icon: AlertCircle,
    color: 'text-red-600',
    description: 'Need attention',
  },
];

const quickActions = [
  {
    title: 'Create New Schedule',
    description: 'Set up a new Oxylabs job schedule',
    href: '/scheduler/create',
    icon: Plus,
    variant: 'default' as const,
  },
  {
    title: 'View Analytics',
    description: 'Check performance metrics',
    href: '/scheduler/analytics',
    icon: BarChart3,
    variant: 'outline' as const,
  },
  {
    title: 'Scheduler Settings',
    description: 'Configure default options',
    href: '/scheduler/settings',
    icon: Settings,
    variant: 'outline' as const,
  },
  {
    title: 'Refresh Data',
    description: 'Update all job statuses',
    href: '#',
    icon: RefreshCw,
    variant: 'outline' as const,
    onClick: () => {
      console.log('Refreshing scheduler data...');
      // Add refresh logic here
    },
  },
];

const recentJobs = [
  {
    id: 'job-001',
    name: 'Daily Product Scraping',
    status: 'running',
    nextRun: '2:30 PM',
    frequency: 'Every 6 hours',
    type: 'Web Scraping',
  },
  {
    id: 'job-002',
    name: 'Competitor Price Check',
    status: 'scheduled',
    nextRun: '4:00 PM',
    frequency: 'Daily at 4 PM',
    type: 'Price Monitoring',
  },
  {
    id: 'job-003',
    name: 'Inventory Update',
    status: 'completed',
    nextRun: 'Tomorrow 9:00 AM',
    frequency: 'Daily at 9 AM',
    type: 'Data Sync',
  },
  {
    id: 'job-004',
    name: 'SEO Keywords Tracking',
    status: 'paused',
    nextRun: 'Paused',
    frequency: 'Weekly',
    type: 'SEO Analysis',
  },
];

export default function SchedulerDashboard() {
  const { actualTheme, themeMode } = useGlobalTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          {/* Enhanced header with proper branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-black" />
            </div>
            <div className="text-white">
              <div className="font-bold text-sm">Scheduler</div>
              <div className="text-xs opacity-75">Oxylabs Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/20">
              <Activity className="h-3 w-3 mr-1" />
              24 Active
            </Badge>
            <Badge variant="outline" className="text-white border-white/20 text-xs">
              {actualTheme}
            </Badge>
          </div>
        </div>
      }
      category={
        <div className="space-y-4">
          <SideCategory section="Main" items={allMenuItems.filter(item => item.section === 'Main')} />
          <SideCategory section="Tools" items={allMenuItems.filter(item => item.section === 'Tools')} />
          <SideCategory section="Settings" items={allMenuItems.filter(item => item.section === 'Settings')} />
        </div>
      }
      menuItems={allMenuItems}
    >
      {/* FIXED: Clean theme-aware styling */}
      <div className="p-6 bg-background text-foreground min-h-screen">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Scheduler Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor and manage your Oxylabs scheduling jobs
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild>
                <a href="/scheduler/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </a>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {schedulerStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
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

        {/* Theme Test Section */}
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              🎯 Scheduler Page Theme Status
            </CardTitle>
            <CardDescription>
              Verifying theme integration for scheduler components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-primary rounded text-primary-foreground text-center text-sm">
                Primary<br/>
                <span className="opacity-75">BLUE</span>
              </div>
              <div className="p-3 bg-card border border-border rounded text-card-foreground text-center text-sm">
                Card<br/>
                <span className="opacity-75">WHITE/DARK</span>
              </div>
              <div className="p-3 bg-green-100 text-green-800 rounded text-center text-sm">
                Success<br/>
                <span className="opacity-75">Running Jobs</span>
              </div>
              <div className="p-3 bg-yellow-100 text-yellow-800 rounded text-center text-sm">
                Warning<br/>
                <span className="opacity-75">Paused Jobs</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Mode: <span className="font-mono">{themeMode}</span> | 
              Active: <span className="font-mono">{actualTheme}</span> | 
              Status: <span className="text-green-600">✅ Theme working correctly</span>
            </p>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Scheduler Dashboard - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  Oxylabs Scheduler Dashboard
                </CardTitle>
                <CardDescription>
                  Main scheduler interface and job management
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Oxylabs Dashboard Component */}
                <OxylabsSchedulerDashboard />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Plus className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant={action.variant}
                        className="w-full justify-start h-auto p-3"
                        asChild={!action.onClick}
                        onClick={action.onClick}
                      >
                        {action.onClick ? (
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-xs opacity-75">{action.description}</div>
                            </div>
                          </div>
                        ) : (
                          <a href={action.href} className="flex items-center gap-3 w-full">
                            <Icon className="h-4 w-4" />
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-xs opacity-75">{action.description}</div>
                            </div>
                          </a>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Jobs
                </CardTitle>
                <CardDescription>
                  Latest scheduling activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors">
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
            </Card>

          </div>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Scheduler System Status
            </CardTitle>
            <CardDescription>
              Current system health and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">System Healthy</p>
                  <p className="text-xs text-green-600">All services operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Queue Processing</p>
                  <p className="text-xs text-blue-600">24 jobs in queue</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg">
                <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}