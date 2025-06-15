
-- First create the location_lists table
CREATE TABLE public.location_lists (
  id uuid not null default gen_random_uuid(),
  name text not null,
  description text null,
  created_by uuid null,
  center_city text not null,
  center_latitude double precision not null,
  center_longitude double precision not null,
  radius_miles integer not null,
  filters jsonb null default '{}'::jsonb,
  location_count integer null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  last_accessed_at timestamp with time zone null default now(),
  constraint location_lists_pkey primary key (id),
  constraint location_lists_created_by_fkey foreign key (created_by) references auth.users (id)
);

-- Create the location_list_items table
CREATE TABLE public.location_list_items (
  id uuid not null default gen_random_uuid(),
  list_id uuid null,
  location_data_id uuid not null,
  city text not null,
  state_name text not null,
  county_name text null,
  postal_code text null,
  latitude double precision null,
  longitude double precision null,
  distance_miles double precision null,
  created_at timestamp with time zone not null default now(),
  country text not null,
  constraint location_list_items_pkey primary key (id),
  constraint location_list_items_list_id_fkey foreign key (list_id) references location_lists (id) on delete cascade
);

-- Create function to update location list count
CREATE OR REPLACE FUNCTION update_location_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE location_lists 
    SET location_count = location_count + 1,
        updated_at = now()
    WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE location_lists 
    SET location_count = location_count - 1,
        updated_at = now()
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update last accessed timestamp
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_list_count_trigger
  AFTER INSERT OR DELETE ON location_list_items
  FOR EACH ROW EXECUTE FUNCTION update_location_list_count();

CREATE TRIGGER update_last_accessed_trigger
  BEFORE UPDATE ON location_lists
  FOR EACH ROW EXECUTE FUNCTION update_last_accessed();

-- Enable RLS on both tables
ALTER TABLE location_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_list_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for location_lists
CREATE POLICY "Users can view their own location lists" 
  ON location_lists FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own location lists" 
  ON location_lists FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own location lists" 
  ON location_lists FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own location lists" 
  ON location_lists FOR DELETE 
  USING (auth.uid() = created_by);

-- Create RLS policies for location_list_items
CREATE POLICY "Users can view items from their own location lists" 
  ON location_list_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM location_lists 
    WHERE location_lists.id = location_list_items.list_id 
    AND location_lists.created_by = auth.uid()
  ));

CREATE POLICY "Users can create items in their own location lists" 
  ON location_list_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM location_lists 
    WHERE location_lists.id = location_list_items.list_id 
    AND location_lists.created_by = auth.uid()
  ));

CREATE POLICY "Users can update items in their own location lists" 
  ON location_list_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM location_lists 
    WHERE location_lists.id = location_list_items.list_id 
    AND location_lists.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete items from their own location lists" 
  ON location_list_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM location_lists 
    WHERE location_lists.id = location_list_items.list_id 
    AND location_lists.created_by = auth.uid()
  ));
