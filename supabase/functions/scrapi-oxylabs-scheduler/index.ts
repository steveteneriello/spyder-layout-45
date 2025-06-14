import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.replace('/functions/v1/scrapi-oxylabs-scheduler', '')

    console.log(`Request received: ${req.method} ${req.url}`)

    // Dashboard endpoint
    if (path === '/dashboard' && req.method === 'GET') {
      console.log('Dashboard endpoint called')
      
      const limit = url.searchParams.get('limit') || '1000'
      const offset = url.searchParams.get('offset') || '0'
      
      const { data: schedules, error } = await supabaseClient
        .from('scrapi_active_oxylabs_schedules')
        .select('*')
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Get total count for pagination
      const { count } = await supabaseClient
        .from('scrapi_active_oxylabs_schedules')
        .select('*', { count: 'exact', head: true })

      console.log(`Returning dashboard data with ${schedules?.length || 0} schedules out of ${count} total`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          schedules: schedules || [],
          total_count: count || 0,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Operations endpoint
    if (path === '/operations' && req.method === 'GET') {
      console.log('Operations endpoint called')
      
      const limit = url.searchParams.get('limit') || '50'
      const status = url.searchParams.get('status')
      
      let query = supabaseClient
        .from('scrapi_operation_monitoring')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(parseInt(limit))

      if (status) {
        query = query.eq('status', status)
      }

      const { data: operations, error } = await query

      if (error) {
        console.error('Operations error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Calculate queue stats
      const { data: statsData } = await supabaseClient
        .from('scrapi_operation_monitoring')
        .select('status')

      const queueStats = {
        pending: statsData?.filter(op => op.status === 'pending').length || 0,
        processing: statsData?.filter(op => op.status === 'processing').length || 0,
        completed: statsData?.filter(op => op.status === 'completed').length || 0,
        failed: statsData?.filter(op => op.status === 'failed').length || 0,
        total: statsData?.length || 0
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          operations: operations || [],
          queue_stats: queueStats
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sync endpoint
    if (path === '/sync' && req.method === 'GET') {
      console.log('Sync endpoint called')

      const { data, error } = await supabaseClient.from('scrapi_active_oxylabs_schedules_sync').insert({}).select().single()

      if (error) {
        console.error('Sync error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Sync triggered', sync_id: data.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map unmanaged endpoint
    if (path === '/map-unmanaged' && req.method === 'GET') {
      console.log('Map unmanaged endpoint called')

      const { data, error } = await supabaseClient.from('scrapi_map_unmanaged_oxylabs_schedules').insert({}).select().single()

      if (error) {
        console.error('Map unmanaged error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Fetch the mappings
      const { data: mappings, error: mappingsError } = await supabaseClient
        .from('scrapi_map_unmanaged_oxylabs_schedules_mappings')
        .select('*')
        .eq('sync_id', data.id);

      if (mappingsError) {
        console.error('Mappings error:', mappingsError)
        return new Response(
          JSON.stringify({ success: false, error: mappingsError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Map unmanaged triggered', sync_id: data.id, mappings: mappings }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Schedule state endpoint
    if (path.startsWith('/schedule/') && path.endsWith('/state') && req.method === 'PUT') {
      const scheduleId = path.split('/')[2]
      console.log(`Schedule state endpoint called for schedule ID: ${scheduleId}`)

      const { active } = await req.json()

      const { data, error } = await supabaseClient
        .from('scrapi_queue_oxylabs_schedule_state_change')
        .insert([{ oxylabs_schedule_id: scheduleId, active }])
        .select()

      if (error) {
        console.error('Schedule state change error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: `Schedule ${scheduleId} state change queued`, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Schedule delete endpoint
    if (path.startsWith('/schedule/') && req.method === 'DELETE') {
      const scheduleId = path.split('/')[2]
      console.log(`Schedule delete endpoint called for schedule ID: ${scheduleId}`)

      const { data, error } = await supabaseClient
        .from('scrapi_queue_oxylabs_schedule_deletion')
        .insert([{ oxylabs_schedule_id: scheduleId }])
        .select()

      if (error) {
        console.error('Schedule deletion error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: `Schedule ${scheduleId} deletion queued`, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
