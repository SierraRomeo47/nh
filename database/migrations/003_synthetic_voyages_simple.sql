-- Quick synthetic voyage generator
DO $$
DECLARE
    ship_rec RECORD;
    v_count INT;
    v_id_str VARCHAR;
    curr_v_id UUID;
    dep TEXT;
    arr TEXT;
    sdate TIMESTAMP;
    edate TIMESTAMP;
BEGIN
    FOR ship_rec IN SELECT id, imo_number, name, ship_type FROM ships WHERE imo_number IS NOT NULL LOOP
        v_count := 2 + (RANDOM() * 2)::INT;
        FOR i IN 1..v_count LOOP
            v_id_str := 'VY-' || ship_rec.imo_number || '-' || LPAD(i::TEXT, 3, '0');
            sdate := NOW() - (RANDOM() * 180 || ' days')::INTERVAL;
            edate := sdate + (5 + RANDOM() * 25 || ' days')::INTERVAL;
            
            SELECT name || ', ' || country_code INTO dep FROM ports WHERE name IS NOT NULL AND country_code IS NOT NULL ORDER BY RANDOM() LIMIT 1;
            SELECT name || ', ' || country_code INTO arr FROM ports WHERE name IS NOT NULL AND country_code IS NOT NULL AND name != SPLIT_PART(dep, ',', 1) ORDER BY RANDOM() LIMIT 1;
            
            INSERT INTO voyages (voyage_id, ship_id, voyage_type, start_date, end_date, start_port, end_port, charter_type, status)
            VALUES (v_id_str, ship_rec.id, 'LADEN', sdate, edate, dep, arr, 'TIME_CHARTER', CASE WHEN edate < NOW() THEN 'COMPLETED' ELSE 'ACTIVE' END)
            RETURNING id INTO curr_v_id;
            
            FOR j IN 1..(1 + (RANDOM() * 2)::INT) LOOP
                SELECT name || ', ' || country_code INTO dep FROM ports WHERE name IS NOT NULL AND country_code IS NOT NULL ORDER BY RANDOM() LIMIT 1;
                SELECT name || ', ' || country_code INTO arr FROM ports WHERE name IS NOT NULL AND country_code IS NOT NULL AND name != SPLIT_PART(dep, ',', 1) ORDER BY RANDOM() LIMIT 1;
                INSERT INTO voyage_legs (voyage_id, leg_number, departure_port, arrival_port, departure_date, arrival_date, distance_nm, cargo_type, cargo_quantity)
                VALUES (curr_v_id, j, dep, arr, sdate, edate, 500 + (RANDOM() * 5000)::INT, 'CONTAINERS', 10000 + (RANDOM() * 50000)::INT);
            END LOOP;
        END LOOP;
        RAISE NOTICE 'Generated % voyages for: %', v_count, ship_rec.name;
    END LOOP;
END $$;

-- Show results
SELECT COUNT(*) as total_voyages FROM voyages WHERE voyage_id LIKE 'VY-%';
SELECT COUNT(*) as total_legs FROM voyage_legs WHERE voyage_id IN (SELECT id FROM voyages WHERE voyage_id LIKE 'VY-%');

