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

// Default colors that MATCH your existing HSL format
const defaultColors: ThemeColors = {
  // These will be converted to HSL to match your existing CSS
  'background': { light: '0 0% 100%', dark: '222.2 84% 4.9%' },
  'foreground': { light: '222.2 84% 4.9%', dark: '210 40% 98%' },
  'card': { light: '0 0% 100%', dark: '222.2 84% 4.9%' },
  'card-foreground': { light: '222.2 84% 4.9%', dark: '210 40% 98%' },
  'primary': { light: '217 91% 60%', dark: '217 91% 60%' },
  'primary-foreground': { light: '210 40% 98%', dark: '222.2 47.4% 11.2%' },
  'secondary': { light: '210 40% 96.1%', dark: '217.2 32.6% 17.5%' },
  'secondary-foreground': { light: '222.2 47.4% 11.2%', dark: '210 40% 98%' },
  'muted': { light: '210 40% 96.1%', dark: '217.2 32.6% 17.5%' },
  'muted-foreground': { light: '215.4 16.3% 46.9%', dark: '215 20.2% 65.1%' },
  'accent': { light: '210 40% 96.1%', dark: '217.2 32.6% 17.5%' },
  'accent-foreground': { light: '222.2 47.4% 11.2%', dark: '210 40% 98%' },
  'border': { light: '214.3 31.8% 91.4%', dark: '217.2 32.6% 17.5%' },
  'input': { light: '214.3 31.8% 91.4%', dark: '217.2 32.6% 17.5%' },
  // Add your custom variables
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

  // Helper functions to work with both HSL and RGB
  const isHSLFormat = (value: string): boolean => {
    return value.includes('%') || (!value.includes(' ') && value.split(' ').length === 3 && !value.startsWith('#'));
  };

  const hslToHex = (hsl: string): string => {
    if (hsl.startsWith('#')) return hsl;
    
    // Parse HSL string like "217 91% 60%"
    const parts = hsl.split(' ');
    if (parts.length !== 3) return '#3b82f6';
    
    const h = parseInt(parts[0]) / 360;
    const s = parseInt(parts[1]) / 100;
    const l = parseInt(parts[2]) / 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const rgbToHex = (rgb: string): string => {
    if (rgb.startsWith('#')) return rgb;
    if (isHSLFormat(rgb)) return hslToHex(rgb);
    
    const parts = rgb.split(' ');
    if (parts.length !== 3) return '#ffffff';
    
    const r = Math.max(0, Math.min(255, parseInt(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseInt(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseInt(parts[2]) || 0));
    
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHSL = (hex: string): string => {
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hexToRGB = (hex: string): string => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return `${r} ${g} ${b}`;
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    console.log(`🎨 Color change: ${colorKey} (${mode}) = ${value}`);
    
    // Determine the format based on the color key
    let finalValue: string;
    
    if (colorGroups.shadcn.includes(colorKey)) {
      // Shadcn colors should be in HSL format
      finalValue = value.startsWith('#') ? hexToHSL(value) : value;
    } else {
      // Custom colors should be in RGB format
      finalValue = value.startsWith('#') ? hexToRGB(value) : value;
    }
    
    setColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: finalValue
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

    // Force body styling
    cssRules.push(`
      body {
        background-color: hsl(${colors.background[actualTheme]}) !important;
        color: hsl(${colors.foreground[actualTheme]}) !important;
      }
    `);

    // Add utility class overrides
    cssRules.push(`
      .bg-background { background-color: hsl(${colors.background[actualTheme]}) !important; }
      .bg-card { background-color: hsl(${colors.card[actualTheme]}) !important; }
      .bg-primary { background-color: hsl(${colors.primary[actualTheme]}) !important; }
      .bg-secondary { background-color: hsl(${colors.secondary[actualTheme]}) !important; }
      .bg-muted { background-color: hsl(${colors.muted[actualTheme]}) !important; }
      
      .text-foreground { color: hsl(${colors.foreground[actualTheme]}) !important; }
      .text-primary { color: hsl(${colors.primary[actualTheme]}) !important; }
      .text-primary-foreground { color: hsl(${colors['primary-foreground'][actualTheme]}) !important; }
      .text-secondary-foreground { color: hsl(${colors['secondary-foreground'][actualTheme]}) !important; }
      .text-muted-foreground { color: hsl(${colors['muted-foreground'][actualTheme]}) !important; }
      
      .border-border { border-color: hsl(${colors.border[actualTheme]}) !important; }
      .border-input { border-color: hsl(${colors.input[actualTheme]}) !important; }
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