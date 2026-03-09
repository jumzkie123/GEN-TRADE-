-- Run this script in your Supabase SQL Editor to enable dynamic categories

CREATE TABLE IF NOT EXISTS market_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color_class TEXT NOT NULL DEFAULT 'from-gray-500 to-gray-400',
  text_class TEXT NOT NULL DEFAULT 'text-gray-800',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE market_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for market_categories" ON market_categories;
CREATE POLICY "Allow all for market_categories" ON market_categories FOR ALL USING (true) WITH CHECK (true);

-- Insert default categories if they don't exist
INSERT INTO market_categories (name, color_class, text_class) VALUES
  ('Herbicide', 'from-emerald-50 to-emerald-100/50', 'text-emerald-800'),
  ('Insecticide', 'from-sky-50 to-sky-100/50', 'text-sky-800'),
  ('Molluscicide', 'from-violet-50 to-violet-100/50', 'text-violet-800'),
  ('Fungicide', 'from-amber-50 to-amber-100/50', 'text-amber-800'),
  ('Others', 'from-slate-50 to-slate-100/50', 'text-slate-700')
ON CONFLICT (name) DO NOTHING;
