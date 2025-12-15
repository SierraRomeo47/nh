-- ========================================
-- MASTER VESSELS PARENT SCHEMA
-- Single Source of Truth for All Vessel Data
-- ========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if rebuilding (use with caution in production)
-- DROP TABLE IF EXISTS ships CASCADE;
-- DROP TABLE IF NOT EXISTS organizations CASCADE;

-- ========================================
-- ORGANIZATIONS TABLE (Parent of Ships)
-- ========================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    imo_company_number VARCHAR(7) UNIQUE,
    registration_country VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    company_type VARCHAR(50) DEFAULT 'SHIPPING_COMPANY', -- SHIPPING_COMPANY, CHARTERER, INSURER, VERIFIER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- ========================================
-- SHIPS TABLE (Master Vessel Registry)
-- This is the parent table referenced by ALL vessel-related data
-- ========================================

CREATE TABLE IF NOT EXISTS ships (
    -- Primary Identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imo_number VARCHAR(7) UNIQUE NOT NULL, -- International Maritime Organization number
    name VARCHAR(255) NOT NULL,
    call_sign VARCHAR(10),
    mmsi VARCHAR(9), -- Maritime Mobile Service Identity
    
    -- Ownership & Registration
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    flag_state VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    port_of_registry VARCHAR(100),
    
    -- Vessel Classification
    ship_type VARCHAR(100) NOT NULL, -- Container Ship, Bulk Carrier, Tanker, LNG Carrier, etc.
    vessel_subtype VARCHAR(100), -- Aframax, Panamax, Capesize, etc.
    ice_class VARCHAR(10), -- Ice classification (1A, 1B, 1C, etc.)
    
    -- Physical Dimensions
    gross_tonnage INTEGER,
    net_tonnage INTEGER,
    deadweight_tonnage INTEGER,
    length_overall_m DECIMAL(8,2),
    beam_m DECIMAL(6,2),
    draft_m DECIMAL(5,2),
    depth_m DECIMAL(5,2),
    
    -- Construction Details
    year_built INTEGER,
    shipyard VARCHAR(255),
    hull_number VARCHAR(50),
    keel_laid_date DATE,
    launch_date DATE,
    delivery_date DATE,
    
    -- Engine & Propulsion
    main_engine_manufacturer VARCHAR(100),
    main_engine_model VARCHAR(100),
    main_engine_type VARCHAR(50), -- 2-STROKE, 4-STROKE, DUAL_FUEL, ELECTRIC
    engine_power_kw INTEGER,
    number_of_main_engines INTEGER DEFAULT 1,
    auxiliary_engines INTEGER,
    propulsion_type VARCHAR(50), -- DIESEL, DUAL_FUEL, LNG, ELECTRIC, HYBRID
    propeller_type VARCHAR(50), -- FIXED_PITCH, CONTROLLABLE_PITCH
    number_of_propellers INTEGER DEFAULT 1,
    
    -- Performance Characteristics
    design_speed_knots DECIMAL(4,1),
    service_speed_knots DECIMAL(4,1),
    max_speed_knots DECIMAL(4,1),
    eco_speed_knots DECIMAL(4,1),
    
    -- Fuel Consumption (baseline rates)
    port_consumption_tonnes_day DECIMAL(6,2),
    sea_consumption_tonnes_day DECIMAL(6,2),
    eco_consumption_tonnes_day DECIMAL(6,2),
    fuel_capacity_tonnes DECIMAL(10,2),
    primary_fuel_type VARCHAR(50), -- HFO, VLSFO, MGO, LNG, etc.
    
    -- Cargo Capacity
    cargo_capacity_teu INTEGER, -- For container ships
    cargo_capacity_cbm DECIMAL(15,2), -- Cubic meters
    cargo_capacity_tonnes DECIMAL(15,2),
    number_of_holds INTEGER,
    number_of_hatches INTEGER,
    reefer_plugs INTEGER, -- Refrigerated container capacity
    
    -- Classification & Certification
    classification_society VARCHAR(100), -- DNV, LR, ABS, BV, etc.
    class_notation VARCHAR(255),
    statutory_class VARCHAR(50),
    last_drydock_date DATE,
    next_drydock_date DATE,
    last_special_survey DATE,
    next_special_survey DATE,
    
    -- Compliance & Certifications
    imo_tier VARCHAR(10), -- IMO Tier II, III for NOx emissions
    eedi_value DECIMAL(8,4), -- Energy Efficiency Design Index
    eexi_value DECIMAL(8,4), -- Energy Efficiency Existing Ship Index
    cii_rating VARCHAR(1), -- CII Rating: A, B, C, D, E
    cii_value DECIMAL(8,4),
    ism_cert_expiry DATE, -- International Safety Management
    isps_cert_expiry DATE, -- International Ship and Port Facility Security
    mlc_cert_expiry DATE, -- Maritime Labour Convention
    
    -- Environmental Features
    ballast_water_treatment BOOLEAN DEFAULT FALSE,
    sox_scrubber_installed BOOLEAN DEFAULT FALSE,
    sox_scrubber_type VARCHAR(50), -- OPEN_LOOP, CLOSED_LOOP, HYBRID
    nox_reduction_system BOOLEAN DEFAULT FALSE,
    waste_heat_recovery BOOLEAN DEFAULT FALSE,
    shore_power_capability BOOLEAN DEFAULT FALSE,
    
    -- Energy Efficiency Technologies
    shaft_generator BOOLEAN DEFAULT FALSE,
    vfd_installed BOOLEAN DEFAULT FALSE, -- Variable Frequency Drive
    propeller_optimization BOOLEAN DEFAULT FALSE,
    hull_coating_type VARCHAR(50),
    air_lubrication_system BOOLEAN DEFAULT FALSE,
    wind_assisted_propulsion BOOLEAN DEFAULT FALSE,
    
    -- Insurance & Risk
    hull_insurance_value DECIMAL(15,2), -- USD
    hull_insurer VARCHAR(255),
    protection_indemnity_club VARCHAR(255), -- P&I Club
    insurance_renewal_date DATE,
    safety_rating VARCHAR(20), -- EXCELLENT, GOOD, FAIR, POOR
    last_psc_inspection DATE, -- Port State Control
    psc_deficiencies INTEGER DEFAULT 0,
    
    -- Operational Status
    operational_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, IN_PORT, MAINTENANCE, LAID_UP, SCRAPPED
    current_port VARCHAR(100),
    current_location_lat DECIMAL(9,6),
    current_location_lon DECIMAL(10,6),
    last_position_update TIMESTAMP WITH TIME ZONE,
    
    -- Commercial Details
    daily_charter_rate_usd DECIMAL(12,2),
    owner_operator VARCHAR(255),
    commercial_manager VARCHAR(255),
    technical_manager VARCHAR(255),
    
    -- Contact Information
    vessel_email VARCHAR(255),
    vessel_phone VARCHAR(50),
    satellite_phone VARCHAR(50),
    master_name VARCHAR(255), -- Captain/Master
    chief_engineer_name VARCHAR(255),
    
    -- Metadata & Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB, -- For flexible additional data
    
    -- Constraints
    CONSTRAINT check_gross_tonnage CHECK (gross_tonnage > 0),
    CONSTRAINT check_year_built CHECK (year_built >= 1900 AND year_built <= EXTRACT(YEAR FROM NOW()) + 2),
    CONSTRAINT check_speeds CHECK (max_speed_knots >= service_speed_knots),
    CONSTRAINT check_cii_rating CHECK (cii_rating IN ('A', 'B', 'C', 'D', 'E') OR cii_rating IS NULL),
    CONSTRAINT check_operational_status CHECK (operational_status IN ('ACTIVE', 'IN_PORT', 'MAINTENANCE', 'LAID_UP', 'SCRAPPED'))
);

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_ships_imo ON ships(imo_number);
CREATE INDEX IF NOT EXISTS idx_ships_name ON ships(name);
CREATE INDEX IF NOT EXISTS idx_ships_type ON ships(ship_type);
CREATE INDEX IF NOT EXISTS idx_ships_organization_id ON ships(organization_id);
CREATE INDEX IF NOT EXISTS idx_ships_status ON ships(operational_status);
CREATE INDEX IF NOT EXISTS idx_ships_active ON ships(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ships_flag ON ships(flag_state);
CREATE INDEX IF NOT EXISTS idx_ships_year ON ships(year_built);

-- Create full-text search index for vessel names
CREATE INDEX IF NOT EXISTS idx_ships_name_search ON ships USING gin(to_tsvector('english', name));

-- ========================================
-- VESSEL MASTER VIEW
-- Comprehensive view joining all vessel-related data
-- ========================================

CREATE OR REPLACE VIEW vessel_master_view AS
SELECT 
    s.id,
    s.imo_number,
    s.name,
    s.call_sign,
    s.mmsi,
    s.ship_type,
    s.vessel_subtype,
    s.gross_tonnage,
    s.deadweight_tonnage,
    s.year_built,
    EXTRACT(YEAR FROM NOW()) - s.year_built AS vessel_age,
    s.flag_state,
    s.port_of_registry,
    s.classification_society,
    s.class_notation,
    s.operational_status,
    s.current_port,
    s.service_speed_knots,
    s.sea_consumption_tonnes_day,
    s.port_consumption_tonnes_day,
    s.primary_fuel_type,
    s.eedi_value,
    s.eexi_value,
    s.cii_rating,
    s.cii_value,
    s.safety_rating,
    s.hull_insurance_value,
    s.protection_indemnity_club,
    s.last_psc_inspection,
    s.psc_deficiencies,
    o.name AS organization_name,
    o.imo_company_number,
    o.registration_country AS company_country,
    -- Calculated fields
    CASE 
        WHEN s.operational_status = 'ACTIVE' THEN TRUE
        ELSE FALSE
    END AS is_operational,
    CASE
        WHEN s.next_drydock_date < NOW() + INTERVAL '6 months' THEN TRUE
        ELSE FALSE
    END AS drydock_due_soon,
    CASE
        WHEN s.ism_cert_expiry < NOW() + INTERVAL '3 months' THEN TRUE
        ELSE FALSE
    END AS certification_renewal_due,
    s.created_at,
    s.updated_at,
    s.is_active
FROM ships s
LEFT JOIN organizations o ON s.organization_id = o.id
WHERE s.is_deleted = FALSE;

-- ========================================
-- VESSEL STATISTICS VIEW
-- Aggregated statistics for fleet overview
-- ========================================

CREATE OR REPLACE VIEW vessel_statistics AS
SELECT 
    COUNT(*) AS total_vessels,
    COUNT(*) FILTER (WHERE operational_status = 'ACTIVE') AS active_vessels,
    COUNT(*) FILTER (WHERE operational_status = 'IN_PORT') AS in_port,
    COUNT(*) FILTER (WHERE operational_status = 'MAINTENANCE') AS in_maintenance,
    AVG(EXTRACT(YEAR FROM NOW()) - year_built) AS average_age,
    AVG(gross_tonnage) AS average_tonnage,
    SUM(gross_tonnage) AS total_fleet_tonnage,
    COUNT(DISTINCT ship_type) AS vessel_types_count,
    COUNT(DISTINCT flag_state) AS flag_states_count,
    COUNT(*) FILTER (WHERE cii_rating IN ('A', 'B')) AS cii_compliant,
    COUNT(*) FILTER (WHERE ballast_water_treatment = TRUE) AS bwts_equipped,
    COUNT(*) FILTER (WHERE sox_scrubber_installed = TRUE) AS scrubber_equipped
FROM ships
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to calculate vessel age
CREATE OR REPLACE FUNCTION calculate_vessel_age(year_built INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM NOW())::INTEGER - year_built;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get active voyages for a vessel
CREATE OR REPLACE FUNCTION get_active_voyages(vessel_id UUID)
RETURNS INTEGER AS $$
DECLARE
    voyage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO voyage_count
    FROM voyages
    WHERE ship_id = vessel_id 
    AND status = 'ACTIVE';
    RETURN voyage_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update vessel location
CREATE OR REPLACE FUNCTION update_vessel_location(
    vessel_id UUID,
    new_lat DECIMAL(9,6),
    new_lon DECIMAL(10,6),
    new_port VARCHAR(100)
)
RETURNS VOID AS $$
BEGIN
    UPDATE ships
    SET current_location_lat = new_lat,
        current_location_lon = new_lon,
        current_port = new_port,
        last_position_update = NOW(),
        updated_at = NOW()
    WHERE id = vessel_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ships_updated_at
    BEFORE UPDATE ON ships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Audit trail trigger
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Log insert
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Log update
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Log delete
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_ships
    AFTER INSERT OR UPDATE OR DELETE ON ships
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Optimize common queries
CREATE INDEX IF NOT EXISTS idx_ships_organization ON ships(organization_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ships_type_status ON ships(ship_type, operational_status);
CREATE INDEX IF NOT EXISTS idx_ships_flag_active ON ships(flag_state) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ships_compliance ON ships(cii_rating) WHERE cii_rating IS NOT NULL;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE ships IS 'Master vessel registry - single source of truth for all vessel data across the application';
COMMENT ON COLUMN ships.imo_number IS 'Unique IMO number assigned by International Maritime Organization';
COMMENT ON COLUMN ships.ship_type IS 'Primary vessel classification (Container Ship, Tanker, Bulk Carrier, etc.)';
COMMENT ON COLUMN ships.gross_tonnage IS 'Vessel size measure in Gross Tonnage (GT)';
COMMENT ON COLUMN ships.eedi_value IS 'Energy Efficiency Design Index for new vessels';
COMMENT ON COLUMN ships.eexi_value IS 'Energy Efficiency Existing Ship Index for existing vessels';
COMMENT ON COLUMN ships.cii_rating IS 'Carbon Intensity Indicator rating (A=best, E=worst)';
COMMENT ON COLUMN ships.operational_status IS 'Current operational state of the vessel';
COMMENT ON COLUMN ships.metadata IS 'JSONB field for flexible additional vessel data';

COMMENT ON VIEW vessel_master_view IS 'Comprehensive view of vessel data with organization details and calculated fields';
COMMENT ON VIEW vessel_statistics IS 'Aggregated fleet statistics for dashboards and reporting';

