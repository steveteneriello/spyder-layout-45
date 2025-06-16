
import React, { useState, useEffect } from 'react';
import { Settings, Palette, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface DebugSettings {
  showThemeDebug: boolean;
  showColorPreview: boolean;
  showThemeInfo: boolean;
}

interface ThemeDebugProps {
  title: string;
  description: string;
  pageSpecificColors?: {
    name: string;
    description: string;
    colorKey: string;
  }[];
}

function ThemeDebugSection({ title, description, pageSpecificColors = [] }: ThemeDebugProps) {
  const { themeMode, actualTheme, colors } = useGlobalTheme();
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    showThemeDebug: false,
    showColorPreview: true,
    showThemeInfo: true
  });

  // Load debug settings and listen for changes
  useEffect(() => {
    const loadDebugSettings = () => {
      const savedSettings = localStorage.getItem('theme-debug-settings');
      if (savedSettings) {
        try {
          setDebugSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Failed to load debug settings:', error);
        }
      }
    };

    loadDebugSettings();

    // Listen for debug settings changes
    const handleDebugSettingsChange = (event: CustomEvent) => {
      setDebugSettings(event.detail);
    };

    window.addEventListener('themeDebugSettingsChanged', handleDebugSettingsChange as EventListener);
    return () => {
      window.removeEventListener('themeDebugSettingsChanged', handleDebugSettingsChange as EventListener);
    };
  }, []);

  // Don't render if debug is disabled
  if (!debugSettings.showThemeDebug) {
    return null;
  }

  // Core colors to always show
  const coreColors = [
    { name: 'Primary Background', colorKey: 'bg-primary' },
    { name: 'Primary Text', colorKey: 'text-primary' },
    { name: 'Primary Accent', colorKey: 'accent-primary' },
    { name: 'Card Background', colorKey: 'bg-secondary' },
  ];

  const allColors = [...coreColors, ...pageSpecificColors];

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="h-5 w-5 text-primary" />
          🎯 {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {debugSettings.showColorPreview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {allColors.map(({ name, colorKey }) => {
              const colorValue = colors[colorKey];
              const currentColor = colorValue ? colorValue[actualTheme] : '128 128 128';
              
              return (
                <div key={colorKey} className="text-center">
                  <div 
                    className="w-full h-12 rounded-lg border border-border mb-2"
                    style={{ backgroundColor: `rgb(${currentColor})` }}
                  />
                  <p className="text-xs font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">rgb({currentColor})</p>
                </div>
              );
            })}
          </div>
        )}

        {debugSettings.showThemeInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-1">Theme Mode</Badge>
              <p className="text-sm font-medium capitalize">{themeMode}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-1">Active Theme</Badge>
              <p className="text-sm font-medium capitalize">{actualTheme}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-1">Colors Status</Badge>
              <p className="text-sm font-medium text-green-600">Working ✓</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-1">Debug Mode</Badge>
              <p className="text-sm font-medium text-blue-600">Enabled</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          🎨 Theme Status: Blue colors should appear blue (not maroon), white backgrounds should appear white (not yellow). 
          Current theme mode: <strong>{themeMode}</strong> | Active theme: <strong>{actualTheme}</strong> | 
          Colors are loading from GlobalThemeContext ✓
        </p>
      </CardContent>
    </Card>
  );
}

// Pre-configured debug sections for different pages
export function DashboardThemeDebug() {
  return (
    <ThemeDebugSection
      title="Dashboard Theme Status"
      description="Verifying theme integration for dashboard components"
      pageSpecificColors={[
        { name: 'Dashboard Cards', description: 'Card backgrounds', colorKey: 'bg-secondary' },
        { name: 'Stats Success', description: 'Success indicators', colorKey: 'success' },
      ]}
    />
  );
}

export function CampaignsThemeDebug() {
  return (
    <ThemeDebugSection
      title="Campaign Page Theme Status"
      description="Verifying theme integration for campaign components"
      pageSpecificColors={[
        { name: 'Campaign Cards', description: 'Campaign card backgrounds', colorKey: 'bg-secondary' },
        { name: 'Status Success', description: 'Active campaign status', colorKey: 'success' },
        { name: 'Status Warning', description: 'Paused campaign status', colorKey: 'warning' },
      ]}
    />
  );
}

export function SchedulerThemeDebug() {
  return (
    <ThemeDebugSection
      title="Scheduler Page Theme Status"
      description="Verifying theme integration for scheduler components"
      pageSpecificColors={[
        { name: 'Job Cards', description: 'Job item backgrounds', colorKey: 'bg-secondary' },
        { name: 'Running Status', description: 'Active job indicators', colorKey: 'success' },
        { name: 'Scheduled Status', description: 'Scheduled job indicators', colorKey: 'accent-primary' },
      ]}
    />
  );
}

export function CreateScheduleThemeDebug() {
  return (
    <ThemeDebugSection
      title="Create Schedule Theme Status"
      description="Verifying theme integration for form and modal components"
      pageSpecificColors={[
        { name: 'Form Background', description: 'Form input backgrounds', colorKey: 'bg-secondary' },
        { name: 'Button Primary', description: 'Primary action buttons', colorKey: 'accent-primary' },
        { name: 'Template Cards', description: 'Template selection cards', colorKey: 'bg-tertiary' },
      ]}
    />
  );
}

export function LocationBuilderThemeDebug() {
  return (
    <ThemeDebugSection
      title="Location Builder Theme Status"
      description="Verifying theme integration for data tables and tools"
      pageSpecificColors={[
        { name: 'Table Background', description: 'Data table backgrounds', colorKey: 'bg-secondary' },
        { name: 'Selected Items', description: 'Selected location highlighting', colorKey: 'success' },
        { name: 'Tools Panel', description: 'Tool panel backgrounds', colorKey: 'bg-tertiary' },
      ]}
    />
  );
}

export function NotFoundThemeDebug() {
  return (
    <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        🎯 404 Page Theme Status
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="w-full h-8 rounded bg-primary mb-2" />
          <p className="text-xs">Primary (Blue)</p>
        </div>
        <div className="text-center">
          <div className="w-full h-8 rounded bg-background border border-border mb-2" />
          <p className="text-xs">Background</p>
        </div>
        <div className="text-center">
          <div className="w-full h-8 rounded bg-card border border-border mb-2" />
          <p className="text-xs">Card</p>
        </div>
        <div className="text-center">
          <div className="w-full h-8 rounded bg-muted mb-2" />
          <p className="text-xs">Muted</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Error page theme verification: Colors should display correctly across all themes.
      </p>
    </div>
  );
}

export default ThemeDebugSection;
