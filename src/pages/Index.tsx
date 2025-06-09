
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { CompanySelector } from '@/components/navigation/CompanySelector';
import { ProfileDropdown } from '@/components/navigation/ProfileDropdown';
import { SideCategory } from '@/components/navigation/SideCategory';

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

const mockMenuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: 'BarChart', section: 'Main' },
  { title: 'Projects', path: '/projects', icon: 'FileText', section: 'Main' },
  { title: 'Team', path: '/team', icon: 'User', section: 'Main' },
  { title: 'Settings', path: '/settings', icon: 'Settings', section: 'Configuration' },
  { title: 'Profile', path: '/profile', icon: 'User', section: 'Configuration' },
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

  const category = <SideCategory section="Main" items={mockMenuItems.filter(item => item.section === 'Main')} />;

  return (
    <SidebarLayout
      user={mockUser}
      nav={nav}
      category={category}
      footer={footer}
      menuItems={mockMenuItems}
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
              <h3 className="text-lg font-semibold mb-2">Projects</h3>
              <p className="text-muted-foreground">Manage your ongoing projects</p>
            </div>
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Team</h3>
              <p className="text-muted-foreground">Collaborate with your team members</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Index;
