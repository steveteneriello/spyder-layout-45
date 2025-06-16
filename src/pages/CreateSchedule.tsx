import React, { useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { CreateOxylabsScheduleModal } from '@/components/scheduler/CreateOxylabsScheduleModal';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Settings, 
  FileText,
  Zap,
  Target,
  MapPin,
  Info,
  CheckCircle,
  AlertTriangle,
  Code2,
  Play
} from 'lucide-react';

const allMenuItems = [
  { title: 'Dashboard', path: '/', icon: 'Home', section: 'Main' },
  { title: 'Campaigns', path: '/campaigns', icon: 'Target', section: 'Main' },
  { title: 'Scheduler', path: '/scheduler', icon: 'Calendar', section: 'Tools' },
  { title: 'Create Schedule', path: '/scheduler/create', icon: 'Plus', section: 'Tools' },
  { title: 'Location Builder', path: '/location-builder', icon: 'MapPin', section: 'Tools' },
  { title: 'Theme', path: '/theme', icon: 'Palette', section: 'Settings' },
  { title: 'Admin Theme', path: '/admin/theme', icon: 'Settings', section: 'Settings' },
];

// Schedule templates
const scheduleTemplates = [
  {
    id: 'web-scraping',
    title: 'Web Scraping Job',
    description: 'Extract data from websites on a schedule',
    icon: Code2,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: ['Custom selectors', 'Rate limiting', 'Data export'],
    popular: true,
  },
  {
    id: 'price-monitoring',
    title: 'Price Monitoring',
    description: 'Track competitor prices automatically',
    icon: Target,
    color: 'bg-green-100 text-green-800 border-green-200',
    features: ['Price alerts', 'Historical data', 'Competitor tracking'],
    popular: false,
  },
  {
    id: 'content-monitoring',
    title: 'Content Monitoring',
    description: 'Monitor website changes and updates',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    features: ['Change detection', 'Content alerts', 'Version tracking'],
    popular: false,
  },
  {
    id: 'location-based',
    title: 'Location-Based Scraping',
    description: 'Scrape data based on geographic locations',
    icon: MapPin,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    features: ['Geo-targeting', 'Location rotation', 'Regional data'],
    popular: false,
  },
];

const quickStartSteps = [
  {
    step: 1,
    title: 'Choose Template',
    description: 'Select a pre-configured template or start from scratch',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Configure Job',
    description: 'Set up your scraping parameters and schedule',
    icon: Settings,
  },
  {
    step: 3,
    title: 'Set Schedule',
    description: 'Define when and how often the job should run',
    icon: Clock,
  },
  {
    step: 4,
    title: 'Launch',
    description: 'Review and start your scheduled job',
    icon: Play,
  },
];

export default function CreateSchedule() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Mock data for the modal
  const mockModalProps = {
    isOpen: isModalOpen,
    jobId: 'new-job-' + Date.now(),
    scheduleId: 'schedule-' + Date.now(),
    jobName: selectedTemplate ? `${selectedTemplate.replace('-', ' ')} Job` : 'Custom Oxylabs Job',
    onClose: () => {
      setIsModalOpen(false);
      setSelectedTemplate(null);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedTemplate(null);
      console.log('Schedule created successfully');
      // You could add a success toast here
    }
  };

  const openModal = (templateId?: string) => {
    if (templateId) {
      setSelectedTemplate(templateId);
    }
    setIsModalOpen(true);
  };

  return (
    <SidebarLayout
      nav={
        <div className="flex items-center justify-between w-full px-4">
          {/* Enhanced header with proper branding */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-black" />
            </div>
            <div className="text-white">
              <div className="font-bold text-sm">Create Schedule</div>
              <div className="text-xs opacity-75">New Oxylabs Job</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-white border-white/20">
              <Zap className="h-3 w-3 mr-1" />
              Templates
            </Badge>
            <Badge variant="outline" className="text-white border-white/20 text-xs">
              {actualTheme}
            </Badge>
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
      {/* FIXED: Clean theme-aware styling */}
      <div className="p-6 bg-background text-foreground min-h-screen">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create New Schedule</h1>
                <p className="text-muted-foreground">
                  Set up automated Oxylabs jobs with custom schedules and parameters
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <a href="/scheduler">
                  <Calendar className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </a>
              </Button>
              <Button onClick={() => openModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Custom Job
              </Button>
            </div>
          </div>
        </div>

        {/* Theme Test Section */}
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Settings className="h-5 w-5 text-primary" />
              🎯 Create Schedule Theme Status
            </CardTitle>
            <CardDescription>
              Verifying theme integration for forms and modals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-primary rounded text-primary-foreground text-center text-sm">
                Primary<br/>
                <span className="opacity-75">BLUE buttons</span>
              </div>
              <div className="p-3 bg-card border border-border rounded text-card-foreground text-center text-sm">
                Forms<br/>
                <span className="opacity-75">Modal backgrounds</span>
              </div>
              <div className="p-3 bg-secondary rounded text-secondary-foreground text-center text-sm">
                Templates<br/>
                <span className="opacity-75">Option cards</span>
              </div>
              <div className="p-3 bg-muted rounded text-muted-foreground text-center text-sm">
                Steps<br/>
                <span className="opacity-75">Process guides</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Mode: <span className="font-mono">{themeMode}</span> | 
              Active: <span className="font-mono">{actualTheme}</span> | 
              Modal Ready: <span className="text-green-600">✅ Theme-aware</span>
            </p>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Templates Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-primary" />
                  Schedule Templates
                </CardTitle>
                <CardDescription>
                  Choose from pre-configured templates or create a custom schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {scheduleTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <div
                        key={template.id}
                        className="relative p-6 border-2 border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => openModal(template.id)}
                      >
                        {/* Popular Badge */}
                        {template.popular && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-green-500 text-white">
                              Popular
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg border ${template.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {template.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="space-y-1">
                              {template.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Job Option */}
                <div className="p-6 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer"
                     onClick={() => openModal()}>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Create Custom Job
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start from scratch with complete customization options
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            
            {/* Quick Start Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Info className="h-5 w-5 text-primary" />
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickStartSteps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.step} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-foreground text-sm font-bold">
                            {step.step}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            {step.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tips & Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Tips & Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Optimize Frequency</p>
                        <p className="text-green-700 text-xs mt-1">
                          Choose appropriate intervals to avoid rate limits
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800">Test First</p>
                        <p className="text-blue-700 text-xs mt-1">
                          Run a single test before scheduling recurring jobs
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-yellow-800">Monitor Usage</p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Keep track of your API quota and usage patterns
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                  Recent Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium text-foreground">Daily Price Check</p>
                      <p className="text-xs text-muted-foreground">Created 2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium text-foreground">Product Scraper</p>
                      <p className="text-xs text-muted-foreground">Created yesterday</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Running</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium text-foreground">Inventory Monitor</p>
                      <p className="text-xs text-muted-foreground">Created 3 days ago</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Paused</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Action Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to get started?
              </h3>
              <p className="text-muted-foreground mb-4">
                Choose a template above or create a custom schedule to begin automating your data collection.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" asChild>
                  <a href="/scheduler">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Existing Schedules
                  </a>
                </Button>
                <Button onClick={() => openModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Creating
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Component */}
        <CreateOxylabsScheduleModal {...mockModalProps} />
      </div>
    </SidebarLayout>
  );
}