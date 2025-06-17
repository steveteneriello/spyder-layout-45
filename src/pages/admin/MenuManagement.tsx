import React, { useState, useEffect, useRef } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useMenuConfig, type MenuItem, type MenuSection, type MenuConfig } from '@/hooks/useMenuConfig';
import { 
  Plus, 
  Settings, 
  Eye, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  GripVertical,
  Home,
  User,
  FileText,
  BarChart,
  Target,
  Calendar,
  MapPin,
  Palette,
  Bug,
  Monitor,
  Layout,
  Image,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Move
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Available icons for menu items
const availableIcons = {
  Home, User, Settings, FileText, BarChart, Target, Calendar, Plus, MapPin, 
  Palette, Bug, Monitor, Layout, Image, Eye, Download, Upload
};

// Default menu configuration
const defaultMenuConfig = {
  sections: [
    {
      id: 'main',
      name: 'Main',
      order: 0,
      isVisible: true,
      items: [
        { id: 'dashboard', title: 'Dashboard', path: '/', icon: 'Home', order: 0, isVisible: true },
        { id: 'campaigns', title: 'Campaigns', path: '/campaigns', icon: 'Target', order: 1, isVisible: true, badge: { text: '12', color: 'bg-blue-100 text-blue-800' } }
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
  const { menuConfig, updateMenuConfig, getMenuItems, getSections } = useMenuConfig();
  const [selectedSection, setSelectedSection] = useState<string>('main');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ sectionId: string; itemId: string } | null>(null);

  // Get current menu items for sidebar
  const allMenuItems = getMenuItems();
  const sections = getSections();

  // Load saved configuration on mount
  useEffect(() => {
    // Configuration loading is now handled by useMenuConfig hook
    // This effect can be removed or used for other initialization
  }, []);

  // Save configuration
  const saveConfiguration = () => {
    updateMenuConfig(menuConfig);
    setHasUnsavedChanges(false);
    
    // Dispatch event for other components to update
    window.dispatchEvent(new CustomEvent('menuConfigChanged', { 
      detail: menuConfig 
    }));
  };

  // Reset to default
  const resetToDefault = () => {
    updateMenuConfig(defaultMenuConfig);
    setHasUnsavedChanges(true);
  };

  // Export configuration
  const exportConfiguration = () => {
    const dataStr = JSON.stringify(menuConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'menu-configuration.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          updateMenuConfig(config);
          setHasUnsavedChanges(true);
        } catch (error) {
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Add new section
  const addSection = () => {
    const newSection: MenuSection = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      order: menuConfig.sections.length,
      isVisible: true,
      items: []
    };
    
    const updatedConfig = {
      sections: [...menuConfig.sections, newSection]
    };
    updateMenuConfig(updatedConfig);
    setHasUnsavedChanges(true);
    setEditingSection(newSection.id);
  };

  // Update section
  const updateSection = (sectionId: string, updates: Partial<MenuSection>) => {
    const updatedConfig = {
      sections: menuConfig.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    };
    updateMenuConfig(updatedConfig);
    setHasUnsavedChanges(true);
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    const updatedConfig = {
      sections: menuConfig.sections.filter(section => section.id !== sectionId)
    };
    updateMenuConfig(updatedConfig);
    setHasUnsavedChanges(true);
    if (selectedSection === sectionId) {
      setSelectedSection(menuConfig.sections[0]?.id || '');
    }
  };

  // Add new menu item
  const addMenuItem = (sectionId: string) => {
    const section = menuConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      path: '/new-page',
      icon: 'FileText',
      order: section.items.length,
      isVisible: true
    };

    updateSection(sectionId, {
      items: [...section.items, newItem]
    });
    setEditingItem(newItem.id);
  };

  // Update menu item
  const updateMenuItem = (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    const section = menuConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedItems = section.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );

    updateSection(sectionId, { items: updatedItems });
  };

  // Delete menu item
  const deleteMenuItem = (sectionId: string, itemId: string) => {
    const section = menuConfig.sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedItems = section.items.filter(item => item.id !== itemId);
    updateSection(sectionId, { items: updatedItems });
  };

  // Drag and drop handlers for sections
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSection(targetSectionId);
  };

  const handleSectionDragLeave = () => {
    setDragOverSection(null);
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) {
      setDraggedSection(null);
      setDragOverSection(null);
      return;
    }

    const sections = [...menuConfig.sections];
    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged section and insert at target position
    const [draggedSectionObj] = sections.splice(draggedIndex, 1);
    sections.splice(targetIndex, 0, draggedSectionObj);

    // Update order values
    sections.forEach((section, index) => {
      section.order = index;
    });

    updateMenuConfig({ sections });
    setHasUnsavedChanges(true);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  // Drag and drop handlers for menu items
  const handleItemDragStart = (e: React.DragEvent, sectionId: string, itemId: string) => {
    setDraggedItem({ sectionId, itemId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e: React.DragEvent, targetSectionId: string, targetItemId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem({ sectionId: targetSectionId, itemId: targetItemId });
  };

  const handleItemDragLeave = () => {
    setDragOverItem(null);
  };

  const handleItemDrop = (e: React.DragEvent, targetSectionId: string, targetItemId: string) => {
    e.preventDefault();
    if (!draggedItem || (draggedItem.sectionId === targetSectionId && draggedItem.itemId === targetItemId)) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const sections = [...menuConfig.sections];
    const draggedSection = sections.find(s => s.id === draggedItem.sectionId);
    const targetSection = sections.find(s => s.id === targetSectionId);

    if (!draggedSection || !targetSection) return;

    // Find and remove dragged item
    const draggedItemIndex = draggedSection.items.findIndex(item => item.id === draggedItem.itemId);
    if (draggedItemIndex === -1) return;

    const [draggedItemObj] = draggedSection.items.splice(draggedItemIndex, 1);

    // Find target position and insert
    const targetItemIndex = targetSection.items.findIndex(item => item.id === targetItemId);
    if (targetItemIndex === -1) return;

    targetSection.items.splice(targetItemIndex, 0, draggedItemObj);

    // Update order values for both sections
    draggedSection.items.forEach((item, index) => {
      item.order = index;
    });
    targetSection.items.forEach((item, index) => {
      item.order = index;
    });

    updateMenuConfig({ sections });
    setHasUnsavedChanges(true);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Handle section drop (for items dropped on section header)
  const handleSectionDropForItem = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const sections = [...menuConfig.sections];
    const draggedSection = sections.find(s => s.id === draggedItem.sectionId);
    const targetSection = sections.find(s => s.id === targetSectionId);

    if (!draggedSection || !targetSection || draggedItem.sectionId === targetSectionId) {
      setDraggedItem(null);
      setDragOverSection(null);
      return;
    }

    // Remove item from source section
    const draggedItemIndex = draggedSection.items.findIndex(item => item.id === draggedItem.itemId);
    if (draggedItemIndex === -1) return;

    const [draggedItemObj] = draggedSection.items.splice(draggedItemIndex, 1);

    // Add to end of target section
    draggedItemObj.order = targetSection.items.length;
    targetSection.items.push(draggedItemObj);

    // Update order values
    draggedSection.items.forEach((item, index) => {
      item.order = index;
    });

    updateMenuConfig({ sections });
    setHasUnsavedChanges(true);
    setDraggedItem(null);
    setDragOverSection(null);
  };

  // Inline editing handlers
  const handleSectionNameEdit = (sectionId: string, newName: string) => {
    updateSection(sectionId, { name: newName });
    setEditingSection(null);
  };

  const handleItemTitleEdit = (sectionId: string, itemId: string, newTitle: string) => {
    updateMenuItem(sectionId, itemId, { title: newTitle });
    setEditingItem(null);
  };

  // Get icon component
  const getIconComponent = (iconName: string) => {
    return availableIcons[iconName as keyof typeof availableIcons] || FileText;
  };

  // Current section
  const currentSection = menuConfig.sections.find(s => s.id === selectedSection);

  return (
    <SidebarLayout
      menuItems={allMenuItems}
      nav={
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-primary-foreground">Admin</h1>
          </div>
        </div>
      }
      category={
        <div className="space-y-4">
          {sections.map((section) => (
            <SideCategory 
              key={section.name}
              section={section.name} 
              items={section.items} 
            />
          ))}
        </div>
      }
      footer={
        <div className="text-xs text-primary-foreground/60 text-center">
          <p>Menu Management</p>
        </div>
      }
    >
      <div className="h-full bg-background text-foreground p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
            <p className="text-muted-foreground">Configure sidebar navigation and menu structure</p>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="mr-2">
                Unsaved Changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
            </Button>
            <Button
              onClick={saveConfiguration}
              className="bg-primary text-primary-foreground"
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Menu Structure */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Menu Structure</CardTitle>
                <Button
                  size="sm"
                  onClick={addSection}
                  className="bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Organize your navigation sections
              </CardDescription>
            </CardHeader>
            <CardContent>
                              <div className="space-y-2">
                {menuConfig.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={(e) => handleSectionDragStart(e, section.id)}
                      onDragOver={(e) => handleSectionDragOver(e, section.id)}
                      onDragLeave={handleSectionDragLeave}
                      onDrop={(e) => {
                        if (draggedItem) {
                          handleSectionDropForItem(e, section.id);
                        } else {
                          handleSectionDrop(e, section.id);
                        }
                      }}
                      className={`p-3 border rounded-lg cursor-move transition-all ${
                        selectedSection === section.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted/30 border-border hover:bg-muted/50'
                      } ${
                        dragOverSection === section.id
                          ? 'border-primary border-2 bg-primary/5'
                          : ''
                      } ${
                        draggedSection === section.id
                          ? 'opacity-50 scale-95'
                          : ''
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          </div>
                          {editingSection === section.id ? (
                            <Input
                              value={section.name}
                              onChange={(e) => updateSection(section.id, { name: e.target.value })}
                              onBlur={() => setEditingSection(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSectionNameEdit(section.id, e.currentTarget.value);
                                } else if (e.key === 'Escape') {
                                  setEditingSection(null);
                                }
                              }}
                              className="h-6 text-sm flex-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              className="font-medium flex-1 cursor-pointer hover:text-primary transition-colors"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingSection(section.id);
                              }}
                              title="Double-click to edit"
                            >
                              {section.name}
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {section.items.length} items
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={section.isVisible}
                            onCheckedChange={(checked) => updateSection(section.id, { isVisible: checked })}
                            className="scale-75"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingSection(section.id);
                                }}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Rename Section
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSection(section.id);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Section
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="w-full justify-start"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConfiguration}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Config
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Config
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={importConfiguration}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Menu Items Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {currentSection?.name} Section
                  </CardTitle>
                  <CardDescription>
                    Manage menu items in this section
                  </CardDescription>
                </div>
                <Button
                  onClick={() => currentSection && addMenuItem(currentSection.id)}
                  className="bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentSection ? (
                <div className="space-y-4">
                  {currentSection.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 border border-border rounded-lg bg-muted/30"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Basic Info */}
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`title-${item.id}`} className="text-sm font-medium">
                                Title
                              </Label>
                              <Input
                                id={`title-${item.id}`}
                                value={item.title}
                                onChange={(e) => updateMenuItem(currentSection.id, item.id, { title: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`path-${item.id}`} className="text-sm font-medium">
                                Path
                              </Label>
                              <Input
                                id={`path-${item.id}`}
                                value={item.path}
                                onChange={(e) => updateMenuItem(currentSection.id, item.id, { path: e.target.value })}
                                className="mt-1"
                                placeholder="/example-page"
                              />
                            </div>
                          </div>

                          {/* Icon & Properties */}
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Icon</Label>
                              <Select
                                value={item.icon}
                                onValueChange={(value) => updateMenuItem(currentSection.id, item.id, { icon: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue>
                                    <div className="flex items-center gap-2">
                                      {React.createElement(getIconComponent(item.icon), { className: "h-4 w-4" })}
                                      {item.icon}
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(availableIcons).map((iconName) => {
                                    const IconComponent = availableIcons[iconName as keyof typeof availableIcons];
                                    return (
                                      <SelectItem key={iconName} value={iconName}>
                                        <div className="flex items-center gap-2">
                                          <IconComponent className="h-4 w-4" />
                                          {iconName}
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Visible</Label>
                                <Switch
                                  checked={item.isVisible}
                                  onCheckedChange={(checked) => updateMenuItem(currentSection.id, item.id, { isVisible: checked })}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">New Badge</Label>
                                <Switch
                                  checked={item.isNew || false}
                                  onCheckedChange={(checked) => updateMenuItem(currentSection.id, item.id, { isNew: checked })}
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">External Link</Label>
                                <Switch
                                  checked={item.isExternal || false}
                                  onCheckedChange={(checked) => updateMenuItem(currentSection.id, item.id, { isExternal: checked })}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Advanced Properties */}
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`description-${item.id}`} className="text-sm font-medium">
                                Description (Tooltip)
                              </Label>
                              <Textarea
                                id={`description-${item.id}`}
                                value={item.description || ''}
                                onChange={(e) => updateMenuItem(currentSection.id, item.id, { description: e.target.value })}
                                className="mt-1 h-20"
                                placeholder="Optional description for tooltip"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`badge-${item.id}`} className="text-sm font-medium">
                                Badge Text
                              </Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  id={`badge-${item.id}`}
                                  value={item.badge?.text || ''}
                                  onChange={(e) => updateMenuItem(currentSection.id, item.id, { 
                                    badge: e.target.value ? { 
                                      text: e.target.value, 
                                      color: item.badge?.color || 'bg-blue-100 text-blue-800' 
                                    } : undefined 
                                  })}
                                  placeholder="12"
                                  className="flex-1"
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteMenuItem(currentSection.id, item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-4 pt-3 border-t border-border">
                          <Label className="text-sm font-medium">Preview:</Label>
                          <div className="mt-2 p-2 bg-background border border-border rounded flex items-center gap-2">
                            {React.createElement(getIconComponent(item.icon), { className: "h-4 w-4" })}
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge.text}
                              </Badge>
                            )}
                            {item.isNew && (
                              <Badge className="text-xs bg-green-100 text-green-800">
                                NEW
                              </Badge>
                            )}
                            {item.isExternal && (
                              <Badge variant="outline" className="text-xs">
                                External
                              </Badge>
                            )}
                            {!item.isVisible && (
                              <Badge variant="destructive" className="text-xs">
                                Hidden
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {currentSection.items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layout className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No menu items in this section</p>
                      <p className="text-sm">Click "Add Item" to create your first menu item</p>
                      <p className="text-xs mt-2 text-blue-600">💡 Tip: Drag items between sections to reorganize</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a section to manage its menu items</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Menu Preview</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPreviewMode(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuConfig.sections
                  .filter(section => section.isVisible)
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div key={section.id}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        {section.name}
                      </h4>
                      <div className="space-y-1">
                        {section.items
                          .filter(item => item.isVisible)
                          .sort((a, b) => a.order - b.order)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                            >
                              {React.createElement(getIconComponent(item.icon), { className: "h-4 w-4" })}
                              <span className="text-sm">{item.title}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {item.badge.text}
                                </Badge>
                              )}
                              {item.isNew && (
                                <Badge className="text-xs bg-green-100 text-green-800 ml-auto">
                                  NEW
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </SidebarLayout>
  );
}