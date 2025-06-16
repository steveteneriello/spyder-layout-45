import React, { useState, useEffect } from 'react';
import { Settings, Monitor, Sun, Moon, Palette, RotateCcw, Upload, Type, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  [key: string]: {
    light: string;
    dark: string;
  };
}

// Mock the GlobalThemeContext - replace with your actual import
const useGlobalTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isSystemDark, setIsSystemDark] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const actualTheme: 'light' | 'dark' = themeMode === 'auto' ? (isSystemDark ? 'dark' : 'light') : themeMode as 'light' | 'dark';
  
  return { themeMode, actualTheme, setThemeMode, isSystemDark };
};

// SIMPLIFIED Default colors using RGB format (the working approach)
const defaultColors: ThemeColors = {
  // Use RGB format for everything - this was working!
  'background': { light: '255 255 255', dark: '15 23 42' },
  'foreground': { light: '15 23 42', dark: '248 250 252' },
  'card': { light: '248 250 252', dark: '30 41 59' },
  'card-foreground': { light: '15 23 42', dark: '248 250 252' },
  'primary': { light: '37 99 235', dark: '59 130 246' },
  'primary-foreground': { light: '248 250 252', dark: '15 23 42' },
  'secondary': { light: '241 245 249', dark: '51 65 85' },
  'secondary-foreground': { light: '71 85 105', dark: '148 163 184' },
  'muted': { light: '241 245 249', dark: '51 65 85' },
  'muted-foreground': { light: '148 163 184', dark: '100 116 139' },
  'accent': { light: '226 232 240', dark: '71 85 105' },
  'accent-foreground': { light: '15 23 42', dark: '248 250 252' },
  'border': { light: '226 232 240', dark: '51 65 85' },
  'input': { light: '226 232 240', dark: '51 65 85' },
  // Custom variables
  'bg-primary': { light: '255 255 255', dark: '15 23 42' },
  'bg-secondary': { light: '248 250 252', dark: '30 41 59' },
  'bg-tertiary': { light: '241 245 249', dark: '51 65 85' },
  'bg-hover': { light: '226 232 240', dark: '71 85 105' },
  'text-primary': { light: '15 23 42', dark: '248 250 252' },
  'text-secondary': { light: '71 85 105', dark: '148 163 184' },
  'text-tertiary': { light: '148 163 184', dark: '100 116 139' },
  'border-primary': { light: '226 232 240', dark: '51 65 85' },
  'accent-primary': { light: '37 99 235', dark: '59 130 246' },
};

const AdminThemeSettings = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark } = useGlobalTheme();
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [activeSection, setActiveSection] = useState('theme');
  const [activeColorGroup, setActiveColorGroup] = useState('shadcn');

  const colorGroups = {
    shadcn: ['background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'border', 'input'],
    custom: ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-hover', 'text-primary', 'text-secondary', 'text-tertiary', 'border-primary', 'accent-primary']
  };

  const colorGroupLabels = {
    shadcn: 'Shadcn/UI Variables',
    custom: 'Custom Variables'
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

  // FIXED COLOR CONVERSION FUNCTIONS (from working version)
  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    if (!/^[a-f0-9]{6}$/i.test(cleanHex)) {
      console.warn('Invalid hex format:', hex);
      return '255 255 255';
    }
    
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    const result = `${r} ${g} ${b}`;
    console.log(`✅ Converted ${hex} to RGB: ${result}`);
    return result;
  };

  const rgbToHex = (rgb: string): string => {
    if (!rgb || typeof rgb !== 'string') {
      return '#ffffff';
    }
    
    const parts = rgb.trim().split(' ').filter(p => p !== '');
    if (parts.length !== 3) {
      console.warn('Invalid RGB format:', rgb);
      return '#ffffff';
    }
    
    const r = Math.max(0, Math.min(255, parseInt(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseInt(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseInt(parts[2]) || 0));
    
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    const result = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    
    console.log(`✅ Converted RGB "${rgb}" to hex: ${result}`);
    return result;
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    console.log(`🎨 Color change: ${colorKey} (${mode}) = ${value}`);
    
    // Use RGB format for all colors (the working approach)
    const rgbValue = value.startsWith('#') ? hexToRgb(value) : value;
    
    setColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: rgbValue
      }
    }));
  };

  // PROPER THEME APPLICATION that works with your existing CSS
  const applyTheme = () => {
    console.log('🎯 APPLYING THEME PROPERLY...');
    console.log('Theme:', actualTheme);
    console.log('Colors:', colors);

    // Remove existing overrides
    const existing = document.getElementById('admin-theme-override');
    if (existing) existing.remove();

    // Apply theme class
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Create style element with proper CSS
    const style = document.createElement('style');
    style.id = 'admin-theme-override';

    // Generate CSS that works with your existing system
    const cssRules = [];

    // Override root variables
    const rootVars = Object.entries(colors).map(([key, values]) => {
      const value = values[actualTheme];
      return `  --${key}: ${value};`;
    }).join('\n');

    cssRules.push(`:root {\n${rootVars}\n}`);

    // Override dark mode variables if in dark mode
    if (actualTheme === 'dark') {
      const darkVars = Object.entries(colors).map(([key, values]) => {
        const value = values.dark;
        return `  --${key}: ${value};`;
      }).join('\n');

      cssRules.push(`.dark {\n${darkVars}\n}`);
    }

    // Force body styling using RGB format (the working approach)
    cssRules.push(`
      body {
        background-color: rgb(${colors.background[actualTheme]}) !important;
        color: rgb(${colors.foreground[actualTheme]}) !important;
      }
    `);

    // Add utility class overrides using RGB format
    cssRules.push(`
      .bg-background { background-color: rgb(${colors.background[actualTheme]}) !important; }
      .bg-card { background-color: rgb(${colors.card[actualTheme]}) !important; }
      .bg-primary { background-color: rgb(${colors.primary[actualTheme]}) !important; }
      .bg-secondary { background-color: rgb(${colors.secondary[actualTheme]}) !important; }
      .bg-muted { background-color: rgb(${colors.muted[actualTheme]}) !important; }
      
      .text-foreground { color: rgb(${colors.foreground[actualTheme]}) !important; }
      .text-primary { color: rgb(${colors.primary[actualTheme]}) !important; }
      .text-primary-foreground { color: rgb(${colors['primary-foreground'][actualTheme]}) !important; }
      .text-secondary-foreground { color: rgb(${colors['secondary-foreground'][actualTheme]}) !important; }
      .text-muted-foreground { color: rgb(${colors['muted-foreground'][actualTheme]}) !important; }
      
      .border-border { border-color: rgb(${colors.border[actualTheme]}) !important; }
      .border-input { border-color: rgb(${colors.input[actualTheme]}) !important; }
    `);

    style.textContent = cssRules.join('\n\n');
    document.head.appendChild(style);

    console.log('✅ Theme applied successfully');
  };

  const resetColors = () => {
    setColors(defaultColors);
    setTimeout(() => applyTheme(), 100);
  };

  // Apply theme when colors or actualTheme changes
  useEffect(() => {
    applyTheme();
  }, [colors, actualTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            ✅ Working Admin Theme Settings
          </h1>
        </div>
        <p className="text-muted-foreground">
          Properly integrated with your existing CSS system
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
      <div className="p-6 max-w-4xl mx-auto">
        {activeSection === 'theme' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Theme Mode
              </CardTitle>
              <CardDescription>Choose how the application should appear</CardDescription>
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
                        isActive ? 'border-primary bg-accent' : 'border-border hover:bg-accent/50'
                      }`}
                      onClick={() => setThemeMode(option.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 text-foreground">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
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
                <Palette className="h-5 w-5 text-primary" />
                ✅ Integrated Color System
              </CardTitle>
              <CardDescription>
                Colors are properly applied to your existing CSS variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Color Group Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
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

              {/* Color Controls */}
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {colorGroups[activeColorGroup as keyof typeof colorGroups]?.map((colorKey) => (
                  <div key={colorKey} className="p-4 border border-border rounded-lg bg-card">
                    <h4 className="text-sm font-medium mb-3 text-foreground">
                      --{colorKey}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Light Mode */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Light Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(colors[colorKey]?.light || '#ffffff')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(colors[colorKey]?.light || '#ffffff')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#ffffff"
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          Current: {colors[colorKey]?.light || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Dark Mode */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Dark Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(colors[colorKey]?.dark || '#000000')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(colors[colorKey]?.dark || '#000000')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#000000"
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          Current: {colors[colorKey]?.dark || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <Button onClick={applyTheme} className="flex-1">
                  ✅ Apply Theme
                </Button>
                <Button onClick={resetColors} variant="outline" className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status & Preview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>✅ Working Theme System</CardTitle>
            <CardDescription>Current status and live preview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Theme Mode</div>
                <div className="text-lg font-semibold text-foreground capitalize">{themeMode}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Active Theme</div>
                <div className="text-lg font-semibold text-foreground capitalize">{actualTheme}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">CSS Format</div>
                <div className="text-lg font-semibold text-foreground">HSL + RGB</div>
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                🎨 Live Preview (Theme: {actualTheme})
              </h4>
              <div className="space-y-4">
                <div className="p-3 bg-background border border-border rounded">
                  <p className="text-foreground">Background with foreground text</p>
                </div>
                <div className="p-3 bg-card border border-border rounded">
                  <p className="text-card-foreground">Card background with card text</p>
                </div>
                <div className="p-3 bg-primary rounded">
                  <p className="text-primary-foreground">Primary background with primary text</p>
                </div>
                <div className="p-3 bg-secondary rounded">
                  <p className="text-secondary-foreground">Secondary background with secondary text</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-muted-foreground">Muted background with muted text</p>
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