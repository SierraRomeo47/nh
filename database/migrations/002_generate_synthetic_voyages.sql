-- Generate synthetic voyage data for all vessels using ports with UN/LOCODE
-- This ensures all ships have realistic voyage legs with proper port codes

-- First, clean up any existing synthetic data if needed
-- (Comment out if you want to keep existing data)
-- DELETE FROM fuel_consumption WHERE voyage_id IN (SELECT id FROM voyages WHERE voyage_id LIKE 'VY-%');
-- DELETE FROM voyage_legs WHERE voyage_id IN (SELECT id FROM voyages WHERE voyage_id LIKE 'VY-%');
-- DELETE FROM voyages WHERE voyage_id LIKE 'VY-%';

-- Function to generate voyages
CREATE OR REPLACE FUNCTION generate_synthetic_voyages()
RETURNS void AS $$
DECLARE
    ship_record RECORD;
    voyage_count INT;
    voyage_id_str VARCHAR;
    leg_count INT;
    start_date_val TIMESTAMP;
    end_date_val TIMESTAMP;
    current_voyage_id BIGINT;
    dep_port TEXT;
    arr_port TEXT;
    leg_start TIMESTAMP;
    leg_end TIMESTAMP;
    leg_duration INTERVAL;
    fuel_date TIMESTAMP;
    days_count INT;
BEGIN
    -- Loop through all ships
    FOR ship_record IN 
        SELECT id, imo_number, name, ship_type 
        FROM ships 
        WHERE imo_number IS NOT NULL
    LOOP
        -- Generate 2-4 voyages per ship
        voyage_count := 2 + (RANDOM() * 3)::INT;
        
        FOR i IN 1..voyage_count LOOP
            -- Generate unique voyage ID
            voyage_id_str := 'VY-' || ship_record.imo_number || '-' || LPAD(i::TEXT, 3, '0');
            
            -- Random start date in last 6 months
            start_date_val := NOW() - (RANDOM() * 180 || ' days')::INTERVAL;
            
            -- Voyage duration 5-30 days
            end_date_val := start_date_val + (5 + RANDOM() * 25 || ' days')::INTERVAL;
            
            -- Get start and end ports
            SELECT name || ', ' || country_code INTO dep_port
            FROM ports 
            WHERE name IS NOT NULL AND country_code IS NOT NULL
            ORDER BY RANDOM() 
            LIMIT 1;
            
            SELECT name || ', ' || country_code INTO arr_port
            FROM ports 
            WHERE name IS NOT NULL AND country_code IS NOT NULL AND name != SPLIT_PART(dep_port, ',', 1)
            ORDER BY RANDOM() 
            LIMIT 1;
            
            -- Insert voyage
            INSERT INTO voyages (
                voyage_id,
                ship_id,
                voyage_type,
                start_date,
                end_date,
                start_port,
                end_port,
                charter_type,
                status,
                created_at,
                updated_at
            ) VALUES (
                voyage_id_str,
                ship_record.id,
                CASE 
                    WHEN ship_record.ship_type LIKE '%TANKER%' THEN 'LADEN'
                    WHEN ship_record.ship_type LIKE '%BULK%' THEN 'LADEN'
                    ELSE 'LADEN'
                END,
                start_date_val,
                end_date_val,
                dep_port,
                arr_port,
                CASE WHEN RANDOM() > 0.5 THEN 'TIME_CHARTER' ELSE 'VOYAGE_CHARTER' END,
                CASE 
                    WHEN end_date_val < NOW() THEN 'COMPLETED'
                    WHEN start_date_val > NOW() THEN 'PLANNED'
                    ELSE 'ACTIVE'
                END,
                NOW(),
                NOW()
            )
            RETURNING id INTO current_voyage_id;
            
            -- Generate 1-3 legs for the voyage
            leg_count := 1 + (RANDOM() * 2)::INT;
            
            FOR j IN 1..leg_count LOOP
                leg_duration := ((end_date_val - start_date_val) / leg_count);
                leg_start := start_date_val + (leg_duration * (j - 1));
                leg_end := leg_start + leg_duration;
                
                -- Get random ports with proper names
                SELECT name || ', ' || country_code INTO dep_port
                FROM ports 
                WHERE name IS NOT NULL AND country_code IS NOT NULL
                ORDER BY RANDOM() 
                LIMIT 1;
                
                SELECT name || ', ' || country_code INTO arr_port
                FROM ports 
                WHERE name IS NOT NULL AND country_code IS NOT NULL AND name != SPLIT_PART(dep_port, ',', 1)
                ORDER BY RANDOM() 
                LIMIT 1;
                
                INSERT INTO voyage_legs (
                    voyage_id,
                    leg_number,
                    departure_port,
                    arrival_port,
                    departure_date,
                    arrival_date,
                    distance_nm,
                    cargo_type,
                    cargo_quantity,
                    created_at,
                    updated_at
                ) VALUES (
                    current_voyage_id,
                    j,
                    dep_port,
                    arr_port,
                    leg_start,
                    leg_end,
                    500 + (RANDOM() * 5000)::INT, -- 500-5500 nautical miles
                    CASE 
                        WHEN ship_record.ship_type LIKE '%CONTAINER%' THEN 'CONTAINERS'
                        WHEN ship_record.ship_type LIKE '%TANKER%' THEN 'CRUDE_OIL'
                        WHEN ship_record.ship_type LIKE '%BULK%' THEN 'IRON_ORE'
                        WHEN ship_record.ship_type LIKE '%LNG%' THEN 'LNG'
                        ELSE 'GENERAL_CARGO'
                    END,
                    10000 + (RANDOM() * 50000)::INT, -- 10k-60k tonnes
                    NOW(),
                    NOW()
                );
            END LOOP;
            
            -- Generate fuel consumption data for the voyage
            days_count := EXTRACT(DAY FROM (end_date_val - start_date_val))::INT;
            
            -- Daily fuel consumption entries
            FOR k IN 0..days_count LOOP
                fuel_date := start_date_val + (k || ' days')::INTERVAL;
                
                -- Main fuel type based on ship type
                INSERT INTO fuel_consumption (
                    voyage_id,
                    fuel_type,
                    fuel_category,
                    consumption_tonnes,
                    consumption_date,
                    lower_calorific_value_mj_kg,
                    well_to_wake_ghg_gco2e_mj,
                    created_at,
                    updated_at
                ) VALUES (
                    current_voyage_id,
                    CASE 
                        WHEN ship_record.ship_type LIKE '%LNG%' THEN 'LNG'
                        ELSE 'VLSFO'
                    END,
                    'FOSSIL',
                    5 + (RANDOM() * 15)::NUMERIC(10,2), -- 5-20 tonnes/day
                    fuel_date,
                    41.0,
                    91.5,
                    NOW(),
                    NOW()
                );
                
                -- Auxiliary fuel (MGO)
                INSERT INTO fuel_consumption (
                    voyage_id,
                    fuel_type,
                    fuel_category,
                    consumption_tonnes,
                    consumption_date,
                    lower_calorific_value_mj_kg,
                    well_to_wake_ghg_gco2e_mj,
                    created_at,
                    updated_at
                ) VALUES (
                    current_voyage_id,
                    'MGO',
                    'FOSSIL',
                    0.2 + (RANDOM() * 1.5)::NUMERIC(10,2), -- 0.2-1.7 tonnes/day
                    fuel_date,
                    42.7,
                    94.1,
                    NOW(),
                    NOW()
                );
            END LOOP;
        END LOOP;
        
        RAISE NOTICE 'Generated % voyages for ship: %', voyage_count, ship_record.name;
    END LOOP;
    
    RAISE NOTICE 'Synthetic voyage generation complete!';
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT generate_synthetic_voyages();

-- Drop the function after use
DROP FUNCTION IF EXISTS generate_synthetic_voyages();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voyage_legs_voyage_id ON voyage_legs(voyage_id);
CREATE INDEX IF NOT EXISTS idx_voyage_legs_ports ON voyage_legs(departure_port, arrival_port);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_voyage_id ON fuel_consumption(voyage_id);
CREATE INDEX IF NOT EXISTS idx_voyages_ship_id ON voyages(ship_id);
CREATE INDEX IF NOT EXISTS idx_voyages_dates ON voyages(start_date, end_date);

-- Show summary
SELECT 
    'Voyages created' as metric,
    COUNT(*) as count
FROM voyages
WHERE voyage_id LIKE 'VY-%'
UNION ALL
SELECT 
    'Voyage legs created',
    COUNT(*)
FROM voyage_legs
WHERE voyage_id IN (SELECT id FROM voyages WHERE voyage_id LIKE 'VY-%')
UNION ALL
SELECT 
    'Fuel entries created',
    COUNT(*)
FROM fuel_consumption
WHERE voyage_id IN (SELECT id FROM voyages WHERE voyage_id LIKE 'VY-%');
