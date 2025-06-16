
import React from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // This component is now just a wrapper since we use GlobalThemeContext
  // The GlobalThemeProvider handles all theme logic
  return <>{children}</>;
}
