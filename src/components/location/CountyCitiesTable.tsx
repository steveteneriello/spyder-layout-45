
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Download, Save, Filter, ChevronUp, ChevronDown, Eye, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CountySavedCityLists from "./CountySavedCityLists";

interface CountyCitiesTableProps {
  selectedCounties: Set<string>;
  searchResults: any[];
  onSelectedCitiesChange: (cities: any[]) => void;
}

interface CityData {
  id: number;
  city: string;
  state_name: string;
  county_name: string;
  population: string;
  latitude: number;
  longitude: number;
  income_household_median: string;
  age_median: string;
  home_value: string;
  home_ownership: string;
  postal_code: string;
}

type SortField = 'population' | 'income_household_median' | 'home_value';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 50;

const CountyCitiesTable: React.FC<CountyCitiesTableProps> = ({ 
  selectedCounties, 
  searchResults,
  onSelectedCitiesChange
}) => {
  const [cities, setCities] = useState<CityData[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [paginatedCities, setPaginatedCities] = useState<CityData[]>([]);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewSavedListsOpen, setViewSavedListsOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states - auto-start with population >= 1
  const [minPopulation, setMinPopulation] = useState('1');
  const [maxPopulation, setMaxPopulation] = useState('');
  const [minIncome, setMinIncome] = useState('');
  const [maxIncome, setMaxIncome] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('population');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchCitiesFromSelectedCounties();
  }, [selectedCounties, searchResults]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [cities, minPopulation, maxPopulation, minIncome, maxIncome, stateFilter, searchTerm, sortField, sortDirection]);

  useEffect(() => {
    applyPagination();
  }, [filteredCities, currentPage]);

  // New useEffect to call onSelectedCitiesChange when selectedCities changes
  useEffect(() => {
    const selectedCityData = cities.filter(city => 
      selectedCities.has(city.id.toString())
    );
    onSelectedCitiesChange(selectedCityData);
  }, [selectedCities, cities, onSelectedCitiesChange]);

  const fetchCitiesFromSelectedCounties = async () => {
    if (selectedCounties.size === 0) {
      setCities([]);
      return;
    }

    setLoading(true);
    try {
      const selectedCountyDetails = searchResults.filter((county, index) => 
        selectedCounties.has(`${county.county_name}-${county.state_name}-${index}`)
      );

      if (selectedCountyDetails.length === 0) {
        setCities([]);
        return;
      }

      let query = supabase
        .from('location_data' as any)
        .select('*');

      if (selectedCountyDetails.length === 1) {
        const county = selectedCountyDetails[0];
        query = query
          .eq('county_name', county.county_name)
          .eq('state_name', county.state_name);
      } else {
        query = query.in('county_name', selectedCountyDetails.map(c => c.county_name));
      }

      query = query.order('population', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cities:', error);
        toast({
          title: "Error",
          description: "Failed to load cities from selected counties",
          variant: "destructive",
        });
        return;
      }

      const filteredData = data?.filter((city: any) => 
        selectedCountyDetails.some(county => 
          city.county_name === county.county_name && city.state_name === county.state_name
        )
      ) || [];

      setCities(filteredData as CityData[]);
      setCurrentPage(1);
      console.log(`Loaded ${filteredData.length} cities from ${selectedCounties.size} selected counties`);

    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...cities];

    if (searchTerm) {
      filtered = filtered.filter(city =>
        city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.county_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minPopulation) {
      filtered = filtered.filter(city => parseInt(city.population || '0') >= parseInt(minPopulation));
    }
    if (maxPopulation) {
      filtered = filtered.filter(city => parseInt(city.population || '0') <= parseInt(maxPopulation));
    }

    if (minIncome) {
      filtered = filtered.filter(city => parseInt(city.income_household_median || '0') >= parseInt(minIncome));
    }
    if (maxIncome) {
      filtered = filtered.filter(city => parseInt(city.income_household_median || '0') <= parseInt(maxIncome));
    }

    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(city => city.state_name === stateFilter);
    }

    filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case 'population':
          aValue = parseInt(a.population || '0');
          bValue = parseInt(b.population || '0');
          break;
        case 'income_household_median':
          aValue = parseInt(a.income_household_median || '0');
          bValue = parseInt(b.income_household_median || '0');
          break;
        case 'home_value':
          aValue = parseInt(a.home_value || '0');
          bValue = parseInt(b.home_value || '0');
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredCities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const applyPagination = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedCities(filteredCities.slice(startIndex, endIndex));
  };

  const totalPages = Math.ceil(filteredCities.length / ITEMS_PER_PAGE);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const handleCitySelection = (cityId: string, checked: boolean) => {
    const newSelected = new Set(selectedCities);
    if (checked) {
      newSelected.add(cityId);
    } else {
      newSelected.delete(cityId);
    }
    setSelectedCities(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCityIds = paginatedCities.map(city => city.id.toString());
      setSelectedCities(new Set([...selectedCities, ...allCityIds]));
    } else {
      const currentPageIds = new Set(paginatedCities.map(city => city.id.toString()));
      setSelectedCities(new Set([...selectedCities].filter(id => !currentPageIds.has(id))));
    }
  };

  const downloadCSV = () => {
    const headers = [
      'City', 'State', 'County', 'Population', 'Median Income', 'Median Age', 
      'Home Value', 'Home Ownership %', 'Postal Code', 'Latitude', 'Longitude'
    ];

    const csvData = filteredCities.map(city => [
      city.city || '',
      city.state_name || '',
      city.county_name || '',
      city.population || '',
      city.income_household_median || '',
      city.age_median || '',
      city.home_value || '',
      city.home_ownership || '',
      city.postal_code || '',
      city.latitude?.toString() || '',
      city.longitude?.toString() || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `county-cities-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Downloaded ${filteredCities.length} cities as CSV`,
    });
  };

  const saveCityList = async () => {
    if (!listName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name",
        variant: "destructive",
      });
      return;
    }

    const selectedCityData = filteredCities.filter(city => 
      selectedCities.has(city.id.toString())
    );

    if (selectedCityData.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one city to save",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Create the location list
      const { data: listData, error: listError } = await supabase
        .from('location_lists' as any)
        .insert({
          name: listName.trim(),
          description: listDescription.trim() || null,
          center_city: selectedCityData[0]?.city || 'Unknown',
          center_latitude: selectedCityData[0]?.latitude || 0,
          center_longitude: selectedCityData[0]?.longitude || 0,
          radius_miles: 0,
          location_count: selectedCityData.length
        })
        .select()
        .single();

      if (listError) throw listError;

      // Insert only the basic required fields that exist in location_list_items
      const locationItems = selectedCityData.map(city => ({
        list_id: listData.id,
        location_data_id: crypto.randomUUID(), // Generate a proper UUID
        city: city.city,
        state_name: city.state_name,
        country: 'United States',
        county_name: city.county_name,
        postal_code: city.postal_code,
        latitude: city.latitude || 0,
        longitude: city.longitude || 0,
        distance_miles: 0
      }));

      const { error: itemsError } = await supabase
        .from('location_list_items' as any)
        .insert(locationItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: `City list "${listName}" saved with ${selectedCityData.length} cities`,
      });

      setListName('');
      setListDescription('');
      setSaveDialogOpen(false);
      setSelectedCities(new Set());

    } catch (error: any) {
      console.error('Error saving city list:', error);
      toast({
        title: "Error",
        description: `Failed to save city list: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value || value === '0') return 'N/A';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(numValue);
  };

  const formatPercentage = (value: string | null | undefined) => {
    if (!value || value === '0') return 'N/A';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(1)}%`;
  };

  const formatNumber = (value: string | null | undefined) => {
    if (!value || value === '0') return 'N/A';
    const numValue = parseInt(value);
    if (isNaN(numValue)) return 'N/A';
    return numValue.toLocaleString();
  };

  const uniqueStates = [...new Set(cities.map(city => city.state_name))].sort();
  const currentPageIds = new Set(paginatedCities.map(city => city.id.toString()));
  const isAllSelected = paginatedCities.length > 0 && paginatedCities.every(city => selectedCities.has(city.id.toString()));
  const isIndeterminate = paginatedCities.some(city => selectedCities.has(city.id.toString())) && !isAllSelected;

  if (selectedCounties.size === 0) {
    return (
      <div className="h-full bg-white rounded-lg overflow-hidden">
        {/* Modernized header with gradient to match counties */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 mr-2 inline-block text-slate-500" />
            <h2 className="text-xl font-semibold tracking-wide text-slate-900">Cities from Selected Counties</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-slate-500">
            <Building2 className="mx-auto w-8 h-8 mb-2 text-slate-300" />
            <p className="font-medium">No cities to display</p>
            <p className="text-sm text-slate-400 mt-1">Select counties to view cities with detailed data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-lg overflow-hidden flex flex-col">
      {/* Modernized header with gradient to match counties */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 mr-2 inline-block text-slate-500" />
            <div>
              <h2 className="text-xl font-semibold tracking-wide text-slate-900">Cities from Selected Counties</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs font-medium">
                  {filteredCities.length} cities
                </Badge>
                {filteredCities.length > ITEMS_PER_PAGE && (
                  <Badge variant="outline" className="text-xs">
                    Page {currentPage} of {totalPages}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadCSV} 
              className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:scale-[1.01] transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewSavedListsOpen(true)} 
              className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:scale-[1.01] transition-all"
            >
              <Eye className="h-4 w-4 mr-2" />
              Saved Lists
            </Button>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  disabled={selectedCities.size === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm hover:shadow-md hover:scale-[1.01]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save List ({selectedCities.size})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Save City List</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Save these {selectedCities.size} selected cities with comprehensive data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="listName" className="text-sm font-medium text-slate-700">List Name *</Label>
                    <Input
                      id="listName"
                      placeholder="e.g., Cities in Selected Counties"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      className="mt-1 border-slate-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="listDescription" className="text-sm font-medium text-slate-700">Description</Label>
                    <Textarea
                      id="listDescription"
                      placeholder="Optional description for this list"
                      value={listDescription}
                      onChange={(e) => setListDescription(e.target.value)}
                      className="mt-1 border-slate-200 focus:border-blue-400"
                    />
                  </div>
                  <Button 
                    onClick={saveCityList} 
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition"
                  >
                    {isSaving ? 'Saving...' : 'Save City List'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Enhanced filters section with better styling */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold tracking-wide text-slate-700">FILTERS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="searchTerm" className="text-xs font-medium text-slate-600 uppercase tracking-wide">Search</Label>
              <Input
                id="searchTerm"
                placeholder="City or county name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 border-slate-200 focus:border-blue-400 hover:border-slate-300 transition-colors"
              />
            </div>
            <div>
              <Label htmlFor="stateFilter" className="text-xs font-medium text-slate-600 uppercase tracking-wide">State</Label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="mt-1 border-slate-200 focus:border-blue-400 hover:border-slate-300 transition-colors">
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All states</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minPopulation" className="text-xs font-medium text-slate-600 uppercase tracking-wide">Min Population</Label>
              <Input
                id="minPopulation"
                type="number"
                placeholder="1"
                value={minPopulation}
                onChange={(e) => setMinPopulation(e.target.value)}
                className="mt-1 border-slate-200 focus:border-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="maxPopulation" className="text-xs font-medium text-slate-600 uppercase tracking-wide">Max Population</Label>
              <Input
                id="maxPopulation"
                type="number"
                placeholder="No limit"
                value={maxPopulation}
                onChange={(e) => setMaxPopulation(e.target.value)}
                className="mt-1 border-slate-200 focus:border-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="minIncome" className="text-xs font-medium text-slate-600 uppercase tracking-wide">Min Income</Label>
              <Input
                id="minIncome"
                type="number"
                placeholder="$0"
                value={minIncome}
                onChange={(e) => setMinIncome(e.target.value)}
                className="mt-1 border-slate-200 focus:border-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="maxIncome" className="text-xs font-medium text-slate-600 uppercase tracking-wide">Max Income</Label>
              <Input
                id="maxIncome"
                type="number"
                placeholder="No limit"
                value={maxIncome}
                onChange={(e) => setMaxIncome(e.target.value)}
                className="mt-1 border-slate-200 focus:border-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Main content area with improved styling */}
        <div className="flex-1 overflow-auto p-6">
          {/* Enhanced select all checkbox */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm">
            <Checkbox
              id="select-all-cities"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className={isIndeterminate ? "data-[state=checked]:bg-blue-600 data-[state=indeterminate]:bg-blue-600" : "data-[state=checked]:bg-blue-600"}
            />
            <Label htmlFor="select-all-cities" className="text-sm font-medium text-slate-700">
              Select All on This Page 
              <span className="text-slate-500 ml-1">
                ({paginatedCities.filter(city => selectedCities.has(city.id.toString())).length} of {paginatedCities.length} selected)
              </span>
            </Label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                <p className="text-slate-600 font-medium">Loading cities...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Enhanced table styling with better hover effects */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                      <TableHead className="w-12 font-semibold text-slate-700"></TableHead>
                      <TableHead className="font-semibold text-slate-700">City</TableHead>
                      <TableHead className="font-semibold text-slate-700">State</TableHead>
                      <TableHead className="font-semibold text-slate-700">County</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
                        onClick={() => handleSort('population')}
                      >
                        <div className="flex items-center gap-2">
                          Population
                          {getSortIcon('population')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
                        onClick={() => handleSort('income_household_median')}
                      >
                        <div className="flex items-center gap-2">
                          Median Income
                          {getSortIcon('income_household_median')}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Median Age</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
                        onClick={() => handleSort('home_value')}
                      >
                        <div className="flex items-center gap-2">
                          Home Value
                          {getSortIcon('home_value')}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Home Ownership</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCities.map((city, index) => (
                      <TableRow 
                        key={city.id}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors hover:scale-[1.001] ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                        }`}
                      >
                        <TableCell className="py-3">
                          <Checkbox
                            checked={selectedCities.has(city.id.toString())}
                            onCheckedChange={(checked) => handleCitySelection(city.id.toString(), checked as boolean)}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 py-3">{city.city}</TableCell>
                        <TableCell className="text-slate-700 py-3">{city.state_name}</TableCell>
                        <TableCell className="text-slate-700 py-3">{city.county_name}</TableCell>
                        <TableCell className="text-slate-700 py-3">{formatNumber(city.population)}</TableCell>
                        <TableCell className="text-slate-700 py-3">{formatCurrency(city.income_household_median)}</TableCell>
                        <TableCell className="text-slate-700 py-3">{city.age_median || 'N/A'}</TableCell>
                        <TableCell className="text-slate-700 py-3">{formatCurrency(city.home_value)}</TableCell>
                        <TableCell className="text-slate-700 py-3">{formatPercentage(city.home_ownership)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced pagination with better styling */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-slate-100 hover:scale-[1.01]"} text-slate-700 transition-all`}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                              }}
                              isActive={currentPage === pageNum}
                              className={currentPage === pageNum ? "bg-blue-600 text-white hover:bg-blue-700" : "text-slate-700 hover:bg-slate-100 hover:scale-[1.01] transition-all"}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis className="text-slate-400" />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-slate-100 hover:scale-[1.01]"} text-slate-700 transition-all`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}

          {filteredCities.length === 0 && !loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-slate-500">
                <Building2 className="mx-auto w-8 h-8 mb-2 text-slate-300" />
                <p className="font-medium">No cities found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or selecting different counties</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Lists Dialog */}
      <Dialog open={viewSavedListsOpen} onOpenChange={setViewSavedListsOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Saved City Lists</DialogTitle>
            <DialogDescription className="text-slate-600">
              View and manage your saved city lists with comprehensive data
            </DialogDescription>
          </DialogHeader>
          <CountySavedCityLists />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountyCitiesTable;
