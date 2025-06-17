
import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGlobalTheme, ThemeMode } from '@/contexts/GlobalThemeContext';

const GlobalThemeToggle = () => {
  const { themeMode, setThemeMode, actualTheme } = useGlobalTheme();

  const themes: { mode: ThemeMode; label: string; icon: React.ComponentType<any> }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'auto', label: 'Auto', icon: Monitor },
  ];

  const currentTheme = themes.find(theme => theme.mode === themeMode);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="theme-button-secondary w-auto gap-2"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="theme-bg-secondary theme-border-primary">
        {themes.map((theme) => {
          const Icon = theme.icon;
          const isActive = themeMode === theme.mode;
          
          return (
            <DropdownMenuItem
              key={theme.mode}
              onClick={() => setThemeMode(theme.mode)}
              className={`gap-2 cursor-pointer ${
                isActive 
                  ? 'theme-bg-selected theme-accent-primary' 
                  : 'theme-text-primary hover:theme-bg-hover'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{theme.label}</span>
              {theme.mode === 'auto' && (
                <span className="text-xs theme-text-secondary ml-auto">
                  ({actualTheme})
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GlobalThemeToggle;
