import React, { useEffect } from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark' | 'auto';
  enableColorScheme?: boolean;
  storageKey?: string;
  className?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'auto',
  enableColorScheme = true,
  storageKey = 'ui-theme',
  className
}: ThemeProviderProps) {
  const { actualTheme, themeMode, setThemeMode } = useGlobalTheme();

  // Set default theme if no theme is currently set
  useEffect(() => {
    if (!themeMode && defaultTheme) {
      setThemeMode(defaultTheme);
    }
  }, [themeMode, defaultTheme, setThemeMode]);

  // Apply color-scheme CSS property for better browser integration
  useEffect(() => {
    if (enableColorScheme) {
      document.documentElement.style.colorScheme = actualTheme;
    }
    
    return () => {
      if (enableColorScheme) {
        document.documentElement.style.colorScheme = '';
      }
    };
  }, [actualTheme, enableColorScheme]);

  // Apply theme class to document element for legacy compatibility
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(actualTheme);
    
    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', actualTheme);
    
    return () => {
      root.classList.remove('light', 'dark');
      root.removeAttribute('data-theme');
    };
  }, [actualTheme]);

  // Wrapper div with theme class for scoped styling
  return (
    <div 
      className={`theme-provider ${actualTheme} ${className || ''}`}
      data-theme={actualTheme}
      data-theme-mode={themeMode}
    >
      {children}
    </div>
  );
}

// ADDED: Theme utilities for components that might need direct theme access
export const useTheme = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark } = useGlobalTheme();
  
  return {
    theme: actualTheme,           // For legacy compatibility
    systemTheme: isSystemDark ? 'dark' : 'light',
    resolvedTheme: actualTheme,   // For next-themes compatibility
    setTheme: setThemeMode,       // For legacy compatibility
    themeMode,
    actualTheme,
    setThemeMode,
    isSystemDark,
  };
};

// ADDED: Theme class utilities
export const getThemeClass = (theme?: 'light' | 'dark') => {
  const { actualTheme } = useGlobalTheme();
  return theme || actualTheme;
};

export const getThemeClasses = (...classes: string[]) => {
  const { actualTheme } = useGlobalTheme();
  return classes.map(cls => `${actualTheme}:${cls}`).join(' ');
};

// ADDED: Color scheme utilities
export const applyColorScheme = (element: HTMLElement, theme: 'light' | 'dark') => {
  element.style.colorScheme = theme;
};

export const removeColorScheme = (element: HTMLElement) => {
  element.style.colorScheme = '';
};

// ADDED: Theme detection utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const watchSystemTheme = (callback: (theme: 'light' | 'dark') => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
};

// ADDED: Legacy ThemeProvider component for next-themes compatibility
export function LegacyThemeProvider({ 
  children, 
  ...props 
}: ThemeProviderProps & { 
  attribute?: string;
  value?: Record<string, string>;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  console.warn(
    '🎨 LegacyThemeProvider: Using legacy theme provider. Consider migrating to GlobalThemeProvider for better features.'
  );
  
  return (
    <ThemeProvider {...props}>
      {children}
    </ThemeProvider>
  );
}

// ADDED: Theme debugging utilities
export const debugTheme = () => {
  const { themeMode, actualTheme, isSystemDark, colors } = useGlobalTheme();
  
  console.group('🎨 Theme Debug Info');
  console.log('Theme Mode:', themeMode);
  console.log('Actual Theme:', actualTheme);
  console.log('System Dark:', isSystemDark);
  console.log('CSS Variables Count:', Object.keys(colors).length);
  console.log('Document Classes:', document.documentElement.classList.toString());
  console.log('Color Scheme:', document.documentElement.style.colorScheme);
  console.groupEnd();
  
  return {
    themeMode,
    actualTheme,
    isSystemDark,
    variableCount: Object.keys(colors).length,
    documentClasses: document.documentElement.classList.toString(),
    colorScheme: document.documentElement.style.colorScheme,
  };
};

// ADDED: Theme validation utilities
export const validateThemeColors = () => {
  const { colors, actualTheme } = useGlobalTheme();
  const issues: string[] = [];
  
  // Check for missing essential colors
  const essentialColors = ['background', 'foreground', 'primary', 'border'];
  essentialColors.forEach(color => {
    if (!colors[color]?.[actualTheme]) {
      issues.push(`Missing ${color} color for ${actualTheme} theme`);
    }
  });
  
  // Check for invalid RGB values
  Object.entries(colors).forEach(([key, value]) => {
    const rgbValue = value[actualTheme];
    if (rgbValue && !/^\d{1,3} \d{1,3} \d{1,3}$/.test(rgbValue)) {
      issues.push(`Invalid RGB format for ${key}: "${rgbValue}"`);
    }
  });
  
  if (issues.length > 0) {
    console.warn('🎨 Theme Validation Issues:', issues);
  } else {
    console.log('✅ Theme validation passed');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    colorCount: Object.keys(colors).length,
  };
};

export default ThemeProvider;