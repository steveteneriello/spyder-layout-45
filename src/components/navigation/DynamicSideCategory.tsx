
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
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
import { 
  Home, User, Settings, FileText, BarChart, Target, Calendar, Plus, MapPin, 
  Palette, Bug, Monitor, Layout, Image, Eye, Download, Upload 
} from 'lucide-react';

// Available icons
const iconMap = {
  Home, User, Settings, FileText, BarChart, Target, Calendar, Plus, MapPin, 
  Palette, Bug, Monitor, Layout, Image, Eye, Download, Upload
};

// Default menu configuration (fallback)
const defaultMenuConfig = {
  sections: [
    {
      id: 'main',
      name: 'Main',
      order: 0,
      isVisible: true,
      items: [
        { id: 'dashboard', title: 'Dashboard', path: '/', icon: 'Home', order: 0, isVisible: true },
        { id: 'campaigns', title: 'Campaigns', path: '/campaigns', icon: 'Target', order: 1, isVisible: true }
      ]
    },
    {
      id: 'tools',
      name: 'Tools',
      order: 1,
      isVisible: true,
      items: [
        { id: 'scheduler', title: 'Scheduler', path: '/scheduler', icon: 'Calendar', order: 0, isVisible: true },
        { id: 'create-schedule', title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', order: 1, isVisible: true },
        { id: 'location-builder', title: 'Location Builder', path: '/location-builder', icon: 'MapPin', order: 2, isVisible: true }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      order: 2,
      isVisible: true,
      items: [
        { id: 'theme', title: 'Theme', path: '/theme', icon: 'Palette', order: 0, isVisible: true },
        { id: 'admin-theme', title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', order: 1, isVisible: true },
        { id: 'menu-management', title: 'Menu Management', path: '/admin/menu', icon: 'Layout', order: 2, isVisible: true, isNew: true }
      ]
    }
  ]
};

interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  order: number;
  isVisible: boolean;
  isNew?: boolean;
  isExternal?: boolean;
  description?: string;
  badge?: {
    text: string;
    color: string;
  };
}

interface MenuSection {
  id: string;
  name: string;
  order: number;
  isVisible: boolean;
  items: MenuItem[];
}

interface MenuConfig {
  sections: MenuSection[];
}

export function DynamicSideCategory() {
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(defaultMenuConfig);
  const location = useLocation();

  // Load menu configuration
  useEffect(() => {
    const loadMenuConfig = () => {
      const savedConfig = localStorage.getItem('menu-config');
      if (savedConfig) {
        try {
          setMenuConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.error('Failed to load menu config:', error);
          setMenuConfig(defaultMenuConfig);
        }
      }
    };

    loadMenuConfig();

    // Listen for menu configuration changes
    const handleMenuConfigChange = (event: CustomEvent) => {
      setMenuConfig(event.detail);
    };

    window.addEventListener('menuConfigChanged', handleMenuConfigChange as EventListener);
    return () => {
      window.removeEventListener('menuConfigChanged', handleMenuConfigChange as EventListener);
    };
  }, []);

  // Get icon component
  const getIcon = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || FileText;
  };

  // Check if item or section is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSectionActive = (items: MenuItem[]) => {
    return items.some(item => isActive(item.path));
  };

  return (
    <div className="space-y-4">
      {menuConfig.sections
        .filter(section => section.isVisible)
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          const visibleItems = section.items
            .filter(item => item.isVisible)
            .sort((a, b) => a.order - b.order);

          if (visibleItems.length === 0) return null;

          const sectionHasActive = isSectionActive(visibleItems);
          const hasNewItems = visibleItems.some(item => item.isNew);

          return (
            <Collapsible key={section.id} defaultOpen className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild className="justify-between">
                  <CollapsibleTrigger className="flex w-full items-center gap-2">
                    <div className="flex items-center gap-2">
                      {sectionHasActive && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      {section.name}
                      {hasNewItems && (
                        <Badge className="text-xs bg-green-100 text-green-800 px-1 py-0">
                          NEW
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {visibleItems.length}
                      </Badge>
                    </div>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="transition-all duration-200 ease-in-out">
                      {visibleItems.map((item) => {
                        const IconComponent = getIcon(item.icon);
                        const itemIsActive = isActive(item.path);

                        return (
                          <SidebarMenuItem key={item.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton asChild>
                                  <a
                                    href={item.path}
                                    target={item.isExternal ? '_blank' : undefined}
                                    rel={item.isExternal ? 'noopener noreferrer' : undefined}
                                    className={`flex gap-2 transition-all duration-200 ease-in-out group/item ${
                                      itemIsActive 
                                        ? 'bg-primary/10 text-primary border-l-2 border-l-primary font-semibold' 
                                        : 'text-foreground hover:bg-accent/50 hover:text-accent-foreground'
                                    }`}
                                  >
                                    <IconComponent 
                                      size={20} 
                                      className={itemIsActive ? 'text-primary' : 'text-foreground group-hover/item:text-accent-foreground'} 
                                    />
                                    <span className="transition-all duration-200 ease-in-out flex-1">
                                      {item.title}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {item.badge && (
                                        <Badge 
                                          variant="secondary" 
                                          className={`text-xs ${item.badge.color || 'bg-blue-100 text-blue-800'}`}
                                        >
                                          {item.badge.text}
                                        </Badge>
                                      )}
                                      {item.isNew && (
                                        <Badge className="text-xs bg-green-100 text-green-800 px-1 py-0">
                                          NEW
                                        </Badge>
                                      )}
                                      {item.isExternal && (
                                        <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                      )}
                                    </div>
                                  </a>
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              <TooltipContent side="right" sideOffset={25}>
                                <div className="space-y-1">
                                  <p className="font-medium">{item.title}</p>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                  )}
                                  {item.isExternal && (
                                    <p className="text-xs text-muted-foreground">Opens in new tab</p>
                                  )}
                                  {item.isNew && (
                                    <p className="text-xs text-green-600">New feature!</p>
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
        })}
    </div>
  );
}

export default DynamicSideCategory;
