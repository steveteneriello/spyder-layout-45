
-- Add missing foreign key relationships and ensure proper indexes
ALTER TABLE campaign_manager_campaigns 
ADD CONSTRAINT fk_campaigns_category 
FOREIGN KEY (category_id) REFERENCES campaign_manager_categories(id);

ALTER TABLE campaign_manager_keywords 
ADD CONSTRAINT fk_keywords_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaign_manager_campaigns(id);

ALTER TABLE campaign_manager_negative_keywords 
ADD CONSTRAINT fk_negative_keywords_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaign_manager_campaigns(id);

ALTER TABLE campaign_manager_keyword_stats 
ADD CONSTRAINT fk_keyword_stats_keyword 
FOREIGN KEY (keyword_id) REFERENCES campaign_manager_keywords(id);

ALTER TABLE campaign_manager_campaign_status 
ADD CONSTRAINT fk_campaign_status_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaign_manager_campaigns(id);

-- Add advertiser_id to campaigns table to link campaigns to advertisers
ALTER TABLE campaign_manager_campaigns 
ADD COLUMN advertiser_id uuid REFERENCES admin_advertisers(id);

-- Add market_id to campaigns table to link campaigns to markets
ALTER TABLE campaign_manager_campaigns 
ADD COLUMN market_id bigint REFERENCES admin_markets(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaign_manager_campaigns(category_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON campaign_manager_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_market ON campaign_manager_campaigns(market_id);
CREATE INDEX IF NOT EXISTS idx_keywords_campaign ON campaign_manager_keywords(campaign_id);
CREATE INDEX IF NOT EXISTS idx_negative_keywords_campaign ON campaign_manager_negative_keywords(campaign_id);
CREATE INDEX IF NOT EXISTS idx_keyword_stats_keyword ON campaign_manager_keyword_stats(keyword_id);
CREATE INDEX IF NOT EXISTS idx_campaign_status_campaign ON campaign_manager_campaign_status(campaign_id);

-- Add campaign_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE campaign_type_enum AS ENUM ('advertiser', 'market');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add campaign_type column to campaigns
ALTER TABLE campaign_manager_campaigns 
ADD COLUMN campaign_type campaign_type_enum DEFAULT 'market';
