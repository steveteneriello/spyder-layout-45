import React, { useState, useEffect } from 'react';
import { Settings, Monitor, Sun, Moon, Palette, RotateCcw, Save, Eye, Code2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme, type ThemeMode } from '@/contexts/GlobalThemeContext';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

const AdminThemeSettings: React.FC = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark, colors, updateColors, resetColors } = useGlobalTheme();
  const [localColors, setLocalColors] = useState(colors);
  const [activeSection, setActiveSection] = useState('theme');
  const [activeColorGroup, setActiveColorGroup] = useState('core');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Enhanced color groups including sidebar and header colors
  const colorGroups = {
    core: ['background', 'foreground', 'card', 'card-foreground', 'primary', 'primary-foreground'],
    layout: ['secondary', 'secondary-foreground', 'muted', 'muted-foreground', 'accent', 'accent-foreground'],
    sidebar: ['sidebar-background', 'sidebar-foreground', 'sidebar-accent', 'sidebar-border'],
    borders: ['border', 'input', 'ring'],
    status: ['success', 'warning', 'error'],
    custom: ['bg-primary', 'bg-secondary', 'text-primary', 'text-secondary', 'accent-primary', 'border-primary']
  };

  const colorGroupLabels = {
    core: 'Core Colors (Background, Text, Primary)',
    layout: 'Layout Colors (Secondary, Muted, Accent)',
    sidebar: '🎯 Sidebar & Header Colors',
    borders: 'Borders & Focus States',
    status: 'Status Colors (Success, Warning, Error)',
    custom: 'Custom Theme Variables'
  };

  const sections = [
    { id: 'theme', label: 'Theme Mode', icon: Monitor },
    { id: 'colors', label: 'Color Editor', icon: Palette },
    { id: 'sidebar', label: 'Sidebar & Header', icon: Settings },
    { id: 'preview', label: 'Live Preview', icon: Eye },
  ];

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Clean and bright interface',
      icon: Sun,
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Easy on the eyes in low-light',
      icon: Moon,
    },
    {
      id: 'auto' as ThemeMode,
      title: 'Auto Mode',
      description: `Follows system (currently ${isSystemDark ? 'dark' : 'light'})`,
      icon: Monitor,
    }
  ];

  // Color conversion utilities
  const hexToRgb = (hex: string): string => {
    const cleanHex = hex.replace('#', '');
    if (!/^[a-f0-9]{6}$/i.test(cleanHex)) return '255 255 255';
    
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `${r} ${g} ${b}`;
  };

  const rgbToHex = (rgb: string): string => {
    if (!rgb || rgb.startsWith('#')) return rgb || '#ffffff';
    
    const parts = rgb.trim().split(' ');
    if (parts.length !== 3) return '#ffffff';
    
    const r = Math.max(0, Math.min(255, parseInt(parts[0]) || 0));
    const g = Math.max(0, Math.min(255, parseInt(parts[1]) || 0));
    const b = Math.max(0, Math.min(255, parseInt(parts[2]) || 0));
    
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    const rgbValue = value.startsWith('#') ? hexToRgb(value) : value;
    
    setLocalColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: rgbValue
      }
    }));
    
    setHasUnsavedChanges(true);
  };

  const applyColors = () => {
    console.log('🎨 Applying advanced theme settings...');
    updateColors(localColors);
    setHasUnsavedChanges(false);
  };

  const resetToDefaults = () => {
    console.log('🔄 Resetting to defaults...');
    resetColors();
    setLocalColors(colors);
    setHasUnsavedChanges(false);
  };

  // Sync local colors with global colors
  useEffect(() => {
    setLocalColors(colors);
    setHasUnsavedChanges(false);
  }, [colors]);

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          {/* FIXED: Proper logo/branding area instead of page name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-black" />
            </div>
            <div className="text-white">
              <div className="font-bold text-sm">Theme Studio</div>
              <div className="text-xs opacity-75">Advanced Settings</div>
            </div>
          </div>
          <Badge variant="outline" className="text-white border-white/20">
            {actualTheme}
          </Badge>
        </div>
      }
      category={
        <div className="space-y-4">
          <SideCategory section="Main" items={allMenuItems.filter(item => item.section === 'Main')} />
          <SideCategory section="Tools" items={allMenuItems.filter(item => item.section === 'Tools')} />
          <SideCategory section="Settings" items={allMenuItems.filter(item => item.section === 'Settings')} />
        </div>
      }
      menuItems={allMenuItems}
    >
      {/* Main Content with proper theming */}
      <div className="min-h-screen bg-background text-foreground">
        
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Advanced Theme Settings</h1>
                <p className="text-muted-foreground">
                  Customize colors, sidebar appearance, and advanced theme options
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              <Badge variant="outline">
                {Object.keys(localColors).length} Variables
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border bg-card px-6">
          <div className="flex space-x-8">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 max-w-6xl mx-auto">
          
          {/* Theme Mode Section */}
          {activeSection === 'theme' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Theme Mode Selection
                </CardTitle>
                <CardDescription>
                  Choose how the application should appear across all pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = themeMode === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                          isActive
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setThemeMode(option.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1 text-foreground">
                              {option.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isActive ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                          }`}>
                            {isActive && <div className="w-3 h-3 bg-primary-foreground rounded-full" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Color Editor Section */}
          {activeSection === 'colors' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Advanced Color Editor
                </CardTitle>
                <CardDescription>
                  Customize individual theme colors with real-time preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Color Group Selection */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(colorGroupLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={activeColorGroup === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveColorGroup(key)}
                      className="text-sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>

                {/* Color Controls */}
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {colorGroups[activeColorGroup as keyof typeof colorGroups]?.map((colorKey) => (
                    <div key={colorKey} className="p-4 border border-border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            --{colorKey}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {colorKey.includes('sidebar') ? 'Sidebar appearance' :
                             colorKey.includes('primary') ? 'Primary theme color' :
                             colorKey.includes('background') ? 'Main background color' :
                             'Theme variable'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                          RGB
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Light Mode */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Light Mode</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={rgbToHex(localColors[colorKey]?.light || '255 255 255')}
                              onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                              className="w-14 h-10 p-1 border-2"
                            />
                            <Input
                              type="text"
                              value={rgbToHex(localColors[colorKey]?.light || '255 255 255')}
                              onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                              className="flex-1 text-sm font-mono"
                              placeholder="#ffffff"
                            />
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground font-mono">
                            RGB: {localColors[colorKey]?.light || '255 255 255'}
                          </div>
                        </div>
                        
                        {/* Dark Mode */}
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Dark Mode</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={rgbToHex(localColors[colorKey]?.dark || '15 23 42')}
                              onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                              className="w-14 h-10 p-1 border-2"
                            />
                            <Input
                              type="text"
                              value={rgbToHex(localColors[colorKey]?.dark || '15 23 42')}
                              onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                              className="flex-1 text-sm font-mono"
                              placeholder="#0f172a"
                            />
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground font-mono">
                            RGB: {localColors[colorKey]?.dark || '15 23 42'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Live Preview */}
                      <div className="mt-3 flex gap-2 items-center">
                        <div 
                          className="w-8 h-8 rounded border-2 border-border"
                          style={{ backgroundColor: `rgb(${localColors[colorKey]?.light || '255 255 255'})` }}
                          title="Light mode preview"
                        />
                        <div 
                          className="w-8 h-8 rounded border-2 border-border"
                          style={{ backgroundColor: `rgb(${localColors[colorKey]?.dark || '15 23 42'})` }}
                          title="Dark mode preview"
                        />
                        <div 
                          className="w-8 h-8 rounded border-4 border-primary"
                          style={{ backgroundColor: `rgb(${localColors[colorKey]?.[actualTheme] || '255 255 255'})` }}
                          title="Current active theme"
                        />
                        <span className="text-xs text-muted-foreground ml-2">
                          Current: {localColors[colorKey]?.[actualTheme] || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sidebar & Header Section */}
          {activeSection === 'sidebar' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  🎯 Sidebar & Header Customization
                </CardTitle>
                <CardDescription>
                  Customize sidebar colors and fix logo/header positioning issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  
                  {/* Current Issues */}
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">🚨 Current Layout Issues</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Page names appearing where logo should be</li>
                      <li>• Sidebar color not customizable through theme system</li>
                      <li>• Header colors hardcoded and not theme-aware</li>
                    </ul>
                  </div>

                  {/* Sidebar Color Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Sidebar Colors</h4>
                      
                      {['sidebar-background', 'sidebar-foreground', 'sidebar-accent'].map((colorKey) => (
                        <div key={colorKey} className="p-3 border border-border rounded">
                          <Label className="text-sm font-medium mb-2 block">
                            {colorKey.replace('sidebar-', '').replace('-', ' ').toUpperCase()}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={rgbToHex(localColors[colorKey]?.light || '0 0 0')}
                              onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <Input
                              type="color"
                              value={rgbToHex(localColors[colorKey]?.dark || '0 0 0')}
                              onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <div className="flex-1 text-xs">
                              <div>Light: {localColors[colorKey]?.light || '0 0 0'}</div>
                              <div>Dark: {localColors[colorKey]?.dark || '0 0 0'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Header Layout Fix</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <h5 className="font-medium mb-2">✅ Fixed in This Component:</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Logo area with brand icon and name</li>
                          <li>• Page title moved to main content area</li>
                          <li>• Theme-aware header colors</li>
                          <li>• Proper navigation structure</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">📝 To Apply Globally:</h5>
                        <p className="text-sm text-blue-700">
                          Update your SidebarLayout component to use the header structure 
                          shown in this component for consistent branding across all pages.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Preview Section */}
          {activeSection === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Theme Preview
                </CardTitle>
                <CardDescription>
                  See how your theme changes look across different UI elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Color Swatches */}
                  {[
                    { key: 'primary', label: 'Primary', desc: 'Should be BLUE' },
                    { key: 'background', label: 'Background', desc: 'Should be WHITE/DARK' },
                    { key: 'card', label: 'Card', desc: 'Elevated surfaces' },
                    { key: 'secondary', label: 'Secondary', desc: 'Muted elements' },
                    { key: 'sidebar-background', label: 'Sidebar', desc: 'Navigation background' },
                    { key: 'accent-primary', label: 'Accent', desc: 'Highlight color' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="text-center">
                      <div 
                        className="w-full h-20 rounded-lg border-2 border-border mb-2 flex items-center justify-center shadow-sm" 
                        style={{ backgroundColor: `rgb(${localColors[key]?.[actualTheme] || '255 255 255'})` }}
                      >
                        <span 
                          className="font-semibold text-sm"
                          style={{ 
                            color: key.includes('background') || key.includes('card') || key.includes('secondary') 
                              ? `rgb(${localColors.foreground?.[actualTheme] || '0 0 0'})`
                              : key.includes('sidebar')
                              ? `rgb(${localColors['sidebar-foreground']?.[actualTheme] || '255 255 255'})`
                              : `rgb(${localColors[key.includes('primary') ? 'primary-foreground' : 'foreground']?.[actualTheme] || '255 255 255'})`
                          }}
                        >
                          {label}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        {localColors[key]?.[actualTheme] || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Component Preview */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Component Preview</h4>
                  
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-card-foreground">Sample Card Component</h5>
                      <Badge variant="outline">Live Preview</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      This card demonstrates how your theme colors appear in actual components.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Primary Button</Button>
                      <Button size="sm" variant="outline">Secondary Button</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Button 
              onClick={applyColors} 
              className="flex items-center gap-2"
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
              Apply Changes
            </Button>
            <Button 
              onClick={resetToDefaults} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button variant="outline" asChild>
              <a href="/theme">
                <Monitor className="h-4 w-4 mr-2" />
                Basic Theme Settings
              </a>
            </Button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminThemeSettings;