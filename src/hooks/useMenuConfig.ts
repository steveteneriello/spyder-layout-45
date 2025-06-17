import { useState, useEffect } from 'react';

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  order: number;
  isVisible: boolean;
  badge?: {
    text: string;
    color: string;
  };
  isNew?: boolean;
  isExternal?: boolean;
  description?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  order: number;
  isVisible: boolean;
  items: MenuItem[];
}

export interface MenuConfig {
  sections: MenuSection[];
}

// Default menu configuration - this matches what's in MenuManagement
const defaultMenuConfig: MenuConfig = {
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
        { id: 'menu-management', title: 'Menu Management', path: '/admin/menu', icon: 'Layout', order: 2, isVisible: true }
      ]
    }
  ]
};

export function useMenuConfig() {
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(defaultMenuConfig);

  // Load menu config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('menu-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setMenuConfig(parsedConfig);
      } catch (error) {
        console.warn('Failed to parse menu config, using defaults');
      }
    }
  }, []);

  // Save menu config to localStorage when it changes
  const updateMenuConfig = (newConfig: MenuConfig) => {
    setMenuConfig(newConfig);
    localStorage.setItem('menu-config', JSON.stringify(newConfig));
  };

  // Convert menu config to the format expected by existing components
  const getMenuItems = () => {
    const items: Array<{title: string; path: string; icon: string; section: string}> = [];
    
    menuConfig.sections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .forEach(section => {
        section.items
          .filter(item => item.isVisible)
          .sort((a, b) => a.order - b.order)
          .forEach(item => {
            items.push({
              title: item.title,
              path: item.path,
              icon: item.icon,
              section: section.name
            });
          });
      });
    
    return items;
  };

  // Get sections for SideCategory components
  const getSections = () => {
    return menuConfig.sections
      .filter(section => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        name: section.name,
        items: section.items
          .filter(item => item.isVisible)
          .sort((a, b) => a.order - b.order)
          .map(item => ({
            title: item.title,
            path: item.path,
            icon: item.icon,
            section: section.name
          }))
      }));
  };

  return {
    menuConfig,
    updateMenuConfig,
    getMenuItems,
    getSections
  };
}
