
-- First, enable the trigram extension (required for gin_trgm_ops)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index for ZIP code searches (postal_code column with ILIKE pattern matching)
CREATE INDEX IF NOT EXISTS idx_location_data_postal_code_pattern 
ON location_data USING gin(postal_code gin_trgm_ops);

-- Index for city name searches (city column with ILIKE pattern matching)
CREATE INDEX IF NOT EXISTS idx_location_data_city_pattern 
ON location_data USING gin(city gin_trgm_ops);

-- Index for state name searches (state_name column with ILIKE pattern matching)
CREATE INDEX IF NOT EXISTS idx_location_data_state_name_pattern 
ON location_data USING gin(state_name gin_trgm_ops);

-- Composite index for city + state searches (most common pattern)
CREATE INDEX IF NOT EXISTS idx_location_data_city_state 
ON location_data(city, state_name);

-- Index for population ordering (to speed up the ORDER BY population DESC)
CREATE INDEX IF NOT EXISTS idx_location_data_population 
ON location_data(population DESC NULLS LAST);
