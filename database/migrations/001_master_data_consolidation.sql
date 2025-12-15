-- ========================================
-- MASTER DATA CONSOLIDATION SCHEMA
-- ========================================
-- Purpose: Create unified parent tables for consistent data across all pages
-- Date: November 9, 2025
-- Version: 1.0

-- ========================================
-- PARENT TABLE: ships (PRIMARY VESSEL MASTER DATA)
-- ========================================
-- This is the single source of truth for all vessel information
-- All pages should reference this table for vessel data consistency

-- The ships table already exists and is comprehensive (100+ columns)
-- We'll enhance it with additional metadata and ensure consistency

-- Add computed columns for common calculations
ALTER TABLE ships ADD COLUMN IF NOT EXISTS vessel_age_years INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM CURRENT_DATE) - year_built) STORED;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS current_vessel_value_usd DECIMAL(15,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS last_annual_survey_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS next_annual_survey_date DATE;

-- Add standardized reference fields
ALTER TABLE ships ADD COLUMN IF NOT EXISTS default_port_id UUID;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS fleet_id UUID;

-- Create view for simplified vessel access (for pages that don't need all 100 fields)
CREATE OR REPLACE VIEW vw_vessels_master AS
SELECT 
    id as vessel_id,
    imo_number,
    name as vessel_name,
    ship_type as vessel_type,
    organization_id,
    gross_tonnage as gt,
    deadweight_tonnage as dwt,
    year_built,
    EXTRACT(YEAR FROM CURRENT_DATE) - year_built as vessel_age,
    flag_state,
    classification_society,
    
    -- Operational Data
    operational_status,
    current_port,
    current_location_lat,
    current_location_lon,
    
    -- Performance Data
    min_speed,
    max_speed,
    design_speed_knots,
    service_speed_knots,
    eco_speed_knots,
    port_consumption_tonnes_day,
    sea_consumption_tonnes_day,
    eco_consumption_tonnes_day,
    
    -- Efficiency Equipment
    waste_heat_recovery as has_whr,
    shaft_generator as has_sgm,
    vfd_installed as has_vfd,
    sox_scrubber_installed as has_scrubber,
    shore_power_capability as has_ops,
    
    -- Compliance Data
    cii_rating,
    cii_value,
    eedi_value,
    eexi_value,
    imo_tier,
    
    -- Insurance
    hull_insurance_value,
    hull_insurer,
    protection_indemnity_club,
    insurance_renewal_date,
    safety_rating,
    
    -- Contact Info
    master_name as captain_name,
    chief_engineer_name,
    vessel_email,
    vessel_phone,
    
    -- Financial
    daily_charter_rate_usd,
    
    -- Management
    owner_operator,
    commercial_manager,
    technical_manager,
    
    -- Status
    is_active,
    is_deleted,
    created_at,
    updated_at
FROM ships
WHERE is_deleted = FALSE;

-- Grant access to view
GRANT SELECT ON vw_vessels_master TO PUBLIC;

-- ========================================
-- PARENT TABLE: organizations (COMPANY MASTER DATA)
-- ========================================
-- Single source of truth for all company/organization data

-- Enhance organizations table with additional fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS organization_type VARCHAR(50) DEFAULT 'SHIPPING_COMPANY';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_contact_name VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS headquarters_city VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS headquarters_country VARCHAR(3);

-- Add constraint for organization types
ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS check_organization_type 
CHECK (organization_type IN (
    'SHIPPING_COMPANY', 
    'CHARTERER', 
    'INSURER', 
    'MTO', 
    'VERIFIER', 
    'BROKER', 
    'AGENT',
    'SUPPLIER'
));

-- Create view for organization summary
CREATE OR REPLACE VIEW vw_organizations_master AS
SELECT 
    id as organization_id,
    name as organization_name,
    organization_type,
    imo_company_number,
    registration_country,
    headquarters_city,
    headquarters_country,
    contact_email,
    contact_phone,
    primary_contact_name,
    website,
    tax_id,
    is_active,
    created_at,
    updated_at
FROM organizations
WHERE is_active = TRUE;

-- ========================================
-- PARENT TABLE: users (USER MASTER DATA)
-- ========================================
-- Single source of truth for all user information

-- Enhance users table with profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS office_location VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Create view for user profiles
CREATE OR REPLACE VIEW vw_users_master AS
SELECT 
    id as user_id,
    email,
    username,
    first_name,
    last_name,
    first_name || ' ' || last_name as full_name,
    role,
    organization_id,
    job_title,
    department,
    phone_number,
    office_location,
    avatar_url,
    is_active,
    email_verified,
    last_login,
    created_at,
    updated_at
FROM users
WHERE is_active = TRUE AND is_deleted = FALSE;

-- ========================================
-- PARENT TABLE: ports (PORT MASTER DATA)
-- ========================================
-- Single source of truth for all port information

-- Enhance ports table with additional fields
ALTER TABLE ports ADD COLUMN IF NOT EXISTS port_code VARCHAR(10);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS country_code VARCHAR(3);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS max_vessel_size VARCHAR(50);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS available_services TEXT[];
ALTER TABLE ports ADD COLUMN IF NOT EXISTS has_bunker_facility BOOLEAN DEFAULT TRUE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS has_repair_facility BOOLEAN DEFAULT FALSE;
ALTER TABLE ports ADD COLUMN IF NOT EXISTS emission_control_area BOOLEAN DEFAULT FALSE;

-- Create view for port summary
CREATE OR REPLACE VIEW vw_ports_master AS
SELECT 
    id as port_id,
    port_name,
    port_code,
    country,
    country_code,
    latitude,
    longitude,
    timezone,
    max_vessel_size,
    has_bunker_facility,
    has_repair_facility,
    emission_control_area,
    available_services,
    is_active,
    created_at,
    updated_at
FROM ports
WHERE is_active = TRUE;

-- ========================================
-- CONSOLIDATION: Migrate vessels data to ships
-- ========================================
-- This ensures ships table is the single source of truth

-- Backup vessels table data before migration
CREATE TABLE IF NOT EXISTS vessels_backup AS 
SELECT *, NOW() as backup_date FROM vessels;

-- Migrate data from vessels to ships (only if not already present)
INSERT INTO ships (
    imo_number,
    name,
    ship_type,
    gross_tonnage,
    year_built,
    flag_state,
    min_speed,
    max_speed,
    port_consumption_tonnes_day,
    sea_consumption_tonnes_day,
    created_at,
    updated_at
)
SELECT 
    v.imo_number,
    v.name,
    v.vessel_type,
    v.dwt, -- Using DWT as GT approximation
    v.built_year,
    v.flag_state,
    v.min_speed,
    v.max_speed,
    v.port_consumption,
    v.sea_consumption,
    v.created_at,
    v.updated_at
FROM vessels v
WHERE NOT EXISTS (
    SELECT 1 FROM ships s WHERE s.imo_number = v.imo_number
)
ON CONFLICT (imo_number) DO NOTHING;

-- Create mapping table for legacy vessel IDs
CREATE TABLE IF NOT EXISTS vessel_id_mapping (
    old_vessel_id INTEGER,
    new_ship_id UUID,
    migration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (old_vessel_id),
    FOREIGN KEY (new_ship_id) REFERENCES ships(id) ON DELETE CASCADE
);

-- Populate mapping table
INSERT INTO vessel_id_mapping (old_vessel_id, new_ship_id)
SELECT v.id, s.id
FROM vessels v
INNER JOIN ships s ON v.imo_number = s.imo_number
ON CONFLICT (old_vessel_id) DO NOTHING;

-- ========================================
-- REFERENCE DATA: Fuel Types
-- ========================================
-- Ensure fuel_specifications is populated with all standard fuel types

INSERT INTO fuel_specifications (fuel_type, fuel_category, standard_density_kg_m3, standard_lower_calorific_value_mj_kg, default_tank_to_wake_ghg_gco2e_mj)
VALUES 
    ('MGO', 'FOSSIL', 890.0, 42.7, 74.5),
    ('MDO', 'FOSSIL', 900.0, 42.0, 77.4),
    ('HFO', 'FOSSIL', 991.0, 40.2, 77.4),
    ('LNG', 'FOSSIL', 450.0, 48.0, 56.0),
    ('BIO_MGO', 'BIOFUEL', 890.0, 42.5, 14.0),
    ('BIO_MDO', 'BIOFUEL', 900.0, 41.8, 14.0),
    ('E_METHANOL', 'E_FUEL', 792.0, 19.9, 0.0),
    ('E_AMMONIA', 'E_FUEL', 602.0, 18.6, 0.0)
ON CONFLICT (fuel_type) DO NOTHING;

-- ========================================
-- MASTER DATA SERVICE VIEW
-- ========================================
-- Consolidated view for master data service endpoints

CREATE OR REPLACE VIEW vw_master_data_summary AS
SELECT 
    'ships' as entity_type,
    COUNT(*)::text as total_count,
    COUNT(*) FILTER (WHERE is_active = TRUE)::text as active_count,
    MAX(updated_at) as last_updated
FROM ships
UNION ALL
SELECT 
    'organizations',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE is_active = TRUE)::text,
    MAX(updated_at)
FROM organizations
UNION ALL
SELECT 
    'users',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE is_active = TRUE)::text,
    MAX(updated_at)
FROM users
UNION ALL
SELECT 
    'ports',
    COUNT(*)::text,
    COUNT(*) FILTER (WHERE is_active = TRUE)::text,
    MAX(updated_at)
FROM ports
UNION ALL
SELECT 
    'voyages',
    COUNT(*)::text,
    COUNT(*)::text,
    MAX(updated_at)
FROM voyages;

-- ========================================
-- CONSISTENCY FUNCTIONS
-- ========================================

-- Function to get vessel display name consistently across all pages
CREATE OR REPLACE FUNCTION get_vessel_display_name(vessel_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    display_name TEXT;
BEGIN
    SELECT name || ' (' || imo_number || ')' 
    INTO display_name
    FROM ships 
    WHERE id = vessel_id_param;
    
    RETURN COALESCE(display_name, 'Unknown Vessel');
END;
$$ LANGUAGE plpgsql;

-- Function to get organization display name
CREATE OR REPLACE FUNCTION get_organization_display_name(org_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    display_name TEXT;
BEGIN
    SELECT name 
    INTO display_name
    FROM organizations 
    WHERE id = org_id_param;
    
    RETURN COALESCE(display_name, 'Unknown Organization');
END;
$$ LANGUAGE plpgsql;

-- Function to get user display name
CREATE OR REPLACE FUNCTION get_user_display_name(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    display_name TEXT;
BEGIN
    SELECT first_name || ' ' || last_name 
    INTO display_name
    FROM users 
    WHERE id = user_id_param;
    
    RETURN COALESCE(display_name, 'Unknown User');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Ensure all foreign key columns are indexed
CREATE INDEX IF NOT EXISTS idx_voyages_ship_id ON voyages(ship_id);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_voyage_id ON fuel_consumption(voyage_id);
CREATE INDEX IF NOT EXISTS idx_user_vessel_assignments_ship_id ON user_vessel_assignments(ship_id);
CREATE INDEX IF NOT EXISTS idx_user_vessel_assignments_user_id ON user_vessel_assignments(user_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ships_org_active ON ships(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_voyages_ship_dates ON voyages(ship_id, departure_date, arrival_date);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(organization_id, role) WHERE is_active = TRUE;

-- ========================================
-- DATA QUALITY CONSTRAINTS
-- ========================================

-- Ensure ships have required fields for consistency
ALTER TABLE ships ALTER COLUMN name SET NOT NULL;
ALTER TABLE ships ALTER COLUMN imo_number SET NOT NULL;
ALTER TABLE ships ALTER COLUMN ship_type SET NOT NULL;
ALTER TABLE ships ALTER COLUMN flag_state SET NOT NULL;

-- Ensure organizations have required fields
ALTER TABLE organizations ALTER COLUMN name SET NOT NULL;
ALTER TABLE organizations ALTER COLUMN registration_country SET NOT NULL;

-- ========================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ========================================

-- Fleet summary (cached for dashboard performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_fleet_summary AS
SELECT 
    s.organization_id,
    COUNT(DISTINCT s.id) as total_vessels,
    COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'IN_PROGRESS') as active_voyages,
    COUNT(DISTINCT s.id) FILTER (WHERE s.operational_status = 'IN_PORT') as vessels_in_port,
    SUM(s.gross_tonnage) as total_gross_tonnage,
    AVG(s.cii_rating::text) FILTER (WHERE s.cii_rating IS NOT NULL) as avg_cii_rating,
    SUM(v.eu_ets_eua_exposure_tco2) as total_eua_exposure,
    NOW() as last_refreshed
FROM ships s
LEFT JOIN voyages v ON s.id = v.ship_id
WHERE s.is_active = TRUE AND s.is_deleted = FALSE
GROUP BY s.organization_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_fleet_summary_org ON mv_fleet_summary(organization_id);

-- Function to refresh fleet summary
CREATE OR REPLACE FUNCTION refresh_fleet_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fleet_summary;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- MASTER DATA API HELPER VIEWS
-- ========================================

-- View for vessel dropdown/selection across all pages
CREATE OR REPLACE VIEW vw_vessel_selector AS
SELECT 
    id as value,
    name as label,
    imo_number,
    ship_type,
    operational_status,
    organization_id,
    name || ' (' || imo_number || ')' as display_name,
    CASE 
        WHEN operational_status = 'ACTIVE' THEN 1
        WHEN operational_status = 'IN_PORT' THEN 2
        ELSE 3
    END as sort_order
FROM ships
WHERE is_active = TRUE AND is_deleted = FALSE
ORDER BY sort_order, name;

-- View for organization dropdown
CREATE OR REPLACE VIEW vw_organization_selector AS
SELECT 
    id as value,
    name as label,
    organization_type,
    name as display_name
FROM organizations
WHERE is_active = TRUE
ORDER BY name;

-- View for user dropdown
CREATE OR REPLACE VIEW vw_user_selector AS
SELECT 
    id as value,
    email as label,
    first_name || ' ' || last_name as display_name,
    role,
    organization_id
FROM users
WHERE is_active = TRUE AND is_deleted = FALSE
ORDER BY last_name, first_name;

-- View for port dropdown
CREATE OR REPLACE VIEW vw_port_selector AS
SELECT 
    id as value,
    port_name as label,
    port_name || ', ' || country as display_name,
    country,
    latitude,
    longitude
FROM ports
WHERE is_active = TRUE
ORDER BY port_name;

-- ========================================
-- CONSISTENCY TRIGGERS
-- ========================================

-- Trigger to update organization vessel count
CREATE OR REPLACE FUNCTION update_org_vessel_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This would update a cached count in organizations table if needed
    -- For now, we'll use the materialized view instead
    PERFORM refresh_fleet_summary();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- DATA VALIDATION FUNCTIONS
-- ========================================

-- Function to validate IMO number format
CREATE OR REPLACE FUNCTION validate_imo_number(imo TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- IMO number should be 7 digits
    RETURN imo ~ '^[0-9]{7}$';
END;
$$ LANGUAGE plpgsql;

-- Function to check vessel availability
CREATE OR REPLACE FUNCTION is_vessel_available(vessel_id_param UUID, start_date DATE, end_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    voyage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO voyage_count
    FROM voyages
    WHERE ship_id = vessel_id_param
    AND status IN ('IN_PROGRESS', 'SCHEDULED')
    AND (
        (departure_date BETWEEN start_date AND end_date)
        OR (arrival_date BETWEEN start_date AND end_date)
        OR (departure_date <= start_date AND arrival_date >= end_date)
    );
    
    RETURN voyage_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE ships IS 'MASTER TABLE: Single source of truth for all vessel data. Referenced by all pages requiring vessel information.';
COMMENT ON TABLE organizations IS 'MASTER TABLE: Single source of truth for all organization/company data.';
COMMENT ON TABLE users IS 'MASTER TABLE: Single source of truth for all user data.';
COMMENT ON TABLE ports IS 'MASTER TABLE: Single source of truth for all port data.';

COMMENT ON VIEW vw_vessels_master IS 'Simplified vessel view for pages that don''t need all 100+ columns from ships table.';
COMMENT ON VIEW vw_organizations_master IS 'Filtered view of active organizations for dropdowns and displays.';
COMMENT ON VIEW vw_users_master IS 'Filtered view of active users for dropdowns and displays.';
COMMENT ON VIEW vw_port_selector IS 'Port dropdown data with display formatting.';

COMMENT ON MATERIALIZED VIEW mv_fleet_summary IS 'Cached fleet statistics for dashboard performance. Refresh with refresh_fleet_summary().';

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

GRANT SELECT ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO PUBLIC;
GRANT SELECT ON ALL MATERIALIZED VIEWS IN SCHEMA public TO PUBLIC;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Log migration
DO $$
BEGIN
    RAISE NOTICE 'Master Data Consolidation Schema Applied Successfully';
    RAISE NOTICE 'Primary Tables: ships (%), organizations (%), users (%), ports (%)',
        (SELECT COUNT(*) FROM ships),
        (SELECT COUNT(*) FROM organizations),
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM ports);
    RAISE NOTICE 'Views Created: vw_vessels_master, vw_organizations_master, vw_users_master, vw_port_selector';
    RAISE NOTICE 'Materialized View: mv_fleet_summary';
END $$;

