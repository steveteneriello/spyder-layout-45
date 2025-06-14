
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

const mockMenuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: 'BarChart', section: 'Main' },
  { title: 'Projects', path: '/projects', icon: 'FileText', section: 'Main' },
  { title: 'Team', path: '/team', icon: 'User', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Marketing' },
  { title: 'Settings', path: '/settings', icon: 'Settings', section: 'Configuration' },
  { title: 'Profile', path: '/profile', icon: 'User', section: 'Configuration' },
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
      <SideCategory section="Main" items={mockMenuItems.filter(item => item.section === 'Main')} />
      <SideCategory section="Marketing" items={mockMenuItems.filter(item => item.section === 'Marketing')} />
      <SideCategory section="Configuration" items={mockMenuItems.filter(item => item.section === 'Configuration')} />
    </div>
  );

  return (
    <SidebarLayout
      user={mockUser}
      nav={nav}
      category={category}
      footer={footer}
      menuItems={mockMenuItems}
    >
      <div style={{ backgroundColor: '#0f172a' }} className="min-h-screen p-6">
        <CampaignDesigner />
      </div>
    </SidebarLayout>
  );
};

export default Campaigns;
