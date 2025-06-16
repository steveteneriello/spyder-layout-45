import React, { useState, useEffect } from 'react';
import { Settings, Monitor, Sun, Moon, Palette, RotateCcw, Upload, Type, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGlobalTheme, ThemeMode } from '@/contexts/GlobalThemeContext';
import SidebarLayout from '@/components/layout/SidebarLayout';

interface ColorSettings {
  [key: string]: {
    light: string;
    dark: string;
  };
}

interface HeaderSettings {
  light: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImage: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
  dark: {
    logoType: 'text' | 'image';
    logoText: string;
    logoImage: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
  };
}

interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  pageTitleSize: string;
  pageTitleWeight: string;
  pageTitleColor: {
    light: string;
    dark: string;
  };
}

const defaultColors: ColorSettings = {
  'bg-primary': { light: '255 255 255', dark: '14 17 23' },
  'bg-secondary': { light: '251 252 253', dark: '22 27 34' },
  'bg-tertiary': { light: '248 249 250', dark: '33 38 45' },
  'bg-hover': { light: '241 243 245', dark: '48 54 61' },
  'bg-active': { light: '233 236 239', dark: '55 62 71' },
  'bg-selected': { light: '227 242 253', dark: '28 33 40' },
  'text-primary': { light: '26 32 44', dark: '240 246 252' },
  'text-secondary': { light: '74 85 104', dark: '125 133 144' },
  'text-tertiary': { light: '113 128 150', dark: '101 109 118' },
  'text-inverse': { light: '255 255 255', dark: '14 17 23' },
  'accent-primary': { light: '49 130 206', dark: '56 139 253' },
  'accent-primary-hover': { light: '44 82 130', dark: '31 111 235' },
  'accent-primary-active': { light: '42 67 101', dark: '26 84 144' },
  'success': { light: '56 161 105', dark: '63 185 80' },
  'warning': { light: '221 107 32', dark: '210 153 34' },
  'error': { light: '229 62 62', dark: '248 81 73' },
  'border-primary': { light: '226 232 240', dark: '48 54 61' },
  'border-secondary': { light: '241 243 245', dark: '33 38 45' },
  'border-focus': { light: '49 130 206', dark: '56 139 253' },
  'sidebar-background': { light: '0 0 0', dark: '0 0 0' },
  'sidebar-foreground': { light: '255 255 255', dark: '255 255 255' },
  'sidebar-primary': { light: '255 255 255', dark: '255 255 255' },
  'sidebar-primary-foreground': { light: '0 0 0', dark: '0 0 0' },
  'sidebar-accent': { light: '0 0 10.2', dark: '0 0 10.2' },
  'sidebar-accent-foreground': { light: '255 255 255', dark: '255 255 255' },
  'sidebar-border': { light: '0 0 0', dark: '0 0 0' },
  'sidebar-ring': { light: '217 91 60', dark: '217 91 60' },
  'header-background': { light: '255 255 255', dark: '14 17 23' },
  'header-text': { light: '26 32 44', dark: '240 246 252' },
  'header-border': { light: '226 232 240', dark: '48 54 61' },
};

const defaultHeaderSettings: HeaderSettings = {
  light: {
    logoType: 'text',
    logoText: 'Your App',
    logoImage: '',
    backgroundColor: '#ffffff',
    textColor: '#1a202c',
    borderColor: '#e2e8f0',
  },
  dark: {
    logoType: 'text',
    logoText: 'Your App',
    logoImage: '',
    backgroundColor: '#0e1117',
    textColor: '#f0f6fc',
    borderColor: '#30363d',
  },
};

const defaultTypographySettings: TypographySettings = {
  headingFont: 'Inter',
  bodyFont: 'Inter',
  pageTitleSize: '24px',
  pageTitleWeight: '600',
  pageTitleColor: {
    light: '#1a202c',
    dark: '#f0f6fc',
  },
};

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
  'Raleway',
  'Ubuntu',
];

const AdminThemeSettings = () => {
  const { themeMode, actualTheme, setThemeMode, isSystemDark } = useGlobalTheme();
  const [colors, setColors] = useState<ColorSettings>(defaultColors);
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [typographySettings, setTypographySettings] = useState<TypographySettings>(defaultTypographySettings);
  const [activeSection, setActiveSection] = useState('theme');
  const [activeColorGroup, setActiveColorGroup] = useState('backgrounds');

  const colorGroups = {
    backgrounds: ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-hover', 'bg-active', 'bg-selected'],
    text: ['text-primary', 'text-secondary', 'text-tertiary', 'text-inverse'],
    accents: ['accent-primary', 'accent-primary-hover', 'accent-primary-active'],
    status: ['success', 'warning', 'error'],
    borders: ['border-primary', 'border-secondary', 'border-focus'],
    sidebar: ['sidebar-background', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground', 'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring'],
    header: ['header-background', 'header-text', 'header-border']
  };

  const colorGroupLabels = {
    backgrounds: 'Background Colors',
    text: 'Text Colors',
    accents: 'Accent Colors',
    status: 'Status Colors',
    borders: 'Border Colors',
    sidebar: 'Sidebar Colors',
    header: 'Header Colors'
  };

  const sections = [
    { id: 'theme', label: 'Theme Mode', icon: Monitor },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'header', label: 'Header & Logo', icon: Image },
    { id: 'typography', label: 'Typography', icon: Type },
  ];

  const themeOptions = [
    {
      id: 'light' as ThemeMode,
      title: 'Light Mode',
      description: 'Clean and bright interface for better visibility in well-lit environments',
      icon: Sun,
      preview: 'light'
    },
    {
      id: 'dark' as ThemeMode,
      title: 'Dark Mode',
      description: 'Easy on the eyes in low-light conditions and reduces eye strain',
      icon: Moon,
      preview: 'dark'
    },
    {
      id: 'auto' as ThemeMode,
      title: 'Auto Mode',
      description: `Automatically switches based on your system preference (currently ${isSystemDark ? 'dark' : 'light'})`,
      icon: Monitor,
      preview: 'auto'
    }
  ];

  const menuItems = [
    { title: "Dashboard", path: "/", icon: "home", section: "Main" },
    { title: "Campaigns", path: "/campaigns", icon: "megaphone", section: "Tools" },
    { title: "Scheduler", path: "/scheduler", icon: "calendar", section: "Tools" },
    { title: "Location Builder", path: "/location-builder", icon: "map-pin", section: "Tools" },
    { title: "Theme Settings", path: "/admin/theme", icon: "palette", section: "Admin" },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    // Reapply colors after theme change to ensure they work with the new theme
    setTimeout(() => applyColors(), 100);
  };

  const handleColorChange = (colorKey: string, mode: 'light' | 'dark', value: string) => {
    console.log('Color change:', colorKey, mode, value);
    
    // Convert hex to RGB if needed
    let rgbValue = value;
    if (value.startsWith('#')) {
      const rgb = hexToRgb(value);
      if (rgb) {
        rgbValue = rgb;
      }
    }
    
    console.log('Setting color:', colorKey, mode, rgbValue);
    
    setColors(prev => ({
      ...prev,
      [colorKey]: {
        ...prev[colorKey],
        [mode]: rgbValue
      }
    }));
    
    // Apply the color immediately
    if (mode === actualTheme) {
      const cssVariable = `--${colorKey}`;
      document.documentElement.style.setProperty(cssVariable, rgbValue);
      console.log(`Applied ${cssVariable} = ${rgbValue}`);
    }
  };

  const handleHeaderSettingChange = (mode: 'light' | 'dark', key: string, value: string) => {
    setHeaderSettings(prev => ({
      ...prev,
      [mode]: {
        ...prev[mode],
        [key]: value
      }
    }));
  };

  const handleTypographyChange = (key: string, value: string) => {
    setTypographySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePageTitleColorChange = (mode: 'light' | 'dark', value: string) => {
    setTypographySettings(prev => ({
      ...prev,
      pageTitleColor: {
        ...prev.pageTitleColor,
        [mode]: value
      }
    }));
  };

  const hexToRgb = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r} ${g} ${b}`;
    }
    return null;
  };

  const rgbToHex = (rgb: string): string => {
    const [r, g, b] = rgb.split(' ').map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const resetColors = () => {
    setColors(defaultColors);
    applyColors();
  };

  const resetHeaderSettings = () => {
    setHeaderSettings(defaultHeaderSettings);
    applyHeaderSettings();
  };

  const resetTypography = () => {
    setTypographySettings(defaultTypographySettings);
    applyTypographySettings();
  };

  const applyColors = () => {
    console.log('Applying colors for theme:', actualTheme);
    Object.entries(colors).forEach(([key, values]) => {
      const colorValue = values[actualTheme];
      const cssVariable = `--${key}`;
      document.documentElement.style.setProperty(cssVariable, colorValue);
      console.log(`Set ${cssVariable} to ${colorValue}`);
    });
  };

  const applyHeaderSettings = () => {
    const currentHeaderSettings = headerSettings[actualTheme];
    console.log('Applying header settings:', currentHeaderSettings);
    
    // Convert hex to RGB for CSS variables
    const bgRgb = hexToRgb(currentHeaderSettings.backgroundColor);
    const textRgb = hexToRgb(currentHeaderSettings.textColor);
    const borderRgb = hexToRgb(currentHeaderSettings.borderColor);
    
    if (bgRgb) {
      document.documentElement.style.setProperty('--header-background', bgRgb);
    }
    if (textRgb) {
      document.documentElement.style.setProperty('--header-text', textRgb);
    }
    if (borderRgb) {
      document.documentElement.style.setProperty('--header-border', borderRgb);
    }
    
    // Store logo settings for components to access
    document.documentElement.style.setProperty('--header-logo-type', currentHeaderSettings.logoType);
    document.documentElement.style.setProperty('--header-logo-text', currentHeaderSettings.logoText);
    document.documentElement.style.setProperty('--header-logo-image', currentHeaderSettings.logoImage);
  };

  const applyTypographySettings = () => {
    console.log('Applying typography settings:', typographySettings);
    
    // Apply font families
    document.documentElement.style.setProperty('--heading-font', typographySettings.headingFont);
    document.documentElement.style.setProperty('--body-font', typographySettings.bodyFont);
    
    // Apply page title styles
    document.documentElement.style.setProperty('--page-title-size', typographySettings.pageTitleSize);
    document.documentElement.style.setProperty('--page-title-weight', typographySettings.pageTitleWeight);
    
    const titleColorRgb = hexToRgb(typographySettings.pageTitleColor[actualTheme]);
    if (titleColorRgb) {
      document.documentElement.style.setProperty('--page-title-color', titleColorRgb);
    }
  };

  const applyAllSettings = () => {
    console.log('Applying all settings...');
    applyColors();
    applyHeaderSettings();
    applyTypographySettings();
    
    // Show confirmation
    const event = new CustomEvent('toast', {
      detail: {
        title: 'Settings Applied',
        description: 'All theme settings have been applied successfully',
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  // Apply settings when theme changes
  useEffect(() => {
    applyColors();
    applyHeaderSettings();
    applyTypographySettings();
  }, [actualTheme]);

  const renderThemeSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Theme Preference
        </CardTitle>
        <CardDescription>
          Choose how the application should appear. Your selection will be saved and applied across all sessions.
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
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onClick={() => handleThemeChange(option.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <ThemePreview mode={option.preview} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`} />
                      <h3 className={`font-semibold ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'}`}>
                        {option.title}
                      </h3>
                    </div>
                    <p className={`text-sm ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {option.description}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isActive 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderColorsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Customization
        </CardTitle>
        <CardDescription>
          Customize theme colors for both light and dark modes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(colorGroupLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={activeColorGroup === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveColorGroup(key)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {colorGroups[activeColorGroup as keyof typeof colorGroups]?.map((colorKey) => (
            <div key={colorKey} className="p-3 border rounded-lg">
              <Label className="text-sm font-medium mb-2 block capitalize">
                {colorKey.replace(/-/g, ' ')}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Light Mode</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={rgbToHex(colors[colorKey]?.light || '255 255 255')}
                      onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                      className="w-12 h-8 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={rgbToHex(colors[colorKey]?.light || '255 255 255')}
                      onChange={(e) => handleColorChange(colorKey, 'light', e.target.value)}
                      className="text-xs flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Dark Mode</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={rgbToHex(colors[colorKey]?.dark || '14 17 23')}
                      onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                      className="w-12 h-8 p-1 rounded"
                    />
                    <Input
                      type="text"
                      value={rgbToHex(colors[colorKey]?.dark || '14 17 23')}
                      onChange={(e) => handleColorChange(colorKey, 'dark', e.target.value)}
                      className="text-xs flex-1"
                      placeholder="#0e1117"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button onClick={applyColors} size="sm" className="flex-1">
            Apply Colors
          </Button>
          <Button onClick={resetColors} variant="outline" size="sm" className="flex items-center gap-1">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderHeaderSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Header & Logo Settings
        </CardTitle>
        <CardDescription>
          Configure the header appearance and logo for both light and dark modes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(['light', 'dark'] as const).map((mode) => (
            <div key={mode} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-4 capitalize">{mode} Mode Header</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-2 block">Logo Type</Label>
                  <Select
                    value={headerSettings[mode].logoType}
                    onValueChange={(value: 'text' | 'image') => handleHeaderSettingChange(mode, 'logoType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Logo</SelectItem>
                      <SelectItem value="image">Image Logo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {headerSettings[mode].logoType === 'text' ? (
                  <div>
                    <Label className="text-sm mb-2 block">Logo Text</Label>
                    <Input
                      value={headerSettings[mode].logoText}
                      onChange={(e) => handleHeaderSettingChange(mode, 'logoText', e.target.value)}
                      placeholder="Your App Name"
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm mb-2 block">Logo Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={headerSettings[mode].logoImage}
                        onChange={(e) => handleHeaderSettingChange(mode, 'logoImage', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm mb-2 block">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={headerSettings[mode].backgroundColor}
                      onChange={(e) => handleHeaderSettingChange(mode, 'backgroundColor', e.target.value)}
                      className="w-12 h-8 p-1 rounded"
                    />
                    <Input
                      value={headerSettings[mode].backgroundColor}
                      onChange={(e) => handleHeaderSettingChange(mode, 'backgroundColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={headerSettings[mode].textColor}
                      onChange={(e) => handleHeaderSettingChange(mode, 'textColor', e.target.value)}
                      className="w-12 h-8 p-1 rounded"
                    />
                    <Input
                      value={headerSettings[mode].textColor}
                      onChange={(e) => handleHeaderSettingChange(mode, 'textColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm mb-2 block">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={headerSettings[mode].borderColor}
                      onChange={(e) => handleHeaderSettingChange(mode, 'borderColor', e.target.value)}
                      className="w-12 h-8 p-1 rounded"
                    />
                    <Input
                      value={headerSettings[mode].borderColor}
                      onChange={(e) => handleHeaderSettingChange(mode, 'borderColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyAllSettings} size="sm" className="flex-1">
              Apply Header Settings
            </Button>
            <Button onClick={resetHeaderSettings} variant="outline" size="sm" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTypographySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Typography Settings
        </CardTitle>
        <CardDescription>
          Configure fonts, page titles, and text styling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Heading Font</Label>
              <Select
                value={typographySettings.headingFont}
                onValueChange={(value) => handleTypographyChange('headingFont', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Body Font</Label>
              <Select
                value={typographySettings.bodyFont}
                onValueChange={(value) => handleTypographyChange('bodyFont', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-4">Page Title Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Font Size</Label>
                <Select
                  value={typographySettings.pageTitleSize}
                  onValueChange={(value) => handleTypographyChange('pageTitleSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18px">18px</SelectItem>
                    <SelectItem value="20px">20px</SelectItem>
                    <SelectItem value="24px">24px</SelectItem>
                    <SelectItem value="28px">28px</SelectItem>
                    <SelectItem value="32px">32px</SelectItem>
                    <SelectItem value="36px">36px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Font Weight</Label>
                <Select
                  value={typographySettings.pageTitleWeight}
                  onValueChange={(value) => handleTypographyChange('pageTitleWeight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="400">Normal (400)</SelectItem>
                    <SelectItem value="500">Medium (500)</SelectItem>
                    <SelectItem value="600">Semi Bold (600)</SelectItem>
                    <SelectItem value="700">Bold (700)</SelectItem>
                    <SelectItem value="800">Extra Bold (800)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Light Mode Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={typographySettings.pageTitleColor.light}
                    onChange={(e) => handlePageTitleColorChange('light', e.target.value)}
                    className="w-12 h-8 p-1 rounded"
                  />
                  <Input
                    value={typographySettings.pageTitleColor.light}
                    onChange={(e) => handlePageTitleColorChange('light', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Dark Mode Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={typographySettings.pageTitleColor.dark}
                    onChange={(e) => handlePageTitleColorChange('dark', e.target.value)}
                    className="w-12 h-8 p-1 rounded"
                  />
                  <Input
                    value={typographySettings.pageTitleColor.dark}
                    onChange={(e) => handlePageTitleColorChange('dark', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyAllSettings} size="sm" className="flex-1">
              Apply Typography
            </Button>
            <Button onClick={resetTypography} variant="outline" size="sm" className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarLayout
      menuItems={menuItems}
      nav={
        <div className="flex items-center justify-between w-full px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-white">Admin</h1>
          </div>
        </div>
      }
      category={
        <div className="flex items-center space-x-2 text-white/80 text-sm">
          <Palette className="h-4 w-4" />
          <span>Theme Settings</span>
        </div>
      }
      footer={
        <div className="text-xs text-white/60 text-center">
          <p>Current: {actualTheme} mode</p>
        </div>
      }
    >
      <div className="h-full bg-slate-50 dark:bg-slate-900">
        {/* Page header */}
        <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center">
              <Palette className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              Global Theme Settings
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Configure the global appearance settings, customize colors, header design, and typography for all users. Changes will apply immediately and be saved as the default preference.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6">
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
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 max-w-6xl">
          {activeSection === 'theme' && renderThemeSection()}
          {activeSection === 'colors' && renderColorsSection()}
          {activeSection === 'header' && renderHeaderSection()}
          {activeSection === 'typography' && renderTypographySection()}

          {/* Global Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Apply All Changes</CardTitle>
              <CardDescription>
                Apply all customizations and view current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Button onClick={applyAllSettings} size="lg" className="flex-1">
                  Apply All Settings
                </Button>
                <Button onClick={() => {
                  resetColors();
                  resetHeaderSettings();
                  resetTypography();
                }} variant="outline" size="lg" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Everything
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme Mode</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {themeMode}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Theme</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {actualTheme}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">System Preference</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
                    {isSystemDark ? 'Dark' : 'Light'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

// Theme Preview Component
const ThemePreview: React.FC<{ mode: string }> = ({ mode }) => {
  return (
    <div className="w-16 h-12 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      {mode === 'auto' ? (
        <div className="flex h-full">
          <div className="flex-1 bg-white">
            <div className="h-2 bg-slate-100 border-b border-slate-200"></div>
            <div className="p-1">
              <div className="h-1 bg-slate-200 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-100 rounded"></div>
            </div>
          </div>
          <div className="flex-1 bg-slate-900">
            <div className="h-2 bg-slate-800 border-b border-slate-700"></div>
            <div className="p-1">
              <div className="h-1 bg-slate-700 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-800 rounded"></div>
            </div>
          </div>
        </div>
      ) : mode === 'dark' ? (
        <div className="h-full bg-slate-900">
          <div className="h-2 bg-slate-800 border-b border-slate-700"></div>
          <div className="flex">
            <div className="w-3 bg-slate-800 border-r border-slate-700 h-10"></div>
            <div className="flex-1 p-1">
              <div className="h-1 bg-slate-700 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-800 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full bg-white">
          <div className="h-2 bg-slate-100 border-b border-slate-200"></div>
          <div className="flex">
            <div className="w-3 bg-slate-50 border-r border-slate-200 h-10"></div>
            <div className="flex-1 p-1">
              <div className="h-1 bg-slate-200 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-100 rounded mb-0.5"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminThemeSettings;
