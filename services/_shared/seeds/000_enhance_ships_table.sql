-- ========================================
-- ENHANCE SHIPS TABLE WITH COMPREHENSIVE FIELDS
-- Add missing columns to existing ships table
-- ========================================

-- Add missing identification fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS call_sign VARCHAR(10);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS mmsi VARCHAR(9);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS port_of_registry VARCHAR(100);

-- Add missing classification fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS vessel_subtype VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS ice_class VARCHAR(10);

-- Add missing dimension fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS net_tonnage INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS length_overall_m DECIMAL(8,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS beam_m DECIMAL(6,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS draft_m DECIMAL(5,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS depth_m DECIMAL(5,2);

-- Add construction details
ALTER TABLE ships ADD COLUMN IF NOT EXISTS shipyard VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS hull_number VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS keel_laid_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS launch_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- Add engine details
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_manufacturer VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_model VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_type VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS number_of_main_engines INTEGER DEFAULT 1;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS auxiliary_engines INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS propulsion_type VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS propeller_type VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS number_of_propellers INTEGER DEFAULT 1;

-- Add performance fields (note: some may already exist)
ALTER TABLE ships ADD COLUMN IF NOT EXISTS design_speed_knots DECIMAL(4,1);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS service_speed_knots DECIMAL(4,1);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eco_speed_knots DECIMAL(4,1);

-- Rename existing consumption fields if they exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ships' AND column_name='port_consumption') THEN
        ALTER TABLE ships RENAME COLUMN port_consumption TO port_consumption_tonnes_day;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ships' AND column_name='sea_consumption') THEN
        ALTER TABLE ships RENAME COLUMN sea_consumption TO sea_consumption_tonnes_day;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Add new consumption fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS port_consumption_tonnes_day DECIMAL(6,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS sea_consumption_tonnes_day DECIMAL(6,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eco_consumption_tonnes_day DECIMAL(6,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS fuel_capacity_tonnes DECIMAL(10,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS primary_fuel_type VARCHAR(50);

-- Add cargo capacity fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cargo_capacity_teu INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cargo_capacity_cbm DECIMAL(15,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cargo_capacity_tonnes DECIMAL(15,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS number_of_holds INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS number_of_hatches INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS reefer_plugs INTEGER;

-- Add classification details
ALTER TABLE ships ADD COLUMN IF NOT EXISTS class_notation VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS statutory_class VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS last_drydock_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS next_drydock_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS last_special_survey DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS next_special_survey DATE;

-- Add compliance fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS imo_tier VARCHAR(10);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_value DECIMAL(8,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_value DECIMAL(8,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_rating VARCHAR(1);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_value DECIMAL(8,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS ism_cert_expiry DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS isps_cert_expiry DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS mlc_cert_expiry DATE;

-- Add environmental features
ALTER TABLE ships ADD COLUMN IF NOT EXISTS ballast_water_treatment BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS sox_scrubber_installed BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS sox_scrubber_type VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS nox_reduction_system BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS waste_heat_recovery BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS shore_power_capability BOOLEAN DEFAULT FALSE;

-- Add energy efficiency tech
ALTER TABLE ships ADD COLUMN IF NOT EXISTS shaft_generator BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS vfd_installed BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS propeller_optimization BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS hull_coating_type VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS air_lubrication_system BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS wind_assisted_propulsion BOOLEAN DEFAULT FALSE;

-- Add insurance fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS hull_insurance_value DECIMAL(15,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS hull_insurer VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS protection_indemnity_club VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS insurance_renewal_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS safety_rating VARCHAR(20);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS last_psc_inspection DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS psc_deficiencies INTEGER DEFAULT 0;

-- Add operational status
ALTER TABLE ships ADD COLUMN IF NOT EXISTS operational_status VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE ships ADD COLUMN IF NOT EXISTS current_port VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS current_location_lat DECIMAL(9,6);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS current_location_lon DECIMAL(10,6);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS last_position_update TIMESTAMP WITH TIME ZONE;

-- Add commercial fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS daily_charter_rate_usd DECIMAL(12,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS owner_operator VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS commercial_manager VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS technical_manager VARCHAR(255);

-- Add contact information
ALTER TABLE ships ADD COLUMN IF NOT EXISTS vessel_email VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS vessel_phone VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS satellite_phone VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS master_name VARCHAR(255);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS chief_engineer_name VARCHAR(255);

-- Add metadata fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add check constraints
DO $$
BEGIN
    ALTER TABLE ships ADD CONSTRAINT check_operational_status 
        CHECK (operational_status IN ('ACTIVE', 'IN_PORT', 'MAINTENANCE', 'LAID_UP', 'SCRAPPED'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE ships ADD CONSTRAINT check_cii_rating 
        CHECK (cii_rating IN ('A', 'B', 'C', 'D', 'E') OR cii_rating IS NULL);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create vessel master view
CREATE OR REPLACE VIEW vessel_master_view AS
SELECT 
    s.id,
    s.imo_number,
    s.name,
    s.call_sign,
    s.ship_type,
    s.vessel_subtype,
    s.gross_tonnage,
    s.deadweight_tonnage,
    s.year_built,
    EXTRACT(YEAR FROM NOW())::INTEGER - s.year_built AS vessel_age,
    s.flag_state,
    s.classification_society,
    s.operational_status,
    s.current_port,
    s.service_speed_knots,
    s.sea_consumption_tonnes_day,
    s.port_consumption_tonnes_day,
    s.primary_fuel_type,
    s.cii_rating,
    s.safety_rating,
    s.hull_insurance_value,
    o.name AS organization_name,
    s.is_active
FROM ships s
LEFT JOIN organizations o ON s.organization_id = o.id
WHERE s.is_deleted = FALSE OR s.is_deleted IS NULL;

-- Create vessel statistics view
CREATE OR REPLACE VIEW vessel_statistics AS
SELECT 
    COUNT(*) AS total_vessels,
    COUNT(*) FILTER (WHERE operational_status = 'ACTIVE') AS active_vessels,
    COUNT(*) FILTER (WHERE operational_status = 'IN_PORT') AS in_port,
    AVG(EXTRACT(YEAR FROM NOW()) - year_built)::NUMERIC(5,1) AS average_age,
    SUM(gross_tonnage) AS total_fleet_tonnage
FROM ships
WHERE (is_active = TRUE OR is_active IS NULL) AND (is_deleted = FALSE OR is_deleted IS NULL);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ships_operational_status ON ships(operational_status);
CREATE INDEX IF NOT EXISTS idx_ships_cii_rating ON ships(cii_rating) WHERE cii_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ships_safety_rating ON ships(safety_rating) WHERE safety_rating IS NOT NULL;

