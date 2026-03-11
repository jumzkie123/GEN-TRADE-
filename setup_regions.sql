CREATE TABLE regional_production_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  region_code TEXT,
  municipality_code TEXT,
  barangay_name TEXT,
  land_area_ha NUMERIC(10,2),
  land_area_ha_farmers NUMERIC(10,2),
  agricultural_land_area_ha NUMERIC(10,2),
  agricultural_land_area_ha_farmers NUMERIC(10,2),
  coconut_ha NUMERIC(10,2),
  rice_ha NUMERIC(10,2),
  corn_ha NUMERIC(10,2),
  rubber_ha NUMERIC(10,2),
  coffee_ha NUMERIC(10,2),
  cacao_ha NUMERIC(10,2),
  banana_ha NUMERIC(10,2),
  mango_ha NUMERIC(10,2),
  calamansi_ha NUMERIC(10,2),
  lansones_ha NUMERIC(10,2),
  durian_ha NUMERIC(10,2),
  rambutan_ha NUMERIC(10,2),
  mangosteen_ha NUMERIC(10,2),
  dragon_fruit_ha NUMERIC(10,2),
  cassava_ha NUMERIC(10,2),
  camote_ha NUMERIC(10,2),
  singkamas NUMERIC(10,2),
  ubi_ha NUMERIC(10,2),
  eggplant_ha NUMERIC(10,2),
  ampalaya_ha NUMERIC(10,2),
  okra_ha NUMERIC(10,2),
  stringbean_ha NUMERIC(10,2),
  squash_ha NUMERIC(10,2),
  mongo_ha NUMERIC(10,2),
  soybeans_ha NUMERIC(10,2),
  hot_pepper_ha NUMERIC(10,2),
  sweet_pepper_ha NUMERIC(10,2),
  ginger_ha NUMERIC(10,2),
  tomato_ha NUMERIC(10,2),
  falcata_ha NUMERIC(10,2),
  total NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE regional_production_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own regional data"
  ON regional_production_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own regional data"
  ON regional_production_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own regional data"
  ON regional_production_areas FOR UPDATE
  USING (auth.uid() = user_id);
