
import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { themeMode, setThemeMode, actualTheme } = useGlobalTheme();

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('auto');
    } else {
      setThemeMode('light');
    }
  };

  const getIcon = () => {
    if (themeMode === 'light') return <Sun className="h-4 w-4" />;
    if (themeMode === 'dark') return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      {getIcon()}
      <span className="sr-only">Toggle theme ({themeMode})</span>
    </Button>
  );
}
