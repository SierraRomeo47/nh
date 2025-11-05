-- Migration: Enhance Voyage Legs Structure and Ensure Data Integrity
-- Purpose: Ensure all voyages have proper leg data and compliance calculations
-- Date: 2024

-- Step 1: Ensure voyage_legs table has all necessary indexes
CREATE INDEX IF NOT EXISTS idx_voyage_legs_voyage_id ON voyage_legs(voyage_id);
CREATE INDEX IF NOT EXISTS idx_voyage_legs_ports ON voyage_legs(departure_port, arrival_port);
CREATE INDEX IF NOT EXISTS idx_voyage_legs_dates ON voyage_legs(departure_date, arrival_date);

-- Step 2: Create voyage_compliance_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS voyage_compliance_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- EU ETS Data
    eu_ets_covered_share_pct DECIMAL(5,2) DEFAULT 0,
    eu_ets_eua_exposure_tco2 DECIMAL(12,2) DEFAULT 0,
    eu_ets_reported_year INTEGER,
    eu_ets_surrender_deadline_iso TIMESTAMP WITH TIME ZONE,
    eu_ets_verification_status VARCHAR(50) DEFAULT 'PENDING',
    
    -- FuelEU Maritime Data
    fueleu_energy_in_scope_gj DECIMAL(15,3) DEFAULT 0,
    fueleu_ghg_intensity_gco2e_per_mj DECIMAL(10,4) DEFAULT 0,
    fueleu_compliance_balance_gco2e DECIMAL(15,2) DEFAULT 0,
    fueleu_banked_gco2e DECIMAL(15,2) DEFAULT 0,
    fueleu_borrowed_gco2e DECIMAL(15,2) DEFAULT 0,
    fueleu_pooling_status VARCHAR(50) DEFAULT 'NONE',
    
    -- IMO DCS Data
    imo_dcs_transport_work_tnm DECIMAL(15,2) DEFAULT 0,
    imo_dcs_submission_status VARCHAR(50) DEFAULT 'PENDING',
    imo_dcs_submission_deadline DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_voyage_id ON voyage_compliance_data(voyage_id);
CREATE INDEX IF NOT EXISTS idx_compliance_eu_ets_year ON voyage_compliance_data(eu_ets_reported_year);

-- Step 3: Populate voyage_legs for existing voyages that don't have legs
INSERT INTO voyage_legs (voyage_id, leg_number, departure_port, arrival_port, distance_nm)
SELECT 
    v.id,
    1 as leg_number,
    v.start_port,
    v.end_port,
    CASE 
        WHEN v.start_port IS NOT NULL AND v.end_port IS NOT NULL THEN
            -- Estimate distance based on common routes
            CASE 
                WHEN (v.start_port ILIKE '%Rotterdam%' OR v.start_port ILIKE '%Hamburg%' OR v.start_port ILIKE '%Antwerp%')
                     AND (v.end_port ILIKE '%Singapore%' OR v.end_port ILIKE '%Hong Kong%' OR v.end_port ILIKE '%Shanghai%')
                THEN 11000 -- Europe to Asia via Suez
                WHEN (v.start_port ILIKE '%Rotterdam%' OR v.start_port ILIKE '%Hamburg%')
                     AND (v.end_port ILIKE '%New York%' OR v.end_port ILIKE '%Charleston%' OR v.end_port ILIKE '%Savannah%')
                THEN 3400 -- Trans-Atlantic
                WHEN (v.start_port ILIKE '%Rotterdam%' OR v.start_port ILIKE '%Hamburg%' OR v.start_port ILIKE '%Antwerp%')
                     AND (v.end_port ILIKE '%Rotterdam%' OR v.end_port ILIKE '%Hamburg%' OR v.end_port ILIKE '%Antwerp%')
                THEN 200 -- Intra-European
                WHEN v.start_port ILIKE '%Singapore%' AND (v.end_port ILIKE '%Shanghai%' OR v.end_port ILIKE '%Hong Kong%')
                THEN 1500 -- Intra-Asia
                ELSE 3000 -- Default estimate
            END
        ELSE NULL
    END as distance_nm
FROM voyages v
WHERE NOT EXISTS (
    SELECT 1 FROM voyage_legs vl WHERE vl.voyage_id = v.id
)
AND v.start_port IS NOT NULL 
AND v.end_port IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 4: Create a view for easy voyage-leg retrieval
CREATE OR REPLACE VIEW voyages_with_legs AS
SELECT 
    v.*,
    s.name as ship_name,
    s.imo_number,
    s.ship_type,
    COALESCE(
        json_agg(
            json_build_object(
                'id', vl.id,
                'leg_number', vl.leg_number,
                'departure_port', vl.departure_port,
                'arrival_port', vl.arrival_port,
                'departure_date', vl.departure_date,
                'arrival_date', vl.arrival_date,
                'distance_nm', vl.distance_nm,
                'cargo_type', vl.cargo_type,
                'cargo_quantity', vl.cargo_quantity
            ) ORDER BY vl.leg_number
        ) FILTER (WHERE vl.id IS NOT NULL),
        '[]'::json
    ) as legs,
    vcd.eu_ets_covered_share_pct,
    vcd.eu_ets_eua_exposure_tco2,
    vcd.fueleu_energy_in_scope_gj,
    vcd.fueleu_compliance_balance_gco2e
FROM voyages v
LEFT JOIN ships s ON s.id = v.ship_id
LEFT JOIN voyage_legs vl ON vl.voyage_id = v.id
LEFT JOIN voyage_compliance_data vcd ON vcd.voyage_id = v.id
GROUP BY v.id, s.id, vcd.id;

-- Step 5: Create function to auto-calculate EU ETS coverage from legs
CREATE OR REPLACE FUNCTION calculate_eu_ets_coverage(p_voyage_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    eu_ports TEXT[] := ARRAY[
        'Rotterdam', 'Amsterdam', 'Antwerp', 'Hamburg', 'Bremen', 'Bremerhaven',
        'Barcelona', 'Valencia', 'Genoa', 'Naples', 'Marseille', 'Le Havre',
        'Felixstowe', 'Southampton', 'Dublin', 'Cork', 'Gdansk', 'Gdynia',
        'Klaipeda', 'Helsinki', 'Stockholm', 'Gothenburg', 'Copenhagen', 'Aarhus',
        'Zeebrugge', 'Algeciras', 'Vigo', 'Lisbon'
    ];
    total_distance DECIMAL := 0;
    eu_distance DECIMAL := 0;
    leg_record RECORD;
BEGIN
    FOR leg_record IN 
        SELECT departure_port, arrival_port, distance_nm
        FROM voyage_legs
        WHERE voyage_id = p_voyage_id
        ORDER BY leg_number
    LOOP
        IF leg_record.distance_nm IS NOT NULL THEN
            total_distance := total_distance + leg_record.distance_nm;
            
            -- Check if both ports are EU
            IF leg_record.departure_port = ANY(eu_ports) 
               AND leg_record.arrival_port = ANY(eu_ports) THEN
                eu_distance := eu_distance + leg_record.distance_nm; -- 100% coverage
            -- Check if one port is EU (extra-EU voyage)
            ELSIF leg_record.departure_port = ANY(eu_ports) 
                  OR leg_record.arrival_port = ANY(eu_ports) THEN
                eu_distance := eu_distance + (leg_record.distance_nm * 0.5); -- 50% coverage
            END IF;
        END IF;
    END LOOP;
    
    IF total_distance > 0 THEN
        RETURN ROUND((eu_distance / total_distance * 100)::numeric, 2);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to auto-update compliance data when legs change
CREATE OR REPLACE FUNCTION update_voyage_compliance_on_leg_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate EU ETS coverage
    UPDATE voyage_compliance_data
    SET 
        eu_ets_covered_share_pct = calculate_eu_ets_coverage(
            COALESCE(NEW.voyage_id, OLD.voyage_id)
        ),
        updated_at = NOW()
    WHERE voyage_id = COALESCE(NEW.voyage_id, OLD.voyage_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_compliance_on_leg_change ON voyage_legs;
CREATE TRIGGER trigger_update_compliance_on_leg_change
AFTER INSERT OR UPDATE OR DELETE ON voyage_legs
FOR EACH ROW
EXECUTE FUNCTION update_voyage_compliance_on_leg_change();

-- Step 7: Add comments for documentation
COMMENT ON TABLE voyage_legs IS 'Stores individual legs of multi-port voyages with port-to-port routing information';
COMMENT ON TABLE voyage_compliance_data IS 'Stores calculated compliance data for EU ETS, FuelEU Maritime, and IMO DCS';
COMMENT ON FUNCTION calculate_eu_ets_coverage(UUID) IS 'Calculates EU ETS coverage percentage based on voyage legs and EU port list';
COMMENT ON VIEW voyages_with_legs IS 'Convenience view joining voyages with their legs and compliance data';

