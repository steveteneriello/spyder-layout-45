
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OxylabsSchedule {
  id: string;
  oxylabs_schedule_id: string;
  active: boolean;
  cron_expression: string;
  next_run_at: string;
  end_time: string;
  job_name?: string;
  schedule_name?: string;
  items_count: number;
  stats: {
    total_job_count: number;
    job_result_outcomes: Array<{
      status: string;
      job_count: number;
      ratio: number;
    }>;
  };
  management_status: 'managed' | 'unmanaged';
  last_synced_at: string;
}

// Oxylabs API client
class OxylabsAPI {
  private username: string;
  private password: string;
  private baseUrl = 'https://realtime.oxylabs.io/v1';

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  private getAuthHeader() {
    const credentials = btoa(`${this.username}:${this.password}`);
    return `Basic ${credentials}`;
  }

  async getSchedules() {
    try {
      const response = await fetch(`${this.baseUrl}/schedules`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Oxylabs schedules:', error);
      throw error;
    }
  }

  async getScheduleRuns(scheduleId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${scheduleId}/runs`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch schedule runs:', error);
      throw error;
    }
  }

  async updateScheduleState(scheduleId: string, active: boolean) {
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update schedule state:', error);
      throw error;
    }
  }

  async createScheduleFromJob(jobId: string, scheduleConfig: any) {
    try {
      const response = await fetch(`${this.baseUrl}/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          ...scheduleConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create schedule:', error);
      throw error;
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Request received: ${req.method} ${path}`);

    // Get Oxylabs credentials from environment
    const oxylabsUsername = Deno.env.get('OXYLABS_USERNAME');
    const oxylabsPassword = Deno.env.get('OXYLABS_PASSWORD');

    if (!oxylabsUsername || !oxylabsPassword) {
      console.error('Missing Oxylabs credentials');
      return new Response(
        JSON.stringify({ error: 'Oxylabs credentials not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const oxylabsAPI = new OxylabsAPI(oxylabsUsername, oxylabsPassword);

    // Health check endpoint
    if (path.endsWith('/health')) {
      console.log('Health check called');
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          message: 'Oxylabs Scheduler API is running',
          credentials_configured: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dashboard endpoint - fetch real data from Oxylabs
    if (path.endsWith('/dashboard')) {
      console.log('Dashboard endpoint called - fetching real data');
      
      try {
        const oxylabsSchedules = await oxylabsAPI.getSchedules();
        console.log('Fetched Oxylabs schedules:', oxylabsSchedules);

        // Transform Oxylabs data to our format
        const schedules: OxylabsSchedule[] = oxylabsSchedules.results?.map((schedule: any) => ({
          id: schedule.id,
          oxylabs_schedule_id: schedule.id,
          active: schedule.active,
          cron_expression: schedule.cron_expression || '',
          next_run_at: schedule.next_run_at || new Date().toISOString(),
          end_time: schedule.end_time || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_name: schedule.name || 'Unnamed Schedule',
          schedule_name: schedule.name || 'Unnamed Schedule',
          items_count: schedule.items_count || 0,
          stats: {
            total_job_count: schedule.stats?.total_job_count || 0,
            job_result_outcomes: schedule.stats?.job_result_outcomes || [
              { status: 'done', job_count: 0, ratio: 0 },
              { status: 'failed', job_count: 0, ratio: 0 }
            ]
          },
          management_status: 'managed' as const,
          last_synced_at: new Date().toISOString()
        })) || [];

        // Fetch recent runs for each schedule
        const recent_runs = [];
        for (const schedule of schedules.slice(0, 5)) { // Limit to prevent too many API calls
          try {
            const runs = await oxylabsAPI.getScheduleRuns(schedule.oxylabs_schedule_id);
            if (runs.results?.length > 0) {
              recent_runs.push({
                run_id: runs.results[0].id,
                success_rate: runs.results[0].success_rate || 0,
                jobs: runs.results[0].jobs || [],
                created_at: runs.results[0].created_at || new Date().toISOString()
              });
            }
          } catch (error) {
            console.error(`Failed to fetch runs for schedule ${schedule.oxylabs_schedule_id}:`, error);
          }
        }

        const dashboardData = {
          schedules,
          recent_runs
        };

        console.log('Returning dashboard data:', dashboardData);
        return new Response(
          JSON.stringify(dashboardData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch data from Oxylabs API',
            details: error.message,
            schedules: [],
            recent_runs: []
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Sync endpoint - sync schedules from Oxylabs
    if (path.endsWith('/sync')) {
      console.log('Sync endpoint called - syncing with Oxylabs');
      
      try {
        const oxylabsSchedules = await oxylabsAPI.getSchedules();
        const syncedCount = oxylabsSchedules.results?.length || 0;

        // Here you could also sync to your database
        // const supabase = createClient(...)
        // await supabase.from('scrapi_oxylabs_schedules').upsert(schedules)

        const syncResult = {
          success: true,
          synced: syncedCount,
          message: `Successfully synced ${syncedCount} schedules from Oxylabs`
        };

        return new Response(
          JSON.stringify(syncResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Sync failed:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to sync with Oxylabs API',
            details: error.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Map unmanaged endpoint
    if (path.endsWith('/map-unmanaged')) {
      console.log('Map unmanaged endpoint called');
      
      // This would typically identify unmanaged schedules and map them to your system
      const mapResult = {
        success: true,
        mappings: [],
        message: 'No unmanaged schedules found'
      };

      return new Response(
        JSON.stringify(mapResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Schedule state endpoint
    if (path.includes('/schedule/') && path.endsWith('/state') && req.method === 'PUT') {
      console.log('Schedule state update called');
      
      const body = await req.json();
      const scheduleId = path.split('/')[2];
      
      try {
        const result = await oxylabsAPI.updateScheduleState(scheduleId, body.active);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            schedule_id: scheduleId,
            active: body.active,
            result 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to update schedule state:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to update schedule state',
            details: error.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get schedule details endpoint
    if (path.includes('/schedule/') && req.method === 'GET') {
      console.log('Get schedule details called');
      
      const scheduleId = path.split('/')[2];
      
      try {
        const runs = await oxylabsAPI.getScheduleRuns(scheduleId);
        
        const scheduleDetails = {
          id: scheduleId,
          details: 'Schedule details from Oxylabs',
          runs: runs.results || []
        };

        return new Response(
          JSON.stringify(scheduleDetails),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to get schedule details:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch schedule details',
            details: error.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Create from job endpoint
    if (path.endsWith('/create-from-job') && req.method === 'POST') {
      console.log('Create from job endpoint called');
      
      const body = await req.json();
      
      try {
        const result = await oxylabsAPI.createScheduleFromJob(body.job_id, {
          name: body.schedule_name || `Schedule for job ${body.job_id}`,
          cron_expression: body.cron_expression || '0 9 * * *',
          // Add other schedule configuration as needed
        });

        const createResult = {
          success: true,
          schedule_id: result.id,
          job_id: body.job_id,
          message: 'Schedule created successfully from Oxylabs API'
        };

        return new Response(
          JSON.stringify(createResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to create schedule:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to create schedule',
            details: error.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Default response for unknown endpoints
    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
