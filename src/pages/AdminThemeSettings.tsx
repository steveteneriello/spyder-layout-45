
import React, { useState } from 'react';
import { Settings, Monitor, Sun, Moon, Palette, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGlobalTheme, ThemeMode } from '@/contexts/GlobalThemeContext';
import SidebarLayout from '@/components/layout/SidebarLayout';

interface ColorSettings {
  [key: string]: {
    light: string;
    dark: string;
  };
}

const defaultColors: ColorSettings = {
  'bg-primary': { light: '255 255 255', dark: '14 17 23' },
  'bg-secondary': { light: '251 252 253', dark: '22 27 34' },
  'bg-tertiary': { light: '248 249 250', dark: '33 38 45' },
  'bg-hover': { light: '241 243 245', dark: '48 54 61' },
  'bg-active': { light: '233 236 239', dark: '55 62 71' },
  'bg-selected': { light: '227 242 253', dark: '28 33 40' },
  'text-primary': { light: '26 32 44', dark: '240 246 252' },
  'text-secondary': { light: '74 85 104', dark: '125 133 144' },
  'text-tertiary': { light: '113 128 150', dark: '101 109 118' },
  'text-inverse': { light: '255 255 255', dark: '14 17 23' },
  'accent-primary': { light: '49 130 206', dark: '56 139 253' },
  'accent-primary-hover': { light: '44 82 130', dark: '31 111 235' },
  'accent-primary-active': { light: '42 67 101', dark: '26 84 144' },
  'success': { light: '56 161 105', dark: '63 185 80' },
  'warning': { light: '221 107 32', dark: '210 153 34' },
  'error': { light: '229 62 62', dark: '248 81 73' },
  'border-primary': { light: '226 232 240', dark: '48 54 61' },
  'border-secondary': { light: '241 243 245', dark: '33 38 45' },
  'border-focus': { light: '49 130 206', dark: '56 139 253' },
};

const AdminThemeSettings = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark } = useGlobalTheme();
  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [activeColorGroup, setActiveColorGroup] = useState('backgrounds');

  const colorGroups = {
    backgrounds: ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-hover', 'bg-active', 'bg-selected'],
    text: ['text-primary', 'text-secondary', 'text-tertiary', 'text-inverse'],
    accents: ['accent-primary', 'accent-primary-hover', 'accent-primary-active'],
    status: ['success', 'warning', 'error'],
    borders: ['border-primary', 'border-secondary', 'border-focus']
  };

  const colorGroupLabels = {
    backgrounds: 'Background Colors',
    text: 'Text Colors',
    accents: 'Accent Colors',
    status: 'Status Colors',
    borders: 'Border Colors'
  };

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Clean and bright interface for better visibility in well-lit environments',
      icon: Sun,
      preview: 'light'
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Easy on the eyes in low-light conditions and reduces eye strain',
      icon: Moon,
      preview: 'dark'
    },
    {
      id: 'auto' as ThemeMode,
      title: 'Auto Mode',
      description: `Automatically switches based on your system preference (currently ${isSystemDark ? 'dark' : 'light'})`,
      icon: Monitor,
      preview: 'auto'
    }
  ];

  const menuItems = [
    { title: "Dashboard", path: "/", icon: "home", section: "Main" },
    { title: "Campaigns", path: "/campaigns", icon: "megaphone", section: "Tools" },
    { title: "Scheduler", path: "/scheduler", icon: "calendar", section: "Tools" },
    { title: "Location Builder", path: "/location-builder", icon: "map-pin", section: "Tools" },
    { title: "Theme Settings", path: "/admin/theme", icon: "palette", section: "Admin" },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: value
      }
    }));
    
    // Apply the color change immediately
    const rgbValue = hexToRgb(value);
    if (rgbValue) {
      document.documentElement.style.setProperty(`--${colorKey}`, rgbValue);
    }
  };

  const hexToRgb = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r} ${g} ${b}`;
    }
    return null;
  };

  const rgbToHex = (rgb: string): string => {
    const [r, g, b] = rgb.split(' ').map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const resetColors = () => {
    setColors(defaultColors);
    // Reset CSS variables to defaults
    Object.entries(defaultColors).forEach(([key, values]) => {
      const currentTheme = actualTheme;
      const rgbValue = values[currentTheme];
      document.documentElement.style.setProperty(`--${key}`, rgbValue);
    });
  };

  const applyColors = () => {
    Object.entries(colors).forEach(([key, values]) => {
      const currentTheme = actualTheme;
      document.documentElement.style.setProperty(`--${key}`, values[currentTheme]);
    });
  };

  return (
    <SidebarLayout
      menuItems={menuItems}
      nav={
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-white">Admin</h1>
          </div>
        </div>
      }
      category={
        <div className="flex items-center space-x-2 text-white/80 text-sm">
          <Palette className="h-4 w-4" />
          <span>Theme Settings</span>
        </div>
      }
      footer={
        <div className="text-xs text-white/60 text-center">
          <p>Current: {actualTheme} mode</p>
        </div>
      }
    >
      <div className="h-full bg-slate-50 dark:bg-slate-900">
        {/* Page header */}
        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              Global Theme Settings
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Configure the global appearance settings and customize colors for all users. Changes will apply immediately and be saved as the default preference.
          </p>
        </div>

        {/* Main content */}
        <div className="p-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theme Mode Selection */}
            <Card className="mb-6 lg:mb-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Theme Preference
                </CardTitle>
                <CardDescription>
                  Choose how the application should appear. Your selection will be saved and applied across all sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = themeMode === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                        onClick={() => handleThemeChange(option.id)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Theme Preview */}
                          <div className="flex-shrink-0">
                            <ThemePreview mode={option.preview} />
                          </div>
                          
                          {/* Theme Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                              <h3 className={`font-semibold ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'}`}>
                                {option.title}
                              </h3>
                            </div>
                            <p className={`text-sm ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                              {option.description}
                            </p>
                          </div>
                          
                          {/* Selection Indicator */}
                          <div className="flex-shrink-0">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isActive 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Customization
                </CardTitle>
                <CardDescription>
                  Customize theme colors for both light and dark modes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Color Group Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(colorGroupLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={activeColorGroup === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveColorGroup(key)}
                      className="text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Color Controls */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {colorGroups[activeColorGroup as keyof typeof colorGroups]?.map((colorKey) => (
                    <div key={colorKey} className="p-3 border rounded-lg">
                      <Label className="text-sm font-medium mb-2 block capitalize">
                        {colorKey.replace(/-/g, ' ')}
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Light Mode</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={rgbToHex(colors[colorKey]?.light || '255 255 255')}
                              onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                              className="w-12 h-8 p-1 rounded"
                            />
                            <Input
                              type="text"
                              value={rgbToHex(colors[colorKey]?.light || '255 255 255')}
                              onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                              className="text-xs flex-1"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-500 mb-1 block">Dark Mode</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={rgbToHex(colors[colorKey]?.dark || '14 17 23')}
                              onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                              className="w-12 h-8 p-1 rounded"
                            />
                            <Input
                              type="text"
                              value={rgbToHex(colors[colorKey]?.dark || '14 17 23')}
                              onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                              className="text-xs flex-1"
                              placeholder="#0e1117"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Color Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button onClick={applyColors} size="sm" className="flex-1">
                    Apply Colors
                  </Button>
                  <Button onClick={resetColors} variant="outline" size="sm" className="flex items-center gap-1">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>
                Information about the currently active theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme Mode</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {themeMode}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Theme</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {actualTheme}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">System Preference</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {isSystemDark ? 'Dark' : 'Light'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

// Theme Preview Component
const ThemePreview: React.FC<{ mode: string }> = ({ mode }) => {
  return (
    <div className="w-16 h-12 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      {mode === 'auto' ? (
        <div className="flex h-full">
          <div className="flex-1 bg-white">
            <div className="h-2 bg-slate-100 border-b border-slate-200"></div>
            <div className="p-1">
              <div className="h-1 bg-slate-200 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-100 rounded"></div>
            </div>
          </div>
          <div className="flex-1 bg-slate-900">
            <div className="h-2 bg-slate-800 border-b border-slate-700"></div>
            <div className="p-1">
              <div className="h-1 bg-slate-700 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      ) : mode === 'dark' ? (
        <div className="h-full bg-slate-900">
          <div className="h-2 bg-slate-800 border-b border-slate-700"></div>
          <div className="flex">
            <div className="w-3 bg-slate-800 border-r border-slate-700 h-10"></div>
            <div className="flex-1 p-1">
              <div className="h-1 bg-slate-700 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-800 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full bg-white">
          <div className="h-2 bg-slate-100 border-b border-slate-200"></div>
          <div className="flex">
            <div className="w-3 bg-slate-50 border-r border-slate-200 h-10"></div>
            <div className="flex-1 p-1">
              <div className="h-1 bg-slate-200 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-100 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminThemeSettings;
