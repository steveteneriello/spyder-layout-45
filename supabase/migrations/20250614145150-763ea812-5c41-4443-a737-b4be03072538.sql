
-- First, let's check what data already exists
SELECT 'Categories count: ' || COUNT(*) FROM campaign_manager_categories;
SELECT 'Advertisers count: ' || COUNT(*) FROM admin_advertisers;
SELECT 'Markets count: ' || COUNT(*) FROM admin_markets;
SELECT 'Campaigns count: ' || COUNT(*) FROM campaign_manager_campaigns;

-- Let's see what markets exist
SELECT id, market FROM admin_markets;

-- Insert only non-existing data
-- Categories
INSERT INTO campaign_manager_categories (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440001', 'E-commerce', 'Online retail and shopping campaigns'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_categories WHERE id = '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO campaign_manager_categories (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440002', 'Healthcare', 'Medical and health services campaigns'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_categories WHERE id = '550e8400-e29b-41d4-a716-446655440002');

INSERT INTO campaign_manager_categories (id, name, description) 
SELECT '550e8400-e29b-41d4-a716-446655440003', 'Technology', 'Tech products and services campaigns'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_categories WHERE id = '550e8400-e29b-41d4-a716-446655440003');

-- Advertisers
INSERT INTO admin_advertisers (id, advertiser_name) 
SELECT '550e8400-e29b-41d4-a716-446655440011', 'TechCorp Solutions'
WHERE NOT EXISTS (SELECT 1 FROM admin_advertisers WHERE id = '550e8400-e29b-41d4-a716-446655440011');

INSERT INTO admin_advertisers (id, advertiser_name) 
SELECT '550e8400-e29b-41d4-a716-446655440012', 'HealthPlus Medical'
WHERE NOT EXISTS (SELECT 1 FROM admin_advertisers WHERE id = '550e8400-e29b-41d4-a716-446655440012');

INSERT INTO admin_advertisers (id, advertiser_name) 
SELECT '550e8400-e29b-41d4-a716-446655440013', 'ShopSmart Retail'
WHERE NOT EXISTS (SELECT 1 FROM admin_advertisers WHERE id = '550e8400-e29b-41d4-a716-446655440013');

-- Markets (using different IDs to avoid conflicts)
INSERT INTO admin_markets (market) 
SELECT 'United States'
WHERE NOT EXISTS (SELECT 1 FROM admin_markets WHERE market = 'United States');

INSERT INTO admin_markets (market) 
SELECT 'Canada'
WHERE NOT EXISTS (SELECT 1 FROM admin_markets WHERE market = 'Canada');

INSERT INTO admin_markets (market) 
SELECT 'United Kingdom'
WHERE NOT EXISTS (SELECT 1 FROM admin_markets WHERE market = 'United Kingdom');

-- Get the actual market IDs for campaigns
-- We'll use the existing market ID for United States
INSERT INTO campaign_manager_campaigns (
  id, name, description, category_id, campaign_type, advertiser_id, market_id, budget, start_date, end_date, status
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440021',
  'Summer Sale Campaign',
  'Promoting summer products with special discounts',
  '550e8400-e29b-41d4-a716-446655440001',
  'advertiser',
  '550e8400-e29b-41d4-a716-446655440013',
  NULL,
  50000.00,
  '2024-06-01',
  '2024-08-31',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaigns WHERE id = '550e8400-e29b-41d4-a716-446655440021');

INSERT INTO campaign_manager_campaigns (
  id, name, description, category_id, campaign_type, advertiser_id, market_id, budget, start_date, end_date, status
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440022',
  'Tech Product Launch',
  'Launch campaign for new AI-powered software',
  '550e8400-e29b-41d4-a716-446655440003',
  'advertiser',
  '550e8400-e29b-41d4-a716-446655440011',
  NULL,
  75000.00,
  '2024-07-15',
  '2024-10-15',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaigns WHERE id = '550e8400-e29b-41d4-a716-446655440022');

INSERT INTO campaign_manager_campaigns (
  id, name, description, category_id, campaign_type, advertiser_id, market_id, budget, start_date, end_date, status
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440023',
  'Healthcare Awareness',
  'Public health awareness campaign for preventive care',
  '550e8400-e29b-41d4-a716-446655440002',
  'market',
  NULL,
  1,  -- Using existing market ID
  25000.00,
  '2024-05-01',
  '2024-12-31',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaigns WHERE id = '550e8400-e29b-41d4-a716-446655440023');

INSERT INTO campaign_manager_campaigns (
  id, name, description, category_id, campaign_type, advertiser_id, market_id, budget, start_date, end_date, status
) 
SELECT 
  '550e8400-e29b-41d4-a716-446655440024',
  'Holiday Shopping Campaign',
  'Black Friday and Cyber Monday promotional campaign',
  '550e8400-e29b-41d4-a716-446655440001',
  'advertiser',
  '550e8400-e29b-41d4-a716-446655440013',
  NULL,
  100000.00,
  '2024-11-01',
  '2024-12-15',
  'draft'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaigns WHERE id = '550e8400-e29b-41d4-a716-446655440024');

-- Campaign statuses
INSERT INTO campaign_manager_campaign_status (campaign_id, active) 
SELECT '550e8400-e29b-41d4-a716-446655440021', true
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaign_status WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440021');

INSERT INTO campaign_manager_campaign_status (campaign_id, active) 
SELECT '550e8400-e29b-41d4-a716-446655440022', true
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaign_status WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440022');

INSERT INTO campaign_manager_campaign_status (campaign_id, active) 
SELECT '550e8400-e29b-41d4-a716-446655440023', false
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaign_status WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440023');

INSERT INTO campaign_manager_campaign_status (campaign_id, active) 
SELECT '550e8400-e29b-41d4-a716-446655440024', false
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_campaign_status WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440024');

-- Keywords
INSERT INTO campaign_manager_keywords (campaign_id, keyword, match_type) 
SELECT '550e8400-e29b-41d4-a716-446655440021', 'summer sale', 'broad'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_keywords WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440021' AND keyword = 'summer sale');

INSERT INTO campaign_manager_keywords (campaign_id, keyword, match_type) 
SELECT '550e8400-e29b-41d4-a716-446655440021', 'discount clothing', 'phrase'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_keywords WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440021' AND keyword = 'discount clothing');

INSERT INTO campaign_manager_keywords (campaign_id, keyword, match_type) 
SELECT '550e8400-e29b-41d4-a716-446655440022', 'AI software', 'broad'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_keywords WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440022' AND keyword = 'AI software');

-- Negative keywords
INSERT INTO campaign_manager_negative_keywords (campaign_id, keyword, match_type) 
SELECT '550e8400-e29b-41d4-a716-446655440021', 'free', 'broad'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_negative_keywords WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440021' AND keyword = 'free');

INSERT INTO campaign_manager_negative_keywords (campaign_id, keyword, match_type) 
SELECT '550e8400-e29b-41d4-a716-446655440022', 'pirated', 'broad'
WHERE NOT EXISTS (SELECT 1 FROM campaign_manager_negative_keywords WHERE campaign_id = '550e8400-e29b-41d4-a716-446655440022' AND keyword = 'pirated');
