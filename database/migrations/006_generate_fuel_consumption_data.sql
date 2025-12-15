-- Generate Synthetic Fuel Consumption Data for All Vessels
-- Based on industry standards and vessel types
-- Covers last 30 days with daily entries

-- Function to generate fuel consumption based on vessel type
CREATE OR REPLACE FUNCTION generate_fuel_consumption_for_vessel(
  p_ship_id UUID,
  p_voyage_id UUID,
  p_imo_number VARCHAR,
  p_ship_type VARCHAR,
  p_deadweight_tonnage DECIMAL,
  p_start_date DATE,
  p_end_date DATE
) RETURNS void AS $$
DECLARE
  v_current_date DATE;
  v_me_consumption_daily DECIMAL;
  v_ae_consumption_daily DECIMAL;
  v_boiler_consumption_daily DECIMAL;
  v_main_fuel_type VARCHAR;
  v_aux_fuel_type VARCHAR;
  v_me_variation DECIMAL;
  v_ae_variation DECIMAL;
  v_boiler_variation DECIMAL;
BEGIN
  -- Determine fuel types and consumption rates based on vessel type
  CASE 
    -- LNG Carriers
    WHEN p_ship_type LIKE '%LNG%' THEN
      v_main_fuel_type := 'LNG';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.35;
      v_ae_consumption_daily := 2.5;
      v_boiler_consumption_daily := 1.8;
    
    -- VLCCs (Very Large Crude Carriers)
    WHEN p_ship_type = 'VLCC' OR p_deadweight_tonnage > 200000 THEN
      v_main_fuel_type := 'HFO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.45;
      v_ae_consumption_daily := 4.5;
      v_boiler_consumption_daily := 3.2;
    
    -- Suezmax Tankers
    WHEN p_ship_type LIKE '%Suezmax%' OR (p_deadweight_tonnage BETWEEN 120000 AND 200000) THEN
      v_main_fuel_type := 'HFO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.42;
      v_ae_consumption_daily := 3.8;
      v_boiler_consumption_daily := 2.8;
    
    -- Aframax Tankers
    WHEN p_ship_type LIKE '%Aframax%' OR (p_deadweight_tonnage BETWEEN 80000 AND 120000 AND p_ship_type LIKE '%Tanker%') THEN
      v_main_fuel_type := 'HFO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.38;
      v_ae_consumption_daily := 3.2;
      v_boiler_consumption_daily := 2.4;
    
    -- MR (Medium Range) Tankers
    WHEN p_ship_type LIKE '%MR%' OR (p_deadweight_tonnage BETWEEN 40000 AND 60000 AND p_ship_type LIKE '%Tanker%') THEN
      v_main_fuel_type := 'MGO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.32;
      v_ae_consumption_daily := 2.8;
      v_boiler_consumption_daily := 1.5;
    
    -- Product Tankers
    WHEN p_ship_type LIKE '%PRODUCT%' OR p_ship_type LIKE '%Chemical%' THEN
      v_main_fuel_type := 'MGO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.30;
      v_ae_consumption_daily := 2.5;
      v_boiler_consumption_daily := 2.0;
    
    -- Crude Oil Tankers
    WHEN p_ship_type LIKE '%CRUDE%' THEN
      v_main_fuel_type := 'HFO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.40;
      v_ae_consumption_daily := 3.5;
      v_boiler_consumption_daily := 2.5;
    
    -- Bulk Carriers
    WHEN p_ship_type LIKE '%BULK%' OR p_ship_type LIKE '%Bulk%' THEN
      v_main_fuel_type := 'HFO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.36;
      v_ae_consumption_daily := 2.8;
      v_boiler_consumption_daily := 1.2;
    
    -- Container Ships
    WHEN p_ship_type LIKE '%Container%' THEN
      v_main_fuel_type := 'HFO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.50;
      v_ae_consumption_daily := 5.5;
      v_boiler_consumption_daily := 1.8;
    
    -- Default for other vessel types
    ELSE
      v_main_fuel_type := 'MGO';
      v_aux_fuel_type := 'MGO';
      v_me_consumption_daily := (p_deadweight_tonnage / 1000.0) * 0.35;
      v_ae_consumption_daily := 3.0;
      v_boiler_consumption_daily := 1.5;
  END CASE;
  
  -- Generate daily consumption records
  v_current_date := p_start_date;
  
  WHILE v_current_date <= p_end_date LOOP
    -- Add some randomness (+/- 15%) to make it realistic
    v_me_variation := 0.85 + (random() * 0.3);
    v_ae_variation := 0.85 + (random() * 0.3);
    v_boiler_variation := 0.85 + (random() * 0.3);
      
    -- Main Engine Consumption
    INSERT INTO fuel_consumption (
      voyage_id, fuel_type, fuel_category, consumption_tonnes,
      consumption_date, engine_type, fuel_supplier,
      lower_calorific_value_mj_kg, carbon_content_pct
    ) VALUES (
      p_voyage_id,
      v_main_fuel_type,
      'FOSSIL',
      v_me_consumption_daily * v_me_variation,
      v_current_date,
      'MAIN_ENGINE',
      CASE v_main_fuel_type
        WHEN 'LNG' THEN 'Shell LNG Supply'
        WHEN 'HFO' THEN 'BP Marine HFO'
        WHEN 'MGO' THEN 'Shell Marine MGO'
        ELSE 'Generic Supplier'
      END,
      CASE v_main_fuel_type
        WHEN 'LNG' THEN 50.0
        WHEN 'HFO' THEN 40.2
        WHEN 'MGO' THEN 42.7
        ELSE 41.0
      END,
      CASE v_main_fuel_type
        WHEN 'LNG' THEN 75.0
        WHEN 'HFO' THEN 85.7
        WHEN 'MGO' THEN 87.0
        ELSE 86.0
      END
    );
    
    -- Auxiliary Engine Consumption
    INSERT INTO fuel_consumption (
      voyage_id, fuel_type, fuel_category, consumption_tonnes,
      consumption_date, engine_type, fuel_supplier,
      lower_calorific_value_mj_kg, carbon_content_pct
    ) VALUES (
      p_voyage_id,
      v_aux_fuel_type,
      'FOSSIL',
      v_ae_consumption_daily * v_ae_variation,
      v_current_date,
      'AUXILIARY_ENGINE',
      'Shell Marine MGO',
      42.7,
      87.0
    );
    
    -- Boiler Consumption (if applicable)
    IF v_boiler_consumption_daily > 0 THEN
      INSERT INTO fuel_consumption (
        voyage_id, fuel_type, fuel_category, consumption_tonnes,
        consumption_date, engine_type, fuel_supplier,
        lower_calorific_value_mj_kg, carbon_content_pct
      ) VALUES (
        p_voyage_id,
        v_main_fuel_type,
        'FOSSIL',
        v_boiler_consumption_daily * v_boiler_variation,
        v_current_date,
        'BOILER',
        CASE v_main_fuel_type
          WHEN 'HFO' THEN 'BP Marine HFO'
          WHEN 'MGO' THEN 'Shell Marine MGO'
          ELSE 'Generic Supplier'
        END,
        CASE v_main_fuel_type
          WHEN 'HFO' THEN 40.2
          WHEN 'MGO' THEN 42.7
          ELSE 41.0
        END,
        CASE v_main_fuel_type
          WHEN 'HFO' THEN 85.7
          WHEN 'MGO' THEN 87.0
          ELSE 86.0
        END
      );
    END IF;
    
    -- Shore-side electricity (OPS) when in port (20% of days)
    IF random() < 0.2 THEN
      INSERT INTO fuel_consumption (
        voyage_id, fuel_type, fuel_category, consumption_tonnes,
        consumption_date, energy_source_type, energy_consumption_kwh,
        lower_calorific_value_mj_kg, carbon_content_pct
      ) VALUES (
        p_voyage_id,
        'GRID_ELECTRICITY',
        'ELECTRIC',
        0,
        v_current_date,
        'OPS',
        500 + (random() * 1000),
        0,
        0
      );
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;
  
END;
$$ LANGUAGE plpgsql;

-- Generate fuel consumption data for all vessels
DO $$
DECLARE
  vessel RECORD;
  voyage_rec RECORD;
  v_voyage_id UUID;
  v_start_date DATE := CURRENT_DATE - INTERVAL '30 days';
  v_end_date DATE := CURRENT_DATE;
BEGIN
  -- Loop through all ships
  FOR vessel IN 
    SELECT id, imo_number, ship_type, deadweight_tonnage
    FROM ships
    ORDER BY imo_number
  LOOP
    RAISE NOTICE 'Generating fuel data for vessel: % (%)', vessel.imo_number, vessel.ship_type;
    
    -- Find or create a voyage for this vessel
    SELECT v.id INTO v_voyage_id
    FROM voyages v
    WHERE v.ship_id = vessel.id
    AND v.status = 'ACTIVE'
    LIMIT 1;
    
    -- If no voyage exists, create one
    IF v_voyage_id IS NULL THEN
      INSERT INTO voyages (
        voyage_id, ship_id, voyage_type, start_date, end_date,
        start_port, end_port, status
      ) VALUES (
        'SYN-' || vessel.imo_number || '-' || TO_CHAR(v_start_date, 'YYYYMMDD'),
        vessel.id,
        'LADEN',
        v_start_date,
        v_end_date,
        'Rotterdam',
        'Singapore',
        'ACTIVE'
      ) RETURNING id INTO v_voyage_id;
      
      RAISE NOTICE 'Created voyage for vessel %', vessel.imo_number;
    END IF;
    
    -- Generate fuel consumption for this vessel
    PERFORM generate_fuel_consumption_for_vessel(
      vessel.id,
      v_voyage_id,
      vessel.imo_number,
      vessel.ship_type,
      vessel.deadweight_tonnage,
      v_start_date,
      v_end_date
    );
    
  END LOOP;
  
  RAISE NOTICE 'Fuel consumption data generation complete!';
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS generate_fuel_consumption_for_vessel;

-- Summary query
SELECT 
  s.name as vessel_name,
  s.imo_number,
  s.ship_type,
  COUNT(fc.id) as fuel_records,
  ROUND(SUM(fc.consumption_tonnes)::NUMERIC, 2) as total_consumption_tonnes,
  MIN(fc.consumption_date) as earliest_date,
  MAX(fc.consumption_date) as latest_date
FROM ships s
LEFT JOIN voyages v ON s.id = v.ship_id
LEFT JOIN fuel_consumption fc ON v.id = fc.voyage_id
WHERE fc.consumption_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.id, s.name, s.imo_number, s.ship_type
ORDER BY s.imo_number;
