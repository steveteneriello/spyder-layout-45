
export const parseCronExpression = (cron: string, timezone?: string) => {
  if (!cron) return 'No schedule';
  
  try {
    const parts = cron.split(' ');
    if (parts.length !== 5) return `Invalid format: ${cron}`;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Format time with timezone
    const formatTime = (h: string, m: string) => {
      const hourNum = parseInt(h);
      const minuteNum = parseInt(m);
      const time = new Date();
      time.setHours(hourNum, minuteNum, 0, 0);
      
      const timeString = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      return timezone ? `${timeString} (${timezone})` : timeString;
    };

    // Get day name
    const getDayName = (dayNum: string) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[parseInt(dayNum)] || `Day ${dayNum}`;
    };

    // Handle common patterns
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      if (minute === '*' && hour === '*') return 'Every minute';
      if (minute === '0' && hour === '*') return 'Every hour';
      if (hour !== '*' && minute !== '*') {
        return `Daily at ${formatTime(hour, minute)}`;
      }
    } else if (dayOfWeek !== '*' && dayOfWeek !== '0') {
      const dayName = getDayName(dayOfWeek);
      return `Weekly on ${dayName} at ${formatTime(hour, minute)}`;
    } else if (dayOfMonth !== '*') {
      const dayNum = parseInt(dayOfMonth);
      const suffix = getDaySuffix(dayNum);
      return `Monthly on ${dayNum}${suffix} at ${formatTime(hour, minute)}`;
    }
    
    return cron;
  } catch (error) {
    console.error('Error parsing cron expression:', error);
    return `Invalid: ${cron}`;
  }
};

// New function to get detailed cron breakdown
export const getCronBreakdown = (cron: string) => {
  if (!cron) return null;
  
  try {
    const parts = cron.split(' ');
    if (parts.length !== 5) return null;
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    const breakdown = {
      time: null as string | null,
      dayOfWeek: null as string | null,
      dayOfMonth: null as string | null,
      frequency: null as string | null
    };

    // Parse time
    if (hour !== '*' && minute !== '*') {
      const hourNum = parseInt(hour);
      const minuteNum = parseInt(minute);
      const time = new Date();
      time.setHours(hourNum, minuteNum, 0, 0);
      breakdown.time = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    // Parse day of week
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      breakdown.dayOfWeek = days[parseInt(dayOfWeek)] || `Day ${dayOfWeek}`;
    }

    // Parse day of month
    if (dayOfMonth !== '*') {
      const dayNum = parseInt(dayOfMonth);
      const suffix = getDaySuffix(dayNum);
      breakdown.dayOfMonth = `${dayNum}${suffix}`;
    }

    // Determine frequency
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      if (minute === '*' && hour === '*') {
        breakdown.frequency = 'Every minute';
      } else if (minute === '0' && hour === '*') {
        breakdown.frequency = 'Hourly';
      } else {
        breakdown.frequency = 'Daily';
      }
    } else if (dayOfWeek !== '*') {
      breakdown.frequency = 'Weekly';
    } else if (dayOfMonth !== '*') {
      breakdown.frequency = 'Monthly';
    }

    return breakdown;
  } catch (error) {
    console.error('Error parsing cron breakdown:', error);
    return null;
  }
};

const getDaySuffix = (day: number) => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export const formatDateWithTimezone = (dateString: string, timezone?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: timezone ? 'short' : undefined
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};
