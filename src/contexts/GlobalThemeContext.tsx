import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';

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
  updateColors: (newColors: ThemeColors) => void;
  resetColors: () => void;
}

// CORRECTED: Proper color mappings - blue stays blue, white stays white
const defaultColors: ThemeColors = {
  // Core theme colors with CORRECT mappings
  'background': { 
    light: '255 255 255',  // WHITE (not yellow!)
    dark: '15 23 42'       // Dark slate
  },
  'foreground': { 
    light: '15 23 42',     // Dark text
    dark: '248 250 252'    // Light text
  },
  'card': { 
    light: '255 255 255',  // WHITE cards
    dark: '15 23 42'       // Dark cards
  },
  'card-foreground': { 
    light: '15 23 42',     // Dark text on white
    dark: '248 250 252'    // Light text on dark
  },
  'primary': { 
    light: '59 130 246',   // BLUE (not maroon!)
    dark: '59 130 246'     // Same blue in dark mode
  },
  'primary-foreground': { 
    light: '255 255 255',  // White text on blue
    dark: '15 23 42'       // Dark text on blue
  },
  'secondary': { 
    light: '241 245 249',  // Light gray
    dark: '51 65 85'       // Dark gray
  },
  'secondary-foreground': { 
    light: '15 23 42', 
    dark: '248 250 252' 
  },
  'muted': { 
    light: '241 245 249', 
    dark: '51 65 85' 
  },
  'muted-foreground': { 
    light: '100 116 139', 
    dark: '148 163 184' 
  },
  'accent': { 
    light: '241 245 249', 
    dark: '51 65 85' 
  },
  'accent-foreground': { 
    light: '15 23 42', 
    dark: '248 250 252' 
  },
  'border': { 
    light: '226 232 240',  // Light border
    dark: '51 65 85'       // Dark border
  },
  'input': { 
    light: '226 232 240', 
    dark: '51 65 85' 
  },
  'ring': { 
    light: '59 130 246',   // Blue focus ring
    dark: '59 130 246' 
  },

  // Custom variables (maintaining correct colors)
  'bg-primary': { 
    light: '255 255 255',  // WHITE background
    dark: '15 23 42' 
  },
  'bg-secondary': { 
    light: '248 250 252', 
    dark: '30 41 59' 
  },
  'bg-tertiary': { 
    light: '241 245 249', 
    dark: '51 65 85' 
  },
  'bg-hover': { 
    light: '226 232 240', 
    dark: '71 85 105' 
  },
  'text-primary': { 
    light: '15 23 42',     // Dark text
    dark: '248 250 252'    // Light text
  },
  'text-secondary': { 
    light: '71 85 105', 
    dark: '148 163 184' 
  },
  'text-tertiary': { 
    light: '148 163 184', 
    dark: '100 116 139' 
  },
  'text-inverse': { 
    light: '255 255 255',  // White text
    dark: '15 23 42' 
  },
  'accent-primary': { 
    light: '59 130 246',   // BLUE accent (not maroon!)
    dark: '59 130 246' 
  },
  'accent-hover': { 
    light: '37 99 235',    // Darker blue on hover
    dark: '37 99 235' 
  },
  'success': { 
    light: '22 163 74',    // Green
    dark: '34 197 94' 
  },
  'warning': { 
    light: '234 179 8',    // Yellow
    dark: '250 204 21' 
  },
  'error': { 
    light: '220 38 38',    // Red
    dark: '248 113 113' 
  },
  'border-primary': { 
    light: '226 232 240', 
    dark: '51 65 85' 
  },
  'border-focus': { 
    light: '59 130 246',   // Blue focus
    dark: '59 130 246' 
  },
};

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

interface GlobalThemeProviderProps {
  children: ReactNode;
}

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
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

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      setThemeModeState(savedTheme);
    }

    const savedColors = localStorage.getItem('theme-colors');
    if (savedColors) {
      try {
        const parsedColors = JSON.parse(savedColors);
        setColors({ ...defaultColors, ...parsedColors });
      } catch (error) {
        console.warn('Failed to parse saved colors, using defaults');
      }
    }
  }, []);

  // Calculate actual theme
  const actualTheme: 'light' | 'dark' = themeMode === 'auto' 
    ? (isSystemDark ? 'dark' : 'light') 
    : themeMode as 'light' | 'dark';

  // Set theme mode with persistence
  const setThemeMode = (mode: ThemeMode) => {
    console.log('🔄 Setting theme mode:', mode);
    setThemeModeState(mode);
    localStorage.setItem('theme-mode', mode);
  };

  // Update colors with persistence
  const updateColors = (newColors: ThemeColors) => {
    console.log('🎨 Updating colors:', newColors);
    setColors(newColors);
    localStorage.setItem('theme-colors', JSON.stringify(newColors));
  };

  // Reset colors to defaults
  const resetColors = () => {
    console.log('🔄 Resetting colors to defaults');
    setColors(defaultColors);
    localStorage.removeItem('theme-colors');
  };

  // Apply theme to document
  useEffect(() => {
    console.log('🎯 APPLYING CORRECTED THEME SYSTEM');
    console.log('Mode:', themeMode, '| Actual:', actualTheme);
    console.log('✅ Blue should be blue:', colors.primary[actualTheme]);
    console.log('✅ White should be white:', colors.background[actualTheme]);

    // Remove existing theme
    document.documentElement.className = '';
    const existing = document.getElementById('corrected-theme-system');
    if (existing) existing.remove();
    
    // Set theme class and attribute
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.setAttribute('data-theme', actualTheme);

    // Create corrected theme CSS
    const style = document.createElement('style');
    style.id = 'corrected-theme-system';

    // RGB variables (primary system)
    const rgbVars = Object.entries(colors).map(([key, values]) => {
      const colorValue = values[actualTheme];
      return `  --${key}: ${colorValue};`;
    }).join('\n');

    // Convert RGB to HSL for shadcn compatibility
    const rgbToHsl = (rgb: string): string => {
      if (!rgb || !rgb.includes(' ')) return '0 0% 100%';
      
      const parts = rgb.split(' ').map(p => parseInt(p) / 255);
      if (parts.length !== 3 || parts.some(isNaN)) return '0 0% 100%';
      
      const [r, g, b] = parts;
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

    // HSL variables for shadcn compatibility
    const hslVars = [
      `--background: ${rgbToHsl(colors.background[actualTheme])}`,
      `--foreground: ${rgbToHsl(colors.foreground[actualTheme])}`,
      `--card: ${rgbToHsl(colors.card[actualTheme])}`,
      `--card-foreground: ${rgbToHsl(colors['card-foreground'][actualTheme])}`,
      `--primary: ${rgbToHsl(colors.primary[actualTheme])}`,
      `--primary-foreground: ${rgbToHsl(colors['primary-foreground'][actualTheme])}`,
      `--secondary: ${rgbToHsl(colors.secondary[actualTheme])}`,
      `--secondary-foreground: ${rgbToHsl(colors['secondary-foreground'][actualTheme])}`,
      `--muted: ${rgbToHsl(colors.muted[actualTheme])}`,
      `--muted-foreground: ${rgbToHsl(colors['muted-foreground'][actualTheme])}`,
      `--accent: ${rgbToHsl(colors.accent[actualTheme])}`,
      `--accent-foreground: ${rgbToHsl(colors['accent-foreground'][actualTheme])}`,
      `--border: ${rgbToHsl(colors.border[actualTheme])}`,
      `--input: ${rgbToHsl(colors.input[actualTheme])}`,
      `--ring: ${rgbToHsl(colors.ring[actualTheme])}`,
    ].join(';\n  ') + ';';

    // Complete CSS with both RGB and HSL support
    style.textContent = `
      /* CORRECTED THEME SYSTEM - Blue stays blue, white stays white */
      :root {
        /* RGB Variables (primary system) */
${rgbVars}
        
        /* HSL Variables (shadcn compatibility) */
        ${hslVars}
      }

      /* Force correct body styling */
      body {
        background-color: rgb(${colors.background[actualTheme]}) !important;
        color: rgb(${colors.foreground[actualTheme]}) !important;
        transition: background-color 0.3s ease, color 0.3s ease !important;
      }

      /* Essential utility class overrides */
      .bg-background { background-color: rgb(${colors.background[actualTheme]}) !important; }
      .bg-card { background-color: rgb(${colors.card[actualTheme]}) !important; }
      .bg-primary { background-color: rgb(${colors.primary[actualTheme]}) !important; }
      .bg-secondary { background-color: rgb(${colors.secondary[actualTheme]}) !important; }
      .bg-muted { background-color: rgb(${colors.muted[actualTheme]}) !important; }
      .bg-accent { background-color: rgb(${colors.accent[actualTheme]}) !important; }
      
      .text-foreground { color: rgb(${colors.foreground[actualTheme]}) !important; }
      .text-card-foreground { color: rgb(${colors['card-foreground'][actualTheme]}) !important; }
      .text-primary { color: rgb(${colors.primary[actualTheme]}) !important; }
      .text-primary-foreground { color: rgb(${colors['primary-foreground'][actualTheme]}) !important; }
      .text-secondary-foreground { color: rgb(${colors['secondary-foreground'][actualTheme]}) !important; }
      .text-muted-foreground { color: rgb(${colors['muted-foreground'][actualTheme]}) !important; }
      .text-accent-foreground { color: rgb(${colors['accent-foreground'][actualTheme]}) !important; }
      
      .border-border { border-color: rgb(${colors.border[actualTheme]}) !important; }
      .border-input { border-color: rgb(${colors.input[actualTheme]}) !important; }

      /* Ensure theme transitions */
      * {
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }
    `;

    document.head.appendChild(style);
    console.log('✅ Corrected theme system applied successfully');

  }, [colors, actualTheme, themeMode]);

  const value: GlobalThemeContextType = {
    themeMode,
    actualTheme,
    setThemeMode,
    isSystemDark,
    colors,
    updateColors,
    resetColors,
  };

  return (
    <GlobalThemeContext.Provider value={value}>
      {children}
    </GlobalThemeContext.Provider>
  );
}

export function useGlobalTheme(): GlobalThemeContextType {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
}