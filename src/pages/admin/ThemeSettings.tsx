
import React, { useState, useEffect } from 'react';
import { Settings, Monitor, Sun, Moon, Palette, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGlobalTheme, type ThemeMode } from '@/contexts/GlobalThemeContext';

const AdminThemeSettings: React.FC = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark, colors, updateColors } = useGlobalTheme();
  const [localColors, setLocalColors] = useState(colors);
  const [activeSection, setActiveSection] = useState('theme');
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

  const sections = [
    { id: 'theme', label: 'Theme Mode', icon: Monitor },
    { id: 'colors', label: 'Colors', icon: Palette },
  ];

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Clean and bright interface',
      icon: Sun,
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Easy on the eyes in low-light',
      icon: Moon,
    },
    {
      id: 'auto' as ThemeMode,
      title: 'Auto Mode',
      description: `Follows system (currently ${isSystemDark ? 'dark' : 'light'})`,
      icon: Monitor,
    }
  ];

  // Color conversion utilities
  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    if (!/^[a-f0-9]{6}$/i.test(cleanHex)) return '255 255 255';
    
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(cleanHex.substr(4, 2), 16);
    
    return `${r} ${g} ${b}`;
  };

  const rgbToHex = (rgb: string): string => {
    if (!rgb) return '#ffffff';
    const parts = rgb.split(' ');
    if (parts.length !== 3) return '#ffffff';
    
    const r = parseInt(parts[0]);
    const g = parseInt(parts[1]);
    const b = parseInt(parts[2]);
    
    const toHex = (num: number) => {
      const hex = num.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    const rgbValue = value.startsWith('#') ? hexToRgb(value) : value;
    
    setLocalColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: rgbValue
      }
    }));
  };

  const applyColors = () => {
    updateColors(localColors);
  };

  const resetColors = () => {
    const defaultColors = {
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
    setLocalColors(defaultColors);
    updateColors(defaultColors);
  };

  // Sync local colors with global colors
  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Global Theme Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure colors and appearance for the entire application
        </p>
      </div>

      {/* Navigation */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl">
        {activeSection === 'theme' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Theme Mode
              </CardTitle>
              <CardDescription>
                Choose how the application should appear
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
                          ? 'border-primary bg-accent'
                          : 'border-border hover:bg-accent/50'
                      }`}
                      onClick={() => setThemeMode(option.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">
                            {option.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isActive ? 'border-primary bg-primary' : 'border-border'
                        }`}>
                          {isActive && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'colors' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Customization
              </CardTitle>
              <CardDescription>
                Customize theme colors for both light and dark modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(colorGroupLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={activeColorGroup === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveColorGroup(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {colorGroups[activeColorGroup as keyof typeof colorGroups]?.map((colorKey) => (
                  <div key={colorKey} className="p-3 border border-border rounded-lg">
                    <Label className="text-sm font-medium mb-2 block capitalize">
                      {colorKey.replace(/-/g, ' ')}
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Light Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(localColors[colorKey]?.light || '255 255 255')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(localColors[colorKey]?.light || '255 255 255')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="flex-1 text-xs"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Dark Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(localColors[colorKey]?.dark || '14 17 23')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="w-12 h-8 p-1"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(localColors[colorKey]?.dark || '14 17 23')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="flex-1 text-xs"
                            placeholder="#0e1117"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button onClick={applyColors} className="flex-1">
                  Apply Colors
                </Button>
                <Button onClick={resetColors} variant="outline" className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Theme configuration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Theme Mode</div>
                <div className="text-lg font-semibold capitalize">
                  {themeMode}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Active Theme</div>
                <div className="text-lg font-semibold capitalize">
                  {actualTheme}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">System</div>
                <div className="text-lg font-semibold capitalize">
                  {isSystemDark ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminThemeSettings;
