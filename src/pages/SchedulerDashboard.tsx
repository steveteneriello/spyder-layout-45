
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import OxylabsSchedulerDashboard from '@/components/scheduler/OxylabsSchedulerDashboard';

const menuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Settings', section: 'Main' },
  { title: 'Theme', path: '/theme', icon: 'Settings', section: 'Settings' }
];

export default function SchedulerDashboard() {
  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          {/* Logo area - title moved to main content */}
        </div>
      }
      category={
        <SideCategory 
          section="Main" 
          items={menuItems.filter(item => item.section === 'Main')} 
        />
      }
      menuItems={menuItems}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Scheduler Dashboard</h1>
        <OxylabsSchedulerDashboard />
      </div>
    </SidebarLayout>
  );
}
