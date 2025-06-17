import React from 'react';
import { useDebugLogger } from '@/components/debug/DebugPanel';

interface ScheduleConfigurationProps {
  campaignData: {
    startDate: string;
    endDate: string;
    noEndDate: boolean;
    frequency: string;
    runTime: string;
  };
  handleInputChange: (field: string, value: any) => void;
  selectedDays: string[];
  setSelectedDays: (days: string[]) => void;
  onContinue: () => void;
}

const ScheduleConfiguration: React.FC<ScheduleConfigurationProps> = ({
  campaignData,
  handleInputChange,
  selectedDays,
  setSelectedDays,
  onContinue
}) => {
  const debug = useDebugLogger('ScheduleConfiguration');

  const toggleDay = (day: string) => {
    const newSelection = selectedDays.includes(day) 
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    debug.debug('Day selection changed', { day, newSelection });
    setSelectedDays(newSelection);
  };

  const handleFieldChange = (field: string, value: any) => {
    debug.debug('Schedule field changed', { field, value });
    handleInputChange(field, value);
  };

  const handleContinue = () => {
    debug.info('Schedule configuration completed', { 
      ...campaignData, 
      selectedDays 
    });
    onContinue();
  };

  const dayLabels = [
    { key: 'sun', label: 'Sun' },
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'bi-monthly', label: 'Bi Monthly' },
    { value: 'specific', label: 'Specific Days' }
  ];

  const handleNoEndDateChange = (checked: boolean) => {
    handleFieldChange('noEndDate', checked);
    if (checked) {
      // Set to 12-31-2029 when no end date is selected
      handleFieldChange('endDate', '2029-12-31');
    } else {
      handleFieldChange('endDate', '');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Campaign Start Date</label>
          <input
            type="date"
            value={campaignData.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background border border-border text-foreground"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Campaign End Date</label>
          <input
            type="date"
            value={campaignData.endDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            disabled={campaignData.noEndDate}
            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-background border border-border text-foreground"
          />
          <label className="flex items-center gap-2 mt-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={campaignData.noEndDate}
              onChange={(e) => handleNoEndDateChange(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
            />
            No end date (sets to 12-31-2029)
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-4 text-foreground">Choose Frequency</h4>
        <div className="flex flex-wrap gap-3">
          {frequencyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFieldChange('frequency', option.value)}
              className={`px-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                campaignData.frequency === option.value
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-secondary border-border hover:bg-secondary/80 text-secondary-foreground'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {campaignData.frequency === 'specific' && (
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-4 text-foreground">Select Days</h4>
          <div className="grid grid-cols-7 gap-2">
            {dayLabels.map((day) => (
              <button
                key={day.key}
                onClick={() => toggleDay(day.key)}
                className={`p-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  selectedDays.includes(day.key)
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-secondary border-border hover:bg-secondary/80 text-secondary-foreground'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-xs mb-6">
        <label className="block text-sm font-medium mb-2 text-foreground">Run Time</label>
        <input
          type="time"
          value={campaignData.runTime}
          onChange={(e) => handleFieldChange('runTime', e.target.value)}
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background border border-border text-foreground"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Schedule: {campaignData.frequency} at {campaignData.runTime}
          {campaignData.frequency === 'specific' && selectedDays.length > 0 && (
            <span> on {selectedDays.join(', ')}</span>
          )}
          {campaignData.noEndDate && <span> (no end date)</span>}
        </div>
        <button 
          onClick={handleContinue}
          disabled={!campaignData.startDate || !campaignData.runTime || (campaignData.frequency === 'specific' && selectedDays.length === 0)}
          className="px-4 py-2 bg-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default ScheduleConfiguration;
