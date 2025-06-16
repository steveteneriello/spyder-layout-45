
-- Create composite indexes to optimize county location searches
-- Index for lat/lng bounding box queries (most common search pattern)
CREATE INDEX IF NOT EXISTS idx_location_data_lat_lng_bounds 
ON location_data (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND county_name IS NOT NULL;

-- Index for state filtering combined with coordinates
CREATE INDEX IF NOT EXISTS idx_location_data_state_coordinates 
ON location_data (state_name, latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND county_name IS NOT NULL;

-- Index for timezone filtering combined with coordinates
CREATE INDEX IF NOT EXISTS idx_location_data_timezone_coordinates 
ON location_data (timezone, latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND county_name IS NOT NULL;

-- Composite index for combined state and timezone filtering with coordinates
CREATE INDEX IF NOT EXISTS idx_location_data_state_timezone_coordinates 
ON location_data (state_name, timezone, latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND county_name IS NOT NULL;

-- Index specifically for county-level data (since we group by county)
CREATE INDEX IF NOT EXISTS idx_location_data_county_state_coords 
ON location_data (county_name, state_name, latitude, longitude) 
WHERE county_name IS NOT NULL AND state_name IS NOT NULL;
