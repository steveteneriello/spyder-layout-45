
import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { CompanySelector } from '@/components/navigation/CompanySelector';
import { ProfileDropdown } from '@/components/navigation/ProfileDropdown';
import { SideCategory } from '@/components/navigation/SideCategory';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { CampaignDesigner } from '@/components/campaigns/CampaignDesigner';

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

const Campaigns = () => {
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
      <div className="min-h-screen p-6 campaign-page-bg">
        <CampaignDesigner />
      </div>
    </SidebarLayout>
  );
};

export default Campaigns;
