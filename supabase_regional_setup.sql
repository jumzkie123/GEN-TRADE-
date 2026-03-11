-- REGIONAL PARTNER SYSTEM - Full SQL Setup
-- Run this in your Supabase SQL Editor

-- =====================
-- 1. PRODUCTS TABLE (dynamic crop/product list)
-- =====================
CREATE TABLE IF NOT EXISTS public.regional_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.regional_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own products" ON public.regional_products
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- 2. FARMERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.regional_farmers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  municipality_code text NOT NULL,
  barangay_code text NOT NULL,
  barangay_name text NOT NULL,
  rsbsa_no text,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  crops text[] DEFAULT '{}',   -- array of product names
  land_area numeric DEFAULT 0,
  agricultural_land_area numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.regional_farmers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own farmers" ON public.regional_farmers
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- 3. PRODUCTION AREA TABLE (per barangay + commodity)
-- =====================
CREATE TABLE IF NOT EXISTS public.regional_production_areas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code text NOT NULL,
  municipality_code text NOT NULL,
  barangay_code text NOT NULL,
  barangay_name text NOT NULL,
  land_area_ha numeric DEFAULT 0,
  land_area_ha_farmers numeric DEFAULT 0,
  agri_land_area_ha numeric DEFAULT 0,
  agri_land_area_ha_farmers numeric DEFAULT 0,
  crop_data jsonb DEFAULT '{}'::jsonb,  -- dynamic: { "Coconut": 5.5, "Rice": 2.0, ... }
  total_ha numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, barangay_code)
);

ALTER TABLE public.regional_production_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own production data" ON public.regional_production_areas
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- 4. VOLUME OF PRODUCTION TABLE (per barangay + commodity, in metric tons)
-- =====================
CREATE TABLE IF NOT EXISTS public.regional_volume_production (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code text NOT NULL,
  municipality_code text NOT NULL,
  barangay_code text NOT NULL,
  barangay_name text NOT NULL,
  crop_data jsonb DEFAULT '{}'::jsonb,  -- dynamic: { "Coconut": 391.12, ... }
  total_mt numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, barangay_code)
);

ALTER TABLE public.regional_volume_production ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own volume data" ON public.regional_volume_production
  FOR ALL USING (auth.uid() = user_id);
