
import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface GlobalThemeContextType {
  themeMode: ThemeMode;
  actualTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  isSystemDark: boolean;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

export const useGlobalTheme = () => {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
};

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export const GlobalThemeProvider: React.FC<GlobalThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isSystemDark, setIsSystemDark] = useState(false);

  // Get the stored theme preference
  const getStoredTheme = (): ThemeMode => {
    const stored = localStorage.getItem('global-theme-preference');
    return (stored as ThemeMode) || 'auto';
  };

  // Set the stored theme preference
  const setStoredTheme = (mode: ThemeMode) => {
    localStorage.setItem('global-theme-preference', mode);
  };

  // Detect system theme preference
  const detectSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // Calculate the actual theme based on mode and system preference
  const getActualTheme = (mode: ThemeMode, systemDark: boolean): 'light' | 'dark' => {
    if (mode === 'auto') {
      return systemDark ? 'dark' : 'light';
    }
    return mode;
  };

  // Apply theme to document
  const applyTheme = (actualTheme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', actualTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        actualTheme === 'dark' ? '#0E1117' : '#FFFFFF'
      );
    }

    // Update CSS class for compatibility with existing styles
    document.documentElement.classList.toggle('dark', actualTheme === 'dark');
  };

  // Set theme mode and persist it
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    setStoredTheme(mode);
    const actualTheme = getActualTheme(mode, isSystemDark);
    applyTheme(actualTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const storedMode = getStoredTheme();
    const systemDark = detectSystemTheme();
    
    setThemeModeState(storedMode);
    setIsSystemDark(systemDark);
    
    const actualTheme = getActualTheme(storedMode, systemDark);
    applyTheme(actualTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
      
      // Only update if in auto mode
      if (themeMode === 'auto') {
        const actualTheme = getActualTheme('auto', e.matches);
        applyTheme(actualTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  const actualTheme = getActualTheme(themeMode, isSystemDark);

  const value: GlobalThemeContextType = {
    themeMode,
    actualTheme,
    setThemeMode,
    isSystemDark,
  };

  return (
    <GlobalThemeContext.Provider value={value}>
      {children}
    </GlobalThemeContext.Provider>
  );
};
