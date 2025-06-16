
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { CompanySelector } from '@/components/navigation/CompanySelector';
import { ProfileDropdown } from '@/components/navigation/ProfileDropdown';
import { SideCategory } from '@/components/navigation/SideCategory';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

// Mock data
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://github.com/shadcn.png',
};

const mockCompanies = [
  { company_id: '1', name: 'Acme Corp', domain: 'acme.com' },
  { company_id: '2', name: 'Tech Solutions Inc', domain: 'techsolutions.com' },
  { company_id: '3', name: 'Digital Innovations', domain: 'digitalinnov.com' },
];

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

const Index = () => {
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);

  const handleSelectCompany = (companyId: string) => {
    const company = mockCompanies.find((c) => c.company_id === companyId);
    if (company) setSelectedCompany(company);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const nav = (
    <div className="flex items-center justify-between w-full px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">Your App</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Welcome back!</span>
        <ThemeToggle />
      </div>
    </div>
  );

  const footer = (
    <div className="space-y-4">
      <CompanySelector
        companies={mockCompanies}
        selectedCompany={selectedCompany}
        onSelectCompany={handleSelectCompany}
        isExpanded={true}
      />
      <ProfileDropdown
        user={mockUser}
        sidebarOpen={true}
        onLogout={handleLogout}
      />
    </div>
  );

  const category = (
    <div className="space-y-4">
      <SideCategory section="Main" items={allMenuItems.filter(item => item.section === 'Main')} />
      <SideCategory section="Tools" items={allMenuItems.filter(item => item.section === 'Tools')} />
      <SideCategory section="Settings" items={allMenuItems.filter(item => item.section === 'Settings')} />
    </div>
  );

  return (
    <SidebarLayout
      user={mockUser}
      nav={nav}
      category={category}
      footer={footer}
      menuItems={allMenuItems}
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">Welcome to Your Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            This is a modern sidebar layout with company selection, user profiles, and collapsible navigation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
              <p className="text-muted-foreground">View your analytics and key metrics</p>
            </div>
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Campaigns</h3>
              <p className="text-muted-foreground">Manage your campaign strategies</p>
            </div>
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Tools</h3>
              <p className="text-muted-foreground">Access scheduler and location builder</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Index;
