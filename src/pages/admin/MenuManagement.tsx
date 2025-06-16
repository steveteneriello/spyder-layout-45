
import React from 'react';
import { Layout } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import MenuManagement from '@/components/MenuManagement';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
  { title: 'Menu Management', path: '/admin/menu', icon: 'Layout', section: 'Settings', isNew: true },
];

export default function MenuManagementPage() {
  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Layout className="h-5 w-5 text-black" />
            </div>
            <div className="text-white">
              <div className="font-bold text-sm">Menu Studio</div>
              <div className="text-xs opacity-75">Navigation Management</div>
            </div>
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
      <MenuManagement />
    </SidebarLayout>
  );
}
