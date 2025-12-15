-- Consolidate Duplicate Fleets
-- Remove duplicate fleet names and merge vessel assignments

-- Consolidate LNG Fleet duplicates
DO $$
DECLARE
  primary_lng_fleet_id UUID;
  duplicate_lng_fleet_id UUID;
BEGIN
  -- Keep the newer LNG Fleet, remove the old one
  SELECT id INTO primary_lng_fleet_id FROM fleets 
  WHERE name = 'LNG Fleet' 
  AND description LIKE '%Middle East%'
  LIMIT 1;
  
  SELECT id INTO duplicate_lng_fleet_id FROM fleets 
  WHERE name = 'LNG Fleet' 
  AND description LIKE '%Liquefied natural gas carriers%'
  LIMIT 1;
  
  IF duplicate_lng_fleet_id IS NOT NULL AND primary_lng_fleet_id IS NOT NULL THEN
    -- Move vessels from duplicate to primary
    UPDATE fleet_vessels 
    SET fleet_id = primary_lng_fleet_id 
    WHERE fleet_id = duplicate_lng_fleet_id
    ON CONFLICT (fleet_id, ship_id) DO NOTHING;
    
    -- Delete duplicate fleet
    DELETE FROM fleets WHERE id = duplicate_lng_fleet_id;
    
    RAISE NOTICE 'Consolidated LNG Fleet';
  END IF;
END $$;

-- Consolidate Container Fleet duplicates
DO $$
DECLARE
  primary_container_fleet_id UUID;
  duplicate_container_fleet_id UUID;
BEGIN
  -- Keep the newer Container Fleet, remove the old one
  SELECT id INTO primary_container_fleet_id FROM fleets 
  WHERE name = 'Container Fleet' 
  AND description LIKE '%Asia to Europe%'
  LIMIT 1;
  
  SELECT id INTO duplicate_container_fleet_id FROM fleets 
  WHERE name = 'Container Fleet' 
  AND description LIKE '%High-speed%'
  LIMIT 1;
  
  IF duplicate_container_fleet_id IS NOT NULL AND primary_container_fleet_id IS NOT NULL THEN
    -- Move vessels from duplicate to primary
    UPDATE fleet_vessels 
    SET fleet_id = primary_container_fleet_id 
    WHERE fleet_id = duplicate_container_fleet_id
    ON CONFLICT (fleet_id, ship_id) DO NOTHING;
    
    -- Delete duplicate fleet
    DELETE FROM fleets WHERE id = duplicate_container_fleet_id;
    
    RAISE NOTICE 'Consolidated Container Fleet';
  END IF;
END $$;

-- Deactivate old Specialized Fleet if no vessels
UPDATE fleets 
SET is_active = false 
WHERE name = 'Specialized Fleet' 
AND NOT EXISTS (
  SELECT 1 FROM fleet_vessels WHERE fleet_id = fleets.id
);

-- Deactivate old Bulk Carrier Fleet if redundant
UPDATE fleets 
SET is_active = false 
WHERE name = 'Bulk Carrier Fleet' 
AND description = 'Dry bulk cargo transportation'
AND EXISTS (
  SELECT 1 FROM fleets WHERE name = 'Dry Bulk Fleet'
);

-- Merge Bulk Carrier Fleet into Dry Bulk Fleet
DO $$
DECLARE
  dry_bulk_fleet_id UUID;
  bulk_carrier_fleet_id UUID;
BEGIN
  SELECT id INTO dry_bulk_fleet_id FROM fleets 
  WHERE name = 'Dry Bulk Fleet' LIMIT 1;
  
  SELECT id INTO bulk_carrier_fleet_id FROM fleets 
  WHERE name = 'Bulk Carrier Fleet' 
  AND is_active = false LIMIT 1;
  
  IF bulk_carrier_fleet_id IS NOT NULL AND dry_bulk_fleet_id IS NOT NULL THEN
    -- Move vessels from old bulk carrier fleet to dry bulk fleet
    UPDATE fleet_vessels 
    SET fleet_id = dry_bulk_fleet_id 
    WHERE fleet_id = bulk_carrier_fleet_id
    ON CONFLICT (fleet_id, ship_id) DO NOTHING;
    
    DELETE FROM fleets WHERE id = bulk_carrier_fleet_id;
    
    RAISE NOTICE 'Consolidated Bulk Carrier fleets';
  END IF;
END $$;

-- Merge Tanker Fleet into Crude Oil Fleet
DO $$
DECLARE
  crude_fleet_id UUID;
  tanker_fleet_id UUID;
BEGIN
  SELECT id INTO crude_fleet_id FROM fleets 
  WHERE name = 'Crude Oil Fleet' LIMIT 1;
  
  SELECT id INTO tanker_fleet_id FROM fleets 
  WHERE name = 'Tanker Fleet' LIMIT 1;
  
  IF tanker_fleet_id IS NOT NULL AND crude_fleet_id IS NOT NULL THEN
    -- Move crude tanker vessels to crude fleet
    UPDATE fleet_vessels fv
    SET fleet_id = crude_fleet_id
    WHERE fv.fleet_id = tanker_fleet_id
    AND EXISTS (
      SELECT 1 FROM ships s 
      WHERE s.id = fv.ship_id 
      AND s.ship_type IN ('TANKER_CRUDE', 'VLCC', 'Suezmax Tanker', 'Aframax Tanker')
    )
    ON CONFLICT (fleet_id, ship_id) DO NOTHING;
    
    -- Delete old tanker fleet
    DELETE FROM fleet_vessels WHERE fleet_id = tanker_fleet_id;
    DELETE FROM fleets WHERE id = tanker_fleet_id;
    
    RAISE NOTICE 'Consolidated Tanker fleets';
  END IF;
END $$;

-- Final fleet summary (only active fleets)
SELECT 
  f.name as fleet_name,
  f.description,
  COUNT(DISTINCT fv.ship_id) as vessel_count,
  ROUND(SUM(s.deadweight_tonnage)::NUMERIC / 1000, 0) as total_dwt_thousands,
  STRING_AGG(DISTINCT s.ship_type, ', ' ORDER BY s.ship_type) as vessel_types
FROM fleets f
LEFT JOIN fleet_vessels fv ON f.id = fv.fleet_id
LEFT JOIN ships s ON fv.ship_id = s.id
WHERE f.is_active = true
GROUP BY f.id, f.name, f.description
ORDER BY f.name;

