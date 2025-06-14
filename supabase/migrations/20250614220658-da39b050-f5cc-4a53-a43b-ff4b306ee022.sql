
-- Drop the existing views first
DROP VIEW IF EXISTS scrapi_active_oxylabs_schedules;
DROP VIEW IF EXISTS scrapi_oxylabs_schedule_overview;

-- Add deleted_at column to track deleted schedules
ALTER TABLE scrapi_oxylabs_schedules 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create index for filtering non-deleted schedules
CREATE INDEX IF NOT EXISTS idx_scrapi_oxylabs_schedules_deleted 
ON scrapi_oxylabs_schedules(deleted_at) 
WHERE deleted_at IS NULL;

-- Recreate the view with all necessary columns including created_at
CREATE VIEW scrapi_oxylabs_schedule_overview AS
SELECT 
    os.id,
    os.oxylabs_schedule_id,
    os.job_id,
    os.schedule_id,
    os.active,
    os.items_count,
    os.cron_expression,
    os.end_time,
    os.next_run_at,
    os.stats,
    os.created_at,
    os.last_synced_at,
    os.deleted_at,
    j.name as job_name,
    s.schedule_name,
    os.stats->>'total_job_count' as total_jobs,
    (os.stats->'job_result_outcomes'->0->>'ratio')::float as success_rate,
    CASE 
        WHEN os.deleted_at IS NOT NULL THEN 'deleted'
        WHEN os.job_id IS NULL THEN 'unmanaged'
        ELSE 'managed'
    END as management_status
FROM scrapi_oxylabs_schedules os
LEFT JOIN scrapi_jobs j ON os.job_id = j.id
LEFT JOIN scrapi_job_schedules s ON os.schedule_id = s.id;

-- Create a filtered view that only shows active schedules (for dashboard)
CREATE VIEW scrapi_active_oxylabs_schedules AS
SELECT * FROM scrapi_oxylabs_schedule_overview
WHERE deleted_at IS NULL;
