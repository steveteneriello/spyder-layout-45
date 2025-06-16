
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { List, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedListsButtonProps {
  onListSelect: (list: any) => void;
}

const SavedListsButton: React.FC<SavedListsButtonProps> = ({ onListSelect }) => {
  const [savedLists, setSavedLists] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchSavedLists();
    }
  }, [isOpen]);

  const fetchSavedLists = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('location_lists')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);

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

  const handleListClick = async (list: any) => {
    setIsLoadingList(true);
    try {
      console.log('Loading saved list:', list);
      
      // Fetch the list items to get the actual location data
      const { data: listItems, error } = await supabase
        .from('location_list_items')
        .select('*')
        .eq('list_id', list.id);

      if (error) throw error;

      // Pass the list with its items to the parent component
      const listWithItems = {
        ...list,
        items: listItems || []
      };
      
      onListSelect(listWithItems);
      setIsOpen(false);
      
      toast({
        title: "List Loaded",
        description: `Loaded "${list.name}" with ${listItems?.length || 0} locations`,
      });
    } catch (error) {
      console.error('Error loading list:', error);
      toast({
        title: "Error",
        description: "Failed to load the selected list",
        variant: "destructive",
      });
    } finally {
      setIsLoadingList(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          disabled={isLoadingList}
        >
          <List className="h-4 w-4 mr-2" />
          {isLoadingList ? "Loading..." : "Saved Lists"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border border-slate-200 shadow-lg" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Saved Location Lists</h4>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-900 border-t-transparent"></div>
            </div>
          ) : savedLists.length > 0 ? (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {savedLists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => handleListClick(list)}
                  className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-slate-900 truncate">
                        {list.name}
                      </h5>
                      <p className="text-xs text-slate-600 mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {list.center_city} • {list.radius_miles} miles
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {list.location_count} locations
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(list.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  {list.description && (
                    <p className="text-xs text-slate-500 mt-2 truncate">
                      {list.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p className="text-sm">No saved lists found</p>
              <p className="text-xs mt-1">Create your first location list by searching and saving counties</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SavedListsButton;
