
import React from 'react';
import { Monitor, Moon, Sun, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useGlobalTheme, ThemeMode } from '@/contexts/GlobalThemeContext';

interface GlobalThemeToggleProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showLabel?: boolean;
  showBadge?: boolean;
  className?: string;
}

const GlobalThemeToggle: React.FC<GlobalThemeToggleProps> = ({
  variant = 'default',
  showLabel = true,
  showBadge = false,
  className = '',
}) => {
  const { themeMode, setThemeMode, actualTheme, isSystemDark } = useGlobalTheme();

  const themes: { 
    mode: ThemeMode; 
    label: string; 
    icon: React.ComponentType<any>;
    description: string;
  }[] = [
    { 
      mode: 'light', 
      label: 'Light', 
      icon: Sun,
      description: 'Light mode with bright backgrounds'
    },
    { 
      mode: 'dark', 
      label: 'Dark', 
      icon: Moon,
      description: 'Dark mode for low-light environments'
    },
    { 
      mode: 'auto', 
      label: 'Auto', 
      icon: Monitor,
      description: 'Follows your system preference'
    },
  ];

  const currentTheme = themes.find(theme => theme.mode === themeMode);
  const CurrentIcon = currentTheme?.icon || Monitor;

  const getButtonVariant = () => {
    switch (variant) {
      case 'compact':
        return 'ghost';
      case 'icon-only':
        return 'ghost';
      default:
        return 'outline';
    }
  };

  const getButtonSize = (): "default" | "sm" | "lg" | "icon" => {
    switch (variant) {
      case 'compact':
        return 'sm';
      case 'icon-only':
        return 'sm';
      default:
        return 'sm';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-200';
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} h-8 w-8 p-0`;
      case 'icon-only':
        return `${baseClasses} h-9 w-9 p-0`;
      default:
        return `${baseClasses} gap-2 min-w-[80px]`;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={getButtonVariant()}
          size={getButtonSize()}
          className={`${getButtonClasses()} ${className}`}
          aria-label={`Current theme: ${currentTheme?.label}. Click to change theme.`}
        >
          <CurrentIcon className="h-4 w-4" />
          {variant === 'default' && showLabel && (
            <span className="hidden sm:inline font-medium">
              {currentTheme?.label}
            </span>
          )}
          {showBadge && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {actualTheme}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-[200px] bg-popover border-border shadow-lg"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
          <Palette className="h-4 w-4 text-primary" />
          Theme Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {themes.map((theme) => {
          const Icon = theme.icon;
          const isActive = themeMode === theme.mode;
          const isCurrentlyActive = (theme.mode === actualTheme && themeMode !== 'auto') || 
                                   (theme.mode === 'auto' && themeMode === 'auto');
          
          return (
            <DropdownMenuItem
              key={theme.mode}
              onClick={() => setThemeMode(theme.mode)}
              className={`flex items-center gap-3 cursor-pointer p-3 transition-colors duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {/* Icon */}
              <div className={`p-1.5 rounded ${
                isActive 
                  ? 'bg-primary/20' 
                  : 'bg-muted'
              }`}>
                <Icon className={`h-4 w-4 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{theme.label}</span>
                  {isActive && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                  {isCurrentlyActive && !isActive && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme.description}
                </p>
                {theme.mode === 'auto' && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    System: {isSystemDark ? 'Dark' : 'Light'} → Currently: {actualTheme}
                  </p>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        
        {/* Advanced Settings Link */}
        <DropdownMenuItem 
          className="text-muted-foreground hover:text-foreground cursor-pointer p-3"
          asChild
        >
          <a href="/theme" className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-muted">
              <Palette className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <span className="text-sm font-medium">More Theme Options</span>
              <p className="text-xs text-muted-foreground">
                Customize colors and advanced settings
              </p>
            </div>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ADDED: Variants for different use cases
export const CompactThemeToggle: React.FC<{ className?: string }> = ({ className }) => (
  <GlobalThemeToggle 
    variant="compact" 
    showLabel={false} 
    className={className}
  />
);

export const IconOnlyThemeToggle: React.FC<{ className?: string }> = ({ className }) => (
  <GlobalThemeToggle 
    variant="icon-only" 
    showLabel={false} 
    className={className}
  />
);

export const BadgedThemeToggle: React.FC<{ className?: string }> = ({ className }) => (
  <GlobalThemeToggle 
    showBadge={true} 
    className={className}
  />
);

export default GlobalThemeToggle;
