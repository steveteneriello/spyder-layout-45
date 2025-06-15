import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Users, Calendar, Trash2, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedList {
  id: string;
  name: string;
  description: string | null;
  center_city: string;
  location_count: number;
  created_at: string;
}

interface ListItem {
  id: string;
  city: string;
  state_name: string;
  county_name: string;
  postal_code: string;
}

const CountySavedCityLists: React.FC = () => {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [selectedList, setSelectedList] = useState<SavedList | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [viewListOpen, setViewListOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedLists();
  }, []);

  const fetchSavedLists = async () => {
    try {
      const { data, error } = await supabase
        .from('location_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSavedLists(data || []);
    } catch (error) {
      console.error('Error fetching saved lists:', error);
      toast({
        title: "Error",
        description: "Failed to load saved lists",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListItems = async (listId: string) => {
    setIsLoadingItems(true);
    try {
      const { data, error } = await supabase
        .from('location_list_items')
        .select(`
          id,
          city,
          state_name,
          county_name,
          postal_code
        `)
        .eq('list_id', listId)
        .order('city', { ascending: true });

      if (error) throw error;
      
      setListItems(data || []);
    } catch (error) {
      console.error('Error fetching list items:', error);
      toast({
        title: "Error",
        description: "Failed to load list items",
        variant: "destructive",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const deleteList = async (listId: string) => {
    try {
      // First delete all items in the list
      const { error: itemsError } = await supabase
        .from('location_list_items')
        .delete()
        .eq('list_id', listId);

      if (itemsError) throw itemsError;

      // Then delete the list itself
      const { error: listError } = await supabase
        .from('location_lists')
        .delete()
        .eq('id', listId);

      if (listError) throw listError;

      toast({
        title: "Success",
        description: "List deleted successfully",
      });
      
      fetchSavedLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Error",
        description: "Failed to delete list",
        variant: "destructive",
      });
    }
  };

  const viewList = async (list: SavedList) => {
    setSelectedList(list);
    await fetchListItems(list.id);
    setViewListOpen(true);
  };

  const downloadListCSV = (list: SavedList, items: ListItem[]) => {
    const headers = [
      'City', 'State', 'County', 'Postal Code'
    ];

    const csvData = items.map(item => [
      item.city || '',
      item.state_name || '',
      item.county_name || '',
      item.postal_code || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${list.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: `Downloaded ${items.length} cities from "${list.name}"`,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading saved lists...</p>
      </div>
    );
  }

  if (savedLists.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No saved city lists yet</p>
            <p className="text-sm">Create your first city list to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedLists.map((list) => (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="truncate">{list.name}</span>
                <Badge variant="secondary">{list.location_count} cities</Badge>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {list.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>Center: {list.center_city}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(list.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => viewList(list)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteList(list.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View List Dialog */}
      <Dialog open={viewListOpen} onOpenChange={setViewListOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedList?.name}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => selectedList && downloadListCSV(selectedList, listItems)}
                disabled={isLoadingItems || listItems.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </DialogTitle>
            <DialogDescription>
              {selectedList?.description || 'City list with basic location data'}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingItems ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading cities...</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Postal Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.city}</TableCell>
                      <TableCell>{item.state_name}</TableCell>
                      <TableCell>{item.county_name}</TableCell>
                      <TableCell>{item.postal_code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {listItems.length === 0 && !isLoadingItems && (
            <div className="text-center py-8 text-gray-500">
              <p>No cities found in this list</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CountySavedCityLists;
