import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { CountyLocationResults } from '@/components/location/CountyLocationResults';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

export default function LocationBuilder() {
  // Mock props for CountyLocationResults to satisfy the component requirements
  const mockProps = {
    searchResults: [],
    centerCoords: { lat: 0, lng: 0 },
    onListSaved: () => {},
    selectedCounties: [],
    onCountySelectionChange: () => {}
  };

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <h1 className="text-lg font-semibold text-white">Location Builder</h1>
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
      <div className="p-6 bg-background text-foreground min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Location Builder</h1>
        <div className="bg-card border p-6 rounded-lg">
          <CountyLocationResults {...mockProps} />
        </div>
      </div>
    </SidebarLayout>
  );
}
