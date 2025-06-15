
import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";

interface CountyDemographicsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  county: any;
}

const CountyDemographicsDrawer: React.FC<CountyDemographicsDrawerProps> = ({ isOpen, onClose, county }) => {
  if (!county) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{county.county_name} County, {county.state_name}</DrawerTitle>
          <DrawerDescription>
            Demographic information and statistics
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Population</p>
              <p className="text-lg font-semibold">{county.total_population?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cities</p>
              <p className="text-lg font-semibold">{county.city_count || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Distance</p>
              <p className="text-lg font-semibold">{county.distance_miles?.toFixed(1)} miles</p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CountyDemographicsDrawer;
