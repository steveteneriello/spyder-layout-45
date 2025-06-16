import React from 'react';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'floating' | 'minimal' | 'with-label';
  size?: 'sm' | 'default' | 'lg';
  showTooltip?: boolean;
  showTransition?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = 'default',
  size = 'default',
  showTooltip = true,
  showTransition = true,
  className 
}: ThemeToggleProps) {
  const { themeMode, setThemeMode, actualTheme, isSystemDark } = useGlobalTheme();
  
  const toggleTheme = () => {
    // Cycle through: light → dark → auto → light
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('auto');
    } else {
      setThemeMode('light');
    }
  };

  const getThemeInfo = () => {
    switch (themeMode) {
      case 'light':
        return {
          icon: Sun,
          label: 'Light',
          description: 'Switch to dark mode',
          next: 'dark',
          color: 'text-yellow-500',
        };
      case 'dark':
        return {
          icon: Moon,
          label: 'Dark',
          description: 'Switch to auto mode',
          next: 'auto',
          color: 'text-blue-500',
        };
      case 'auto':
        return {
          icon: Monitor,
          label: 'Auto',
          description: `Switch to light mode (currently ${actualTheme})`,
          next: 'light',
          color: 'text-green-500',
        };
      default:
        return {
          icon: Sun,
          label: 'Light',
          description: 'Switch theme',
          next: 'dark',
          color: 'text-yellow-500',
        };
    }
  };

  const themeInfo = getThemeInfo();
  const Icon = themeInfo.icon;

  const getButtonVariant = () => {
    switch (variant) {
      case 'floating':
        return 'default';
      case 'minimal':
        return 'ghost';
      case 'with-label':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-200 group';
    
    switch (variant) {
      case 'floating':
        return cn(
          baseClasses,
          'fixed bottom-4 right-4 z-50 shadow-lg hover:shadow-xl',
          'bg-background border-border backdrop-blur-sm',
          size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        );
      case 'minimal':
        return cn(
          baseClasses,
          'hover:bg-accent/50',
          size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
        );
      case 'with-label':
        return cn(
          baseClasses,
          'gap-2 px-3',
          size === 'sm' ? 'h-8' : size === 'lg' ? 'h-12' : 'h-10'
        );
      default:
        return cn(
          baseClasses,
          size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
        );
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      default: return 'h-4 w-4';
    }
  };

  const button = (
    <Button
      variant={getButtonVariant()}
      onClick={toggleTheme}
      className={cn(getButtonClasses(), className)}
      aria-label={`Current theme: ${themeInfo.label}. ${themeInfo.description}`}
    >
      {/* Main Icon with Transition */}
      <div className={cn(
        'relative flex items-center justify-center',
        showTransition && 'transform transition-transform duration-300 group-hover:rotate-12'
      )}>
        <Icon className={cn(
          getIconSize(),
          themeInfo.color,
          'transition-colors duration-200'
        )} />
        
        {/* Status Indicator */}
        {themeMode === 'auto' && (
          <div className="absolute -top-1 -right-1">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isSystemDark ? 'bg-blue-500' : 'bg-yellow-500'
            )} />
          </div>
        )}
      </div>

      {/* Label for with-label variant */}
      {variant === 'with-label' && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{themeInfo.label}</span>
          {themeMode === 'auto' && (
            <Badge variant="outline" className="text-xs px-1">
              {actualTheme}
            </Badge>
          )}
        </div>
      )}

      {/* Hidden accessibility text */}
      <span className="sr-only">
        Toggle theme - Current: {themeInfo.label}
        {themeMode === 'auto' && ` (${actualTheme})`}
      </span>
    </Button>
  );

  // Wrap with tooltip if enabled
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{themeInfo.label} Mode</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {themeInfo.description}
              </p>
              {themeMode === 'auto' && (
                <p className="text-xs text-muted-foreground mt-1">
                  System: {isSystemDark ? 'Dark' : 'Light'}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <span>Next:</span>
                {themeInfo.next === 'dark' && <Moon className="h-3 w-3" />}
                {themeInfo.next === 'light' && <Sun className="h-3 w-3" />}
                {themeInfo.next === 'auto' && <Monitor className="h-3 w-3" />}
                <span className="capitalize">{themeInfo.next}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

// ADDED: Preset variants for common use cases
export const FloatingThemeToggle: React.FC<{ className?: string }> = ({ className }) => (
  <ThemeToggle 
    variant="floating" 
    size="default"
    className={className}
  />
);

export const MinimalThemeToggle: React.FC<{ className?: string }> = ({ className }) => (
  <ThemeToggle 
    variant="minimal" 
    size="sm"
    showTooltip={false}
    className={className}
  />
);

export const LabeledThemeToggle: React.FC<{ className?: string }> = ({ className }) => (
  <ThemeToggle 
    variant="with-label" 
    size="default"
    className={className}
  />
);

// ADDED: Theme cycle indicator component
export const ThemeCycleIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { themeMode } = useGlobalTheme();
  
  const themes = ['light', 'dark', 'auto'];
  const currentIndex = themes.indexOf(themeMode);
  
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {themes.map((theme, index) => {
        const isActive = index === currentIndex;
        const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
        
        return (
          <div
            key={theme}
            className={cn(
              'p-1 rounded transition-colors duration-200',
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-3 w-3" />
          </div>
        );
      })}
    </div>
  );
};

// ADDED: Quick theme buttons (for settings pages)
export const QuickThemeButtons: React.FC<{ className?: string }> = ({ className }) => {
  const { themeMode, setThemeMode, actualTheme, isSystemDark } = useGlobalTheme();
  
  const themes = [
    { mode: 'light' as const, icon: Sun, label: 'Light', color: 'text-yellow-500' },
    { mode: 'dark' as const, icon: Moon, label: 'Dark', color: 'text-blue-500' },
    { mode: 'auto' as const, icon: Monitor, label: 'Auto', color: 'text-green-500' },
  ];
  
  return (
    <div className={cn('flex gap-2', className)}>
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isActive = themeMode === theme.mode;
        
        return (
          <Button
            key={theme.mode}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => setThemeMode(theme.mode)}
            className="gap-2"
          >
            <Icon className={cn('h-4 w-4', isActive ? '' : theme.color)} />
            <span>{theme.label}</span>
            {theme.mode === 'auto' && (
              <Badge variant="outline" className="text-xs">
                {isSystemDark ? 'Dark' : 'Light'}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;