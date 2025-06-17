import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { DebugErrorBoundary } from '@/components/debug/DebugPanel';
import { useDebugLogger } from '@/components/debug/DebugPanel';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  MapPin, 
  Plus, 
  Minus, 
  ChevronRight, 
  ChevronDown,
  Bookmark,
  BookmarkPlus,
  Users,
  Globe,
  Building,
  Home,
  Trash2,
  Edit,
  Share,
  Eye,
  EyeOff,
  Check,
  X,
  Filter,
  Star,
  StarOff,
  List,
  Map,
  Layers,
  Target,
  Navigation,
  Clock,
  TrendingUp
} from 'lucide-react';

// Types
interface Location {
  id: string;
  name: string;
  type: 'country' | 'state' | 'city' | 'metro' | 'postal';
  parentId?: string;
  lat?: number;
  lng?: number;
  population?: number;
  code?: string;
  fullPath?: string;
}

interface LocationList {
  id: string;
  name: string;
  description?: string;
  locations: string[]; // location IDs
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  icon: string;
  color: string;
}

interface LocationTargeting {
  included: string[];
  excluded: string[];
  radius?: number;
  radiusUnit: 'miles' | 'km';
}

// Mock Data
const MOCK_LOCATIONS: Location[] = [
  // Countries
  { id: 'us', name: 'United States', type: 'country', population: 331000000, code: 'US' },
  { id: 'ca', name: 'Canada', type: 'country', population: 38000000, code: 'CA' },
  { id: 'uk', name: 'United Kingdom', type: 'country', population: 67000000, code: 'GB' },
  
  // US States
  { id: 'us-ca', name: 'California', type: 'state', parentId: 'us', population: 39500000, code: 'CA', fullPath: 'United States > California' },
  { id: 'us-ny', name: 'New York', type: 'state', parentId: 'us', population: 19500000, code: 'NY', fullPath: 'United States > New York' },
  { id: 'us-tx', name: 'Texas', type: 'state', parentId: 'us', population: 29000000, code: 'TX', fullPath: 'United States > Texas' },
  { id: 'us-fl', name: 'Florida', type: 'state', parentId: 'us', population: 21500000, code: 'FL', fullPath: 'United States > Florida' },
  { id: 'us-il', name: 'Illinois', type: 'state', parentId: 'us', population: 12700000, code: 'IL', fullPath: 'United States > Illinois' },
  
  // California Cities
  { id: 'us-ca-la', name: 'Los Angeles', type: 'city', parentId: 'us-ca', population: 3900000, lat: 34.0522, lng: -118.2437, fullPath: 'United States > California > Los Angeles' },
  { id: 'us-ca-sf', name: 'San Francisco', type: 'city', parentId: 'us-ca', population: 875000, lat: 37.7749, lng: -122.4194, fullPath: 'United States > California > San Francisco' },
  { id: 'us-ca-sd', name: 'San Diego', type: 'city', parentId: 'us-ca', population: 1400000, lat: 32.7157, lng: -117.1611, fullPath: 'United States > California > San Diego' },
  { id: 'us-ca-sj', name: 'San Jose', type: 'city', parentId: 'us-ca', population: 1000000, lat: 37.3382, lng: -121.8863, fullPath: 'United States > California > San Jose' },
  
  // New York Cities
  { id: 'us-ny-nyc', name: 'New York City', type: 'city', parentId: 'us-ny', population: 8400000, lat: 40.7128, lng: -74.0060, fullPath: 'United States > New York > New York City' },
  { id: 'us-ny-buffalo', name: 'Buffalo', type: 'city', parentId: 'us-ny', population: 255000, lat: 42.8864, lng: -78.8784, fullPath: 'United States > New York > Buffalo' },
  { id: 'us-ny-rochester', name: 'Rochester', type: 'city', parentId: 'us-ny', population: 206000, lat: 43.1566, lng: -77.6088, fullPath: 'United States > New York > Rochester' },
  
  // Metro Areas
  { id: 'us-ca-la-metro', name: 'Los Angeles Metro Area', type: 'metro', parentId: 'us-ca-la', population: 13200000, fullPath: 'United States > California > Los Angeles > Metro Area' },
  { id: 'us-ny-nyc-metro', name: 'New York Metro Area', type: 'metro', parentId: 'us-ny-nyc', population: 20100000, fullPath: 'United States > New York > New York City > Metro Area' },
  
  // Postal Codes (sample)
  { id: 'us-ca-90210', name: '90210 (Beverly Hills)', type: 'postal', parentId: 'us-ca-la', population: 21000, fullPath: 'United States > California > Los Angeles > 90210' },
  { id: 'us-ny-10001', name: '10001 (Manhattan)', type: 'postal', parentId: 'us-ny-nyc', population: 52000, fullPath: 'United States > New York > New York City > 10001' },
];

const MOCK_SAVED_LISTS: LocationList[] = [
  {
    id: 'list-1',
    name: 'Major US Cities',
    description: 'Top metropolitan areas for national campaigns',
    locations: ['us-ca-la', 'us-ny-nyc', 'us-il-chicago', 'us-tx-houston'],
    isPublic: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'current-user',
    tags: ['cities', 'national', 'metros'],
    icon: 'building',
    color: 'blue'
  },
  {
    id: 'list-2',
    name: 'California Markets',
    description: 'Primary California market areas',
    locations: ['us-ca-la', 'us-ca-sf', 'us-ca-sd', 'us-ca-sj'],
    isPublic: true,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    createdBy: 'current-user',
    tags: ['california', 'west-coast', 'tech'],
    icon: 'map',
    color: 'green'
  },
  {
    id: 'list-3',
    name: 'East Coast Corridor',
    description: 'High-density eastern seaboard markets',
    locations: ['us-ny-nyc', 'us-ma-boston', 'us-pa-philadelphia', 'us-dc-washington'],
    isPublic: false,
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-08T16:45:00Z',
    createdBy: 'team-member',
    tags: ['east-coast', 'urban', 'high-density'],
    icon: 'navigation',
    color: 'purple'
  }
];

// Location Tree Component
const LocationTree: React.FC<{
  locations: Location[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  searchTerm?: string;
}> = ({ locations, selectedIds, onToggle, searchTerm = '' }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['us']));

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const getChildLocations = (parentId?: string) => {
    return locations.filter(loc => loc.parentId === parentId);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'country': return Globe;
      case 'state': return Layers;
      case 'city': return Building;
      case 'metro': return Navigation;
      case 'postal': return Home;
      default: return MapPin;
    }
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return '';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toString();
  };

  const renderLocationNode = (location: Location, level: number = 0) => {
    const children = getChildLocations(location.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(location.id);
    const selected = isSelected(location.id);
    const Icon = getLocationIcon(location.type);

    // Filter based on search term
    const matchesSearch = !searchTerm || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.fullPath?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && level > 0) return null;

    return (
      <div key={location.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
            selected ? 'bg-primary/20 text-primary' : 'hover:bg-accent'
          }`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(location.id)}
              className="p-0 h-4 w-4"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(location.id)}
            className="h-4 w-4"
          />
          
          <Icon className="h-4 w-4 text-muted-foreground" />
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {location.name}
              </span>
              {level === 0 && location.code && (
                <span className="text-xs text-muted-foreground">
                  {location.code}
                </span>
              )}
            </div>
            
            {location.population && (
              <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                {formatPopulation(location.population)}
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {children.map(child => renderLocationNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootLocations = getChildLocations();
  
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {rootLocations.map(location => renderLocationNode(location))}
    </div>
  );
};

// Saved Lists Manager
const SavedListsManager: React.FC<{
  lists: LocationList[];
  locations: Location[];
  onSelectList: (list: LocationList) => void;
  onCreateList: (list: Omit<LocationList, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditList: (list: LocationList) => void;
  onDeleteList: (listId: string) => void;
}> = ({ lists, locations, onSelectList, onCreateList, onEditList, onDeleteList }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<LocationList | null>(null);
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    isPublic: false,
    tags: '',
    icon: 'bookmark',
    color: 'blue'
  });

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const handleCreateList = () => {
    if (!newListData.name.trim()) return;
    
    onCreateList({
      ...newListData,
      locations: [],
      createdBy: 'current-user',
      tags: newListData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    
    setNewListData({
      name: '',
      description: '',
      isPublic: false,
      tags: '',
      icon: 'bookmark',
      color: 'blue'
    });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Saved Location Lists</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Create New Location List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="list-name" className="text-foreground">List Name</Label>
                <Input
                  id="list-name"
                  value={newListData.name}
                  onChange={(e) => setNewListData({ ...newListData, name: e.target.value })}
                  placeholder="Enter list name"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="list-description" className="text-foreground">Description (Optional)</Label>
                <Textarea
                  id="list-description"
                  value={newListData.description}
                  onChange={(e) => setNewListData({ ...newListData, description: e.target.value })}
                  placeholder="Describe this location list"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-public"
                  checked={newListData.isPublic}
                  onCheckedChange={(checked) => setNewListData({ ...newListData, isPublic: checked as boolean })}
                />
                <Label htmlFor="is-public" className="text-foreground">Make this list public</Label>
              </div>
              <div>
                <Label htmlFor="tags" className="text-foreground">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newListData.tags}
                  onChange={(e) => setNewListData({ ...newListData, tags: e.target.value })}
                  placeholder="e.g., urban, west-coast, high-value"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleCreateList} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create List
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-border text-foreground hover:bg-accent">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {lists.map((list) => (
          <Card key={list.id} className="bg-card border-border hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bookmark className={`h-4 w-4 text-${list.color}-500`} />
                    <h4 className="font-medium text-card-foreground">{list.name}</h4>
                    {list.isPublic && <Users className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  {list.description && (
                    <p className="text-sm text-muted-foreground mb-2">{list.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {list.locations.length} locations
                    </span>
                    {list.tags.length > 0 && (
                      <div className="flex gap-1">
                        {list.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-border">
                            {tag}
                          </Badge>
                        ))}
                        {list.tags.length > 2 && (
                          <span className="text-muted-foreground">+{list.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectList(list)}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Select
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingList(list)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteList(list.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {list.locations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex flex-wrap gap-1">
                    {list.locations.slice(0, 3).map((locationId) => (
                      <Badge key={locationId} variant="secondary" className="text-xs">
                        {getLocationName(locationId)}
                      </Badge>
                    ))}
                    {list.locations.length > 3 && (
                      <Badge variant="outline" className="text-xs border-border">
                        +{list.locations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Location Selector Component
const CampaignLocationSelector: React.FC<{
  value?: LocationTargeting;
  onChange?: (targeting: LocationTargeting) => void;
}> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncluded, setSelectedIncluded] = useState<string[]>(value?.included || []);
  const [selectedExcluded, setSelectedExcluded] = useState<string[]>(value?.excluded || []);
  const [savedLists, setSavedLists] = useState<LocationList[]>(MOCK_SAVED_LISTS);
  const [radiusSettings, setRadiusSettings] = useState({
    radius: value?.radius || 25,
    unit: value?.radiusUnit || 'miles' as const
  });

  const locations = MOCK_LOCATIONS;

  useEffect(() => {
    if (onChange) {
      onChange({
        included: selectedIncluded,
        excluded: selectedExcluded,
        radius: radiusSettings.radius,
        radiusUnit: radiusSettings.unit
      });
    }
  }, [selectedIncluded, selectedExcluded, radiusSettings, onChange]);

  const handleToggleIncluded = (locationId: string) => {
    setSelectedIncluded(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleToggleExcluded = (locationId: string) => {
    setSelectedExcluded(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleSelectSavedList = (list: LocationList) => {
    setSelectedIncluded(prev => {
      const newSelection = new Set([...prev, ...list.locations]);
      return Array.from(newSelection);
    });
  };

  const handleCreateSavedList = (listData: Omit<LocationList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newList: LocationList = {
      ...listData,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSavedLists(prev => [...prev, newList]);
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const getLocationFullPath = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.fullPath || locationId;
  };

  const filteredLocations = useMemo(() => {
    if (!searchTerm) return locations;
    return locations.filter(loc => 
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.fullPath?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [locations, searchTerm]);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Targeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Selection Summary */}
        {(selectedIncluded.length > 0 || selectedExcluded.length > 0) && (
          <div className="p-4 rounded-lg bg-muted border border-border">
            <h4 className="font-medium text-foreground mb-3">Current Targeting</h4>
            
            {selectedIncluded.length > 0 && (
              <div className="mb-3">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Included Locations ({selectedIncluded.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedIncluded.slice(0, 5).map(locationId => (
                    <Badge key={locationId} variant="default" className="text-xs">
                      {getLocationName(locationId)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleIncluded(locationId)}
                        className="ml-1 p-0 h-3 w-3"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                  {selectedIncluded.length > 5 && (
                    <Badge variant="outline" className="text-xs border-border">
                      +{selectedIncluded.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {selectedExcluded.length > 0 && (
              <div className="mb-3">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Excluded Locations ({selectedExcluded.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedExcluded.slice(0, 5).map(locationId => (
                    <Badge key={locationId} variant="destructive" className="text-xs">
                      {getLocationName(locationId)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleExcluded(locationId)}
                        className="ml-1 p-0 h-3 w-3"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                  {selectedExcluded.length > 5 && (
                    <Badge variant="outline" className="text-xs border-border">
                      +{selectedExcluded.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Radius Settings */}
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground">Radius:</Label>
              <Input
                type="number"
                value={radiusSettings.radius}
                onChange={(e) => setRadiusSettings(prev => ({ ...prev, radius: parseInt(e.target.value) || 0 }))}
                className="w-20 bg-background border-border text-foreground"
                min="1"
                max="500"
              />
              <Select value={radiusSettings.unit} onValueChange={(value: 'miles' | 'km') => setRadiusSettings(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger className="w-24 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="miles">Miles</SelectItem>
                  <SelectItem value="km">KM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Location Selection Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted border-border">
            <TabsTrigger value="browse" className="text-foreground">
              <Layers className="h-4 w-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="search" className="text-foreground">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="saved-lists" className="text-foreground">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Lists
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedIncluded([]);
                    setSelectedExcluded([]);
                  }}
                  className="border-border text-foreground hover:bg-accent"
                >
                  Clear All
                </Button>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Check className="h-3 w-3 text-primary" />
                  Include
                  <X className="h-3 w-3 text-destructive" />
                  Exclude
                </div>
              </div>
              
              <LocationTree
                locations={locations}
                selectedIds={selectedIncluded}
                onToggle={handleToggleIncluded}
              />
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>

              {searchTerm && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredLocations.slice(0, 20).map((location) => (
                    <div key={location.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <Checkbox
                        checked={selectedIncluded.includes(location.id)}
                        onCheckedChange={() => handleToggleIncluded(location.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-card-foreground">{location.name}</div>
                        <div className="text-sm text-muted-foreground">{location.fullPath}</div>
                      </div>
                      {location.population && (
                        <Badge variant="outline" className="text-xs border-border">
                          {location.population >= 1000000 ? `${(location.population / 1000000).toFixed(1)}M` : `${(location.population / 1000).toFixed(0)}K`}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved-lists" className="mt-4">
            <SavedListsManager
              lists={savedLists}
              locations={locations}
              onSelectList={handleSelectSavedList}
              onCreateList={handleCreateSavedList}
              onEditList={handleEditList}
              onDeleteList={(listId) => setSavedLists(prev => prev.filter(l => l.id !== listId))}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Standalone Location Targeting Page (for testing/demo)
function LocationTargetingPageComponent() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const debugLogger = useDebugLogger('CampaignLocationTargeting');
  
  const allMenuItems = getMenuItems();
  const menuSections = getSections();

  const [locationTargeting, setLocationTargeting] = useState<LocationTargeting>({
    included: [],
    excluded: [],
    radius: 25,
    radiusUnit: 'miles'
  });

  useEffect(() => {
    debugLogger.log('LocationTargeting component mounted');
  }, []);

  const handleEditList = (list: any) => {
    debugLogger.log('Edit list clicked', { listId: list.id, listName: list.name });
    // TODO: Implement list editing functionality
  };

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-3">
            <BrandLogo
              size="md"
              showText={true}
              className="flex items-center gap-3 text-primary-foreground"
            />
          </div>
          <Badge variant="outline" className="text-primary-foreground border-primary-foreground/20">
            {actualTheme}
          </Badge>
        </div>
      }
      category={
        <div className="space-y-4">
          {menuSections.map((section) => (
            <SideCategory 
              key={section.name}
              section={section.name} 
              items={section.items} 
            />
          ))}
        </div>
      }
      menuItems={allMenuItems}
    >
      <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Location Targeting Manager
            </h1>
            <p className="text-muted-foreground">
              Configure geographic targeting with saved location lists
            </p>
          </div>

          {/* Main Location Selector */}
          <CampaignLocationSelector
            value={locationTargeting}
            onChange={setLocationTargeting}
          />

          {/* Debug Info (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-6 bg-muted/50 border-border">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-muted-foreground overflow-auto">
                  {JSON.stringify(locationTargeting, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
        <DebugPanel />
      </div>
    </SidebarLayout>
  );
}

// Wrap with DebugErrorBoundary
const LocationTargetingPage = () => (
  <DebugErrorBoundary>
    <LocationTargetingPageComponent />
  </DebugErrorBoundary>
);

export default LocationTargetingPage;
export { CampaignLocationSelector };