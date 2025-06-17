import React, { useState, useEffect, useMemo } from 'react';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { DebugErrorBoundary } from '@/components/debug/DebugPanel';
import { useDebugLogger } from '@/components/debug/DebugPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Layers, 
  Tag, 
  Ban, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreVertical,
  Activity,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Pause
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/brand-logo';

// Types
interface Campaign {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  created_at?: string;
  updated_at?: string;
  category?: Category;
  locationTargeting?: LocationTargeting;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  created_at?: string;
  updated_at?: string;
  parent_category?: Category;
}

interface KeywordStats {
  keyword_id: string;
  local_volume: number;
  market_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competitive_density: number;
  last_updated?: string;
}

interface Keyword {
  id: string;
  campaign_id: string;
  keyword: string;
  match_type: 'exact' | 'phrase' | 'broad';
  stats?: KeywordStats;
  created_at?: string;
  updated_at?: string;
  campaign?: Campaign;
}

interface NegativeKeyword {
  id: string;
  campaign_id: string;
  keyword: string;
  match_type: 'exact' | 'phrase' | 'broad';
  created_at?: string;
  updated_at?: string;
}

interface Stats {
  activeCampaigns: number;
  totalCategories: number;
  totalKeywords: number;
  totalNegativeKeywords: number;
}

// Location Targeting Types
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
const SAMPLE_CATEGORIES: Category[] = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Plumbing', description: 'Plumbing services and related categories' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'HVAC', description: 'Heating, ventilation, and air conditioning services' },
  { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Electrical', description: 'Electrical services and contractors' },
  { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Roofing', description: 'Roofing services and contractors' }
];

const SAMPLE_CAMPAIGNS: Campaign[] = [
  { 
    id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 
    name: 'Drain Cleaning Campaign', 
    category_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    description: 'Targeted drain cleaning services campaign',
    status: 'active'
  },
  { 
    id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 
    name: 'Emergency Plumbing', 
    category_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    description: 'Campaign for emergency plumbing services',
    status: 'draft'
  },
  { 
    id: 'g0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 
    name: 'Summer AC Maintenance', 
    category_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
    description: 'Seasonal campaign for AC maintenance services',
    status: 'paused'
  }
];

const SAMPLE_KEYWORDS: Keyword[] = [
  { id: 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', campaign_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', keyword: 'drain cleaning', match_type: 'broad', stats: { keyword_id: 'h0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', local_volume: 1200, market_volume: 3500, keyword_difficulty: 55, cpc: 12.50, competitive_density: 0.75 } },
  { id: 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', campaign_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', keyword: 'drain cleaning near me', match_type: 'phrase', stats: { keyword_id: 'i0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', local_volume: 850, market_volume: 2700, keyword_difficulty: 62, cpc: 15.75, competitive_density: 0.85 } },
  { id: 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', campaign_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', keyword: 'emergency drain cleaning', match_type: 'exact', stats: { keyword_id: 'j0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', local_volume: 450, market_volume: 1200, keyword_difficulty: 70, cpc: 18.25, competitive_density: 0.90 } },
  { id: 'k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', campaign_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', keyword: 'emergency plumber', match_type: 'exact', stats: { keyword_id: 'k0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', local_volume: 1800, market_volume: 5200, keyword_difficulty: 75, cpc: 22.50, competitive_density: 0.95 } },
];

const SAMPLE_NEGATIVE_KEYWORDS: NegativeKeyword[] = [
  { id: 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', campaign_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', keyword: 'draino', match_type: 'exact' },
  { id: 'q0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', campaign_id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', keyword: 'how to unclog drain', match_type: 'broad' },
  { id: 's0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', campaign_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', keyword: 'diy plumbing', match_type: 'broad' },
];

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, text: 'Active', class: 'bg-primary/10 text-primary border-primary/20' };
      case 'paused':
        return { icon: Pause, text: 'Paused', class: 'bg-secondary/10 text-secondary border-secondary/20' };
      case 'draft':
        return { icon: Clock, text: 'Draft', class: 'bg-muted text-muted-foreground border-muted' };
      default:
        return { icon: AlertCircle, text: 'Unknown', class: 'bg-destructive/10 text-destructive border-destructive/20' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${config.class}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
};

// Campaign Location Selector Component (Embedded)
const CampaignLocationSelector: React.FC<{
  value?: LocationTargeting;
  onChange?: (targeting: LocationTargeting) => void;
}> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncluded, setSelectedIncluded] = useState<string[]>(value?.included || []);
  const [selectedExcluded, setSelectedExcluded] = useState<string[]>(value?.excluded || []);
  const [radiusSettings, setRadiusSettings] = useState({
    radius: value?.radius || 25,
    unit: value?.radiusUnit || 'miles' as const
  });

  // Mock location data (simplified for embedding)
  const locations: Location[] = [
    { id: 'us', name: 'United States', type: 'country', population: 331000000, code: 'US' },
    { id: 'us-ca', name: 'California', type: 'state', parentId: 'us', population: 39500000, code: 'CA', fullPath: 'United States > California' },
    { id: 'us-ny', name: 'New York', type: 'state', parentId: 'us', population: 19500000, code: 'NY', fullPath: 'United States > New York' },
    { id: 'us-tx', name: 'Texas', type: 'state', parentId: 'us', population: 29000000, code: 'TX', fullPath: 'United States > Texas' },
    { id: 'us-ca-la', name: 'Los Angeles', type: 'city', parentId: 'us-ca', population: 3900000, fullPath: 'United States > California > Los Angeles' },
    { id: 'us-ca-sf', name: 'San Francisco', type: 'city', parentId: 'us-ca', population: 875000, fullPath: 'United States > California > San Francisco' },
    { id: 'us-ny-nyc', name: 'New York City', type: 'city', parentId: 'us-ny', population: 8400000, fullPath: 'United States > New York > New York City' },
  ];

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

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || locationId;
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
        <CardTitle className="text-card-foreground flex items-center gap-2 text-base">
          <MapPin className="h-4 w-4" />
          Geographic Targeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Selection Summary */}
        {selectedIncluded.length > 0 && (
          <div className="p-3 rounded-lg bg-muted border border-border">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Selected Locations ({selectedIncluded.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedIncluded.slice(0, 4).map(locationId => (
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
              {selectedIncluded.length > 4 && (
                <Badge variant="outline" className="text-xs border-border">
                  +{selectedIncluded.length - 4} more
                </Badge>
              )}
            </div>
            
            {/* Radius Settings */}
            <div className="flex items-center gap-3 mt-3">
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
                <SelectTrigger className="w-20 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="miles">Mi</SelectItem>
                  <SelectItem value="km">Km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Location Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted border-border">
            <TabsTrigger value="browse" className="text-foreground text-sm">
              <Globe className="h-3 w-3 mr-1" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="search" className="text-foreground text-sm">
              <Search className="h-3 w-3 mr-1" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-3">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {locations.filter(loc => !loc.parentId).map((country) => (
                <div key={country.id}>
                  <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                    <Checkbox
                      checked={selectedIncluded.includes(country.id)}
                      onCheckedChange={() => handleToggleIncluded(country.id)}
                      className="h-4 w-4"
                    />
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{country.name}</span>
                  </div>
                  
                  {/* States */}
                  {locations.filter(loc => loc.parentId === country.id).map((state) => (
                    <div key={state.id} className="ml-6">
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                        <Checkbox
                          checked={selectedIncluded.includes(state.id)}
                          onCheckedChange={() => handleToggleIncluded(state.id)}
                          className="h-4 w-4"
                        />
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-foreground">{state.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {state.population && state.population >= 1000000 ? `${(state.population / 1000000).toFixed(1)}M` : `${state.population && (state.population / 1000).toFixed(0)}K`}
                        </Badge>
                      </div>
                      
                      {/* Cities */}
                      {locations.filter(loc => loc.parentId === state.id).map((city) => (
                        <div key={city.id} className="ml-6">
                          <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                            <Checkbox
                              checked={selectedIncluded.includes(city.id)}
                              onCheckedChange={() => handleToggleIncluded(city.id)}
                              className="h-4 w-4"
                            />
                            <Home className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{city.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {city.population && city.population >= 1000000 ? `${(city.population / 1000000).toFixed(1)}M` : `${city.population && (city.population / 1000).toFixed(0)}K`}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-3">
            <div className="space-y-3">
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
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredLocations.slice(0, 10).map((location) => (
                    <div key={location.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                      <Checkbox
                        checked={selectedIncluded.includes(location.id)}
                        onCheckedChange={() => handleToggleIncluded(location.id)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{location.name}</div>
                        <div className="text-xs text-muted-foreground">{location.fullPath}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Campaign List Component
const CampaignList: React.FC<{
  campaigns: Campaign[];
  categories: Category[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}> = ({ campaigns, categories, onEdit, onDelete, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campaigns</h2>
          <p className="text-muted-foreground mt-1">
            Manage your advertising campaigns
          </p>
        </div>
        <Button onClick={onCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-card-foreground text-lg mb-1">
                    {campaign.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {getCategoryName(campaign.category_id)}
                  </p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {campaign.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {SAMPLE_KEYWORDS.filter(k => k.campaign_id === campaign.id).length} keywords
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(campaign)}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(campaign.id)}
                    className="border-border text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No campaigns found</p>
          <p>Try adjusting your search or create a new campaign.</p>
        </div>
      )}
    </div>
  );
};

// Campaign Editor Component
const CampaignEditor: React.FC<{
  campaign: Campaign | null;
  categories: Category[];
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}> = ({ campaign, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Campaign>>({
    name: '',
    category_id: '',
    description: '',
    status: 'draft',
    locationTargeting: {
      included: [],
      excluded: [],
      radius: 25,
      radiusUnit: 'miles'
    }
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        id: campaign.id,
        name: campaign.name,
        category_id: campaign.category_id,
        description: campaign.description || '',
        status: campaign.status,
        locationTargeting: campaign.locationTargeting || {
          included: [],
          excluded: [],
          radius: 25,
          radiusUnit: 'miles'
        }
      });
    } else {
      setFormData({
        name: '',
        category_id: '',
        description: '',
        status: 'draft',
        locationTargeting: {
          included: [],
          excluded: [],
          radius: 25,
          radiusUnit: 'miles'
        }
      });
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.category_id) {
      onSave(formData as Campaign);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {campaign ? 'Edit Campaign' : 'Create New Campaign'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {campaign ? 'Update campaign details' : 'Create a new advertising campaign'}
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Campaign Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter campaign name"
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">
                  Category *
                </Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-foreground">
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'active' | 'paused' | 'draft') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter campaign description"
                className="bg-background border-border text-foreground"
                rows={3}
              />
            </div>

            {/* Location Targeting Section */}
            <div className="space-y-4">
              <Label className="text-foreground font-medium">Location Targeting</Label>
              <CampaignLocationSelector
                value={formData.locationTargeting}
                onChange={(targeting) => setFormData({ ...formData, locationTargeting: targeting })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={() => {
                  if (formData.name && formData.category_id) {
                    onSave(formData as Campaign);
                  }
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!formData.name || !formData.category_id}
              >
                {campaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Keywords by Category Component
const KeywordsByCategory: React.FC<{
  campaigns: Campaign[];
  categories: Category[];
  keywords: Keyword[];
  theme: any;
  onKeywordEdit: (keyword: Keyword) => void;
  onKeywordDelete: (keywordId: string) => void;
}> = ({ campaigns, categories, keywords, theme, onKeywordEdit, onKeywordDelete }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatchType, setSelectedMatchType] = useState<string>('all');

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleCampaignExpanded = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
    }
    setExpandedCampaigns(newExpanded);
  };

  const getKeywordsForCampaign = (campaignId: string) => {
    return keywords.filter(k => k.campaign_id === campaignId);
  };

  const getCampaignsForCategory = (categoryId: string) => {
    return campaigns.filter(c => c.category_id === categoryId);
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'bg-primary/10 text-primary border-primary/20';
      case 'phrase': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'broad': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact': return '"';
      case 'phrase': return '[]';
      case 'broad': return '+';
      default: return '?';
    }
  };

  const filteredKeywords = useMemo(() => {
    return keywords.filter(keyword => {
      const matchesSearch = !searchTerm || 
        keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedMatchType === 'all' || keyword.match_type === selectedMatchType;
      return matchesSearch && matchesType;
    });
  }, [keywords, searchTerm, selectedMatchType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${theme.text}`}>Keywords by Campaign</h2>
          <p className={`${theme.textSecondary} mt-1`}>
            Browse keywords organized by categories and campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={theme.textSecondary}>
            {filteredKeywords.length} keywords
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${theme.textSecondary}`} />
          <Input
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 ${theme.cardBackground} ${theme.border} ${theme.text}`}
          />
        </div>
        <Select value={selectedMatchType} onValueChange={setSelectedMatchType}>
          <SelectTrigger className={`w-[180px] ${theme.cardBackground} ${theme.border} ${theme.text}`}>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Match type" />
          </SelectTrigger>
          <SelectContent className={`${theme.cardBackground} ${theme.border}`}>
            <SelectItem value="all">All Match Types</SelectItem>
            <SelectItem value="exact">Exact Match</SelectItem>
            <SelectItem value="phrase">Phrase Match</SelectItem>
            <SelectItem value="broad">Broad Match</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories, Campaigns, and Keywords Tree */}
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryIds = new Set([category.id]);
          const categoryCampaigns = getCampaignsForCategory(category.id);
          const categoryKeywords = categoryCampaigns.flatMap(campaign => 
            getKeywordsForCampaign(campaign.id)
          ).filter(keyword => filteredKeywords.includes(keyword));

          if (categoryCampaigns.length === 0) return null;

          const isCategoryExpanded = expandedCategories.has(category.id);

          return (
            <Card key={category.id} className={`${theme.cardBackground} ${theme.border}`}>
              <CardContent className="p-0">
                {/* Category Header */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer hover:${theme.cardBackground} border-b ${theme.border}`}
                  onClick={() => toggleCategoryExpanded(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6"
                    >
                      {isCategoryExpanded ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                    <Layers className={`h-5 w-5 ${theme.textSecondary}`} />
                    <div>
                      <h3 className={`font-semibold ${theme.text}`}>{category.name}</h3>
                      {category.description && (
                        <p className={`text-sm ${theme.textSecondary}`}>{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-xs">
                      {categoryCampaigns.length} campaigns
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {categoryKeywords.length} keywords
                    </Badge>
                  </div>
                </div>

                {/* Category Content */}
                {isCategoryExpanded && (
                  <div className="p-4 space-y-4">
                    {categoryCampaigns.map((campaign) => {
                      const campaignKeywords = getKeywordsForCampaign(campaign.id)
                        .filter(keyword => filteredKeywords.includes(keyword));
                      
                      if (campaignKeywords.length === 0 && searchTerm) return null;

                      const isCampaignExpanded = expandedCampaigns.has(campaign.id);

                      return (
                        <div key={campaign.id} className={`border ${theme.border} rounded-lg`}>
                          {/* Campaign Header */}
                          <div 
                            className={`flex items-center justify-between p-3 cursor-pointer hover:${theme.cardBackground} rounded-t-lg`}
                            onClick={() => toggleCampaignExpanded(campaign.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-5 w-5"
                              >
                                {isCampaignExpanded ? 
                                  <ChevronDown className="h-3 w-3" /> : 
                                  <ChevronRight className="h-3 w-3" />
                                }
                              </Button>
                              <Target className={`h-4 w-4 ${theme.textSecondary}`} />
                              <div>
                                <h4 className={`font-medium ${theme.text}`}>{campaign.name}</h4>
                                {campaign.description && (
                                  <p className={`text-xs ${theme.textSecondary}`}>{campaign.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={campaign.status} theme={theme} />
                              <Badge variant="outline" className="text-xs">
                                {campaignKeywords.length} keywords
                              </Badge>
                            </div>
                          </div>

                          {/* Campaign Keywords */}
                          {isCampaignExpanded && campaignKeywords.length > 0 && (
                            <div className="border-t border-border">
                              <div className="p-3 space-y-2">
                                {campaignKeywords.map((keyword) => (
                                  <div 
                                    key={keyword.id} 
                                    className={`flex items-center justify-between p-3 rounded-lg border ${theme.border} hover:${theme.cardBackground} transition-colors`}
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <Tag className={`h-4 w-4 ${theme.textSecondary}`} />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className={`font-medium ${theme.text}`}>
                                            {keyword.keyword}
                                          </span>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${getMatchTypeColor(keyword.match_type)}`}
                                          >
                                            {getMatchTypeIcon(keyword.match_type)} {keyword.match_type}
                                          </Badge>
                                        </div>
                                        {keyword.stats && (
                                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Vol: {formatNumber(keyword.stats.local_volume)}</span>
                                            <span>CPC: {formatCurrency(keyword.stats.cpc)}</span>
                                            <span>Diff: {keyword.stats.keyword_difficulty}%</span>
                                            <span>Comp: {(keyword.stats.competitive_density * 100).toFixed(0)}%</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {keyword.stats && (
                                        <div className="flex items-center gap-3 text-sm">
                                          <div className="text-center">
                                            <div className={`text-xs ${theme.textSecondary}`}>Volume</div>
                                            <div className={`font-medium ${theme.text}`}>
                                              {formatNumber(keyword.stats.local_volume)}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className={`text-xs ${theme.textSecondary}`}>CPC</div>
                                            <div className={`font-medium ${theme.text}`}>
                                              {formatCurrency(keyword.stats.cpc)}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onKeywordEdit(keyword)}
                                        className={`${theme.border} ${theme.text}`}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onKeywordDelete(keyword.id)}
                                        className={`${theme.border} text-red-500 hover:bg-red-50`}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Empty State for Campaign */}
                          {isCampaignExpanded && campaignKeywords.length === 0 && (
                            <div className={`border-t ${theme.border} p-6 text-center`}>
                              <Tag className={`h-8 w-8 mx-auto mb-2 ${theme.textSecondary} opacity-50`} />
                              <p className={`text-sm ${theme.textSecondary}`}>
                                {searchTerm ? 'No keywords match your search' : 'No keywords in this campaign'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className={`text-center py-12 ${theme.textSecondary}`}>
          <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No categories found</p>
          <p>Create some categories and campaigns to see keywords organized here.</p>
        </div>
      )}
    </div>
  );
};

function CampaignBuilderPage() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const debugLogger = useDebugLogger('CampaignBuilder');
  
  const allMenuItems = getMenuItems();
  const menuSections = getSections();

  // State
  const [activeTab, setActiveTab] = useState<string>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<NegativeKeyword[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    activeCampaigns: 0,
    totalCategories: 0,
    totalKeywords: 0,
    totalNegativeKeywords: 0
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use sample data
      setCampaigns(SAMPLE_CAMPAIGNS);
      setCategories(SAMPLE_CATEGORIES);
      setKeywords(SAMPLE_KEYWORDS);
      setNegativeKeywords(SAMPLE_NEGATIVE_KEYWORDS);
      
      // Calculate stats
      setStats({
        activeCampaigns: SAMPLE_CAMPAIGNS.filter(c => c.status === 'active').length,
        totalCategories: SAMPLE_CATEGORIES.length,
        totalKeywords: SAMPLE_KEYWORDS.length,
        totalNegativeKeywords: SAMPLE_NEGATIVE_KEYWORDS.length
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleCampaignEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('editor');
  };

  const handleCampaignCreate = () => {
    setSelectedCampaign(null);
    setActiveTab('editor');
  };

  const handleCampaignSave = async (campaign: Campaign) => {
    try {
      let updatedCampaigns;
      
      if (campaign.id) {
        // Update existing
        updatedCampaigns = campaigns.map(c => c.id === campaign.id ? campaign : c);
      } else {
        // Create new
        const newCampaign = {
          ...campaign,
          id: `new-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedCampaigns = [...campaigns, newCampaign];
      }
      
      setCampaigns(updatedCampaigns);
      setActiveTab('campaigns');
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeCampaigns: updatedCampaigns.filter(c => c.status === 'active').length
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to save campaign');
    }
  };

  const handleCampaignDelete = async (campaignId: string) => {
    try {
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
      setCampaigns(updatedCampaigns);
      
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(null);
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeCampaigns: updatedCampaigns.filter(c => c.status === 'active').length
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to delete campaign');
    }
  };

  const handleKeywordEdit = (keyword: Keyword) => {
    debugLogger.log('Edit keyword clicked', { keywordId: keyword.id, keyword: keyword.keyword });
    // TODO: Implement keyword editing functionality
  };

  const handleKeywordDelete = async (keywordId: string) => {
    try {
      debugLogger.log('Delete keyword clicked', { keywordId });
      const updatedKeywords = keywords.filter(k => k.id !== keywordId);
      setKeywords(updatedKeywords);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalKeywords: updatedKeywords.length
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to delete keyword');
    }
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
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Campaign Builder
            </h1>
            <p className="text-muted-foreground">
              Manage your advertising campaigns, keywords, and categories
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Campaigns</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.activeCampaigns}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categories</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.totalCategories}</p>
                  </div>
                  <div className="h-12 w-12 bg-secondary/10 flex items-center justify-center rounded-lg">
                    <Layers className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Keywords</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.totalKeywords}</p>
                  </div>
                  <div className="h-12 w-12 bg-accent/10 flex items-center justify-center rounded-lg">
                    <Tag className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Negative Keywords</p>
                    <p className="text-3xl font-semibold text-card-foreground">{stats.totalNegativeKeywords}</p>
                  </div>
                  <div className="h-12 w-12 bg-destructive/10 flex items-center justify-center rounded-lg">
                    <Ban className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <h3 className="font-medium text-destructive">Error</h3>
                    <p className="text-destructive/80">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading ? (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading campaigns...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Main Content */
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-muted border-border">
                <TabsTrigger value="campaigns" className="text-foreground">Campaigns</TabsTrigger>
                <TabsTrigger value="editor" className="text-foreground">
                  {selectedCampaign ? 'Edit Campaign' : 'New Campaign'}
                </TabsTrigger>
                <TabsTrigger value="categories" className="text-foreground">Categories</TabsTrigger>
                <TabsTrigger value="keywords" className="text-foreground">Keywords</TabsTrigger>
                <TabsTrigger value="negative-keywords" className="text-foreground">Negative Keywords</TabsTrigger>
              </TabsList>
              
              <TabsContent value="campaigns">
                <CampaignList 
                  campaigns={campaigns}
                  categories={categories}
                  onEdit={handleCampaignEdit}
                  onDelete={handleCampaignDelete}
                  onCreate={handleCampaignCreate}
                />
              </TabsContent>
              
              <TabsContent value="editor">
                <CampaignEditor 
                  campaign={selectedCampaign}
                  categories={categories}
                  onSave={handleCampaignSave}
                  onCancel={() => setActiveTab('campaigns')}
                />
              </TabsContent>
              
              <TabsContent value="categories">
                <div className="bg-card border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Categories</h3>
                  <p className="text-muted-foreground">Category management coming soon...</p>
                </div>
              </TabsContent>
              
              <TabsContent value="keywords">
                <KeywordsByCategory 
                  campaigns={campaigns}
                  categories={categories}
                  keywords={keywords}
                  theme={actualTheme}
                  onKeywordEdit={handleKeywordEdit}
                  onKeywordDelete={handleKeywordDelete}
                />
              </TabsContent>
              
              <TabsContent value="negative-keywords">
                <div className="bg-card border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Negative Keywords</h3>
                  <p className="text-muted-foreground">Negative keyword management coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
        <DebugPanel />
      </div>
    </SidebarLayout>
  );
}

// Wrap with DebugErrorBoundary
const CampaignBuilder = () => (
  <DebugErrorBoundary>
    <CampaignBuilderPage />
  </DebugErrorBoundary>
);

export default CampaignBuilder;