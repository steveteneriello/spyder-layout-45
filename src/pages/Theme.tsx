import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme, type ThemeMode } from '@/contexts/GlobalThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Sun, Moon, Palette, Settings } from 'lucide-react';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

// Built-in Theme Toggle Component (in case GlobalThemeToggle doesn't exist)
const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode, isSystemDark } = useGlobalTheme();

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      title: 'Light',
      description: 'Light mode',
      icon: Sun,
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark', 
      description: 'Dark mode',
      icon: Moon,
    },
    {
      id: 'auto' as ThemeMode,
      title: 'Auto',
      description: `System (${isSystemDark ? 'dark' : 'light'})`,
      icon: Monitor,
    }
  ];

  return (
    <div className="flex gap-2">
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isActive = themeMode === option.id;
        
        return (
          <Button
            key={option.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => setThemeMode(option.id)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {option.title}
          </Button>
        );
      })}
    </div>
  );
};

export default function Theme() {
  const { themeMode, actualTheme, isSystemDark, colors } = useGlobalTheme();

  // Error handling for theme context
  if (!themeMode || !actualTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Theme Error</CardTitle>
            <CardDescription>
              Unable to load theme context. Please check your GlobalThemeProvider.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <h1 className="text-lg font-semibold text-white">Theme Settings</h1>
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
      {/* FIXED: Removed redundant bg-background text-foreground classes */}
      <div className="p-6 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Theme Settings</h1>
        </div>

        {/* Theme Control Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Theme Control
            </CardTitle>
            <CardDescription>
              Switch between light, dark, and auto themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Current mode: <span className="font-medium capitalize">{themeMode}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Active theme: <span className="font-medium capitalize">{actualTheme}</span>
                </p>
                {themeMode === 'auto' && (
                  <p className="text-xs text-muted-foreground">
                    Following system preference: {isSystemDark ? 'dark' : 'light'}
                  </p>
                )}
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Theme Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Theme Status</CardTitle>
            <CardDescription>
              Current theme configuration and applied colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Theme Mode</div>
                <div className="text-lg font-semibold capitalize">{themeMode}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Active Theme</div>
                <div className="text-lg font-semibold capitalize">{actualTheme}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">System Preference</div>
                <div className="text-lg font-semibold capitalize">
                  {isSystemDark ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>

            {/* Color Preview */}
            {colors && Object.keys(colors).length > 0 && (
              <div className="mt-6 p-4 border border-border rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Applied Colors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'bg-primary', label: 'Primary BG' },
                    { key: 'accent-primary', label: 'Primary Accent' },
                    { key: 'text-primary', label: 'Primary Text' },
                    { key: 'border-primary', label: 'Primary Border' }
                  ].map(({ key, label }) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-12 h-12 mx-auto rounded border-2 border-border mb-2" 
                        style={{ 
                          backgroundColor: colors[key] 
                            ? `rgb(${colors[key][actualTheme]})` 
                            : 'transparent'
                        }}
                      />
                      <div className="text-xs text-muted-foreground">{label}</div>
                      {colors[key] && (
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {colors[key][actualTheme]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common theme-related actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start" asChild>
                <a href="/admin/theme">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Theme Settings
                </a>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => {
                  // Force refresh theme
                  window.location.reload();
                }}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Refresh Theme
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}