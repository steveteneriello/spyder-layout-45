
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Layout,
  GripVertical,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Save,
  RefreshCw,
  Settings,
  Home,
  Target,
  Calendar,
  MapPin,
  Palette
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

// Available icons
const availableIcons = {
  Home, Target, Calendar, Plus, MapPin, Palette, Settings, Layout
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
        { id: 'menu-management', title: 'Menu Management', path: '/admin/menu', icon: 'Layout', order: 2, isVisible: true, isNew: true }
      ]
    }
  ]
};

export default function MenuManagement() {
  const { actualTheme } = useGlobalTheme();
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(defaultMenuConfig);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load menu configuration
  useEffect(() => {
    const savedConfig = localStorage.getItem('menu-config');
    if (savedConfig) {
      try {
        setMenuConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load menu config:', error);
      }
    }
  }, []);

  // Save menu configuration
  const saveMenuConfig = () => {
    localStorage.setItem('menu-config', JSON.stringify(menuConfig));
    setHasChanges(false);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('menuConfigChanged', { 
      detail: menuConfig 
    }));
  };

  // Update section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    setMenuConfig(prev => ({
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    }));
    setHasChanges(true);
  };

  // Update item visibility
  const toggleItemVisibility = (sectionId: string, itemId: string) => {
    setMenuConfig(prev => ({
      sections: prev.sections.map(section => 
        section.id === sectionId 
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId 
                  ? { ...item, isVisible: !item.isVisible }
                  : item
              )
            }
          : section
      )
    }));
    setHasChanges(true);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setMenuConfig(defaultMenuConfig);
    setHasChanges(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure navigation menu structure and visibility
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={saveMenuConfig} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Menu Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Configuration Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Menu Configuration
              </CardTitle>
              <CardDescription>
                Manage sections and menu items visibility and order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {menuConfig.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id} className="space-y-3">
                      
                      {/* Section Header */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground">{section.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {section.items.filter(item => item.isVisible).length} visible items
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={section.isVisible}
                          onCheckedChange={() => toggleSectionVisibility(section.id)}
                        />
                      </div>

                      {/* Section Items */}
                      {section.isVisible && (
                        <div className="ml-6 space-y-2">
                          {section.items
                            .sort((a, b) => a.order - b.order)
                            .map((item) => {
                              const IconComponent = availableIcons[item.icon as keyof typeof availableIcons] || Layout;
                              
                              return (
                                <div 
                                  key={item.id}
                                  className="flex items-center justify-between p-2 border border-border rounded-md hover:bg-accent/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                                    <IconComponent className="h-4 w-4 text-primary" />
                                    <div>
                                      <span className="text-sm font-medium">{item.title}</span>
                                      <p className="text-xs text-muted-foreground">{item.path}</p>
                                    </div>
                                    {item.isNew && (
                                      <Badge className="text-xs bg-green-100 text-green-800">
                                        NEW
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleItemVisibility(section.id, item.id)}
                                    >
                                      {item.isVisible ? (
                                        <Eye className="h-3 w-3" />
                                      ) : (
                                        <EyeOff className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how your menu configuration will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                
                {/* Theme Preview */}
                <div className="p-4 border border-border rounded-lg bg-card">
                  <div className="text-sm font-medium mb-3">Current Theme: {actualTheme}</div>
                  
                  <div className="space-y-3">
                    {menuConfig.sections
                      .filter(section => section.isVisible)
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const visibleItems = section.items.filter(item => item.isVisible);
                        
                        if (visibleItems.length === 0) return null;
                        
                        return (
                          <div key={section.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              {section.name}
                              <Badge variant="secondary" className="text-xs">
                                {visibleItems.length}
                              </Badge>
                            </div>
                            
                            <div className="ml-4 space-y-1">
                              {visibleItems
                                .sort((a, b) => a.order - b.order)
                                .map((item) => {
                                  const IconComponent = availableIcons[item.icon as keyof typeof availableIcons] || Layout;
                                  
                                  return (
                                    <div 
                                      key={item.id}
                                      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 text-sm"
                                    >
                                      <IconComponent className="h-4 w-4 text-primary" />
                                      <span>{item.title}</span>
                                      {item.isNew && (
                                        <Badge className="text-xs bg-green-100 text-green-800">
                                          NEW
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">
                      {menuConfig.sections.filter(s => s.isVisible).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active Sections</div>
                  </div>
                  
                  <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {menuConfig.sections.reduce((acc, section) => 
                        acc + section.items.filter(item => item.isVisible).length, 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Visible Items</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
