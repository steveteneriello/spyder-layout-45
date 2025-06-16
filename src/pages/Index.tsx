import React, { useState, useEffect } from 'react';
import { Monitor, Sun, Moon, Palette, RotateCcw } from 'lucide-react';

// Mock your existing components - replace these imports with your actual ones
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// Temporary components for demo - replace with your actual imports
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) => {
  const baseClass = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  };
  const sizes = {
    sm: 'h-9 px-3',
    default: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };
  
  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '' 
}: {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

// FORCE COLOR OVERRIDE SYSTEM
type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  [key: string]: {
    light: string;
    dark: string;
  };
}

// Corrected default colors with proper RGB values
const defaultColors: ThemeColors = {
  'bg-primary': { light: '255 255 255', dark: '15 23 42' },      // Pure white / Slate 800
  'bg-secondary': { light: '248 250 252', dark: '30 41 59' },    // Slate 50 / Slate 700
  'bg-tertiary': { light: '241 245 249', dark: '51 65 85' },     // Slate 100 / Slate 600
  'bg-hover': { light: '226 232 240', dark: '71 85 105' },       // Slate 200 / Slate 500
  'text-primary': { light: '15 23 42', dark: '248 250 252' },    // Slate 800 / Slate 50
  'text-secondary': { light: '71 85 105', dark: '148 163 184' }, // Slate 500 / Slate 400
  'text-tertiary': { light: '148 163 184', dark: '100 116 139' }, // Slate 400 / Slate 500
  'text-inverse': { light: '248 250 252', dark: '15 23 42' },    // Slate 50 / Slate 800
  'accent-primary': { light: '37 99 235', dark: '59 130 246' },  // Blue 600 / Blue 500
  'accent-hover': { light: '29 78 216', dark: '37 99 235' },     // Blue 700 / Blue 600
  'success': { light: '22 163 74', dark: '34 197 94' },          // Green 600 / Green 500
  'warning': { light: '234 179 8', dark: '250 204 21' },         // Yellow 600 / Yellow 400
  'error': { light: '220 38 38', dark: '248 113 113' },          // Red 600 / Red 400
  'border-primary': { light: '226 232 240', dark: '51 65 85' },  // Slate 200 / Slate 600
  'border-focus': { light: '37 99 235', dark: '59 130 246' },    // Blue 600 / Blue 500
};

const AdminThemeSettings: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [activeSection, setActiveSection] = useState('theme');
  const [activeColorGroup, setActiveColorGroup] = useState('backgrounds');

  // Detect system theme
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

  const colorGroups = {
    backgrounds: ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-hover'],
    text: ['text-primary', 'text-secondary', 'text-tertiary', 'text-inverse'],
    accents: ['accent-primary', 'accent-hover'],
    status: ['success', 'warning', 'error'],
    borders: ['border-primary', 'border-focus']
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
    { id: 'light' as ThemeMode, title: 'Light Mode', description: 'Clean and bright interface', icon: Sun },
    { id: 'dark' as ThemeMode, title: 'Dark Mode', description: 'Easy on the eyes in low-light', icon: Moon },
    { id: 'auto' as ThemeMode, title: 'Auto Mode', description: `Follows system (currently ${isSystemDark ? 'dark' : 'light'})`, icon: Monitor },
  ];

  // FORCE THEME APPLICATION - This is the key fix
  const forceApplyTheme = () => {
    console.log('🔥 FORCE APPLYING THEME:', actualTheme);
    console.log('🎨 Colors to apply:', colors);

    // Remove any existing theme classes
    document.documentElement.className = '';
    document.body.className = '';

    // Set theme mode
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // FORCE override all CSS variables with !important
    const style = document.createElement('style');
    style.id = 'force-theme-override';
    
    // Remove existing override if it exists
    const existing = document.getElementById('force-theme-override');
    if (existing) {
      existing.remove();
    }

    const currentColors = Object.entries(colors).map(([key, values]) => {
      const colorValue = values[actualTheme];
      return `--${key}: ${colorValue}`;
    }).join('; ');

    // Map to shadcn variables with proper values
    const shadcnVars = [
      `--background: ${colors['bg-primary'][actualTheme]}`,
      `--foreground: ${colors['text-primary'][actualTheme]}`,
      `--card: ${colors['bg-secondary'][actualTheme]}`,
      `--card-foreground: ${colors['text-primary'][actualTheme]}`,
      `--popover: ${colors['bg-secondary'][actualTheme]}`,
      `--popover-foreground: ${colors['text-primary'][actualTheme]}`,
      `--primary: ${colors['accent-primary'][actualTheme]}`,
      `--primary-foreground: ${colors['text-inverse'][actualTheme]}`,
      `--secondary: ${colors['bg-tertiary'][actualTheme]}`,
      `--secondary-foreground: ${colors['text-secondary'][actualTheme]}`,
      `--muted: ${colors['bg-tertiary'][actualTheme]}`,
      `--muted-foreground: ${colors['text-tertiary'][actualTheme]}`,
      `--accent: ${colors['bg-hover'][actualTheme]}`,
      `--accent-foreground: ${colors['text-primary'][actualTheme]}`,
      `--destructive: ${colors['error'][actualTheme]}`,
      `--destructive-foreground: ${colors['text-inverse'][actualTheme]}`,
      `--border: ${colors['border-primary'][actualTheme]}`,
      `--input: ${colors['border-primary'][actualTheme]}`,
      `--ring: ${colors['border-focus'][actualTheme]}`,
    ].join('; ');

    // Create CSS that forces the theme with !important
    style.textContent = `
      :root {
        ${currentColors} !important;
        ${shadcnVars} !important;
      }
      
      body {
        background-color: rgb(${colors['bg-primary'][actualTheme]}) !important;
        color: rgb(${colors['text-primary'][actualTheme]}) !important;
        transition: background-color 0.3s ease, color 0.3s ease !important;
      }
      
      /* Force all background utilities */
      .bg-background { background-color: rgb(${colors['bg-primary'][actualTheme]}) !important; }
      .bg-card { background-color: rgb(${colors['bg-secondary'][actualTheme]}) !important; }
      .bg-secondary { background-color: rgb(${colors['bg-tertiary'][actualTheme]}) !important; }
      .bg-primary { background-color: rgb(${colors['accent-primary'][actualTheme]}) !important; }
      .bg-muted { background-color: rgb(${colors['bg-tertiary'][actualTheme]}) !important; }
      
      /* Force all text utilities */
      .text-foreground { color: rgb(${colors['text-primary'][actualTheme]}) !important; }
      .text-primary { color: rgb(${colors['accent-primary'][actualTheme]}) !important; }
      .text-secondary { color: rgb(${colors['text-secondary'][actualTheme]}) !important; }
      .text-muted-foreground { color: rgb(${colors['text-tertiary'][actualTheme]}) !important; }
      .text-card-foreground { color: rgb(${colors['text-primary'][actualTheme]}) !important; }
      .text-primary-foreground { color: rgb(${colors['text-inverse'][actualTheme]}) !important; }
      
      /* Force all border utilities */
      .border-border { border-color: rgb(${colors['border-primary'][actualTheme]}) !important; }
      .border-input { border-color: rgb(${colors['border-primary'][actualTheme]}) !important; }
      
      /* Force button styles */
      button.bg-primary { background-color: rgb(${colors['accent-primary'][actualTheme]}) !important; }
      button.text-primary-foreground { color: rgb(${colors['text-inverse'][actualTheme]}) !important; }
    `;

    document.head.appendChild(style);

    console.log('✅ Theme force applied with CSS injection');
  };

  // Color conversion utilities
  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    if (!/^[a-f0-9]{6}$/i.test(cleanHex)) return '255 255 255';
    
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `${r} ${g} ${b}`;
  };

  const rgbToHex = (rgb: string): string => {
    if (!rgb) return '#ffffff';
    
    const parts = rgb.trim().split(' ');
    if (parts.length !== 3) return '#ffffff';
    
    const r = Math.max(0, Math.min(255, parseInt(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseInt(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseInt(parts[2]) || 0));
    
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    const rgbValue = value.startsWith('#') ? hexToRgb(value) : value;
    
    setColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: rgbValue
      }
    }));
  };

  const applyColors = () => {
    console.log('🚀 APPLYING COLORS...');
    forceApplyTheme();
  };

  const resetColors = () => {
    console.log('🔄 RESETTING COLORS...');
    setColors(defaultColors);
    // Apply reset immediately
    setTimeout(() => forceApplyTheme(), 100);
  };

  // Apply theme when mode or colors change
  useEffect(() => {
    forceApplyTheme();
  }, [actualTheme, colors]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            🔥 FORCE Color Override System
          </h1>
        </div>
        <p className="text-muted-foreground">
          This system FORCES color changes by injecting CSS with !important
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
                🔥 Force Color Override
              </CardTitle>
              <CardDescription>Colors are applied with CSS injection and !important</CardDescription>
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
                    <h4 className="text-sm font-medium mb-3 capitalize text-foreground">
                      {colorKey.replace(/-/g, ' ')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Light Mode */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Light Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(colors[colorKey]?.light || '255 255 255')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(colors[colorKey]?.light || '255 255 255')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#ffffff"
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          RGB: {colors[colorKey]?.light || '255 255 255'}
                        </div>
                      </div>
                      
                      {/* Dark Mode */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Dark Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(colors[colorKey]?.dark || '15 23 42')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(colors[colorKey]?.dark || '15 23 42')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#0f172a"
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          RGB: {colors[colorKey]?.dark || '15 23 42'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Color Preview */}
                    <div className="mt-3 flex gap-2 items-center">
                      <div 
                        className="w-8 h-8 rounded border-2 border-border"
                        style={{ backgroundColor: `rgb(${colors[colorKey]?.light || '255 255 255'})` }}
                        title="Light mode"
                      />
                      <div 
                        className="w-8 h-8 rounded border-2 border-border"
                        style={{ backgroundColor: `rgb(${colors[colorKey]?.dark || '15 23 42'})` }}
                        title="Dark mode"
                      />
                      <div 
                        className="w-8 h-8 rounded border-4 border-primary"
                        style={{ backgroundColor: `rgb(${colors[colorKey]?.[actualTheme] || '255 255 255'})` }}
                        title="Current theme (active)"
                      />
                      <span className="text-xs text-muted-foreground ml-2">
                        Current: {colors[colorKey]?.[actualTheme] || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <Button onClick={applyColors} className="flex-1">
                  🔥 FORCE Apply Colors
                </Button>
                <Button onClick={resetColors} variant="outline" className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔧 Debug Information</CardTitle>
            <CardDescription>Current theme status and applied colors</CardDescription>
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
                <div className="text-sm font-medium text-muted-foreground">System</div>
                <div className="text-lg font-semibold text-foreground capitalize">
                  {isSystemDark ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>
            
            {/* Live Color Test */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                🎨 Live Color Test (Theme: {actualTheme})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'bg-primary', label: 'Primary BG' },
                  { key: 'accent-primary', label: 'Primary Accent' },
                  { key: 'text-primary', label: 'Primary Text' },
                  { key: 'border-primary', label: 'Primary Border' }
                ].map(({ key, label }) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-12 h-12 mx-auto rounded border-2 border-border mb-2 flex items-center justify-center" 
                      style={{ backgroundColor: `rgb(${colors[key]?.[actualTheme] || '255 255 255'})` }}
                    >
                      {key.includes('text') && (
                        <span 
                          className="text-lg font-bold"
                          style={{ color: `rgb(${colors[key]?.[actualTheme] || '15 23 42'})` }}
                        >
                          Aa
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {colors[key]?.[actualTheme] || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminThemeSettings;