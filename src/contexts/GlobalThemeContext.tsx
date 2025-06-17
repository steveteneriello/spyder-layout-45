import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ColorTheme {
  light: string;
  dark: string;
}

interface Colors {
  [key: string]: ColorTheme;
}

interface DebugSettings {
  showThemeDebug: boolean;
  showColorPreview: boolean;
  showThemeInfo: boolean;
}

interface BrandSettings {
  useLogo: boolean;
  brandText: string;
  tagline: string;
  lightModeLogo: string | null;
  darkModeLogo: string | null;
  logoSize: 'sm' | 'md' | 'lg';
  showTagline: boolean;
  logoPosition: 'left' | 'center';
}

interface GlobalThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  actualTheme: 'light' | 'dark';
  colors: Colors;
  updateColors: (newColors: Colors) => void;
  debugSettings: DebugSettings;
  brandSettings: BrandSettings;
}

const defaultColors: Colors = {
  'bg-primary': { light: '255 255 255', dark: '14 17 23' },
  'bg-secondary': { light: '251 252 253', dark: '22 27 34' },
  'bg-tertiary': { light: '248 249 250', dark: '30 35 42' },
  'text-primary': { light: '26 32 44', dark: '240 246 252' },
  'text-secondary': { light: '74 85 104', dark: '125 133 144' },
  'text-tertiary': { light: '113 128 150', dark: '156 163 175' },
  'accent-primary': { light: '49 130 206', dark: '56 189 248' },
  'success': { light: '56 161 105', dark: '72 187 120' },
  'warning': { light: '221 107 32', dark: '251 146 60' },
  'error': { light: '229 62 62', dark: '248 113 113' },
  'border-primary': { light: '226 232 240', dark: '52 64 84' },
  'border-secondary': { light: '241 243 245', dark: '45 55 72' },
  'border-focus': { light: '49 130 206', dark: '56 189 248' },
  'sidebar-background': { light: '0 0 0', dark: '15 23 42' },
  'sidebar-foreground': { light: '255 255 255', dark: '240 246 252' },
  'sidebar-accent': { light: '49 130 206', dark: '56 189 248' },
  'header-background': { light: '255 255 255', dark: '22 27 34' },
  'header-foreground': { light: '26 32 44', dark: '240 246 252' },
};

const defaultDebugSettings: DebugSettings = {
  showThemeDebug: false,
  showColorPreview: true,
  showThemeInfo: true,
};

const defaultBrandSettings: BrandSettings = {
  useLogo: false,
  brandText: 'Your App Name',
  tagline: 'Powered by Oxylabs',
  lightModeLogo: null,
  darkModeLogo: null,
  logoSize: 'md',
  showTagline: true,
  logoPosition: 'left',
};

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export function GlobalThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [colors, setColors] = useState<Colors>(defaultColors);
  const [debugSettings, setDebugSettings] = useState<DebugSettings>(defaultDebugSettings);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(defaultBrandSettings);

  // Function to apply colors to CSS custom properties
  const applyColorsToCSS = (colorData: Colors, currentTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    Object.entries(colorData).forEach(([colorKey, themeValues]) => {
      if (themeValues && themeValues[currentTheme]) {
        const cssVarName = `--${colorKey}`;
        root.style.setProperty(cssVarName, themeValues[currentTheme]);
        
        // Also set for Tailwind RGB format
        root.style.setProperty(`${cssVarName}-rgb`, themeValues[currentTheme]);
      }
    });

    // Set theme-aware CSS variables for shadcn/ui compatibility
    if (currentTheme === 'light') {
      root.style.setProperty('--background', themeValues['bg-primary']?.light || '255 255 255');
      root.style.setProperty('--foreground', themeValues['text-primary']?.light || '26 32 44');
      root.style.setProperty('--card', themeValues['bg-secondary']?.light || '251 252 253');
      root.style.setProperty('--card-foreground', themeValues['text-primary']?.light || '26 32 44');
      root.style.setProperty('--primary', themeValues['accent-primary']?.light || '49 130 206');
      root.style.setProperty('--primary-foreground', '255 255 255');
      root.style.setProperty('--muted', themeValues['bg-tertiary']?.light || '248 249 250');
      root.style.setProperty('--muted-foreground', themeValues['text-secondary']?.light || '74 85 104');
      root.style.setProperty('--border', themeValues['border-primary']?.light || '226 232 240');
    } else {
      root.style.setProperty('--background', themeValues['bg-primary']?.dark || '14 17 23');
      root.style.setProperty('--foreground', themeValues['text-primary']?.dark || '240 246 252');
      root.style.setProperty('--card', themeValues['bg-secondary']?.dark || '22 27 34');
      root.style.setProperty('--card-foreground', themeValues['text-primary']?.dark || '240 246 252');
      root.style.setProperty('--primary', themeValues['accent-primary']?.dark || '56 189 248');
      root.style.setProperty('--primary-foreground', '14 17 23');
      root.style.setProperty('--muted', themeValues['bg-tertiary']?.dark || '30 35 42');
      root.style.setProperty('--muted-foreground', themeValues['text-secondary']?.dark || '125 133 144');
      root.style.setProperty('--border', themeValues['border-primary']?.dark || '52 64 84');
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    // Load theme mode
    const savedThemeMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedThemeMode) {
      setThemeModeState(savedThemeMode);
    }

    // Load colors
    const savedColors = localStorage.getItem('theme-colors');
    if (savedColors) {
      try {
        const parsedColors = JSON.parse(savedColors);
        setColors({ ...defaultColors, ...parsedColors });
      } catch (error) {
        console.error('Failed to load colors:', error);
      }
    }

    // Load debug settings
    const savedDebugSettings = localStorage.getItem('theme-debug-settings');
    if (savedDebugSettings) {
      try {
        setDebugSettings(JSON.parse(savedDebugSettings));
      } catch (error) {
        console.error('Failed to load debug settings:', error);
      }
    }

    // Load brand settings
    const savedBrandSettings = localStorage.getItem('brand-settings');
    if (savedBrandSettings) {
      try {
        setBrandSettings(JSON.parse(savedBrandSettings));
      } catch (error) {
        console.error('Failed to load brand settings:', error);
      }
    }
  }, []);

  // Determine actual theme based on mode
  useEffect(() => {
    const updateActualTheme = () => {
      if (themeMode === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
        
        const handleChange = () => {
          setActualTheme(mediaQuery.matches ? 'dark' : 'light');
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        setActualTheme(themeMode);
      }
    };

    updateActualTheme();
  }, [themeMode]);

  // Apply colors when theme or colors change
  useEffect(() => {
    applyColorsToCSS(colors, actualTheme);
    
    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(actualTheme);
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [colors, actualTheme]);

  // Listen for external setting changes
  useEffect(() => {
    const handleThemeDebugChange = (event: CustomEvent) => {
      setDebugSettings(event.detail);
    };

    const handleBrandChange = (event: CustomEvent) => {
      setBrandSettings(event.detail);
    };

    const handleColorChange = (event: CustomEvent) => {
      setColors(event.detail);
    };

    window.addEventListener('themeDebugSettingsChanged', handleThemeDebugChange as EventListener);
    window.addEventListener('brandSettingsChanged', handleBrandChange as EventListener);
    window.addEventListener('themeColorsChanged', handleColorChange as EventListener);

    return () => {
      window.removeEventListener('themeDebugSettingsChanged', handleThemeDebugChange as EventListener);
      window.removeEventListener('brandSettingsChanged', handleBrandChange as EventListener);
      window.removeEventListener('themeColorsChanged', handleColorChange as EventListener);
    };
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const updateColors = (newColors: Colors) => {
    const mergedColors = { ...colors, ...newColors };
    setColors(mergedColors);
    localStorage.setItem('theme-colors', JSON.stringify(mergedColors));
    applyColorsToCSS(mergedColors, actualTheme);
  };

  const value: GlobalThemeContextType = {
    themeMode,
    setThemeMode,
    actualTheme,
    colors,
    updateColors,
    debugSettings,
    brandSettings,
  };

  return (
    <GlobalThemeContext.Provider value={value}>
      {children}
    </GlobalThemeContext.Provider>
  );
}

export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
}