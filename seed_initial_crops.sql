
-- Final Seed
DELETE FROM crops;
INSERT INTO crops (name, category, stock, unit, territory, min_stock, max_stock) VALUES
('Rice', 'Grain', 0, 'kg', 'Stock', 1000, 10000),
('Corn', 'Grain', 0, 'kg', 'Stock', 1000, 10000),
('Sugarcane', 'Grain', 0, 'kg', 'Stock', 1000, 10000),
('Veg', 'Vegetables', 0, 'kg', 'Stock', 500, 5000),
('Mango (#Bearing Trees)', 'Fruit', 0, 'units', 'Stock', 100, 5000),
('Other Crops', 'Others', 0, 'kg', 'Stock', 500, 10000);
