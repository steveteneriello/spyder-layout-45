import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { 
  Home, 
  User, 
  Settings, 
  FileText, 
  BarChart, 
  Target, 
  Calendar, 
  Plus, 
  MapPin, 
  Palette,
  Activity,
  Database,
  Layers,
  Shield,
  Bell,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
  isNew?: boolean;
  isExternal?: boolean;
  description?: string;
}

interface SideCategoryProps {
  section: string;
  items: MenuItem[];
  defaultOpen?: boolean;
  variant?: 'sidebar' | 'compact';
}

const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    Home,
    User,
    Settings,
    FileText,
    BarChart,
    Target,
    Calendar,
    Plus,
    MapPin,
    Palette,
    Activity,
    Database,
    Layers,
    Shield,
    Bell,
    HelpCircle,
    ExternalLink,
  };
  return iconMap[iconName] || Home;
};

export function SideCategory({ 
  section, 
  items, 
  defaultOpen = true,
  variant = 'sidebar' 
}: SideCategoryProps) {
  const location = useLocation();
  const { actualTheme, colors } = useGlobalTheme();
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // FIXED: Theme-aware styling
  const sidebarText = colors['sidebar-foreground']
    ? `rgb(${colors['sidebar-foreground'][actualTheme]})`
    : 'rgb(255, 255, 255)';

  const sidebarAccent = colors['sidebar-accent']
    ? `rgb(${colors['sidebar-accent'][actualTheme]})`
    : 'rgb(55, 65, 81)';

  // Check if current path matches any item
  const isActiveSection = items.some(item => location.pathname === item.path);
  
  // Count of items for section badge
  const itemCount = items.length;
  const activeItemCount = items.filter(item => location.pathname === item.path).length;

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger 
            className="flex w-full items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
            style={{ color: sidebarText }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold tracking-wide">
                {section}
              </span>
              {/* Section Status Indicators */}
              {isActiveSection && (
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              )}
              {items.some(item => item.isNew) && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-1.5 py-0 bg-green-100 text-green-800 border-green-200"
                >
                  NEW
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Item count badge */}
              {variant === 'sidebar' && itemCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-1.5 py-0 bg-white/10 text-white border-white/20"
                >
                  {itemCount}
                </Badge>
              )}
              <ChevronDown 
                className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" 
                style={{ color: sidebarText }}
              />
            </div>
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent className="transition-all duration-200 ease-in-out">
          <SidebarGroupContent>
            <SidebarMenu className="mt-2 space-y-1">
              {items.map((item) => {
                const IconComponent = getIcon(item.icon);
                const isActive = location.pathname === item.path;
                
                return (
                  <SidebarMenuItem key={`${section}-${item.title}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <a
                            href={item.path}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group/menuitem relative ${
                              isActive 
                                ? 'bg-white/20 shadow-sm' 
                                : 'hover:bg-white/10'
                            }`}
                            style={{ color: sidebarText }}
                            target={item.isExternal ? '_blank' : undefined}
                            rel={item.isExternal ? 'noopener noreferrer' : undefined}
                          >
                            {/* Active Indicator */}
                            {isActive && (
                              <div 
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"
                              />
                            )}
                            
                            {/* Icon */}
                            <div className={`flex items-center justify-center ${isActive ? 'ml-2' : ''}`}>
                              <IconComponent 
                                size={18} 
                                className={`transition-all duration-200 ${
                                  isActive 
                                    ? 'text-blue-400' 
                                    : 'text-white/80 group-hover/menuitem:text-white'
                                }`}
                              />
                            </div>
                            
                            {/* Title and badges */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`text-sm font-medium transition-all duration-200 truncate ${
                                isActive 
                                  ? 'text-white font-semibold' 
                                  : 'text-white/90 group-hover/menuitem:text-white'
                              }`}>
                                {item.title}
                              </span>
                              
                              {/* Item badges */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {item.isNew && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs px-1.5 py-0 bg-green-100 text-green-800 border-green-200"
                                  >
                                    NEW
                                  </Badge>
                                )}
                                
                                {item.badge && (
                                  <Badge 
                                    variant={item.badge.variant || "outline"}
                                    className={`text-xs px-1.5 py-0 ${item.badge.color || 'bg-blue-100 text-blue-800 border-blue-200'}`}
                                  >
                                    {item.badge.text}
                                  </Badge>
                                )}
                                
                                {item.isExternal && (
                                  <ExternalLink className="h-3 w-3 text-white/60" />
                                )}
                              </div>
                            </div>
                            
                            {/* Hover effect */}
                            <div className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover/menuitem:opacity-100 transition-opacity duration-200 pointer-events-none" />
                          </a>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="right" 
                        sideOffset={25}
                        className="max-w-xs"
                      >
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          {item.isExternal && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Opens in new tab
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}