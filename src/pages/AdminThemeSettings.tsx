import React, { useState, useEffect } from 'react';
import { Monitor, Sun, Moon, Palette, RotateCcw } from 'lucide-react';

// Use your actual imports - replace these:
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

// Mock components - REPLACE WITH YOUR ACTUAL IMPORTS
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 mb-4">{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight text-foreground ${className}`}>{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground mt-1.5">{children}</p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
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
  const baseClass = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
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
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium leading-none text-foreground ${className}`}>
    {children}
  </label>
);

// Mock theme hook - REPLACE WITH YOUR ACTUAL IMPORT
const useGlobalTheme = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
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

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  [key: string]: {
    light: string;
    dark: string;
  };
}

// Colors that match your existing CSS structure (HSL format)
const defaultColors: ThemeColors = {
  // Your existing shadcn variables (HSL format to match globals.css)
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
  'ring': { light: '222.2 84% 4.9%', dark: '212.7 26.8% 83.9%' },
  
  // Your custom RGB variables (RGB format to match your CSS comments)
  'bg-primary': { light: '255 255 255', dark: '14 17 23' },
  'bg-secondary': { light: '251 252 253', dark: '22 27 34' },
  'bg-tertiary': { light: '248 249 250', dark: '33 38 45' },
  'bg-hover': { light: '241 243 245', dark: '48 54 61' },
  'text-primary': { light: '26 32 44', dark: '240 246 252' },
  'text-secondary': { light: '74 85 104', dark: '125 133 144' },
  'text-tertiary': { light: '113 128 150', dark: '101 109 118' },
  'accent-primary': { light: '49 130 206', dark: '56 139 253' },
  'border-primary': { light: '226 232 240', dark: '48 54 61' },
};

const AdminThemeSettings = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark } = useGlobalTheme();
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [activeSection, setActiveSection] = useState('theme');
  const [activeColorGroup, setActiveColorGroup] = useState('shadcn');

  const colorGroups = {
    shadcn: ['background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground', 'border', 'input'],
    custom: ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-hover', 'text-primary', 'text-secondary', 'text-tertiary', 'accent-primary', 'border-primary']
  };

  const colorGroupLabels = {
    shadcn: 'Shadcn/UI Variables (HSL)',
    custom: 'Custom Variables (RGB)'
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

  // Detect if a color value is HSL or RGB format
  const isHSLFormat = (value: string): boolean => {
    return value.includes('%') || /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(value);
  };

  // Convert hex to HSL (for shadcn variables)
  const hexToHSL = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

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

  // Convert hex to RGB (for custom variables)
  const hexToRGB = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  };

  // Convert HSL to hex for color picker
  const hslToHex = (hsl: string): string => {
    const parts = hsl.split(' ');
    if (parts.length !== 3) return '#000000';
    
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

    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert RGB to hex for color picker
  const rgbToHex = (rgb: string): string => {
    if (rgb.startsWith('#')) return rgb;
    
    const parts = rgb.split(' ');
    if (parts.length !== 3) return '#ffffff';
    
    const r = Math.max(0, Math.min(255, parseInt(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseInt(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseInt(parts[2]) || 0));
    
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Smart color conversion based on variable type
  const convertColorForVariable = (colorKey: string, hexValue: string): string => {
    if (colorGroups.shadcn.includes(colorKey)) {
      // Shadcn variables use HSL format
      return hexToHSL(hexValue);
    } else {
      // Custom variables use RGB format
      return hexToRGB(hexValue);
    }
  };

  // Smart color to hex conversion
  const colorToHex = (colorKey: string, colorValue: string): string => {
    if (colorGroups.shadcn.includes(colorKey)) {
      // HSL format
      return hslToHex(colorValue);
    } else {
      // RGB format
      return rgbToHex(colorValue);
    }
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    console.log(`🎨 Color change: ${colorKey} (${mode}) = "${value}"`);
    
    // Convert based on variable type
    const convertedValue = convertColorForVariable(colorKey, value);
    console.log(`🔄 Converted value: "${convertedValue}"`);
    
    setColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: convertedValue
      }
    }));
  };

  // CSS-Compatible theme application
  const applyTheme = () => {
    console.log('🎯 CSS-COMPATIBLE THEME APPLICATION');
    console.log('Theme:', actualTheme);

    // Remove existing overrides
    const existing = document.getElementById('css-compatible-theme-override');
    if (existing) existing.remove();

    // Apply theme classes that match your CSS
    document.documentElement.className = '';
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.setAttribute('data-theme', actualTheme);

    // Create CSS that works with your existing structure
    const style = document.createElement('style');
    style.id = 'css-compatible-theme-override';

    // Generate CSS that matches your existing format
    const rootVars = Object.entries(colors).map(([key, values]) => {
      const value = values[actualTheme];
      return `  --${key}: ${value};`;
    }).join('\n');

    const darkVars = actualTheme === 'dark' ? Object.entries(colors).map(([key, values]) => {
      const value = values.dark;
      return `  --${key}: ${value};`;
    }).join('\n') : '';

    const css = `
      /* CSS-Compatible Theme Override */
      :root {
${rootVars}
      }
      
      ${actualTheme === 'dark' ? `.dark {\n${darkVars}\n}` : ''}

      /* Force body styling with proper format */
      body {
        background-color: hsl(${colors.background[actualTheme]}) !important;
        color: hsl(${colors.foreground[actualTheme]}) !important;
        transition: all 0.3s ease !important;
      }

      /* Override utility classes with proper format */
      .bg-background { background-color: hsl(${colors.background[actualTheme]}) !important; }
      .bg-card { background-color: hsl(${colors.card[actualTheme]}) !important; }
      .bg-primary { background-color: hsl(${colors.primary[actualTheme]}) !important; }
      .bg-secondary { background-color: hsl(${colors.secondary[actualTheme]}) !important; }
      .bg-muted { background-color: hsl(${colors.muted[actualTheme]}) !important; }
      
      .text-foreground { color: hsl(${colors.foreground[actualTheme]}) !important; }
      .text-card-foreground { color: hsl(${colors['card-foreground'][actualTheme]}) !important; }
      .text-primary { color: hsl(${colors.primary[actualTheme]}) !important; }
      .text-primary-foreground { color: hsl(${colors['primary-foreground'][actualTheme]}) !important; }
      .text-secondary-foreground { color: hsl(${colors['secondary-foreground'][actualTheme]}) !important; }
      .text-muted-foreground { color: hsl(${colors['muted-foreground'][actualTheme]}) !important; }
      
      .border-border { border-color: hsl(${colors.border[actualTheme]}) !important; }
      .border-input { border-color: hsl(${colors.input[actualTheme]}) !important; }

      /* Custom RGB variables (for your custom CSS) */
      ${Object.entries(colors).filter(([key]) => colorGroups.custom.includes(key)).map(([key, values]) => {
        const value = values[actualTheme];
        return `.theme-${key.replace(/-/g, '-')} { background-color: rgb(${value}) !important; }`;
      }).join('\n      ')}
    `;

    style.textContent = css;
    document.head.appendChild(style);

    console.log('✅ CSS-compatible theme applied');
  };

  const resetColors = () => {
    console.log('🔄 Resetting to defaults');
    setColors(defaultColors);
  };

  // Apply theme when colors or actualTheme changes
  useEffect(() => {
    applyTheme();
  }, [colors, actualTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            🎯 CSS-Compatible Theme System
          </h1>
        </div>
        <p className="text-muted-foreground">
          Properly integrated with your existing globals.css structure
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
              <CardDescription>Choose your preferred theme</CardDescription>
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
                🎯 CSS-Compatible Colors
              </CardTitle>
              <CardDescription>
                Properly formatted for your existing CSS structure
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

              {/* Quick Tests */}
              <div className="mb-6 p-4 border border-border rounded-lg bg-secondary">
                <h4 className="text-sm font-semibold mb-3 text-foreground">🧪 Quick Tests</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleColorChange('primary', actualTheme, '#3b82f6')}
                  >
                    🔵 Set Primary Blue
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleColorChange('background', actualTheme, '#ffffff')}
                  >
                    ⚪ Set Background White
                  </Button>
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-6 max-h-96 overflow-y-auto">
                {colorGroups[activeColorGroup as keyof typeof colorGroups]?.map((colorKey) => (
                  <div key={colorKey} className="p-4 border border-border rounded-lg bg-card">
                    <h4 className="text-sm font-medium mb-3 text-foreground">
                      --{colorKey}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({colorGroups.shadcn.includes(colorKey) ? 'HSL' : 'RGB'} format)
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Light Mode */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Light Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={colorToHex(colorKey, colors[colorKey]?.light || '')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={colorToHex(colorKey, colors[colorKey]?.light || '')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#ffffff"
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          Value: {colors[colorKey]?.light || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Dark Mode */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Dark Mode</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={colorToHex(colorKey, colors[colorKey]?.dark || '')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={colorToHex(colorKey, colors[colorKey]?.dark || '')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#000000"
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-mono">
                          Value: {colors[colorKey]?.dark || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-border">
                <Button onClick={applyTheme} className="flex-1">
                  🎯 Apply Theme
                </Button>
                <Button onClick={resetColors} variant="outline" className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Reset All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🎯 CSS Integration Status</CardTitle>
            <CardDescription>Current theme configuration and format verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Theme</div>
                <div className="text-lg font-semibold text-foreground capitalize">{actualTheme}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Primary (HSL)</div>
                <div className="text-sm font-mono text-foreground">
                  {colors.primary?.[actualTheme] || 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">BG Primary (RGB)</div>
                <div className="text-sm font-mono text-foreground">
                  {colors['bg-primary']?.[actualTheme] || 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="p-4 border border-border rounded-lg bg-card">
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                🎨 Live Preview
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-background border border-border rounded">
                  <p className="text-foreground">Background with foreground text (HSL format)</p>
                </div>
                <div className="p-3 bg-primary rounded">
                  <p className="text-primary-foreground">Primary background with primary text (HSL format)</p>
                </div>
                <div className="p-3 bg-card border border-border rounded">
                  <p className="text-card-foreground">Card background with card text (HSL format)</p>
                </div>
                <div className="p-3 bg-secondary rounded">
                  <p className="text-secondary-foreground">Secondary background (HSL format)</p>
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