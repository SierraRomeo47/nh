-- Add voyage legs for voyages that don't have any
-- This script adds 1-2 legs for each voyage based on start/end ports

DO $$
DECLARE
  v_record RECORD;
  v_voyage_id UUID;
  v_start_port TEXT;
  v_end_port TEXT;
  v_intermediate_port TEXT;
  v_has_intermediate BOOLEAN;
BEGIN
  -- Loop through voyages without legs
  FOR v_record IN (
    SELECT v.id, v.voyage_id, v.start_port, v.end_port
    FROM voyages v
    LEFT JOIN voyage_legs vl ON v.id = vl.voyage_id
    WHERE vl.id IS NULL
    ORDER BY v.voyage_id
  )
  LOOP
    v_voyage_id := v_record.id;
    v_start_port := v_record.start_port;
    v_end_port := v_record.end_port;
    
    -- Randomly decide if this voyage has an intermediate port (50% chance)
    v_has_intermediate := (RANDOM() > 0.5);
    
    IF v_has_intermediate THEN
      -- Select a random intermediate port from major ports
      SELECT name || ', ' || country_code INTO v_intermediate_port
      FROM ports
      WHERE unlocode IN ('SGSIN', 'EGSUZ', 'AEDUQ', 'GRPIR', 'MAPTM')
        AND name || ', ' || country_code != v_start_port
        AND name || ', ' || country_code != v_end_port
      ORDER BY RANDOM()
      LIMIT 1;
      
      -- Insert two legs
      INSERT INTO voyage_legs (id, voyage_id, leg_number, departure_port, arrival_port, distance_nm, cargo_type, created_at)
      VALUES (
        gen_random_uuid(),
        v_voyage_id,
        1,
        v_start_port,
        v_intermediate_port,
        FLOOR(2000 + RANDOM() * 3000)::INTEGER, -- Random distance 2000-5000 nm
        (ARRAY['CRUDE_OIL', 'REFINED_PRODUCTS', 'LNG', 'IRON_ORE', 'COAL', 'GRAIN', 'CONTAINERS'])[FLOOR(RANDOM() * 7 + 1)],
        NOW() - INTERVAL '30 days' * RANDOM()
      );
      
      INSERT INTO voyage_legs (id, voyage_id, leg_number, departure_port, arrival_port, distance_nm, cargo_type, created_at)
      VALUES (
        gen_random_uuid(),
        v_voyage_id,
        2,
        v_intermediate_port,
        v_end_port,
        FLOOR(2000 + RANDOM() * 3000)::INTEGER,
        (ARRAY['CRUDE_OIL', 'REFINED_PRODUCTS', 'LNG', 'IRON_ORE', 'COAL', 'GRAIN', 'CONTAINERS'])[FLOOR(RANDOM() * 7 + 1)],
        NOW() - INTERVAL '30 days' * RANDOM()
      );
    ELSE
      -- Insert single direct leg
      INSERT INTO voyage_legs (id, voyage_id, leg_number, departure_port, arrival_port, distance_nm, cargo_type, created_at)
      VALUES (
        gen_random_uuid(),
        v_voyage_id,
        1,
        v_start_port,
        v_end_port,
        FLOOR(2000 + RANDOM() * 5000)::INTEGER, -- Random distance 2000-7000 nm
        (ARRAY['CRUDE_OIL', 'REFINED_PRODUCTS', 'LNG', 'IRON_ORE', 'COAL', 'GRAIN', 'CONTAINERS'])[FLOOR(RANDOM() * 7 + 1)],
        NOW() - INTERVAL '30 days' * RANDOM()
      );
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Added legs for % voyages', (SELECT COUNT(DISTINCT v.id) FROM voyages v LEFT JOIN voyage_legs vl ON v.id = vl.voyage_id WHERE vl.id IS NULL);
END $$;

SELECT 'Migration complete: Added legs for voyages without them' as status;

