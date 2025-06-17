import React from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { DashboardThemeDebug } from '@/components/theme/ThemeDebugSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Target, 
  Calendar, 
  Plus, 
  MapPin, 
  Palette, 
  Settings,
  Activity,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useMenuConfig } from '@/hooks/useMenuConfig';

// Dashboard Cards Data
const dashboardStats = [
  {
    title: 'Active Campaigns',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Target,
    description: 'Currently running campaigns',
  },
  {
    title: 'Scheduled Jobs',
    value: '48',
    change: '+8',
    trend: 'up',
    icon: Calendar,
    description: 'Jobs in the queue',
  },
  {
    title: 'Success Rate',
    value: '94.2%',
    change: '+1.2%',
    trend: 'up',
    icon: TrendingUp,
    description: 'Last 30 days',
  },
  {
    title: 'Active Users',
    value: '156',
    change: '+12',
    trend: 'up',
    icon: Users,
    description: 'Users this month',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'campaign',
    title: 'New campaign "Summer Sale" created',
    time: '2 minutes ago',
    status: 'success',
    icon: Target,
  },
  {
    id: 2,
    type: 'schedule',
    title: 'Daily scraping job completed',
    time: '15 minutes ago',
    status: 'success',
    icon: CheckCircle,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Rate limit approaching for API',
    time: '1 hour ago',
    status: 'warning',
    icon: AlertCircle,
  },
  {
    id: 4,
    type: 'schedule',
    title: 'Location data updated for 5 campaigns',
    time: '2 hours ago',
    status: 'success',
    icon: MapPin,
  },
];

const quickActions = [
  {
    title: 'Create New Campaign',
    description: 'Set up a new marketing campaign',
    href: '/campaigns',
    icon: Target,
    color: 'primary',
  },
  {
    title: 'Schedule Job',
    description: 'Create a new Oxylabs schedule',
    href: '/scheduler/create',
    icon: Calendar,
    color: 'secondary',
  },
  {
    title: 'Build Locations',
    description: 'Create location-based targeting',
    href: '/location-builder',
    icon: MapPin,
    color: 'secondary',
  },
  {
    title: 'View Analytics',
    description: 'Check campaign performance',
    href: '/analytics',
    icon: Activity,
    color: 'secondary',
  },
];

function Index() {
  const { actualTheme, themeMode, debugSettings } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  
  const allMenuItems = getMenuItems();
  const sections = getSections();

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
            {actualTheme} mode
          </Badge>
        </div>
      }
      category={
        <div className="space-y-4">
          {sections.map((section) => (
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
      {/* FIXED: Use proper theme-aware classes */}
      <div className="p-6 bg-background text-foreground min-h-screen">
        {/* Debug Section - Only show when debug setting is enabled */}
        {debugSettings.showThemeDebug && <DashboardThemeDebug />}
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your campaigns and schedules.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                    <Badge 
                      variant={stat.trend === 'up' ? 'default' : 'secondary'}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant={action.color === 'primary' ? 'default' : 'outline'}
                        className="h-auto p-4 flex flex-col items-start space-y-2 hover:scale-105 transition-transform"
                        asChild
                      >
                        <Link to={action.href}>
                          <Icon className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-semibold">{action.title}</div>
                            <div className="text-xs opacity-80">{action.description}</div>
                          </div>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div                        className={`p-2 rounded-full ${
                          activity.status === 'success' ? 'bg-success-bg text-success' :
                          activity.status === 'warning' ? 'bg-warning-bg text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Color Test Section - Only show when debug setting is enabled */}
        {debugSettings.showColorTest && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-foreground">🧪 Color Test Section</CardTitle>
              <CardDescription>
                Visual confirmation that theme colors are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-16 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">Primary (Blue)</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Should be blue, not maroon</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full h-16 bg-secondary rounded flex items-center justify-center border border-border">
                    <span className="text-secondary-foreground font-semibold">Secondary</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Light gray / dark gray</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full h-16 bg-background border-2 border-border rounded flex items-center justify-center">
                    <span className="text-foreground font-semibold">Background</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Should be white/dark, not yellow</p>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full h-16 bg-card border border-border rounded flex items-center justify-center">
                    <span className="text-card-foreground font-semibold">Card</span>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Card background</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>✅ If you see:</strong> Blue primary colors, white/dark backgrounds, proper contrast<br/>
                  <strong>❌ If you still see:</strong> Maroon instead of blue, yellow instead of white - check for conflicting CSS files
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}

export default Index;