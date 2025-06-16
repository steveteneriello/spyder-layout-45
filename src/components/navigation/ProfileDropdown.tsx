import { ChevronUp, LogOut, Settings, User, Shield, Bell, HelpCircle, Palette } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import React from 'react';
import { cn } from '@/lib/utils';

interface User {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  plan?: 'free' | 'pro' | 'enterprise';
  lastSeen?: string;
}

interface ProfileDropdownProps {
  user: User;
  className?: string;
  sidebarOpen?: boolean;
  variant?: 'sidebar' | 'header' | 'inline';
  onLogout: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export function ProfileDropdown({ 
  user, 
  className, 
  sidebarOpen = true, 
  variant = 'sidebar',
  onLogout,
  onProfileClick,
  onSettingsClick
}: ProfileDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const { actualTheme, colors } = useGlobalTheme();

  if (!user) return null;

  const { name, email, image, role, status = 'online', plan, lastSeen } = user;

  // FIXED: Theme-aware styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'sidebar':
        return {
          button: 'bg-transparent hover:bg-white/10 text-white border-none',
          text: 'text-white',
          subtext: 'text-white/70',
          hoverText: 'group-hover/profiledrop:text-white/90',
          hoverSubtext: 'group-hover/profiledrop:text-white/60',
        };
      case 'header':
        return {
          button: 'bg-transparent hover:bg-accent text-foreground border-border',
          text: 'text-foreground',
          subtext: 'text-muted-foreground',
          hoverText: 'group-hover/profiledrop:text-foreground/90',
          hoverSubtext: 'group-hover/profiledrop:text-muted-foreground/80',
        };
      case 'inline':
        return {
          button: 'bg-background hover:bg-accent text-foreground border-border',
          text: 'text-foreground',
          subtext: 'text-muted-foreground',
          hoverText: 'group-hover/profiledrop:text-foreground/90',
          hoverSubtext: 'group-hover/profiledrop:text-muted-foreground/80',
        };
      default:
        return {
          button: 'bg-transparent hover:bg-accent text-foreground',
          text: 'text-foreground',
          subtext: 'text-muted-foreground',
          hoverText: 'group-hover/profiledrop:text-foreground/90',
          hoverSubtext: 'group-hover/profiledrop:text-muted-foreground/80',
        };
    }
  };

  const styles = getVariantStyles();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserInitials = (name?: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <div className={cn('w-auto', className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'h-auto w-full group/profiledrop transition-all duration-200',
              sidebarOpen ? 'justify-between p-3' : 'justify-center p-2',
              styles.button
            )}
          >
            <div className={cn(
              'flex items-center gap-3',
              !sidebarOpen && 'justify-center'
            )}>
              {/* Avatar with Status */}
              <div className="relative">
                <Avatar className="h-8 w-8 group-hover/profiledrop:opacity-90 transition-opacity">
                  <AvatarImage src={image || undefined} alt={name || 'User'} />
                  <AvatarFallback className={variant === 'sidebar' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}>
                    {getUserInitials(name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status Indicator */}
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2',
                  getStatusColor(status),
                  variant === 'sidebar' ? 'border-black' : 'border-background'
                )}></div>
              </div>

              {/* User Info */}
              {sidebarOpen && (
                <div className="flex flex-col items-start overflow-hidden min-w-0 flex-1">
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn(
                      'text-sm font-semibold truncate max-w-[120px]',
                      styles.text,
                      styles.hoverText
                    )}>
                      {name || 'User'}
                    </span>
                    {plan && (
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs px-1.5 py-0', getPlanBadgeColor(plan))}
                      >
                        {plan.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className={cn(
                      'text-xs truncate max-w-[120px]',
                      styles.subtext,
                      styles.hoverSubtext
                    )}>
                      {email || (role && `${role}`) || 'No email'}
                    </span>
                    {status === 'online' && (
                      <span className={cn('text-xs', styles.subtext)}>
                        • Online
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Dropdown Arrow */}
            {sidebarOpen && (
              <ChevronUp className={cn(
                'h-4 w-4 transition-all duration-200 opacity-0 group-hover/profiledrop:opacity-70',
                open && 'rotate-180 opacity-70',
                styles.text
              )} />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align={variant === 'sidebar' ? 'start' : 'end'} 
          className="w-[16rem]"
          side={variant === 'sidebar' ? 'right' : 'bottom'}
        >
          {/* User Info Header */}
          <DropdownMenuLabel className="p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={image || undefined} alt={name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                  getStatusColor(status)
                )}></div>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{name || 'User'}</span>
                  {plan && (
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs px-1.5 py-0', getPlanBadgeColor(plan))}
                    >
                      {plan.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate">{email}</span>
                {role && (
                  <span className="text-xs text-muted-foreground">{role}</span>
                )}
                {status !== 'online' && lastSeen && (
                  <span className="text-xs text-muted-foreground">Last seen {lastSeen}</span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />

          {/* Menu Items */}
          <DropdownMenuItem 
            className="cursor-pointer p-3"
            onClick={() => handleMenuItemClick(onProfileClick || (() => console.log('Profile clicked')))}
          >
            <User className="mr-3 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer p-3"
            onClick={() => handleMenuItemClick(onSettingsClick || (() => console.log('Settings clicked')))}
          >
            <Settings className="mr-3 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer p-3">
            <Bell className="mr-3 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer p-3">
            <a href="/theme">
              <Palette className="mr-3 h-4 w-4" />
              <span>Theme Settings</span>
            </a>
          </DropdownMenuItem>

          {role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer p-3">
                <Shield className="mr-3 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer p-3">
            <HelpCircle className="mr-3 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="cursor-pointer p-3 text-red-600 focus:text-red-600"
            onClick={() => handleMenuItemClick(onLogout)}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}