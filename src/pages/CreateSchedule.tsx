import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { CreateOxylabsScheduleModal } from '@/components/scheduler/CreateOxylabsScheduleModal';
import { Button } from '@/components/ui/button';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

export default function CreateSchedule() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data for the modal
  const mockModalProps = {
    isOpen: isModalOpen,
    jobId: 'mock-job-id',
    scheduleId: 'mock-schedule-id',
    jobName: 'Sample Job',
    onClose: () => setIsModalOpen(false),
    onSuccess: () => {
      setIsModalOpen(false);
      console.log('Schedule created successfully');
    }
  };

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <h1 className="text-lg font-semibold text-white">Create Schedule</h1>
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
        <h1 className="text-2xl font-bold mb-6">Create New Schedule</h1>
        <div className="bg-card border p-6 rounded-lg">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Click the button below to create a new Oxylabs schedule.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              Create Schedule
            </Button>
          </div>
          <CreateOxylabsScheduleModal {...mockModalProps} />
        </div>
      </div>
    </SidebarLayout>
  );
}
