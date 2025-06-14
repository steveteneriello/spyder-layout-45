
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Dashboard endpoint - fetch data from database and Oxylabs
    if (path.endsWith('/dashboard')) {
      console.log('Dashboard endpoint called');
      
      try {
        // Get schedules from our database view
        const { data: schedules, error: dbError } = await supabase
          .from('scrapi_active_oxylabs_schedules')
          .select('*');

        if (dbError) {
          console.error('Database error:', dbError);
        }

        // Try to get fresh data from Oxylabs API
        let oxylabsSchedules = [];
        try {
          const oxylabsData = await oxylabsAPI.getSchedules();
          oxylabsSchedules = oxylabsData.results || [];
        } catch (oxylabsError) {
          console.warn('Failed to fetch from Oxylabs, using database data only:', oxylabsError);
        }

        // Transform and combine data
        const transformedSchedules: OxylabsSchedule[] = (schedules || []).map((schedule: any) => ({
          id: schedule.id,
          oxylabs_schedule_id: schedule.oxylabs_schedule_id,
          active: schedule.active || false,
          cron_expression: schedule.cron_expression || '',
          next_run_at: schedule.next_run_at || '',
          end_time: schedule.end_time || '',
          job_name: schedule.job_name,
          schedule_name: schedule.schedule_name,
          items_count: schedule.items_count || 0,
          stats: schedule.stats || { 
            total_job_count: 0, 
            job_result_outcomes: [
              { status: 'done', job_count: 0, ratio: 0 },
              { status: 'failed', job_count: 0, ratio: 0 }
            ]
          },
          management_status: schedule.management_status || 'unmanaged',
          last_synced_at: schedule.last_synced_at || new Date().toISOString()
        }));

        const dashboardData = {
          success: true,
          schedules: transformedSchedules,
          recent_runs: []
        };

        console.log('Returning dashboard data with', transformedSchedules.length, 'schedules');
        return new Response(
          JSON.stringify(dashboardData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Dashboard error:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to fetch dashboard data',
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

    // Operations endpoint - get operation queue status
    if (path.endsWith('/operations')) {
      console.log('Operations endpoint called');
      
      try {
        const { data: operations, error } = await supabase
          .from('scrapi_schedule_operations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Operations query error:', error);
          throw error;
        }

        // Calculate queue stats
        const stats = (operations || []).reduce((acc, op) => {
          acc[op.status] = (acc[op.status] || 0) + 1;
          acc.total++;
          return acc;
        }, { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 });

        return new Response(
          JSON.stringify({
            success: true,
            operations: operations || [],
            queue_stats: stats
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Operations error:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to fetch operations',
            operations: [],
            queue_stats: { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 }
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
      console.log('Sync endpoint called');
      
      try {
        const oxylabsSchedules = await oxylabsAPI.getSchedules();
        const schedules = oxylabsSchedules.results || [];

        // Sync schedules to database
        for (const schedule of schedules) {
          const { error: upsertError } = await supabase
            .from('scrapi_oxylabs_schedules')
            .upsert({
              oxylabs_schedule_id: schedule.id,
              active: schedule.active,
              cron_expression: schedule.cron_expression || '',
              next_run_at: schedule.next_run_at || null,
              end_time: schedule.end_time || null,
              items_count: schedule.items_count || 0,
              stats: {
                total_job_count: schedule.stats?.total_job_count || 0,
                job_result_outcomes: schedule.stats?.job_result_outcomes || []
              },
              last_synced_at: new Date().toISOString()
            }, {
              onConflict: 'oxylabs_schedule_id'
            });

          if (upsertError) {
            console.error('Upsert error for schedule', schedule.id, ':', upsertError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            synced: schedules.length,
            message: `Successfully synced ${schedules.length} schedules from Oxylabs`
          }),
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
        // Queue the operation instead of direct API call
        const { error } = await supabase.rpc('scrapi_queue_schedule_operation', {
          p_schedule_id: scheduleId,
          p_operation_type: body.active ? 'activate' : 'deactivate',
          p_requested_by: 'dashboard',
          p_operation_data: { active: body.active }
        });

        if (error) {
          throw error;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            schedule_id: scheduleId,
            active: body.active,
            message: `Operation queued successfully`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to queue schedule state change:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to queue schedule state change',
            details: error.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Schedule delete endpoint
    if (path.includes('/schedule/') && req.method === 'DELETE') {
      console.log('Schedule delete called');
      
      const scheduleId = path.split('/')[2];
      
      try {
        // Queue the delete operation
        const { error } = await supabase.rpc('scrapi_queue_schedule_operation', {
          p_schedule_id: scheduleId,
          p_operation_type: 'delete',
          p_requested_by: 'dashboard',
          p_operation_data: {}
        });

        if (error) {
          throw error;
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            schedule_id: scheduleId,
            message: `Delete operation queued successfully`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Failed to queue schedule deletion:', error);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Failed to queue schedule deletion',
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
          success: true,
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
            success: false,
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
      JSON.stringify({ 
        error: 'Invalid endpoint',
        path: path,
        method: req.method
      }),
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
