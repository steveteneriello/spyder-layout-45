
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  Image, 
  Type, 
  Sun, 
  Moon, 
  Monitor, 
  Trash2, 
  Eye, 
  Download, 
  RefreshCw,
  Palette,
  Settings
} from 'lucide-react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';

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

export function LogoBrandSettings() {
  const { actualTheme } = useGlobalTheme();
  const lightFileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);

  // Get brand settings from localStorage
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    const saved = localStorage.getItem('brand-settings');
    return saved ? JSON.parse(saved) : {
      useLogo: false,
      brandText: 'Your App Name',
      tagline: 'Powered by Excellence',
      lightModeLogo: null,
      darkModeLogo: null,
      logoSize: 'md',
      showTagline: true,
      logoPosition: 'left',
    };
  });

  // Save brand settings to localStorage and dispatch event
  const updateBrandSettings = (newSettings: Partial<BrandSettings>) => {
    const updated = { ...brandSettings, ...newSettings };
    setBrandSettings(updated);
    localStorage.setItem('brand-settings', JSON.stringify(updated));
    
    // Trigger custom event to notify other components
    window.dispatchEvent(new CustomEvent('brandSettingsChanged', { 
      detail: updated 
    }));
  };

  // Handle file upload for logos
  const handleLogoUpload = (mode: 'light' | 'dark', file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateBrandSettings({
          [mode === 'light' ? 'lightModeLogo' : 'darkModeLogo']: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = (mode: 'light' | 'dark') => {
    updateBrandSettings({
      [mode === 'light' ? 'lightModeLogo' : 'darkModeLogo']: null
    });
  };

  // Get current logo based on theme
  const getCurrentLogo = () => {
    return actualTheme === 'dark' ? brandSettings.darkModeLogo : brandSettings.lightModeLogo;
  };

  // Logo size classes
  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'h-6 w-6';
      case 'lg': return 'h-10 w-10';
      default: return 'h-8 w-8';
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo Management
          </CardTitle>
          <CardDescription>
            Upload different logos for light and dark themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Logo Toggle */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Image className="h-4 w-4 text-primary" />
                  <Label htmlFor="use-logo" className="text-sm font-medium">
                    Use Logo Instead of Text
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Show uploaded logo images instead of text branding
                </p>
              </div>
              <Switch
                id="use-logo"
                checked={brandSettings.useLogo}
                onCheckedChange={(checked) => updateBrandSettings({ useLogo: checked })}
              />
            </div>

            {/* Logo Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Light Mode Logo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <Label className="text-sm font-medium">Light Mode Logo</Label>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {brandSettings.lightModeLogo ? (
                    <div className="space-y-3">
                      <img 
                        src={brandSettings.lightModeLogo} 
                        alt="Light mode logo"
                        className="max-h-16 mx-auto object-contain"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => lightFileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Replace
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeLogo('light')}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Upload Light Logo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 2MB</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => lightFileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={lightFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('light', file);
                  }}
                />
              </div>

              {/* Dark Mode Logo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm font-medium">Dark Mode Logo</Label>
                </div>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-slate-900">
                  {brandSettings.darkModeLogo ? (
                    <div className="space-y-3">
                      <img 
                        src={brandSettings.darkModeLogo} 
                        alt="Dark mode logo"
                        className="max-h-16 mx-auto object-contain"
                      />
                      <div className="flex gap-2 justify-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => darkFileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Replace
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeLogo('dark')}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="h-8 w-8 text-white/60 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-white">Upload Dark Logo</p>
                        <p className="text-xs text-white/60">PNG, JPG, SVG up to 2MB</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => darkFileInputRef.current?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={darkFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload('dark', file);
                  }}
                />
              </div>
            </div>

            {/* Logo Settings */}
            {brandSettings.useLogo && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold">Logo Display Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Logo Size</Label>
                    <div className="flex gap-2">
                      {['sm', 'md', 'lg'].map((size) => (
                        <Button
                          key={size}
                          size="sm"
                          variant={brandSettings.logoSize === size ? "default" : "outline"}
                          onClick={() => updateBrandSettings({ logoSize: size as 'sm' | 'md' | 'lg' })}
                        >
                          {size.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Position</Label>
                    <div className="flex gap-2">
                      {[
                        { value: 'left', label: 'Left' },
                        { value: 'center', label: 'Center' }
                      ].map((position) => (
                        <Button
                          key={position.value}
                          size="sm"
                          variant={brandSettings.logoPosition === position.value ? "default" : "outline"}
                          onClick={() => updateBrandSettings({ logoPosition: position.value as 'left' | 'center' })}
                        >
                          {position.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Text Branding Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text Branding
          </CardTitle>
          <CardDescription>
            Customize text-based branding for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Brand Text */}
            <div>
              <Label htmlFor="brand-text" className="text-sm font-medium mb-2 block">
                Brand Name
              </Label>
              <Input
                id="brand-text"
                value={brandSettings.brandText}
                onChange={(e) => updateBrandSettings({ brandText: e.target.value })}
                placeholder="Your App Name"
                className="font-semibold"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Main brand name displayed in the header
              </p>
            </div>

            {/* Tagline */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="tagline" className="text-sm font-medium">
                  Tagline
                </Label>
                <Switch
                  checked={brandSettings.showTagline}
                  onCheckedChange={(checked) => updateBrandSettings({ showTagline: checked })}
                />
              </div>
              <Input
                id="tagline"
                value={brandSettings.tagline}
                onChange={(e) => updateBrandSettings({ tagline: e.target.value })}
                placeholder="Powered by Excellence"
                disabled={!brandSettings.showTagline}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Subtitle displayed below the brand name
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how your branding will appear in the header
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {/* Preview for Current Theme */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {actualTheme === 'dark' ? (
                  <Moon className="h-4 w-4 text-blue-500" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm font-medium capitalize">{actualTheme} Mode Preview</span>
              </div>
              
              <div className={`p-4 rounded-lg border border-border ${
                actualTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}>
                <div className="flex items-center gap-3">
                  {brandSettings.useLogo && getCurrentLogo() ? (
                    <img 
                      src={getCurrentLogo()!} 
                      alt="Logo preview"
                      className={`object-contain ${getSizeClass(brandSettings.logoSize)}`}
                    />
                  ) : (
                    <div className={`${getSizeClass(brandSettings.logoSize)} bg-primary rounded-lg flex items-center justify-center`}>
                      <Palette className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div className={brandSettings.logoPosition === 'center' ? 'text-center' : ''}>
                    <div className="font-bold text-sm">{brandSettings.brandText}</div>
                    {brandSettings.showTagline && (
                      <div className="text-xs opacity-75">{brandSettings.tagline}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview for Both Themes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Light Preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Light Theme</span>
                </div>
                <div className="p-4 rounded-lg border border-border bg-white text-black">
                  <div className="flex items-center gap-3">
                    {brandSettings.useLogo && brandSettings.lightModeLogo ? (
                      <img 
                        src={brandSettings.lightModeLogo} 
                        alt="Light logo"
                        className={`object-contain ${getSizeClass(brandSettings.logoSize)}`}
                      />
                    ) : (
                      <div className={`${getSizeClass(brandSettings.logoSize)} bg-blue-500 rounded-lg flex items-center justify-center`}>
                        <Palette className="h-4 w-4 text-white" />
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

              {/* Dark Preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Dark Theme</span>
                </div>
                <div className="p-4 rounded-lg border border-border bg-slate-900 text-white">
                  <div className="flex items-center gap-3">
                    {brandSettings.useLogo && brandSettings.darkModeLogo ? (
                      <img 
                        src={brandSettings.darkModeLogo} 
                        alt="Dark logo"
                        className={`object-contain ${getSizeClass(brandSettings.logoSize)}`}
                      />
                    ) : (
                      <div className={`${getSizeClass(brandSettings.logoSize)} bg-blue-500 rounded-lg flex items-center justify-center`}>
                        <Palette className="h-4 w-4 text-white" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={() => {
          updateBrandSettings({
            useLogo: false,
            brandText: 'Your App Name',
            tagline: 'Powered by Excellence',
            lightModeLogo: null,
            darkModeLogo: null,
            logoSize: 'md',
            showTagline: true,
            logoPosition: 'left',
          });
        }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

// Hook for other components to use brand settings
export function useBrandSettings() {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    const saved = localStorage.getItem('brand-settings');
    return saved ? JSON.parse(saved) : {
      useLogo: false,
      brandText: 'Your App Name',
      tagline: 'Powered by Excellence',
      lightModeLogo: null,
      darkModeLogo: null,
      logoSize: 'md',
      showTagline: true,
      logoPosition: 'left',
    };
  });

  React.useEffect(() => {
    const handleBrandSettingsChange = (event: CustomEvent<BrandSettings>) => {
      setBrandSettings(event.detail);
    };

    window.addEventListener('brandSettingsChanged', handleBrandSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('brandSettingsChanged', handleBrandSettingsChange as EventListener);
    };
  }, []);

  return brandSettings;
}

export default LogoBrandSettings;
