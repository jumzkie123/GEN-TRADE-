-- Migration: Add period tracking to production area and volume tables
-- Run this in your Supabase SQL Editor

-- 1. Add period columns to regional_production_areas
ALTER TABLE regional_production_areas
  ADD COLUMN IF NOT EXISTS period_type text NOT NULL DEFAULT 'yearly',
  ADD COLUMN IF NOT EXISTS report_year int NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::int,
  ADD COLUMN IF NOT EXISTS report_quarter int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_month int NOT NULL DEFAULT 0;

-- 2. Add period columns to regional_volume_production
ALTER TABLE regional_volume_production
  ADD COLUMN IF NOT EXISTS period_type text NOT NULL DEFAULT 'yearly',
  ADD COLUMN IF NOT EXISTS report_year int NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::int,
  ADD COLUMN IF NOT EXISTS report_quarter int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_month int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS land_area_ha numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS agri_land_area_ha numeric DEFAULT 0;

-- 3. Drop old single-barangay unique constraints and add period-aware ones
ALTER TABLE regional_production_areas
  DROP CONSTRAINT IF EXISTS regional_production_areas_user_id_barangay_code_key;

ALTER TABLE regional_production_areas
  ADD CONSTRAINT regional_production_areas_period_unique
  UNIQUE (user_id, barangay_code, period_type, report_year, report_quarter, report_month);

ALTER TABLE regional_volume_production
  DROP CONSTRAINT IF EXISTS regional_volume_production_user_id_barangay_code_key;

ALTER TABLE regional_volume_production
  ADD CONSTRAINT regional_volume_production_period_unique
  UNIQUE (user_id, barangay_code, period_type, report_year, report_quarter, report_month);
