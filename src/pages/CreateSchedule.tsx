
import React, { useState } from 'react';
import { Plus, Calendar, Clock, Settings } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { CreateOxylabsScheduleModal } from '@/components/scheduler/CreateOxylabsScheduleModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface JobOption {
  id: string;
  name: string;
  description: string;
  type: 'google_search' | 'google_ads' | 'bing_ads';
  keywords_count: number;
  last_run?: string;
}

// Mock data - in real app this would come from API
const availableJobs: JobOption[] = [
  {
    id: 'job-1',
    name: 'Local Business Keywords',
    description: 'Track local business search results for competitive analysis',
    type: 'google_search',
    keywords_count: 50,
    last_run: '2024-06-13'
  },
  {
    id: 'job-2', 
    name: 'Google Ads Monitoring',
    description: 'Monitor Google Ads campaigns and competitor analysis',
    type: 'google_ads',
    keywords_count: 25,
    last_run: '2024-06-12'
  },
  {
    id: 'job-3',
    name: 'Bing Search Tracking',
    description: 'Track Bing search results for keyword performance',
    type: 'bing_ads',
    keywords_count: 30
  }
];

function CreateSchedulePage() {
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSchedule = (job: JobOption) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleScheduleSuccess = () => {
    // Handle successful schedule creation
    console.log('Schedule created successfully');
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'google_search': return 'Google Search';
      case 'google_ads': return 'Google Ads';
      case 'bing_ads': return 'Bing Ads';
      default: return type;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'google_search': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'google_ads': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'bing_ads': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen campaign-page-bg">
      {/* Header */}
      <div className="campaign-card-bg campaign-border border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold campaign-primary-text">Create Oxylabs Schedule</h1>
              <p className="text-sm campaign-secondary-text mt-1">
                Create automated schedules for your scraping jobs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 campaign-accent" />
              <Clock className="w-5 h-5 campaign-secondary-text" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold campaign-primary-text mb-2">
              Available Jobs
            </h2>
            <p className="campaign-secondary-text">
              Select a job to create an automated schedule. Schedules will run your jobs at specified intervals.
            </p>
          </div>

          <div className="grid gap-4">
            {availableJobs.map((job) => (
              <Card key={job.id} className="campaign-card-bg campaign-border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold campaign-primary-text">{job.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
                        {getJobTypeLabel(job.type)}
                      </span>
                    </div>
                    <p className="campaign-secondary-text text-sm mb-3">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm campaign-secondary-text">
                      <div className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        <span>{job.keywords_count} keywords</span>
                      </div>
                      {job.last_run && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Last run: {job.last_run}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => handleCreateSchedule(job)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Schedule
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {availableJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="campaign-secondary-text mb-4">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No jobs available for scheduling</p>
                <p className="text-sm">Create some scraping jobs first to enable scheduling</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {selectedJob && (
        <CreateOxylabsScheduleModal
          isOpen={isModalOpen}
          jobId={selectedJob.id}
          scheduleId={`schedule-${selectedJob.id}`}
          jobName={selectedJob.name}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJob(null);
          }}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  );
}

const menuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Main' },
  { title: 'Create Schedule', path: '/create-schedule', icon: 'Plus', section: 'Main' },
  { title: 'Theme', path: '/theme', icon: 'Settings', section: 'Settings' }
];

export default function CreateSchedule() {
  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          <h1 className="text-lg font-semibold text-white">Create Schedule</h1>
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
      <CreateSchedulePage />
    </SidebarLayout>
  );
}
