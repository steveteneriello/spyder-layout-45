import React, { useState } from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { DebugErrorBoundary } from '@/components/debug/DebugPanel';
import { useDebugLogger } from '@/components/debug/DebugPanel';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  AlertTriangle, 
  X,
  Play,
  Pause,
  Settings,
  Home,
  User,
  Bell,
  Search
} from 'lucide-react';

function ThemeDemoPage() {
  const { themeMode, setThemeMode, actualTheme, debugSettings, updateDebugSettings } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const debugLogger = useDebugLogger('ThemeSystemDemo');
  
  const allMenuItems = getMenuItems();
  const menuSections = getSections();
  
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const themeOptions = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'auto', label: 'Auto Mode', icon: Monitor }
  ];

  const statusExamples = [
    { type: 'success', message: 'Theme system working correctly', icon: Check },
    { type: 'warning', message: 'Some components may need refresh', icon: AlertTriangle },
    { type: 'error', message: 'Unable to load custom theme', icon: X }
  ];

  const interactiveCards = [
    { id: 'dashboard', title: 'Dashboard', description: 'Main overview', icon: Home },
    { id: 'profile', title: 'Profile', description: 'User settings', icon: User },
    { id: 'notifications', title: 'Notifications', description: 'Recent alerts', icon: Bell }
  ];

  const handleThemeChange = (newTheme: string) => {
    debugLogger.log('Theme changed', { from: themeMode, to: newTheme });
    setThemeMode(newTheme as any);
  };

  const handleCardSelect = (cardId: string) => {
    debugLogger.log('Card selected', { cardId });
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
            Complete Theme System Demo
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Implementation Guide Showcase - All Components & States
          </p>
          <Badge variant="outline" className="mt-2">
            Current: {actualTheme} mode
          </Badge>
        </div>

          {/* Theme Controls */}
          <Card className="mb-6 sm:mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Controls
            </CardTitle>
            <CardDescription>
              Switch between themes and toggle debug features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Theme Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.id}
                        variant={themeMode === option.id ? "default" : "outline"}
                        onClick={() => setThemeMode(option.id as any)}
                        className="flex flex-col items-center gap-2 h-auto p-4"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Debug Controls */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Debug Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debug-toggle" className="text-sm">Show Theme Debug</Label>
                    <Switch
                      id="debug-toggle"
                      checked={debugSettings.showThemeDebug}
                      onCheckedChange={(checked) => 
                        updateDebugSettings({ showThemeDebug: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="color-preview" className="text-sm">Color Preview</Label>
                    <Switch
                      id="color-preview"
                      checked={debugSettings.showColorPreview}
                      onCheckedChange={(checked) => 
                        updateDebugSettings({ showColorPreview: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Components</CardTitle>
            <CardDescription>
              Sidebar items, tabs, and navigation with all interactive states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sidebar Navigation */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sidebar Navigation</Label>
                <div className="space-y-1">
                  <div className="nav-item active">
                    <Home className="h-4 w-4 mr-3" />
                    <span>Dashboard (Active)</span>
                  </div>
                  <div className="nav-item">
                    <User className="h-4 w-4 mr-3" />
                    <span>Profile</span>
                  </div>
                  <div className="nav-item">
                    <Settings className="h-4 w-4 mr-3" />
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tab Navigation</Label>
                <div className="flex border-b border-border">
                  <div className="nav-tab active">Overview</div>
                  <div className="nav-tab">Analytics</div>
                  <div className="nav-tab">Settings</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>
              All button variants with hover, active, and focus states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Primary Buttons</Label>
                <div className="space-y-2">
                  <Button className="w-full">Default Primary</Button>
                  <Button className="w-full btn-primary-enhanced">
                    <Play className="h-4 w-4 mr-2" />
                    Enhanced Primary
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Secondary Buttons</Label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">Default Outline</Button>
                  <Button className="w-full btn-secondary-enhanced">
                    <Pause className="h-4 w-4 mr-2" />
                    Enhanced Secondary
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">State Examples</Label>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">Destructive</Button>
                  <Button disabled className="w-full">Disabled</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Cards Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Cards</CardTitle>
            <CardDescription>
              Cards with hover effects, selection states, and transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {interactiveCards.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedCard === card.id;
                
                return (
                  <div
                    key={card.id}
                    className={`card-interactive ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCard(isSelected ? null : card.id)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="h-5 w-5 text-accent-primary" />
                      <h3 className="font-medium text-foreground">{card.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                    {isSelected && (
                      <Badge className="mt-3" variant="default">Selected</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Form Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Enhanced inputs, switches, and form controls with all states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Input Examples */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="demo-input">Enhanced Input</Label>
                  <Input
                    id="demo-input"
                    className="input-enhanced"
                    placeholder="Type something..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="search-input">Search Input</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-input"
                      className="input-enhanced pl-10"
                      placeholder="Search..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disabled-input">Disabled Input</Label>
                  <Input
                    id="disabled-input"
                    className="input-enhanced"
                    placeholder="Disabled input"
                    disabled
                  />
                </div>
              </div>

              {/* Switch Examples */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Toggle Controls</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="demo-switch">Standard Switch</Label>
                    <Switch
                      id="demo-switch"
                      checked={switchValue}
                      onCheckedChange={setSwitchValue}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enhanced-toggle">Enhanced Toggle</Label>
                    <button
                      id="enhanced-toggle"
                      className={`toggle-enhanced ${switchValue ? 'active' : ''}`}
                      onClick={() => setSwitchValue(!switchValue)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Disabled Toggle</Label>
                    <Switch disabled />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Feedback Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Feedback Components</CardTitle>
            <CardDescription>
              Alerts, badges, and status indicators with proper theming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusExamples.map((status, index) => {
                const Icon = status.icon;
                return (
                  <div key={index} className={`alert-enhanced ${status.type}`}>
                    <Icon className="h-4 w-4" />
                    <span>{status.message}</span>
                  </div>
                );
              })}
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="default">Default Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color System Display */}
        <Card>
          <CardHeader>
            <CardTitle>Color System</CardTitle>
            <CardDescription>
              Complete color palette showing all theme variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              
              {/* Background Colors */}
              <div className="space-y-2">
                <div className="w-full h-12 rounded bg-primary-enhanced border border-border"></div>
                <div className="text-xs text-muted-foreground">bg-primary</div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-12 rounded bg-secondary-enhanced border border-border"></div>
                <div className="text-xs text-muted-foreground">bg-secondary</div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-12 rounded bg-tertiary-enhanced border border-border"></div>
                <div className="text-xs text-muted-foreground">bg-tertiary</div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-12 rounded bg-primary border border-border"></div>
                <div className="text-xs text-muted-foreground">accent-primary</div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-12 rounded bg-green-500 border border-border"></div>
                <div className="text-xs text-muted-foreground">success</div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-12 rounded bg-red-500 border border-border"></div>
                <div className="text-xs text-muted-foreground">error</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Implementation Complete</CardTitle>
            <CardDescription>
              All components follow the complete theme system implementation guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">✅ Color System</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Complete dark/light mode colors</li>
                  <li>• Proper RGB to HSL conversion</li>
                  <li>• CSS custom properties</li>
                  <li>• Shadow definitions</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">✅ Component States</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Hover, active, focus states</li>
                  <li>• Disabled and error states</li>
                  <li>• Smooth transitions</li>
                  <li>• Accessibility features</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">✅ System Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Early theme detection</li>
                  <li>• No flash of wrong theme</li>
                  <li>• Centralized debug system</li>
                  <li>• Implementation guide aligned</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ThemeSystemDemo() {
  return (
    <DebugErrorBoundary>
      <SidebarLayout>
        <ThemeDemoPage />
        <DebugPanel />
      </SidebarLayout>
    </DebugErrorBoundary>
  );
}

export default ThemeSystemDemo;
