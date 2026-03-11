-- Barangay Demographics Table for Household and Population Data
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.regional_demographics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code text NOT NULL,
  municipality_code text NOT NULL,
  barangay_code text NOT NULL,
  barangay_name text NOT NULL,
  households int DEFAULT 0,
  population int DEFAULT 0,
  period_type text NOT NULL DEFAULT 'yearly',
  report_year int NOT NULL DEFAULT EXTRACT(YEAR FROM NOW())::int,
  report_quarter int NOT NULL DEFAULT 0,
  report_month int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, barangay_code, period_type, report_year, report_quarter, report_month)
);

ALTER TABLE public.regional_demographics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own demographics data" ON public.regional_demographics
  FOR ALL USING (auth.uid() = user_id);
