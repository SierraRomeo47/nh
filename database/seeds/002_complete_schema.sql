-- ========================================
-- NAUTILUS HORIZON - COMPLETE DATABASE SCHEMA
-- ========================================
-- Creates all tables required by all microservices
-- Date: November 14, 2025
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CORE TABLES
-- ========================================

-- Organizations (Shipping companies)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    imo_company_number VARCHAR(7) UNIQUE,
    registration_country VARCHAR(3) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Ships/Vessels
CREATE TABLE IF NOT EXISTS ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imo_number VARCHAR(7) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ship_type VARCHAR(100),
    gross_tonnage INTEGER,
    deadweight_tonnage INTEGER,
    engine_power_kw INTEGER,
    flag_state VARCHAR(3) NOT NULL,
    year_built INTEGER,
    classification_society VARCHAR(100),
    operational_status VARCHAR(50) DEFAULT 'ACTIVE',
    current_port VARCHAR(100),
    current_location_lat DECIMAL(10, 7),
    current_location_lon DECIMAL(10, 7),
    min_speed DECIMAL(5, 2),
    max_speed DECIMAL(5, 2),
    design_speed DECIMAL(5, 2),
    length_overall DECIMAL(8, 2),
    beam DECIMAL(8, 2),
    draft DECIMAL(6, 2),
    fuel_capacity_mt DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Ports
CREATE TABLE IF NOT EXISTS ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unlocode VARCHAR(5) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(2) NOT NULL,
    country_name VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FLEET MANAGEMENT
-- ========================================

-- Fleets
CREATE TABLE IF NOT EXISTS fleets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fleet-Vessel Relationships
CREATE TABLE IF NOT EXISTS fleet_vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fleet_id UUID REFERENCES fleets(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fleet_id, ship_id)
);

-- User-Fleet Assignments
CREATE TABLE IF NOT EXISTS user_fleet_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fleet_id UUID REFERENCES fleets(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, fleet_id)
);

-- User-Vessel Assignments  
CREATE TABLE IF NOT EXISTS user_vessel_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, ship_id)
);

-- ========================================
-- VOYAGES
-- ========================================

-- Voyages
CREATE TABLE IF NOT EXISTS voyages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voyage_id VARCHAR(100) UNIQUE NOT NULL,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    voyage_type VARCHAR(50) DEFAULT 'COMMERCIAL',
    start_date DATE NOT NULL,
    end_date DATE,
    start_port VARCHAR(100),
    end_port VARCHAR(100),
    charter_type VARCHAR(50),
    charterer_org_id UUID REFERENCES organizations(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    distance_nm DECIMAL(10, 2),
    fuel_consumed_mt DECIMAL(10, 2),
    co2_emissions_mt DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voyage Legs
CREATE TABLE IF NOT EXISTS voyage_legs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    departure_port VARCHAR(100),
    departure_port_unlocode VARCHAR(5),
    arrival_port VARCHAR(100),
    arrival_port_unlocode VARCHAR(5),
    departure_date TIMESTAMP WITH TIME ZONE,
    arrival_date TIMESTAMP WITH TIME ZONE,
    distance_nm DECIMAL(10, 2),
    average_speed_kts DECIMAL(5, 2),
    cargo_weight_mt DECIMAL(10, 2),
    ballast_voyage BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FUEL & CONSUMPTION
-- ========================================

-- Fuel Consumption
CREATE TABLE IF NOT EXISTS fuel_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id),
    fuel_type VARCHAR(50) NOT NULL,
    fuel_category VARCHAR(50),
    consumption_tonnes DECIMAL(10, 4) NOT NULL,
    consumption_period_start TIMESTAMP WITH TIME ZONE,
    consumption_period_end TIMESTAMP WITH TIME ZONE,
    distance_nm DECIMAL(10, 2),
    co2_emissions_mt DECIMAL(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Noon Reports
CREATE TABLE IF NOT EXISTS noon_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voyage_id UUID REFERENCES voyages(id),
    ship_id UUID REFERENCES ships(id) NOT NULL,
    report_date DATE NOT NULL,
    report_time TIME NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    course DECIMAL(5, 2),
    speed_kts DECIMAL(5, 2),
    distance_traveled_nm DECIMAL(10, 2),
    distance_to_go_nm DECIMAL(10, 2),
    fuel_consumed_mt DECIMAL(10, 4),
    fuel_rob_mt DECIMAL(10, 4),
    weather_conditions TEXT,
    sea_state VARCHAR(50),
    wind_force INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bunker Reports
CREATE TABLE IF NOT EXISTS bunker_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID REFERENCES ships(id) NOT NULL,
    voyage_id UUID REFERENCES voyages(id),
    bunkering_port VARCHAR(100),
    bunker_date DATE NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    quantity_mt DECIMAL(10, 4) NOT NULL,
    price_per_mt DECIMAL(10, 2),
    total_cost DECIMAL(12, 2),
    supplier_name VARCHAR(255),
    sulphur_content DECIMAL(5, 4),
    density DECIMAL(6, 4),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statement of Facts (SOF) Reports
CREATE TABLE IF NOT EXISTS sof_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID REFERENCES ships(id) NOT NULL,
    voyage_id UUID REFERENCES voyages(id),
    port_name VARCHAR(255) NOT NULL,
    terminal_name VARCHAR(255),
    berth_number VARCHAR(50),
    arrival_time TIMESTAMP WITH TIME ZONE,
    berthing_time TIMESTAMP WITH TIME ZONE,
    commence_loading_time TIMESTAMP WITH TIME ZONE,
    complete_loading_time TIMESTAMP WITH TIME ZONE,
    unberthing_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    cargo_loaded_mt DECIMAL(10, 2),
    cargo_discharged_mt DECIMAL(10, 2),
    laytime_used_hours DECIMAL(10, 2),
    demurrage_hours DECIMAL(10, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- OVD (Onboard Vessel Data) INTEGRATION
-- ========================================

-- OVD Sync Configuration
CREATE TABLE IF NOT EXISTS ovd_sync_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_name VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    sync_direction VARCHAR(20) NOT NULL,
    schedule_frequency VARCHAR(50),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OVD Sync History
CREATE TABLE IF NOT EXISTS ovd_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_config_id UUID REFERENCES ovd_sync_config(id),
    sync_type VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    initiated_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- OVD File Metadata
CREATE TABLE IF NOT EXISTS ovd_file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_type VARCHAR(50),
    operation_type VARCHAR(50),
    checksum VARCHAR(64),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OVD Import Validation Errors
CREATE TABLE IF NOT EXISTS ovd_import_validation_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_history_id UUID REFERENCES ovd_sync_history(id),
    file_metadata_id UUID REFERENCES ovd_file_metadata(id),
    row_number INTEGER,
    field_name VARCHAR(100),
    error_type VARCHAR(50),
    error_message TEXT,
    raw_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OVD Audit Log
CREATE TABLE IF NOT EXISTS ovd_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action_type VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- COMPLIANCE & EMISSIONS
-- ========================================

-- EU ETS Compliance
CREATE TABLE IF NOT EXISTS ets_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID REFERENCES ships(id),
    reporting_year INTEGER NOT NULL,
    total_co2_emissions_mt DECIMAL(12, 4),
    covered_emissions_mt DECIMAL(12, 4),
    allowances_required INTEGER,
    allowances_surrendered INTEGER,
    compliance_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FuelEU Maritime Compliance
CREATE TABLE IF NOT EXISTS fueleu_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ship_id UUID REFERENCES ships(id),
    reporting_year INTEGER NOT NULL,
    ghg_intensity DECIMAL(10, 6),
    target_ghg_intensity DECIMAL(10, 6),
    compliance_balance DECIMAL(12, 4),
    pooling_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MARKET DATA (for EUA prices, etc.)
-- ========================================

-- EUA Market Prices
CREATE TABLE IF NOT EXISTS eua_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price_date DATE NOT NULL UNIQUE,
    price_eur DECIMAL(10, 2) NOT NULL,
    volume INTEGER,
    high_eur DECIMAL(10, 2),
    low_eur DECIMAL(10, 2),
    change_pct DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Ships indexes
CREATE INDEX IF NOT EXISTS idx_ships_imo ON ships(imo_number);
CREATE INDEX IF NOT EXISTS idx_ships_organization ON ships(organization_id);
CREATE INDEX IF NOT EXISTS idx_ships_type ON ships(ship_type);

-- Voyages indexes
CREATE INDEX IF NOT EXISTS idx_voyages_ship ON voyages(ship_id);
CREATE INDEX IF NOT EXISTS idx_voyages_status ON voyages(status);
CREATE INDEX IF NOT EXISTS idx_voyages_dates ON voyages(start_date, end_date);

-- Ports indexes
CREATE INDEX IF NOT EXISTS idx_ports_unlocode ON ports(unlocode);
CREATE INDEX IF NOT EXISTS idx_ports_country ON ports(country_code);

-- Fuel consumption indexes
CREATE INDEX IF NOT EXISTS idx_fuel_voyage ON fuel_consumption(voyage_id);
CREATE INDEX IF NOT EXISTS idx_fuel_ship ON fuel_consumption(ship_id);

-- Fleet indexes
CREATE INDEX IF NOT EXISTS idx_fleets_org ON fleets(organization_id);
CREATE INDEX IF NOT EXISTS idx_fleet_vessels_fleet ON fleet_vessels(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleet_vessels_ship ON fleet_vessels(ship_id);

