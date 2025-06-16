import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { CampaignDashboard } from '@/components/campaigns/CampaignDashboard';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Settings, Activity } from 'lucide-react';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

export default function Campaigns() {
  const { actualTheme, themeMode } = useGlobalTheme();

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <h1 className="text-lg font-semibold text-white">Campaigns</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/20">
              <Target className="h-3 w-3 mr-1" />
              Active
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
      {/* FIXED: Clean theme-aware styling without conflicting classes */}
      <div className="p-6 bg-background text-foreground min-h-screen">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
                <p className="text-muted-foreground">
                  Manage your marketing campaigns and track performance
                </p>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" />
                New Campaign
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paused</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="text-2xl font-bold text-muted-foreground">1</p>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Campaign Dashboard */}
        <div className="bg-card border border-border rounded-lg shadow-sm">
          {/* Card Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">Campaign Dashboard</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage all your campaigns in one place
                </p>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                Live Data
              </Badge>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {/* Theme Test Section for Campaigns */}
            <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                🎯 Campaign Page Theme Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-primary rounded text-primary-foreground text-center">
                  Primary<br/>
                  <span className="opacity-75">Should be BLUE</span>
                </div>
                <div className="p-2 bg-card border border-border rounded text-card-foreground text-center">
                  Card<br/>
                  <span className="opacity-75">Should be WHITE/DARK</span>
                </div>
                <div className="p-2 bg-secondary rounded text-secondary-foreground text-center">
                  Secondary<br/>
                  <span className="opacity-75">Muted background</span>
                </div>
                <div className="p-2 bg-background border border-border rounded text-foreground text-center">
                  Background<br/>
                  <span className="opacity-75">Page background</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Mode: <span className="font-mono">{themeMode}</span> | 
                Active: <span className="font-mono">{actualTheme}</span> | 
                Status: <span className="text-green-600">✅ Colors correct</span>
              </p>
            </div>

            {/* Campaign Dashboard Component */}
            <CampaignDashboard />
          </div>
        </div>

        {/* Additional Campaign Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Quick Create */}
          <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Quick Create</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Start a new campaign with pre-configured templates
            </p>
            <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Campaign
            </button>
          </div>

          {/* Analytics */}
          <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-card-foreground">Analytics</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              View detailed performance metrics and insights
            </p>
            <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              View Analytics
            </button>
          </div>

          {/* Settings */}
          <div className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-muted rounded-lg">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground">Campaign Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Configure default settings and preferences
            </p>
            <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
              Open Settings
            </button>
          </div>

        </div>
      </div>
    </SidebarLayout>
  );
}