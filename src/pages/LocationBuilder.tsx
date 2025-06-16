import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import CountyLocationResults from '@/components/location/CountyLocationResults';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Search, 
  Target, 
  Globe,
  Settings, 
  Plus, 
  Download,
  Upload,
  Filter,
  Map,
  Database,
  Layers,
  Navigation,
  Compass,
  BarChart3,
  List,
  Grid3X3
} from 'lucide-react';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

// Mock location search data
const mockSearchResults = [
  {
    id: '1',
    name: 'New York County',
    state: 'New York',
    population: '1,694,251',
    area: '23 sq mi',
    density: '73,663/sq mi',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    selected: false,
  },
  {
    id: '2',
    name: 'Los Angeles County',
    state: 'California',
    population: '10,014,009',
    area: '4,751 sq mi',
    density: '2,108/sq mi',
    coordinates: { lat: 34.0549, lng: -118.2426 },
    selected: true,
  },
  {
    id: '3',
    name: 'Cook County',
    state: 'Illinois',
    population: '5,275,541',
    area: '946 sq mi',
    density: '5,574/sq mi',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    selected: false,
  },
];

const locationTools = [
  {
    id: 'search',
    title: 'Location Search',
    description: 'Find counties, cities, and regions by name or criteria',
    icon: Search,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    active: true,
  },
  {
    id: 'radius',
    title: 'Radius Targeting',
    description: 'Select areas within a specific radius of a point',
    icon: Target,
    color: 'bg-green-100 text-green-800 border-green-200',
    active: false,
  },
  {
    id: 'demographic',
    title: 'Demographic Filtering',
    description: 'Filter locations by population, income, and demographics',
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    active: false,
  },
  {
    id: 'import',
    title: 'Bulk Import',
    description: 'Import location lists from CSV or other sources',
    icon: Upload,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    active: false,
  },
];

const quickActions = [
  {
    title: 'Import Locations',
    description: 'Upload a CSV file with location data',
    icon: Upload,
    action: 'import',
  },
  {
    title: 'Export Selection',
    description: 'Download selected locations as CSV',
    icon: Download,
    action: 'export',
  },
  {
    title: 'Clear Selection',
    description: 'Remove all selected locations',
    icon: Filter,
    action: 'clear',
  },
  {
    title: 'Save List',
    description: 'Save current selection as a reusable list',
    icon: Database,
    action: 'save',
  },
];

export default function LocationBuilder() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCounties, setSelectedCounties] = useState<Set<string>>(new Set(['2']));
  const [centerCoords] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of US

  // Mock props for CountyLocationResults component
  const mockProps = {
    searchResults: mockSearchResults,
    centerCoords: centerCoords,
    onListSaved: () => {
      console.log('List saved successfully');
      // Handle list saving logic
    },
    selectedCounties: selectedCounties,
    onCountySelectionChange: (countyId: string, selected: boolean) => {
      const newSelection = new Set(selectedCounties);
      if (selected) {
        newSelection.add(countyId);
      } else {
        newSelection.delete(countyId);
      }
      setSelectedCounties(newSelection);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'import':
        console.log('Opening import dialog...');
        break;
      case 'export':
        console.log('Exporting selected locations...');
        break;
      case 'clear':
        setSelectedCounties(new Set());
        break;
      case 'save':
        console.log('Opening save dialog...');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          {/* Enhanced header with proper branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-black" />
            </div>
            <div className="text-white">
              <div className="font-bold text-sm">Location Builder</div>
              <div className="text-xs opacity-75">Geographic Targeting</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/20">
              <Globe className="h-3 w-3 mr-1" />
              {selectedCounties.size} Selected
            </Badge>
            <Badge variant="outline" className="text-white border-white/20 text-xs">
              {actualTheme}
            </Badge>
          </div>
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
      {/* FIXED: Clean theme-aware styling */}
      <div className="p-6 bg-background text-foreground min-h-screen">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Location Builder</h1>
                <p className="text-muted-foreground">
                  Build targeted location lists for campaigns and data collection
                </p>
              </div>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline">
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="location-search" className="sr-only">Search locations</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location-search"
                  type="text"
                  placeholder="Search counties, cities, or ZIP codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Theme Test Section */}
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              🎯 Location Builder Theme Status
            </CardTitle>
            <CardDescription>
              Verifying theme integration for data tables and location tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-primary rounded text-primary-foreground text-center text-sm">
                Primary<br/>
                <span className="opacity-75">BLUE tools</span>
              </div>
              <div className="p-3 bg-card border border-border rounded text-card-foreground text-center text-sm">
                Tables<br/>
                <span className="opacity-75">Data lists</span>
              </div>
              <div className="p-3 bg-green-100 text-green-800 rounded text-center text-sm">
                Selected<br/>
                <span className="opacity-75">Active locations</span>
              </div>
              <div className="p-3 bg-muted rounded text-muted-foreground text-center text-sm">
                Tools<br/>
                <span className="opacity-75">Action panels</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Mode: <span className="font-mono">{themeMode}</span> | 
              Active: <span className="font-mono">{actualTheme}</span> | 
              Data Ready: <span className="text-green-600">✅ Theme-aware tables</span>
            </p>
          </CardContent>
        </Card>

        {/* Tools Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Layers className="h-5 w-5 text-primary" />
              Location Tools
            </CardTitle>
            <CardDescription>
              Choose the method for building your location targeting list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {locationTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      tool.active 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded border ${tool.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm mb-1">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    {tool.active && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Location Results - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Database className="h-5 w-5 text-primary" />
                  County Location Results
                </CardTitle>
                <CardDescription>
                  Search results and selected locations for targeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{mockSearchResults.length}</strong> results found
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">
                      <strong className="text-primary">{selectedCounties.size}</strong> selected
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">
                        {mockSearchResults
                          .filter(r => selectedCounties.has(r.id))
                          .reduce((sum, r) => sum + parseInt(r.population.replace(/,/g, '')), 0)
                          .toLocaleString()}
                      </strong> total population
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleQuickAction('clear')}>
                      Clear Selection
                    </Button>
                    <Button size="sm" onClick={() => handleQuickAction('save')}>
                      Save List
                    </Button>
                  </div>
                </div>

                {/* County Location Results Component */}
                <CountyLocationResults {...mockProps} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Navigation className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleQuickAction(action.action)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-primary" />
                  Selection Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Selected Locations</span>
                    <Badge variant="outline">{selectedCounties.size}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Total Population</span>
                    <Badge variant="outline">
                      {mockSearchResults
                        .filter(r => selectedCounties.has(r.id))
                        .reduce((sum, r) => sum + parseInt(r.population.replace(/,/g, '')), 0)
                        .toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span className="text-sm text-muted-foreground">Coverage Area</span>
                    <Badge variant="outline">Multi-State</Badge>
                  </div>
                </div>

                {selectedCounties.size > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Selected Locations:</h4>
                    <div className="space-y-1">
                      {mockSearchResults
                        .filter(r => selectedCounties.has(r.id))
                        .map(location => (
                          <div key={location.id} className="text-xs text-muted-foreground">
                            {location.name}, {location.state}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Compass className="h-5 w-5 text-primary" />
                  Map Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Map visualization</p>
                    <p className="text-xs text-muted-foreground">showing selected areas</p>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline">
                  <Map className="h-4 w-4 mr-2" />
                  Open Full Map
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Export Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Ready to use your location list?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Export your selection or integrate with campaigns and schedules
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleQuickAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button asChild>
                  <a href="/campaigns">
                    <Target className="h-4 w-4 mr-2" />
                    Use in Campaign
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
