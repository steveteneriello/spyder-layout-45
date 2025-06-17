import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { SideCategory } from '@/components/navigation/SideCategory';
import { useGlobalTheme } from '@/contexts/GlobalThemeContext';
import { useMenuConfig } from '@/hooks/useMenuConfig';
import { DebugPanel, useDebugLogger, DebugErrorBoundary } from '@/components/debug/DebugPanel';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { ChevronDown, Plus, Check } from 'lucide-react';
import CampaignDetails from '@/components/campaigns/CampaignDetails';
import LocationSelection from '@/components/campaigns/LocationSelection';
import KeywordSelection from '@/components/campaigns/KeywordSelection';
import ScheduleConfiguration from '@/components/campaigns/ScheduleConfiguration';
import PreflightChecklist from '@/components/campaigns/PreflightChecklist';

interface CampaignData {
  name: string;
  type: 'client' | 'market' | 'prospect' | 'data';
  assignment: string;
  assignmentId: string;
  network: 'google' | 'bing';
  targetingType: 'local' | 'regional' | 'timezone';
  savedConfig: string;
  category: string;
  startDate: string;
  endDate: string;
  noEndDate: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'bi-monthly' | 'specific';
  runTime: string;
  worker: string;
  adhocKeywords: string;
}

interface StepStatus {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
}

export default function CampaignLauncher() {
  const { actualTheme, themeMode } = useGlobalTheme();
  const { getMenuItems, getSections } = useMenuConfig();
  const allMenuItems = getMenuItems();
  const menuSections = getSections();
  const debug = useDebugLogger('CampaignLauncher');

  // Step management
  const [activeSection, setActiveSection] = useState<number | null>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Data states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    type: 'client',
    assignment: '',
    assignmentId: '',
    network: 'google',
    targetingType: 'local',
    savedConfig: 'none',
    category: 'plumbing',
    startDate: '',
    endDate: '',
    noEndDate: false,
    frequency: 'daily',
    runTime: '09:00',
    worker: 'default',
    adhocKeywords: ''
  });

  // Steps configuration
  const steps: StepStatus[] = [
    { id: 1, title: 'Campaign Details', completed: completedSteps.includes(1), active: activeSection === 1 },
    { id: 2, title: 'Choose Locations', completed: completedSteps.includes(2), active: activeSection === 2 },
    { id: 3, title: 'Keyword Selection', completed: completedSteps.includes(3), active: activeSection === 3 },
    { id: 4, title: 'Schedule Configuration', completed: completedSteps.includes(4), active: activeSection === 4 },
    { id: 5, title: 'Preflight Checklist', completed: completedSteps.includes(5), active: activeSection === 5 }
  ];

  useEffect(() => {
    debug.info('Campaign Launcher mounted');
    return () => debug.info('Campaign Launcher unmounted');
  }, []);

  const handleInputChange = (field: keyof CampaignData, value: any) => {
    debug.debug('Campaign data updated', { field, value });
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const calculateSearchVolume = () => {
    const locationsCount = selectedLocations.length || 1;
    const keywordsCount = selectedKeywords.length + (campaignData.adhocKeywords ? campaignData.adhocKeywords.split(',').length : 0);
    const frequency = campaignData.frequency === 'daily' ? 30 : campaignData.frequency === 'weekly' ? 4 : 1;
    const volume = locationsCount * keywordsCount * frequency;
    debug.debug('Search volume calculated', { locationsCount, keywordsCount, frequency, volume });
    return volume;
  };

  const handleSaveDraft = () => {
    debug.info('Saving campaign draft');
    // Implementation for saving draft
  };

  const handleCreateCampaign = () => {
    debug.info('Creating campaign', { campaignData, selectedLocations, selectedKeywords });
    // Implementation for creating campaign
  };

  const handleStepComplete = (stepId: number) => {
    debug.info('Step completed', { stepId });
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
    
    // Auto-advance to next step
    if (stepId < 5) {
      setActiveSection(stepId + 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    debug.info('Step clicked', { stepId });
    setActiveSection(activeSection === stepId ? null : stepId);
  };

  const getStepIcon = (step: StepStatus) => {
    if (step.completed) {
      return <Check className="w-4 h-4 text-white" />;
    }
    return <span className="text-sm font-medium">{step.id}</span>;
  };

  const getStepClasses = (step: StepStatus) => {
    if (step.completed) {
      return "w-7 h-7 bg-green-500 rounded-full flex items-center justify-center";
    }
    if (step.active) {
      return "w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground";
    }
    return "w-7 h-7 bg-muted border border-border rounded-full flex items-center justify-center text-muted-foreground";
  };

  const getStepButtonClasses = (step: StepStatus) => {
    const baseClasses = "w-full p-4 sm:p-6 transition-colors flex items-center justify-between";
    
    if (step.completed) {
      return `${baseClasses} bg-green-50 hover:bg-green-100 border-b border-border`;
    }
    if (step.active) {
      return `${baseClasses} bg-primary/10 hover:bg-primary/20 border-b border-border`;
    }
    return `${baseClasses} bg-muted/50 hover:bg-muted border-b border-border`;
  };

  return (
    <DebugErrorBoundary componentName="CampaignLauncher">
      <SidebarLayout
        nav={
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-3">
              <BrandLogo
                size="md"
                showText={true}
                className="flex items-center gap-3 text-header-foreground"
              />
            </div>
            <Badge variant="outline" className="text-header-foreground border-header-foreground/20">
              {actualTheme}
            </Badge>
          </div>
        }
        category={
          <div className="space-y-4">
            {menuSections.map((section) => (
              <SideCategory 
                key={section.name}
                section={section.name} 
                items={section.items} 
              />
            ))}
          </div>
        }
        menuItems={allMenuItems}
      >
        <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Campaign Launcher</h1>
            <p className="text-muted-foreground">Create and configure your search campaigns step by step</p>
          </div>

          {/* Progress Overview */}
          <div className="mb-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Campaign Setup Progress</h2>
              <span className="text-sm text-muted-foreground">
                {completedSteps.length} of 5 steps completed
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={getStepClasses(step)}>
                      {getStepIcon(step)}
                    </div>
                    <span className={`text-xs mt-1 text-center ${
                      step.completed ? 'text-green-600 font-medium' : 
                      step.active ? 'text-primary font-medium' : 
                      'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">Create New Campaign</h2>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleSaveDraft}
                  className="flex-1 sm:flex-none px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors text-secondary-foreground"
                >
                  Save Draft
                </button>
                <button 
                  onClick={handleCreateCampaign}
                  className="flex-1 sm:flex-none px-4 py-2 bg-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </button>
              </div>
            </div>

            {/* Step 1: Campaign Details */}
            <div className="border-b border-border">
              <button
                onClick={() => handleStepClick(1)}
                className={getStepButtonClasses(steps[0])}
              >
                <div className="flex items-center gap-3">
                  <div className={getStepClasses(steps[0])}>
                    {getStepIcon(steps[0])}
                  </div>
                  <span className="font-medium text-foreground">Campaign Details</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeSection === 1 ? 'rotate-180' : ''}`} />
              </button>
              
              {activeSection === 1 && (
                <CampaignDetails 
                  campaignData={campaignData} 
                  handleInputChange={handleInputChange} 
                  onContinue={() => handleStepComplete(1)}
                />
              )}
            </div>

            {/* Step 2: Choose Locations */}
            <div className="border-b border-border">
              <button
                onClick={() => handleStepClick(2)}
                className={getStepButtonClasses(steps[1])}
              >
                <div className="flex items-center gap-3">
                  <div className={getStepClasses(steps[1])}>
                    {getStepIcon(steps[1])}
                  </div>
                  <span className="font-medium text-foreground">Choose Locations</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeSection === 2 ? 'rotate-180' : ''}`} />
              </button>
              
              {activeSection === 2 && (
                <LocationSelection 
                  campaignData={campaignData}
                  handleInputChange={handleInputChange}
                  selectedLocations={selectedLocations}
                  setSelectedLocations={setSelectedLocations}
                  onContinue={() => handleStepComplete(2)}
                />
              )}
            </div>

            {/* Step 3: Keyword Selection */}
            <div className="border-b border-border">
              <button
                onClick={() => handleStepClick(3)}
                className={getStepButtonClasses(steps[2])}
              >
                <div className="flex items-center gap-3">
                  <div className={getStepClasses(steps[2])}>
                    {getStepIcon(steps[2])}
                  </div>
                  <span className="font-medium text-foreground">Keyword Selection</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeSection === 3 ? 'rotate-180' : ''}`} />
              </button>
              
              {activeSection === 3 && (
                <KeywordSelection 
                  campaignData={campaignData}
                  handleInputChange={handleInputChange}
                  selectedCampaigns={selectedCampaigns}
                  setSelectedCampaigns={setSelectedCampaigns}
                  selectedKeywords={selectedKeywords}
                  setSelectedKeywords={setSelectedKeywords}
                  onContinue={() => handleStepComplete(3)}
                />
              )}
            </div>

            {/* Step 4: Schedule Configuration */}
            <div className="border-b border-border">
              <button
                onClick={() => handleStepClick(4)}
                className={getStepButtonClasses(steps[3])}
              >
                <div className="flex items-center gap-3">
                  <div className={getStepClasses(steps[3])}>
                    {getStepIcon(steps[3])}
                  </div>
                  <span className="font-medium text-foreground">Schedule Configuration</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeSection === 4 ? 'rotate-180' : ''}`} />
              </button>
              
              {activeSection === 4 && (
                <ScheduleConfiguration 
                  campaignData={campaignData}
                  handleInputChange={handleInputChange}
                  selectedDays={selectedDays}
                  setSelectedDays={setSelectedDays}
                  onContinue={() => handleStepComplete(4)}
                />
              )}
            </div>

            {/* Step 5: Preflight Checklist */}
            <div>
              <button
                onClick={() => handleStepClick(5)}
                className={getStepButtonClasses(steps[4])}
              >
                <div className="flex items-center gap-3">
                  <div className={getStepClasses(steps[4])}>
                    {getStepIcon(steps[4])}
                  </div>
                  <span className="font-medium text-foreground">Preflight Checklist</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeSection === 5 ? 'rotate-180' : ''}`} />
              </button>
              
              {activeSection === 5 && (
                <PreflightChecklist 
                  campaignData={campaignData}
                  handleInputChange={handleInputChange}
                  selectedLocations={selectedLocations}
                  selectedKeywords={selectedKeywords}
                  calculateSearchVolume={calculateSearchVolume}
                />
              )}
            </div>
          </div>

          <DebugPanel 
            componentName="CampaignLauncher" 
            position="bottom-right"
          />
        </div>
      </SidebarLayout>
    </DebugErrorBoundary>
  );
}