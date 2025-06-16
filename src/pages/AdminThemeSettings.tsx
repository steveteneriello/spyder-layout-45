import React, { useState, useEffect, createContext, useContext } from 'react';
import { Settings, Monitor, Sun, Moon, Palette, RotateCcw, Upload, Type, Image } from 'lucide-react';

// ===== THEME CONTEXT =====
type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  [key: string]: {
    light: string;
    dark: string;
  };
}

interface GlobalThemeContextType {
  themeMode: ThemeMode;
  actualTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  isSystemDark: boolean;
  colors: ThemeColors;
  updateColors: (colors: ThemeColors) => void;
  applyTheme: () => void;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export const useGlobalTheme = () => {
  const context = useContext(GlobalThemeContext);
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
};

// CORRECTED Default theme colors - these are the proper values
const defaultColors: ThemeColors = {
  'bg-primary': { light: '255 255 255', dark: '15 23 42' },      // Pure white / Slate 800
  'bg-secondary': { light: '248 250 252', dark: '30 41 59' },    // Slate 50 / Slate 700
  'bg-tertiary': { light: '241 245 249', dark: '51 65 85' },     // Slate 100 / Slate 600
  'bg-hover': { light: '226 232 240', dark: '71 85 105' },       // Slate 200 / Slate 500
  'bg-active': { light: '203 213 225', dark: '100 116 139' },    // Slate 300 / Slate 400
  'bg-selected': { light: '219 234 254', dark: '30 58 138' },    // Blue 100 / Blue 800
  'text-primary': { light: '15 23 42', dark: '248 250 252' },    // Slate 800 / Slate 50
  'text-secondary': { light: '71 85 105', dark: '148 163 184' }, // Slate 500 / Slate 400
  'text-tertiary': { light: '148 163 184', dark: '100 116 139' }, // Slate 400 / Slate 500
  'text-inverse': { light: '248 250 252', dark: '15 23 42' },    // Slate 50 / Slate 800
  'accent-primary': { light: '37 99 235', dark: '59 130 246' },  // Blue 600 / Blue 500
  'accent-primary-hover': { light: '29 78 216', dark: '37 99 235' }, // Blue 700 / Blue 600
  'accent-primary-active': { light: '30 64 175', dark: '29 78 216' }, // Blue 800 / Blue 700
  'success': { light: '22 163 74', dark: '34 197 94' },          // Green 600 / Green 500
  'warning': { light: '234 179 8', dark: '250 204 21' },         // Yellow 600 / Yellow 400
  'error': { light: '220 38 38', dark: '248 113 113' },          // Red 600 / Red 400
  'border-primary': { light: '226 232 240', dark: '51 65 85' },  // Slate 200 / Slate 600
  'border-secondary': { light: '241 245 249', dark: '30 41 59' }, // Slate 100 / Slate 700
  'border-focus': { light: '37 99 235', dark: '59 130 246' },    // Blue 600 / Blue 500
};

export const GlobalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(defaultColors);

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

  // Calculate actual theme
  const actualTheme: 'light' | 'dark' = themeMode === 'auto' ? (isSystemDark ? 'dark' : 'light') : themeMode as 'light' | 'dark';

  const applyTheme = () => {
    console.log('🎨 Applying theme:', actualTheme);
    console.log('🎯 Colors:', colors);

    // Set theme attribute
    document.documentElement.setAttribute('data-theme', actualTheme);
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }

    // Apply all color variables with rgb() wrapper
    Object.entries(colors).forEach(([key, values]) => {
      const colorValue = values[actualTheme];
      document.documentElement.style.setProperty(`--${key}`, colorValue);
      // Also set without prefix for easier access
      document.documentElement.style.setProperty(`--color-${key}`, `rgb(${colorValue})`);
    });

    // Map to standard shadcn variables
    const standardMapping = {
      'background': colors['bg-primary'][actualTheme],
      'foreground': colors['text-primary'][actualTheme],
      'card': colors['bg-secondary'][actualTheme],
      'card-foreground': colors['text-primary'][actualTheme],
      'primary': colors['accent-primary'][actualTheme],
      'primary-foreground': colors['text-inverse'][actualTheme],
      'secondary': colors['bg-tertiary'][actualTheme],
      'secondary-foreground': colors['text-secondary'][actualTheme],
      'muted': colors['bg-tertiary'][actualTheme],
      'muted-foreground': colors['text-tertiary'][actualTheme],
      'accent': colors['bg-hover'][actualTheme],
      'accent-foreground': colors['text-primary'][actualTheme],
      'destructive': colors['error'][actualTheme],
      'destructive-foreground': colors['text-inverse'][actualTheme],
      'border': colors['border-primary'][actualTheme],
      'input': colors['border-primary'][actualTheme],
      'ring': colors['border-focus'][actualTheme],
    };

    Object.entries(standardMapping).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // Force body styles
    const bodyStyle = document.body.style;
    bodyStyle.backgroundColor = `rgb(${colors['bg-primary'][actualTheme]})`;
    bodyStyle.color = `rgb(${colors['text-primary'][actualTheme]})`;
    bodyStyle.transition = 'background-color 0.2s ease, color 0.2s ease';

    console.log('✅ Theme applied successfully');
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const updateColors = (newColors: ThemeColors) => {
    console.log('🔄 Updating colors:', newColors);
    setColors(newColors);
    localStorage.setItem('theme-colors', JSON.stringify(newColors));
  };

  // Apply theme when actualTheme or colors change
  useEffect(() => {
    applyTheme();
  }, [actualTheme, colors]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedColors = localStorage.getItem('theme-colors');
    
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      setThemeModeState(savedMode);
    }
    
    if (savedColors) {
      try {
        const parsed = JSON.parse(savedColors);
        setColors(parsed);
      } catch (e) {
        console.error('Failed to parse saved colors:', e);
      }
    }
  }, []);

  return (
    <GlobalThemeContext.Provider value={{
      themeMode,
      actualTheme,
      setThemeMode,
      isSystemDark,
      colors,
      updateColors,
      applyTheme
    }}>
      {children}
    </GlobalThemeContext.Provider>
  );
};

// ===== COMPONENT WRAPPERS FOR EXISTING SHADCN COMPONENTS =====
// These work with your existing @/components/ui imports

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div 
    className={`rounded-lg border shadow-sm p-6 transition-all duration-200 ${className}`}
    style={{
      backgroundColor: `var(--color-bg-secondary, rgb(248 250 252))`,
      borderColor: `var(--color-border-primary, rgb(226 232 240))`,
      color: `var(--color-text-primary, rgb(15 23 42))`
    }}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 mb-4">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
  >
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p 
    className="text-sm mt-1.5"
    style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}
  >
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-11 px-8'
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: `var(--color-text-primary, rgb(15 23 42))`,
          border: `1px solid var(--color-border-primary, rgb(226 232 240))`
        };
      case 'secondary':
        return {
          backgroundColor: `var(--color-bg-tertiary, rgb(241 245 249))`,
          color: `var(--color-text-primary, rgb(15 23 42))`,
          border: 'none'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: `var(--color-text-primary, rgb(15 23 42))`,
          border: 'none'
        };
      default:
        return {
          backgroundColor: `var(--color-accent-primary, rgb(37 99 235))`,
          color: `var(--color-text-inverse, rgb(248 250 252))`,
          border: 'none'
        };
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={getVariantStyle()}
    >
      {children}
    </button>
  );
};

interface InputProps {
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ type = 'text', value, onChange, placeholder, className = '' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    style={{
      backgroundColor: `var(--color-bg-primary, rgb(255 255 255))`,
      borderColor: `var(--color-border-primary, rgb(226 232 240))`,
      color: `var(--color-text-primary, rgb(15 23 42))`,
    }}
  />
);

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <label 
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    <span style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}>
      {children}
    </span>
  </label>
);

// ===== ADMIN THEME SETTINGS =====
const AdminThemeSettings: React.FC = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark, colors, updateColors } = useGlobalTheme();
  const [localColors, setLocalColors] = useState<ThemeColors>(colors);
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

  // CORRECTED color conversion functions
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
    
    const rgbValue = value.startsWith('#') ? hexToRgb(value) : value;
    
    setLocalColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: rgbValue
      }
    }));

    // Apply immediately for current theme
    if (mode === actualTheme) {
      document.documentElement.style.setProperty(`--${colorKey}`, rgbValue);
      document.documentElement.style.setProperty(`--color-${colorKey}`, `rgb(${rgbValue})`);
      
      // Update body for primary background
      if (colorKey === 'bg-primary') {
        document.body.style.backgroundColor = `rgb(${rgbValue})`;
      }
      if (colorKey === 'text-primary') {
        document.body.style.color = `rgb(${rgbValue})`;
      }
    }
  };

  const applyColors = () => {
    console.log('🚀 Applying all colors...');
    updateColors(localColors);
  };

  const resetColors = () => {
    console.log('🔄 Resetting to default colors...');
    setLocalColors(defaultColors);
    updateColors(defaultColors);
  };

  // Sync local colors with global colors
  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  return (
    <div 
      className="min-h-screen transition-all duration-200"
      style={{ 
        backgroundColor: `var(--color-bg-primary, rgb(255 255 255))`,
        color: `var(--color-text-primary, rgb(15 23 42))`
      }}
    >
      {/* Header */}
      <div 
        className="border-b p-6 transition-all duration-200" 
        style={{ 
          borderColor: `var(--color-border-primary, rgb(226 232 240))`,
          backgroundColor: `var(--color-bg-secondary, rgb(248 250 252))`
        }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: `var(--color-accent-primary, rgb(37 99 235))` }}
          >
            <Palette 
              className="h-5 w-5" 
              style={{ color: `var(--color-text-inverse, rgb(248 250 252))` }} 
            />
          </div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
          >
            Global Theme Settings
          </h1>
        </div>
        <p style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}>
          Configure colors and appearance for the entire application
        </p>
      </div>

      {/* Navigation */}
      <div 
        className="border-b px-6 transition-all duration-200" 
        style={{ 
          borderColor: `var(--color-border-primary, rgb(226 232 240))`,
          backgroundColor: `var(--color-bg-secondary, rgb(248 250 252))`
        }}
      >
        <div className="flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200"
                style={{
                  borderColor: isActive ? `var(--color-accent-primary, rgb(37 99 235))` : 'transparent',
                  color: isActive ? `var(--color-accent-primary, rgb(37 99 235))` : `var(--color-text-secondary, rgb(71 85 105))`
                }}
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
                <Monitor 
                  className="h-5 w-5" 
                  style={{ color: `var(--color-accent-primary, rgb(37 99 235))` }} 
                />
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
                      className="relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200"
                      style={{
                        borderColor: isActive ? `var(--color-accent-primary, rgb(37 99 235))` : `var(--color-border-primary, rgb(226 232 240))`,
                        backgroundColor: isActive ? `var(--color-bg-selected, rgb(219 234 254))` : `var(--color-bg-primary, rgb(255 255 255))`
                      }}
                      onClick={() => setThemeMode(option.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon 
                          className="h-5 w-5" 
                          style={{ color: `var(--color-accent-primary, rgb(37 99 235))` }} 
                        />
                        <div className="flex-1">
                          <h3 
                            className="font-semibold mb-1"
                            style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
                          >
                            {option.title}
                          </h3>
                          <p 
                            className="text-sm"
                            style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}
                          >
                            {option.description}
                          </p>
                        </div>
                        <div 
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ 
                            borderColor: isActive ? `var(--color-accent-primary, rgb(37 99 235))` : `var(--color-border-primary, rgb(226 232 240))`,
                            backgroundColor: isActive ? `var(--color-accent-primary, rgb(37 99 235))` : 'transparent'
                          }}
                        >
                          {isActive && (
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: `var(--color-text-inverse, rgb(248 250 252))` }}
                            />
                          )}
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
                <Palette 
                  className="h-5 w-5" 
                  style={{ color: `var(--color-accent-primary, rgb(37 99 235))` }} 
                />
                Color Customization
              </CardTitle>
              <CardDescription>
                Customize theme colors for both light and dark modes
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
                  <div 
                    key={colorKey} 
                    className="p-4 border rounded-lg transition-all duration-200"
                    style={{ 
                      borderColor: `var(--color-border-primary, rgb(226 232 240))`,
                      backgroundColor: `var(--color-bg-primary, rgb(255 255 255))`
                    }}
                  >
                    <h4 
                      className="text-sm font-medium mb-3 capitalize"
                      style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
                    >
                      {colorKey.replace(/-/g, ' ')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Light Mode */}
                      <div>
                        <Label className="text-xs mb-2 block">
                          <span style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}>
                            Light Mode
                          </span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(localColors[colorKey]?.light || '255 255 255')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(localColors[colorKey]?.light || '255 255 255')}
                            onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#ffffff"
                          />
                        </div>
                        <div 
                          className="mt-1 text-xs font-mono"
                          style={{ color: `var(--color-text-tertiary, rgb(148 163 184))` }}
                        >
                          RGB: {localColors[colorKey]?.light || '255 255 255'}
                        </div>
                      </div>
                      
                      {/* Dark Mode */}
                      <div>
                        <Label className="text-xs mb-2 block">
                          <span style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}>
                            Dark Mode
                          </span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={rgbToHex(localColors[colorKey]?.dark || '15 23 42')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="w-12 h-10 p-1 border-2"
                          />
                          <Input
                            type="text"
                            value={rgbToHex(localColors[colorKey]?.dark || '15 23 42')}
                            onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                            className="flex-1 text-sm font-mono"
                            placeholder="#0f172a"
                          />
                        </div>
                        <div 
                          className="mt-1 text-xs font-mono"
                          style={{ color: `var(--color-text-tertiary, rgb(148 163 184))` }}
                        >
                          RGB: {localColors[colorKey]?.dark || '15 23 42'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Color Preview */}
                    <div className="mt-3 flex gap-2">
                      <div 
                        className="w-8 h-8 rounded border-2 transition-all duration-200"
                        style={{ 
                          backgroundColor: `rgb(${localColors[colorKey]?.light || '255 255 255'})`,
                          borderColor: `var(--color-border-primary, rgb(226 232 240))`
                        }}
                        title="Light mode preview"
                      />
                      <div 
                        className="w-8 h-8 rounded border-2 transition-all duration-200"
                        style={{ 
                          backgroundColor: `rgb(${localColors[colorKey]?.dark || '15 23 42'})`,
                          borderColor: `var(--color-border-primary, rgb(226 232 240))`
                        }}
                        title="Dark mode preview"
                      />
                      <div 
                        className="w-8 h-8 rounded border-2 transition-all duration-200"
                        style={{ 
                          backgroundColor: `rgb(${localColors[colorKey]?.[actualTheme] || '255 255 255'})`,
                          borderColor: `var(--color-accent-primary, rgb(37 99 235))`,
                          borderWidth: '2px',
                          borderStyle: 'solid'
                        }}
                        title="Current theme preview"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div 
                className="flex gap-2 mt-6 pt-4 border-t transition-all duration-200" 
                style={{ borderColor: `var(--color-border-primary, rgb(226 232 240))` }}
              >
                <Button onClick={applyColors} className="flex-1">
                  Apply Colors
                </Button>
                <Button onClick={resetColors} variant="outline" className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Current Status & Live Preview</CardTitle>
            <CardDescription>Theme configuration status and color testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div 
                className="p-3 rounded-lg transition-all duration-200" 
                style={{ backgroundColor: `var(--color-bg-tertiary, rgb(241 245 249))` }}
              >
                <div 
                  className="text-sm font-medium"
                  style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}
                >
                  Theme Mode
                </div>
                <div 
                  className="text-lg font-semibold capitalize"
                  style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
                >
                  {themeMode}
                </div>
              </div>
              <div 
                className="p-3 rounded-lg transition-all duration-200" 
                style={{ backgroundColor: `var(--color-bg-tertiary, rgb(241 245 249))` }}
              >
                <div 
                  className="text-sm font-medium"
                  style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}
                >
                  Active Theme
                </div>
                <div 
                  className="text-lg font-semibold capitalize"
                  style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
                >
                  {actualTheme}
                </div>
              </div>
              <div 
                className="p-3 rounded-lg transition-all duration-200" 
                style={{ backgroundColor: `var(--color-bg-tertiary, rgb(241 245 249))` }}
              >
                <div 
                  className="text-sm font-medium"
                  style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}
                >
                  System Preference
                </div>
                <div 
                  className="text-lg font-semibold capitalize"
                  style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
                >
                  {isSystemDark ? 'Dark' : 'Light'}
                </div>
              </div>
            </div>
            
            {/* Live Color Test Section */}
            <div 
              className="p-4 border rounded-lg transition-all duration-200" 
              style={{ borderColor: `var(--color-border-primary, rgb(226 232 240))` }}
            >
              <h4 
                className="text-sm font-semibold mb-3"
                style={{ color: `var(--color-text-primary, rgb(15 23 42))` }}
              >
                🎨 Live Color Preview (Current Theme: {actualTheme})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { key: 'bg-primary', label: 'Primary BG' },
                  { key: 'bg-secondary', label: 'Secondary BG' },
                  { key: 'accent-primary', label: 'Primary Accent' },
                  { key: 'text-primary', label: 'Primary Text' },
                  { key: 'border-primary', label: 'Primary Border' }
                ].map(({ key, label }) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-12 h-12 mx-auto rounded border-2 mb-2 transition-all duration-200 flex items-center justify-center" 
                      style={{ 
                        backgroundColor: `rgb(${localColors[key]?.[actualTheme] || '255 255 255'})`,
                        borderColor: `var(--color-border-primary, rgb(226 232 240))`
                      }}
                    >
                      {key.includes('text') && (
                        <span 
                          className="text-lg font-bold"
                          style={{ color: `rgb(${localColors[key]?.[actualTheme] || '15 23 42'})` }}
                        >
                          Aa
                        </span>
                      )}
                    </div>
                    <div 
                      className="text-xs"
                      style={{ color: `var(--color-text-secondary, rgb(71 85 105))` }}
                    >
                      {label}
                    </div>
                    <div 
                      className="text-xs font-mono mt-1"
                      style={{ color: `var(--color-text-tertiary, rgb(148 163 184))` }}
                    >
                      {localColors[key]?.[actualTheme] || 'N/A'}
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

// ===== MAIN APP =====
const App: React.FC = () => {
  return (
    <GlobalThemeProvider>
      <AdminThemeSettings />
    </GlobalThemeProvider>
  );
};

export default App;