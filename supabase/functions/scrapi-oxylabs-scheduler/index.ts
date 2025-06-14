
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Request received: ${req.method} ${path}`);

    // Health check endpoint
    if (path.endsWith('/health')) {
      console.log('Health check called');
      return new Response(
        JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          message: 'Oxylabs Scheduler API is running'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Dashboard endpoint - returns mock data for now
    if (path.endsWith('/dashboard')) {
      console.log('Dashboard endpoint called');
      
      // Mock data for demonstration
      const mockSchedules: OxylabsSchedule[] = [
        {
          id: 'mock-1',
          oxylabs_schedule_id: 'oxylabs_123',
          active: true,
          cron_expression: '0 9 * * *',
          next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_name: 'Daily Product Scraping',
          schedule_name: 'Product Schedule',
          items_count: 1000,
          stats: {
            total_job_count: 50,
            job_result_outcomes: [
              { status: 'done', job_count: 45, ratio: 0.9 },
              { status: 'failed', job_count: 5, ratio: 0.1 }
            ]
          },
          management_status: 'managed',
          last_synced_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          oxylabs_schedule_id: 'oxylabs_456',
          active: false,
          cron_expression: '0 12 * * 1',
          next_run_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          job_name: 'Weekly Competitor Analysis',
          schedule_name: 'Competitor Schedule',
          items_count: 500,
          stats: {
            total_job_count: 12,
            job_result_outcomes: [
              { status: 'done', job_count: 10, ratio: 0.83 },
              { status: 'failed', job_count: 2, ratio: 0.17 }
            ]
          },
          management_status: 'unmanaged',
          last_synced_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const dashboardData = {
        schedules: mockSchedules,
        recent_runs: [
          { run_id: 1, success_rate: 0.9, jobs: [], created_at: new Date().toISOString() },
          { run_id: 2, success_rate: 0.85, jobs: [], created_at: new Date().toISOString() }
        ]
      };

      return new Response(
        JSON.stringify(dashboardData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sync endpoint
    if (path.endsWith('/sync')) {
      console.log('Sync endpoint called');
      
      // Mock sync response
      const syncResult = {
        success: true,
        synced: 2,
        message: 'Mock sync completed successfully'
      };

      return new Response(
        JSON.stringify(syncResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map unmanaged endpoint
    if (path.endsWith('/map-unmanaged')) {
      console.log('Map unmanaged endpoint called');
      
      const mapResult = {
        success: true,
        mappings: [
          { schedule_id: 'oxylabs_456', success: true }
        ]
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
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          schedule_id: scheduleId,
          active: body.active 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get schedule details endpoint
    if (path.includes('/schedule/') && req.method === 'GET') {
      console.log('Get schedule details called');
      
      const scheduleId = path.split('/')[2];
      
      const scheduleDetails = {
        id: scheduleId,
        details: 'Mock schedule details',
        runs: []
      };

      return new Response(
        JSON.stringify(scheduleDetails),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create from job endpoint
    if (path.endsWith('/create-from-job') && req.method === 'POST') {
      console.log('Create from job endpoint called');
      
      const body = await req.json();
      
      const createResult = {
        success: true,
        schedule_id: `oxylabs_${Date.now()}`,
        job_id: body.job_id,
        message: 'Mock schedule created successfully'
      };

      return new Response(
        JSON.stringify(createResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
