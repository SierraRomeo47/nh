-- Populate Fleet Management System and Distribute Vessels
-- Uses existing fleets and fleet_vessels tables

-- Insert fleets based on vessel types and trade routes
INSERT INTO fleets (name, description) VALUES
  ('LNG Fleet', 'Liquefied Natural Gas carriers for global LNG trade - Middle East to Asia/Europe')
ON CONFLICT DO NOTHING;

INSERT INTO fleets (name, description) VALUES
  ('Crude Oil Fleet', 'VLCCs, Suezmax, and Aframax tankers for crude oil transport - Persian Gulf to Asia/Europe')
ON CONFLICT DO NOTHING;

INSERT INTO fleets (name, description) VALUES
  ('Product Tanker Fleet', 'Clean product tankers for refined petroleum products - Singapore to Australia/Japan')
ON CONFLICT DO NOTHING;

INSERT INTO fleets (name, description) VALUES
  ('Dry Bulk Fleet', 'Bulk carriers for iron ore, coal, and grain - Australia/Brazil to Asia')
ON CONFLICT DO NOTHING;

INSERT INTO fleets (name, description) VALUES
  ('Container Fleet', 'Container ships for global liner services - Asia to Europe/Americas')
ON CONFLICT DO NOTHING;

-- Distribute vessels to LNG Fleet
INSERT INTO fleet_vessels (fleet_id, ship_id)
SELECT 
  (SELECT id FROM fleets WHERE name = 'LNG Fleet' LIMIT 1),
  s.id
FROM ships s
WHERE s.ship_type LIKE '%LNG%'
ON CONFLICT (fleet_id, ship_id) DO NOTHING;

-- Distribute vessels to Crude Oil Fleet
INSERT INTO fleet_vessels (fleet_id, ship_id)
SELECT 
  (SELECT id FROM fleets WHERE name = 'Crude Oil Fleet' LIMIT 1),
  s.id
FROM ships s
WHERE s.ship_type IN ('VLCC', 'TANKER_CRUDE') 
   OR s.ship_type LIKE '%Suezmax%'
   OR s.ship_type LIKE '%Aframax%'
ON CONFLICT (fleet_id, ship_id) DO NOTHING;

-- Distribute vessels to Product Tanker Fleet
INSERT INTO fleet_vessels (fleet_id, ship_id)
SELECT 
  (SELECT id FROM fleets WHERE name = 'Product Tanker Fleet' LIMIT 1),
  s.id
FROM ships s
WHERE s.ship_type IN ('TANKER_PRODUCT', 'MR Tanker')
   OR s.ship_type LIKE '%Chemical%'
   OR s.ship_type LIKE '%Product%'
ON CONFLICT (fleet_id, ship_id) DO NOTHING;

-- Distribute vessels to Dry Bulk Fleet
INSERT INTO fleet_vessels (fleet_id, ship_id)
SELECT 
  (SELECT id FROM fleets WHERE name = 'Dry Bulk Fleet' LIMIT 1),
  s.id
FROM ships s
WHERE s.ship_type LIKE '%BULK%'
   OR s.ship_type LIKE '%Bulk%'
ON CONFLICT (fleet_id, ship_id) DO NOTHING;

-- Distribute vessels to Container Fleet
INSERT INTO fleet_vessels (fleet_id, ship_id)
SELECT 
  (SELECT id FROM fleets WHERE name = 'Container Fleet' LIMIT 1),
  s.id
FROM ships s
WHERE s.ship_type LIKE '%Container%'
ON CONFLICT (fleet_id, ship_id) DO NOTHING;

-- Summary of fleet distribution
SELECT 
  f.name as fleet_name,
  f.description,
  COUNT(fv.ship_id) as vessel_count,
  ROUND(SUM(s.deadweight_tonnage)::NUMERIC / 1000, 0) as total_dwt_thousands,
  STRING_AGG(DISTINCT s.ship_type, ', ' ORDER BY s.ship_type) as vessel_types
FROM fleets f
LEFT JOIN fleet_vessels fv ON f.id = fv.fleet_id
LEFT JOIN ships s ON fv.ship_id = s.id
WHERE f.is_active = true
GROUP BY f.id, f.name, f.description
ORDER BY f.name;

-- List vessels by fleet
SELECT 
  f.name as fleet_name,
  s.name as vessel_name,
  s.imo_number,
  s.ship_type,
  s.deadweight_tonnage,
  CASE 
    WHEN v.id IS NOT NULL THEN 'Active'
    ELSE 'Idle'
  END as status
FROM fleets f
JOIN fleet_vessels fv ON f.id = fv.fleet_id
JOIN ships s ON fv.ship_id = s.id
LEFT JOIN voyages v ON s.id = v.ship_id AND v.status = 'ACTIVE'
ORDER BY f.name, s.imo_number;
