
import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Sun, 
  Moon, 
  Palette, 
  RotateCcw, 
  Save, 
  Eye, 
  Bug, 
  Layout, 
  Image,
  Upload,
  X,
  Check,
  Settings,
  Home,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useGlobalTheme, type ThemeMode } from '@/contexts/GlobalThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DebugSettings {
  showThemeDebug: boolean;
  showColorPreview: boolean;
  showThemeInfo: boolean;
}

interface BrandSettings {
  useLogo: boolean;
  brandText: string;
  tagline: string;
  lightModeLogo: string | null;
  darkModeLogo: string | null;
  logoSize: 'sm' | 'md' | 'lg';
  showTagline: boolean;
  logoPosition: 'left' | 'center';
}

export default function AdminThemeSettings() {
  const { themeMode, setThemeMode, actualTheme, colors, updateColors } = useGlobalTheme();
  
  const [debugSettings, setDebugSettings] = useState<DebugSettings>({
    showThemeDebug: false,
    showColorPreview: true,
    showThemeInfo: true
  });

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    useLogo: false,
    brandText: 'Oxylabs Dashboard',
    tagline: 'Data Collection Platform',
    lightModeLogo: null,
    darkModeLogo: null,
    logoSize: 'md',
    showTagline: true,
    logoPosition: 'left'
  });

  const [activeSection, setActiveSection] = useState('theme');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    const savedDebugSettings = localStorage.getItem('theme-debug-settings');
    if (savedDebugSettings) {
      try {
        setDebugSettings(JSON.parse(savedDebugSettings));
      } catch (error) {
        console.error('Failed to load debug settings:', error);
      }
    }

    const savedBrandSettings = localStorage.getItem('brand-settings');
    if (savedBrandSettings) {
      try {
        setBrandSettings(JSON.parse(savedBrandSettings));
      } catch (error) {
        console.error('Failed to load brand settings:', error);
      }
    }
  }, []);

  const updateDebugSettings = (updates: Partial<DebugSettings>) => {
    const newSettings = { ...debugSettings, ...updates };
    setDebugSettings(newSettings);
    setUnsavedChanges(true);
  };

  const updateBrandSettings = (updates: Partial<BrandSettings>) => {
    const newSettings = { ...brandSettings, ...updates };
    setBrandSettings(newSettings);
    setUnsavedChanges(true);
  };

  const saveAllSettings = () => {
    localStorage.setItem('theme-debug-settings', JSON.stringify(debugSettings));
    window.dispatchEvent(new CustomEvent('themeDebugSettingsChanged', { 
      detail: debugSettings 
    }));

    localStorage.setItem('brand-settings', JSON.stringify(brandSettings));
    window.dispatchEvent(new CustomEvent('brandSettingsChanged', { 
      detail: brandSettings 
    }));

    setUnsavedChanges(false);
  };

  const handleLogoUpload = (file: File, mode: 'light' | 'dark') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateBrandSettings({
        [mode === 'light' ? 'lightModeLogo' : 'darkModeLogo']: result
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (mode: 'light' | 'dark') => {
    updateBrandSettings({
      [mode === 'light' ? 'lightModeLogo' : 'darkModeLogo']: null
    });
  };

  const colorGroups = [
    {
      name: 'Core Colors',
      colors: {
        'bg-primary': colors['bg-primary'] || { light: '255 255 255', dark: '14 17 23' },
        'bg-secondary': colors['bg-secondary'] || { light: '251 252 253', dark: '22 27 34' },
        'text-primary': colors['text-primary'] || { light: '26 32 44', dark: '240 246 252' },
        'text-secondary': colors['text-secondary'] || { light: '74 85 104', dark: '125 133 144' },
      }
    },
    {
      name: 'Sidebar & Header',
      colors: {
        'sidebar-background': colors['sidebar-background'] || { light: '0 0 0', dark: '15 23 42' },
        'sidebar-foreground': colors['sidebar-foreground'] || { light: '255 255 255', dark: '240 246 252' },
        'sidebar-accent': colors['sidebar-accent'] || { light: '49 130 206', dark: '56 189 248' },
        'header-background': colors['header-background'] || { light: '255 255 255', dark: '22 27 34' },
        'header-foreground': colors['header-foreground'] || { light: '26 32 44', dark: '240 246 252' },
      }
    },
    {
      name: 'Accents',
      colors: {
        'accent-primary': colors['accent-primary'] || { light: '49 130 206', dark: '56 189 248' },
        'success': colors['success'] || { light: '56 161 105', dark: '72 187 120' },
        'warning': colors['warning'] || { light: '221 107 32', dark: '251 146 60' },
        'error': colors['error'] || { light: '229 62 62', dark: '248 113 113' },
      }
    }
  ];

  const sections = [
    { id: 'theme', label: 'Theme Mode', icon: Monitor },
    { id: 'colors', label: 'Color Editor', icon: Palette },
    { id: 'sidebar', label: 'Sidebar & Header', icon: Layout },
    { id: 'branding', label: 'Logo & Branding', icon: Image },
    { id: 'debug', label: 'Debug Settings', icon: Bug },
    { id: 'preview', label: 'Live Preview', icon: Eye },
  ];

  const resetColors = () => {
    const defaultColors = {
      'bg-primary': { light: '255 255 255', dark: '14 17 23' },
      'bg-secondary': { light: '251 252 253', dark: '22 27 34' },
      'text-primary': { light: '26 32 44', dark: '240 246 252' },
      'text-secondary': { light: '74 85 104', dark: '125 133 144' },
      'accent-primary': { light: '49 130 206', dark: '56 189 248' },
      'sidebar-background': { light: '0 0 0', dark: '15 23 42' },
      'sidebar-foreground': { light: '255 255 255', dark: '240 246 252' },
    };
    
    updateColors(defaultColors);
    setUnsavedChanges(false);
  };

  const updateColor = (colorKey: string, theme: 'light' | 'dark', value: string) => {
    const currentColors = { ...colors };
    if (!currentColors[colorKey]) {
      currentColors[colorKey] = { light: '', dark: '' };
    }
    currentColors[colorKey][theme] = value;
    updateColors(currentColors);
    setUnsavedChanges(true);
  };

  const rgbToHex = (rgb: string) => {
    const values = rgb.split(' ').map(v => parseInt(v.trim()));
    if (values.length !== 3 || values.some(v => isNaN(v))) return '#000000';
    return '#' + values.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0 0';
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ].join(' ');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="mr-2"
            >
              ← Back
            </Button>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Advanced Theme Settings</h1>
              <p className="text-muted-foreground">Complete theme customization and debugging tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/menu'}
              className="text-muted-foreground hover:text-foreground"
            >
              Menu Management
            </Button>
            <Badge variant="outline" className="text-foreground border-border">
              {actualTheme} mode
            </Badge>
            {unsavedChanges && (
              <Badge variant="destructive">Unsaved Changes</Badge>
            )}
            <Button
              onClick={saveAllSettings}
              className="bg-primary text-primary-foreground"
              disabled={!unsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Choose a category to customize</CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {section.label}
                    </Button>
                  );
                })}
              </nav>
              
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Quick Navigation</h4>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => window.location.href = '/'}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => window.location.href = '/admin/menu'}
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Menu Management
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => window.location.href = '/campaigns'}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Campaigns
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                  {unsavedChanges ? (
                    <div className="text-orange-600 dark:text-orange-400">
                      ⚠️ You have unsaved changes
                    </div>
                  ) : (
                    <div className="text-green-600 dark:text-green-400">
                      ✅ All settings saved
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {activeSection === 'theme' && (
            <Card>
              <CardHeader>
                <CardTitle>Theme Mode Settings</CardTitle>
                <CardDescription>Choose between light, dark, and auto themes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                    <Button
                      key={mode}
                      variant={themeMode === mode ? 'default' : 'outline'}
                      onClick={() => setThemeMode(mode)}
                      className="h-20 flex-col gap-2"
                    >
                      {mode === 'light' && <Sun className="h-6 w-6" />}
                      {mode === 'dark' && <Moon className="h-6 w-6" />}
                      {mode === 'auto' && <Monitor className="h-6 w-6" />}
                      <span className="capitalize">{mode}</span>
                      {mode === 'auto' && (
                        <span className="text-xs opacity-75">({actualTheme})</span>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'colors' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Color Editor</CardTitle>
                    <CardDescription>Customize colors for {actualTheme} theme</CardDescription>
                  </div>
                  <Button variant="outline" onClick={resetColors}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Colors
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {colorGroups.map((group) => (
                    <div key={group.name}>
                      <h3 className="font-semibold mb-3 text-foreground">{group.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(group.colors).map(([colorKey, colorValue]) => (
                          <div key={colorKey} className="space-y-2">
                            <Label className="text-sm font-medium">{colorKey}</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded border border-border"
                                style={{ backgroundColor: `rgb(${colorValue[actualTheme]})` }}
                              />
                              <Input
                                type="color"
                                value={rgbToHex(colorValue[actualTheme])}
                                onChange={(e) => updateColor(colorKey, actualTheme, hexToRgb(e.target.value))}
                                className="w-16 h-8 p-1 border-border"
                              />
                              <Input
                                value={colorValue[actualTheme]}
                                onChange={(e) => updateColor(colorKey, actualTheme, e.target.value)}
                                placeholder="255 255 255"
                                className="flex-1 text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'sidebar' && (
            <Card>
              <CardHeader>
                <CardTitle>Sidebar & Header Colors</CardTitle>
                <CardDescription>Customize navigation and header appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Sidebar Colors</h3>
                    <div className="space-y-4">
                      {['sidebar-background', 'sidebar-foreground', 'sidebar-accent'].map((colorKey) => {
                        const colorValue = colors[colorKey] || { light: '0 0 0', dark: '15 23 42' };
                        return (
                          <div key={colorKey} className="space-y-2">
                            <Label className="text-sm font-medium">{colorKey.split('-')[1]}</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded border border-border"
                                style={{ backgroundColor: `rgb(${colorValue[actualTheme]})` }}
                              />
                              <Input
                                type="color"
                                value={rgbToHex(colorValue[actualTheme])}
                                onChange={(e) => updateColor(colorKey, actualTheme, hexToRgb(e.target.value))}
                                className="w-16 h-8 p-1 border-border"
                              />
                              <Input
                                value={colorValue[actualTheme]}
                                onChange={(e) => updateColor(colorKey, actualTheme, e.target.value)}
                                placeholder="255 255 255"
                                className="flex-1 text-sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Header Colors</h3>
                    <div className="space-y-4">
                      {['header-background', 'header-foreground'].map((colorKey) => {
                        const colorValue = colors[colorKey] || { light: '255 255 255', dark: '22 27 34' };
                        return (
                          <div key={colorKey} className="space-y-2">
                            <Label className="text-sm font-medium">{colorKey.split('-')[1]}</Label>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded border border-border"
                                style={{ backgroundColor: `rgb(${colorValue[actualTheme]})` }}
                              />
                              <Input
                                type="color"
                                value={rgbToHex(colorValue[actualTheme])}
                                onChange={(e) => updateColor(colorKey, actualTheme, hexToRgb(e.target.value))}
                                className="w-16 h-8 p-1 border-border"
                              />
                              <Input
                                value={colorValue[actualTheme]}
                                onChange={(e) => updateColor(colorKey, actualTheme, e.target.value)}
                                placeholder="255 255 255"
                                className="flex-1 text-sm"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'branding' && (
            <Card>
              <CardHeader>
                <CardTitle>Logo & Branding</CardTitle>
                <CardDescription>Upload logos and customize branding text</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Use Logo Instead of Text</Label>
                      <p className="text-sm text-muted-foreground">Replace text branding with uploaded logos</p>
                    </div>
                    <Switch
                      checked={brandSettings.useLogo}
                      onCheckedChange={(checked) => updateBrandSettings({ useLogo: checked })}
                    />
                  </div>

                  {brandSettings.useLogo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Light Mode Logo</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                          {brandSettings.lightModeLogo ? (
                            <div className="space-y-3">
                              <img 
                                src={brandSettings.lightModeLogo} 
                                alt="Light mode logo" 
                                className="mx-auto max-h-16 max-w-full object-contain"
                              />
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('light-logo-upload')?.click()}
                                >
                                  Replace
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeLogo('light')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                              <div>
                                <Button
                                  variant="outline"
                                  onClick={() => document.getElementById('light-logo-upload')?.click()}
                                >
                                  Upload Light Logo
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                  PNG, JPG, SVG up to 2MB
                                </p>
                              </div>
                            </div>
                          )}
                          <input
                            id="light-logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'light')}
                            className="hidden"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Dark Mode Logo</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
                          {brandSettings.darkModeLogo ? (
                            <div className="space-y-3">
                              <img 
                                src={brandSettings.darkModeLogo} 
                                alt="Dark mode logo" 
                                className="mx-auto max-h-16 max-w-full object-contain"
                              />
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('dark-logo-upload')?.click()}
                                >
                                  Replace
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeLogo('dark')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                              <div>
                                <Button
                                  variant="outline"
                                  onClick={() => document.getElementById('dark-logo-upload')?.click()}
                                >
                                  Upload Dark Logo
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2">
                                  PNG, JPG, SVG up to 2MB
                                </p>
                              </div>
                            </div>
                          )}
                          <input
                            id="dark-logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], 'dark')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold">Text Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brand-text" className="text-sm font-medium">Brand Name</Label>
                        <Input
                          id="brand-text"
                          value={brandSettings.brandText}
                          onChange={(e) => updateBrandSettings({ brandText: e.target.value })}
                          placeholder="Your App Name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tagline" className="text-sm font-medium">Tagline</Label>
                        <Input
                          id="tagline"
                          value={brandSettings.tagline}
                          onChange={(e) => updateBrandSettings({ tagline: e.target.value })}
                          placeholder="Your app description"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <Label className="text-sm font-medium mb-2 block">Preview</Label>
                    <div className="flex items-center gap-3">
                      {brandSettings.useLogo && (brandSettings.lightModeLogo || brandSettings.darkModeLogo) ? (
                        <div className="w-8 h-8">
                          <img 
                            src={actualTheme === 'light' ? brandSettings.lightModeLogo || brandSettings.darkModeLogo : brandSettings.darkModeLogo || brandSettings.lightModeLogo} 
                            alt="Logo preview" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <Settings className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm">{brandSettings.brandText}</div>
                        {brandSettings.showTagline && (
                          <div className="text-xs opacity-75">{brandSettings.tagline}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'debug' && (
            <Card>
              <CardHeader>
                <CardTitle>Debug Settings</CardTitle>
                <CardDescription>Control theme debugging features across all pages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show Theme Debug Sections</Label>
                      <p className="text-sm text-muted-foreground">Display theme status sections on all pages for debugging</p>
                    </div>
                    <Switch
                      checked={debugSettings.showThemeDebug}
                      onCheckedChange={(checked) => updateDebugSettings({ showThemeDebug: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show Color Preview</Label>
                      <p className="text-sm text-muted-foreground">Display color swatches in debug sections</p>
                    </div>
                    <Switch
                      checked={debugSettings.showColorPreview}
                      onCheckedChange={(checked) => updateDebugSettings({ showColorPreview: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Show Theme Information</Label>
                      <p className="text-sm text-muted-foreground">Display current theme mode and status information</p>
                    </div>
                    <Switch
                      checked={debugSettings.showThemeInfo}
                      onCheckedChange={(checked) => updateDebugSettings({ showThemeInfo: checked })}
                    />
                  </div>

                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="font-semibold mb-3">Current Debug Status</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {debugSettings.showThemeDebug ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        Theme Debug Sections
                      </div>
                      <div className="flex items-center gap-2">
                        {debugSettings.showColorPreview ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        Color Previews
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it Works</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Toggle "Show Theme Debug Sections" to show/hide debug panels on all pages</li>
                      <li>• Changes are staged until you click "Save All Settings"</li>
                      <li>• Debug sections help verify colors are working correctly</li>
                      <li>• Turn off debug sections for production use</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your current theme looks across different modes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-border rounded-lg p-4 bg-white text-black">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light Theme
                    </h3>
                    <div className="space-y-3">
                      <div style={{ backgroundColor: `rgb(${colors['bg-primary']?.light || '255 255 255'})`, color: `rgb(${colors['text-primary']?.light || '26 32 44'})` }} className="p-3 rounded border">
                        <p className="font-medium">Primary Background</p>
                        <p className="text-sm opacity-75">rgb({colors['bg-primary']?.light || '255 255 255'})</p>
                      </div>
                      <div style={{ backgroundColor: `rgb(${colors['accent-primary']?.light || '49 130 206'})`, color: 'white' }} className="p-3 rounded">
                        <p className="font-medium">Primary Accent</p>
                        <p className="text-sm opacity-75">rgb({colors['accent-primary']?.light || '49 130 206'})</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4 bg-gray-900 text-white">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark Theme
                    </h3>
                    <div className="space-y-3">
                      <div style={{ backgroundColor: `rgb(${colors['bg-primary']?.dark || '14 17 23'})`, color: `rgb(${colors['text-primary']?.dark || '240 246 252'})` }} className="p-3 rounded border border-gray-700">
                        <p className="font-medium">Primary Background</p>
                        <p className="text-sm opacity-75">rgb({colors['bg-primary']?.dark || '14 17 23'})</p>
                      </div>
                      <div style={{ backgroundColor: `rgb(${colors['accent-primary']?.dark || '56 189 248'})`, color: 'white' }} className="p-3 rounded">
                        <p className="font-medium">Primary Accent</p>
                        <p className="text-sm opacity-75">rgb({colors['accent-primary']?.dark || '56 189 248'})</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
                  <h3 className="font-semibold mb-3">Current Theme Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Theme Mode</p>
                      <p className="font-medium capitalize">{themeMode}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Active Theme</p>
                      <p className="font-medium capitalize">{actualTheme}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Debug Status</p>
                      <p className="font-medium">{debugSettings.showThemeDebug ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Branding</p>
                      <p className="font-medium">{brandSettings.useLogo ? 'Logo' : 'Text'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
