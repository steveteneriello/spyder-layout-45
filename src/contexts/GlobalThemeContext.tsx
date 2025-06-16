
import React, { useState, useEffect, createContext, useContext } from 'react';

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

// Default theme colors - COMPLETE SET
const defaultColors: ThemeColors = {
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
  // Sidebar colors (always dark)
  'sidebar-background': { light: '0 0 0', dark: '0 0 0' },
  'sidebar-foreground': { light: '255 255 255', dark: '255 255 255' },
  'sidebar-primary': { light: '255 255 255', dark: '255 255 255' },
  'sidebar-primary-foreground': { light: '0 0 0', dark: '0 0 0' },
  'sidebar-accent': { light: '0 0 10.2', dark: '0 0 10.2' },
  'sidebar-accent-foreground': { light: '255 255 255', dark: '255 255 255' },
  'sidebar-border': { light: '0 0 0', dark: '0 0 0' },
  'sidebar-ring': { light: '217 91 60', dark: '217 91 60' },
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
    console.log('Applying theme:', actualTheme);

    // Set data attribute for theme
    document.documentElement.setAttribute('data-theme', actualTheme);

    // Apply all color variables
    Object.entries(colors).forEach(([key, values]) => {
      const colorValue = values[actualTheme];
      const cssVariable = `--${key}`;
      document.documentElement.style.setProperty(cssVariable, colorValue);
    });

    // Map to shadcn variables for compatibility
    const shadcnMapping = {
      'background': colors['bg-primary'][actualTheme],
      'foreground': colors['text-primary'][actualTheme],
      'card': colors['bg-secondary'][actualTheme],
      'card-foreground': colors['text-primary'][actualTheme],
      'popover': colors['bg-secondary'][actualTheme],
      'popover-foreground': colors['text-primary'][actualTheme],
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

    // Apply shadcn variables
    Object.entries(shadcnMapping).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });

    // Force body styles
    document.body.style.backgroundColor = `rgb(${colors['bg-primary'][actualTheme]})`;
    document.body.style.color = `rgb(${colors['text-primary'][actualTheme]})`;
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const updateColors = (newColors: ThemeColors) => {
    setColors(newColors);
    localStorage.setItem('theme-colors', JSON.stringify(newColors));
  };

  // Apply theme when actualTheme or colors change
  useEffect(() => {
    applyTheme();
  }, [actualTheme, colors]);

  // Load saved preferences
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedColors = localStorage.getItem('theme-colors');
    
    if (savedMode) {
      setThemeModeState(savedMode);
    }
    
    if (savedColors) {
      try {
        setColors(JSON.parse(savedColors));
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
