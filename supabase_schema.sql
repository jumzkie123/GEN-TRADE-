-- ============================================
-- GEN. TRADE TERRITORY - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Create crops table
CREATE TABLE IF NOT EXISTS crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Grain',
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  territory TEXT NOT NULL DEFAULT '',
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create market_potential table
CREATE TABLE IF NOT EXISTS market_potential (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  category TEXT NOT NULL,
  volume NUMERIC DEFAULT 0,
  value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_potential ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anon key)
CREATE POLICY "Allow all for crops" ON crops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for market_potential" ON market_potential FOR ALL USING (true) WITH CHECK (true);

-- Insert seed data for crops
INSERT INTO crops (name, category, stock, unit, territory, min_stock, max_stock) VALUES
  ('Rice', 'Grain', 2500, 'kg', 'North', 1000, 5000),
  ('Corn', 'Grain', 1800, 'kg', 'South', 1500, 4000),
  ('Mango', 'Fruit', 4500, 'units', 'East', 500, 8000),
  ('Vegetables', 'Veg', 680, 'kg', 'West', 400, 1200);

-- Insert seed data for market_potential
INSERT INTO market_potential (crop_name, category, volume, value) VALUES
  ('Rice', 'Herbicide', 0, 0),
  ('Rice', 'Insecticide', 0, 0),
  ('Rice', 'Molluscicide', 0, 0),
  ('Rice', 'Fungicide', 0, 0),
  ('Rice', 'Others', 0, 0),
  ('Corn', 'Herbicide', 0, 0),
  ('Corn', 'Insecticide', 0, 0),
  ('Corn', 'Molluscicide', 0, 0),
  ('Corn', 'Fungicide', 0, 0),
  ('Corn', 'Others', 0, 0),
  ('Veg', 'Herbicide', 0, 0),
  ('Veg', 'Insecticide', 0, 0),
  ('Veg', 'Molluscicide', 0, 0),
  ('Veg', 'Fungicide', 0, 0),
  ('Veg', 'Others', 0, 0),
  ('Mango (# of Bearing Trees)', 'Herbicide', 0, 0),
  ('Mango (# of Bearing Trees)', 'Insecticide', 0, 0),
  ('Mango (# of Bearing Trees)', 'Molluscicide', 0, 0),
  ('Mango (# of Bearing Trees)', 'Fungicide', 0, 0),
  ('Mango (# of Bearing Trees)', 'Others', 0, 0),
  ('Other Crops', 'Herbicide', 0, 0),
  ('Other Crops', 'Insecticide', 0, 0),
  ('Other Crops', 'Molluscicide', 0, 0),
  ('Other Crops', 'Fungicide', 0, 0),
  ('Other Crops', 'Others', 0, 0);
