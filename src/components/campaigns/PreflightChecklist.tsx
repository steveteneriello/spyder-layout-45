import React from 'react';
import { Link } from 'react-router-dom';
import { useDebugLogger } from '@/components/debug/DebugPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PreflightChecklistProps {
  campaignData: {
    name: string;
    type: string;
    network: string;
    worker: string;
    frequency: string;
    runTime: string;
    startDate: string;
    endDate: string;
    noEndDate: boolean;
  };
  handleInputChange: (field: string, value: any) => void;
  selectedLocations: string[];
  selectedKeywords: number[];
  calculateSearchVolume: () => number;
}

const PreflightChecklist: React.FC<PreflightChecklistProps> = ({
  campaignData,
  handleInputChange,
  selectedLocations,
  selectedKeywords,
  calculateSearchVolume
}) => {
  const debug = useDebugLogger('PreflightChecklist');

  const handleWorkerChange = (value: string) => {
    debug.debug('Worker selection changed', { worker: value });
    handleInputChange('worker', value);
  };

  const handleSaveTemplate = () => {
    debug.info('Saving campaign as template', campaignData);
    // Implementation for saving as template
    alert('Template saved successfully!');
  };

  const handleSaveCampaign = () => {
    debug.info('Saving campaign for later', campaignData);
    // Implementation for saving campaign
    alert('Campaign saved as draft!');
  };

  const handleScheduleNow = () => {
    debug.info('Scheduling campaign now', { 
      campaignData, 
      selectedLocations, 
      selectedKeywords,
      estimatedVolume: calculateSearchVolume()
    });
    // Implementation for scheduling campaign
    alert('Campaign scheduled successfully!');
  };

  const campaignSummary = [
    { label: 'Campaign Name', value: campaignData.name || 'Not set' },
    { label: 'Type', value: `${campaignData.type} Campaign` },
    { label: 'Network', value: campaignData.network },
    { label: 'Locations', value: `${selectedLocations.length} cities selected` },
    { label: 'Keywords', value: `${selectedKeywords.length} keywords` },
    { label: 'Schedule', value: `${campaignData.frequency} @ ${campaignData.runTime}` },
    { label: 'Start Date', value: campaignData.startDate || 'Not set' },
    { label: 'End Date', value: campaignData.noEndDate ? 'No end date (12-31-2029)' : campaignData.endDate || 'Not set' },
    { label: 'Est. Monthly Searches', value: `${calculateSearchVolume().toLocaleString()} searches` }
  ];

  return (
    <div className="p-4 sm:p-6 bg-card">
      <Card className="bg-muted border-border mb-6">
        <CardHeader>
          <CardTitle className="text-card-foreground">Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaignSummary.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-muted-foreground text-sm sm:text-base">{item.label}</span>
                <span className="font-medium text-foreground text-sm sm:text-base">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Choose Worker (API User)</label>
        <select
          value={campaignData.worker}
          onChange={(e) => handleWorkerChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background border border-border text-foreground"
        >
          <option value="default">Default Worker</option>
          <option value="worker2">Worker 2 - High Volume</option>
          <option value="worker3">Worker 3 - Premium</option>
          <option value="worker4">Worker 4 - Backup</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Workers determine backend routing and payload handling for your campaign
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={handleSaveTemplate}
          className="bg-background border-border text-foreground hover:bg-muted"
        >
          Save as Template
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleSaveCampaign}
          className="bg-background border-border text-foreground hover:bg-muted"
        >
          Save for Later
        </Button>
        
        <Button asChild>
          <Link to="/campaigns" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            View Campaigns
          </Link>
        </Button>
        
        <Button 
          onClick={handleScheduleNow}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Schedule Now
        </Button>
      </div>

      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <h4 className="font-medium text-foreground mb-2">🚀 Ready to Launch?</h4>
        <p className="text-sm text-muted-foreground">
          Your campaign is configured and ready to schedule. Click "Schedule Now" to activate your campaign 
          or save as a draft to launch later. All data will be stored in the database for future reference.
        </p>
      </div>
    </div>
  );
};

export default PreflightChecklist;
