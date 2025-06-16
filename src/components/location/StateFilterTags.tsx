
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface StateFilterTagsProps {
  searchResults: any[];
  selectedStates: Set<string>;
  onStateToggle: (state: string) => void;
}

const StateFilterTags: React.FC<StateFilterTagsProps> = ({
  searchResults,
  selectedStates,
  onStateToggle
}) => {
  // Get unique states from search results
  const uniqueStates = Array.from(new Set(
    searchResults.map(county => county.state_name)
  )).sort();

  if (uniqueStates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueStates.map((state) => {
        const isSelected = selectedStates.has(state);
        const countiesInState = searchResults.filter(county => county.state_name === state).length;
        
        return (
          <Badge
            key={state}
            variant={isSelected ? "default" : "secondary"}
            className={`cursor-pointer transition-colors ${
              isSelected 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            onClick={() => onStateToggle(state)}
          >
            {state} ({countiesInState})
            {isSelected && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        );
      })}
    </div>
  );
};

export default StateFilterTags;
