-- Run this script in your Supabase SQL Editor to enable date tracking

ALTER TABLE market_potential ADD COLUMN IF NOT EXISTS record_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Optional: To ensure there's a unique constraint for upserts
-- ALTER TABLE market_potential ADD CONSTRAINT market_uniq_crop_cat_date UNIQUE (crop_name, category, record_date);
