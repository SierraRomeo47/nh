-- Maritime Compliance Database Schema
-- Designed for EU ETS, FuelEU Maritime, and IMO DCS compliance
-- Meets latest data standards for verifier authentication

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Energy Efficiency Technologies Table
CREATE TABLE energy_efficiency_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    technology_type VARCHAR(50) NOT NULL, -- MEWIS_DUCT, WIND_TURBINES, OPS, SHAFT_GENERATOR, etc.
    technology_name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    installation_date DATE NOT NULL,
    certification VARCHAR(100),
    
    -- Performance Specifications
    rated_power_kw DECIMAL(10,2),
    efficiency_gain_pct DECIMAL(5,2),
    fuel_savings_potential_pct DECIMAL(5,2),
    co2_reduction_potential_pct DECIMAL(5,2),
    
    -- Operational Parameters
    operational_hours DECIMAL(10,2),
    availability_pct DECIMAL(5,2),
    maintenance_interval_months INTEGER,
    last_maintenance_date DATE,
    
    -- Financial Information
    installation_cost_eur DECIMAL(15,2),
    annual_maintenance_cost_eur DECIMAL(10,2),
    payback_period_years DECIMAL(5,2),
    
    -- Status and Compliance
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, MAINTENANCE, REPAIR
    compliance_status VARCHAR(50) DEFAULT 'COMPLIANT', -- COMPLIANT, NON_COMPLIANT, PENDING
    verification_required BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Fuel Specifications Table (DNV/LR/ABS Standards)
CREATE TABLE fuel_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fuel_type VARCHAR(50) UNIQUE NOT NULL,
    fuel_category VARCHAR(20) NOT NULL, -- FOSSIL, BIOFUEL, E_FUEL, HYBRID
    
    -- Standard Properties (DNV Guidelines)
    standard_density_kg_m3 DECIMAL(8,2),
    standard_lower_calorific_value_mj_kg DECIMAL(8,2),
    standard_higher_calorific_value_mj_kg DECIMAL(8,2),
    standard_sulphur_content_pct DECIMAL(5,3),
    standard_carbon_content_pct DECIMAL(5,3),
    standard_hydrogen_content_pct DECIMAL(5,3),
    
    -- Default GHG Emissions (Well-to-Wake)
    default_well_to_wake_ghg_gco2e_mj DECIMAL(10,6),
    default_tank_to_wake_ghg_gco2e_mj DECIMAL(10,6),
    default_well_to_tank_ghg_gco2e_mj DECIMAL(10,6),
    
    -- Regulatory Classifications
    imo_annex_vi_category VARCHAR(20),
    eu_red_ii_category VARCHAR(20),
    carbon_intensity_factor DECIMAL(10,6),
    
    -- Safety Properties
    flash_point_c DECIMAL(5,1),
    auto_ignition_temp_c DECIMAL(5,1),
    toxicity_class VARCHAR(20),
    corrosiveness_class VARCHAR(20),
    
    -- Engine Compatibility
    compatible_engine_types TEXT[], -- Array of compatible engine types
    retrofit_requirements TEXT,
    
    -- Certification Requirements
    required_certifications TEXT[], -- ISCC, RED II, etc.
    quality_standards TEXT[],
    
    -- Classification Society Approvals
    dnv_approved BOOLEAN DEFAULT FALSE,
    lr_approved BOOLEAN DEFAULT FALSE,
    abs_approved BOOLEAN DEFAULT FALSE,
    approval_certificate_numbers TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Organizations (Shipping companies, charterers, etc.)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    imo_company_number VARCHAR(7) UNIQUE,
    registration_country VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Ships
CREATE TABLE ships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imo_number VARCHAR(7) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ship_type VARCHAR(100),
    gross_tonnage INTEGER,
    deadweight_tonnage INTEGER,
    engine_power_kw INTEGER,
    flag_state VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    year_built INTEGER,
    classification_society VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Voyages
CREATE TABLE voyages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id VARCHAR(100) UNIQUE NOT NULL,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    voyage_type VARCHAR(50) DEFAULT 'COMMERCIAL', -- COMMERCIAL, BALLAST, etc.
    start_date DATE NOT NULL,
    end_date DATE,
    start_port VARCHAR(100),
    end_port VARCHAR(100),
    charter_type VARCHAR(50), -- SPOT_VOYAGE, TIME, BAREBOAT
    charterer_org_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'ACTIVE' -- ACTIVE, COMPLETED, CANCELLED
);

-- Voyage Legs (for multi-port voyages)
CREATE TABLE voyage_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    departure_port VARCHAR(100) NOT NULL,
    arrival_port VARCHAR(100) NOT NULL,
    departure_date TIMESTAMP WITH TIME ZONE,
    arrival_date TIMESTAMP WITH TIME ZONE,
    distance_nm DECIMAL(10,2),
    cargo_type VARCHAR(100),
    cargo_quantity DECIMAL(15,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fuel Consumption Data (IMO DCS) - Enhanced for DNV/LR/ABS Standards
CREATE TABLE fuel_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    leg_id UUID REFERENCES voyage_legs(id) ON DELETE CASCADE,
    
    -- Basic Fuel Information
    fuel_type VARCHAR(50) NOT NULL, -- MGO, MDO, HFO, LNG, BIO_MGO, BIO_MDO, E_METHANOL, E_AMMONIA, OPS, etc.
    fuel_category VARCHAR(20) NOT NULL, -- FOSSIL, BIOFUEL, E_FUEL, HYBRID, ELECTRIC, EFFICIENCY
    consumption_tonnes DECIMAL(15,3) NOT NULL,
    consumption_date DATE NOT NULL,
    
    -- Energy Source Type (for non-fuel energy)
    energy_source_type VARCHAR(50), -- FUEL, OPS, WIND_ASSISTED, EFFICIENCY_GAIN
    energy_consumption_kwh DECIMAL(15,3), -- For OPS and other electrical sources
    energy_consumption_gj DECIMAL(15,3), -- For efficiency gains and wind assistance
    
    -- Fuel Supplier and Documentation
    fuel_supplier VARCHAR(255),
    bunker_delivery_note VARCHAR(100),
    certificate_of_origin VARCHAR(100), -- For biofuels and e-fuels
    sustainability_certificate VARCHAR(100), -- ISCC, RED II, etc.
    
    -- Physical Properties (DNV Standards)
    density_kg_m3 DECIMAL(8,2),
    lower_calorific_value_mj_kg DECIMAL(8,2), -- Critical for biofuels and e-fuels
    higher_calorific_value_mj_kg DECIMAL(8,2),
    viscosity_cst DECIMAL(8,2),
    flash_point_c DECIMAL(5,1),
    
    -- Chemical Composition
    sulphur_content_pct DECIMAL(5,3),
    carbon_content_pct DECIMAL(5,3),
    hydrogen_content_pct DECIMAL(5,3),
    nitrogen_content_pct DECIMAL(5,3),
    oxygen_content_pct DECIMAL(5,3),
    ash_content_pct DECIMAL(5,3),
    water_content_pct DECIMAL(5,3),
    
    -- Biofuel Specific Properties (LR Standards)
    biofuel_feedstock VARCHAR(100), -- Rapeseed, Palm, Soy, Waste, etc.
    biofuel_blend_ratio_pct DECIMAL(5,2), -- Percentage of biofuel in blend
    biofuel_generation VARCHAR(20), -- 1G, 2G, 3G, 4G
    land_use_change_category VARCHAR(20), -- ILUC, dLUC, No LUC
    
    -- E-Fuel Specific Properties (ABS Standards)
    e_fuel_production_method VARCHAR(50), -- Electrolysis, Power-to-X, etc.
    renewable_electricity_source VARCHAR(50), -- Solar, Wind, Hydro, etc.
    carbon_source VARCHAR(50), -- Direct Air Capture, Industrial CO2, etc.
    well_to_tank_ghg_gco2e_mj DECIMAL(10,6), -- Well-to-tank emissions
    tank_to_wake_ghg_gco2e_mj DECIMAL(10,6), -- Tank-to-wake emissions
    well_to_wake_ghg_gco2e_mj DECIMAL(10,6), -- Total lifecycle emissions
    
    -- Safety and Handling (Classification Society Requirements)
    flash_point_category VARCHAR(20), -- Category A, B, C, D
    toxicity_level VARCHAR(20), -- Low, Medium, High, Very High
    corrosiveness_rating VARCHAR(20), -- Low, Medium, High
    storage_requirements TEXT, -- Special storage conditions
    handling_requirements TEXT, -- Special handling procedures
    
    -- Engine Compatibility
    engine_type VARCHAR(50), -- 2-stroke, 4-stroke, Dual-fuel, etc.
    engine_manufacturer VARCHAR(100),
    engine_model VARCHAR(100),
    retrofit_required BOOLEAN DEFAULT FALSE,
    retrofit_certificate VARCHAR(100),
    
    -- Quality Assurance
    quality_test_results JSONB, -- Detailed test results
    batch_number VARCHAR(100),
    production_date DATE,
    expiry_date DATE,
    
    -- Regulatory Compliance
    imo_annex_vi_compliant BOOLEAN DEFAULT TRUE,
    eu_red_ii_compliant BOOLEAN DEFAULT FALSE,
    iscc_certified BOOLEAN DEFAULT FALSE,
    rspo_certified BOOLEAN DEFAULT FALSE,
    
    -- Onshore Power Supply (OPS) Specific Fields
    ops_connection_time_hours DECIMAL(8,2), -- Hours connected to shore power
    ops_power_consumption_kw DECIMAL(10,2), -- Average power consumption during OPS
    ops_voltage_v DECIMAL(8,2), -- Connection voltage
    ops_frequency_hz DECIMAL(5,2), -- Connection frequency
    ops_connection_type VARCHAR(50), -- High voltage, Low voltage, etc.
    ops_certification VARCHAR(100), -- OPS system certification
    ops_emissions_factor_gco2e_kwh DECIMAL(10,6), -- Grid emissions factor
    
    -- Mewis Duct Efficiency Fields
    mewis_duct_installed BOOLEAN DEFAULT FALSE,
    mewis_duct_efficiency_gain_pct DECIMAL(5,2), -- Efficiency improvement percentage
    mewis_duct_fuel_savings_tonnes DECIMAL(10,3), -- Calculated fuel savings
    mewis_duct_installation_date DATE,
    mewis_duct_certification VARCHAR(100),
    
    -- Wind Turbines/Wind Assistance Fields
    wind_turbines_installed BOOLEAN DEFAULT FALSE,
    wind_turbines_count INTEGER,
    wind_turbines_power_kw DECIMAL(10,2), -- Total wind power capacity
    wind_turbines_efficiency_gain_pct DECIMAL(5,2), -- Efficiency improvement
    wind_turbines_fuel_savings_tonnes DECIMAL(10,3), -- Calculated fuel savings
    wind_turbines_installation_date DATE,
    wind_turbines_certification VARCHAR(100),
    wind_speed_avg_ms DECIMAL(5,2), -- Average wind speed during operation
    wind_direction_avg_deg DECIMAL(6,2), -- Average wind direction
    
    -- Other Energy Efficiency Technologies
    energy_efficiency_technologies TEXT[], -- Array of installed technologies
    total_efficiency_gain_pct DECIMAL(5,2), -- Combined efficiency improvement
    total_fuel_savings_tonnes DECIMAL(10,3), -- Total calculated fuel savings
    co2_reduction_tonnes DECIMAL(10,3), -- Total CO2 reduction achieved
    
    -- Verification and Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verifier_id UUID,
    verification_certificate VARCHAR(100),
    last_updated_by UUID,
    update_reason TEXT
);

-- EU ETS Data
CREATE TABLE eu_ets_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    reporting_year INTEGER NOT NULL,
    covered_share_pct DECIMAL(5,2) NOT NULL, -- 0-100
    total_co2_emissions_t DECIMAL(15,3) NOT NULL,
    eu_covered_emissions_t DECIMAL(15,3) NOT NULL,
    surrender_deadline DATE NOT NULL,
    allowances_required DECIMAL(15,3),
    allowances_surrendered DECIMAL(15,3),
    compliance_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLIANT, NON_COMPLIANT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verifier_id UUID
);

-- FuelEU Maritime Data
CREATE TABLE fueleu_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    reporting_year INTEGER NOT NULL,
    energy_in_scope_gj DECIMAL(20,3) NOT NULL,
    ghg_intensity_gco2e_per_mj DECIMAL(10,6) NOT NULL,
    compliance_balance_gco2e DECIMAL(20,3) NOT NULL,
    pooling_status VARCHAR(50) DEFAULT 'STANDALONE', -- STANDALONE, IN_POOL, POOL_LEADER
    pool_id UUID, -- References pooling arrangements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    verifier_id UUID
);

-- Verifiers (Accredited verification bodies)
CREATE TABLE verifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    accreditation_number VARCHAR(100) UNIQUE NOT NULL,
    accreditation_body VARCHAR(255) NOT NULL,
    accreditation_scope TEXT NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Verification Records
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verifier_id UUID REFERENCES verifiers(id),
    data_type VARCHAR(50) NOT NULL, -- FUEL_CONSUMPTION, EU_ETS, FUELEU
    reference_id UUID NOT NULL, -- References the specific data record
    verification_date DATE NOT NULL,
    verification_result VARCHAR(50) NOT NULL, -- VERIFIED, REJECTED, CONDITIONAL
    findings TEXT,
    recommendations TEXT,
    certificate_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pooling Arrangements (FuelEU)
CREATE TABLE pooling_arrangements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_name VARCHAR(255) NOT NULL,
    pool_leader_org_id UUID REFERENCES organizations(id),
    reporting_year INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Pool Participants
CREATE TABLE pool_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID REFERENCES pooling_arrangements(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(pool_id, organization_id)
);

-- RFQ System (FuelEU Pooling)
CREATE TABLE pool_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    reporting_year INTEGER NOT NULL,
    need_gco2e DECIMAL(20,3) NOT NULL, -- Positive for need, negative for surplus
    price_range_min DECIMAL(10,6),
    price_range_max DECIMAL(10,6),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, FILLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Pool Offers
CREATE TABLE pool_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES pool_rfqs(id) ON DELETE CASCADE,
    counterparty_org_id UUID REFERENCES organizations(id),
    offered_gco2e DECIMAL(20,3) NOT NULL,
    price_eur_per_gco2e DECIMAL(10,6) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EUA Trading Records
CREATE TABLE eua_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    trade_type VARCHAR(10) NOT NULL, -- BUY, SELL
    quantity_tco2 DECIMAL(15,3) NOT NULL,
    price_eur_per_tco2 DECIMAL(10,2) NOT NULL,
    trade_date DATE NOT NULL,
    counterparty VARCHAR(255),
    external_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Compliance Alerts
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    alert_type VARCHAR(50) NOT NULL, -- DEADLINE_APPROACHING, NON_COMPLIANCE, etc.
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_ships_imo ON ships(imo_number);
CREATE INDEX idx_voyages_ship_date ON voyages(ship_id, start_date);
CREATE INDEX idx_fuel_consumption_voyage ON fuel_consumption(voyage_id);
CREATE INDEX idx_eu_ets_voyage_year ON eu_ets_data(voyage_id, reporting_year);
CREATE INDEX idx_fueleu_voyage_year ON fueleu_data(voyage_id, reporting_year);
CREATE INDEX idx_verifications_verifier ON verifications(verifier_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_compliance_alerts_org_status ON compliance_alerts(organization_id, status);

-- Triggers for audit trail
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, record_id, operation, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_ships AFTER INSERT OR UPDATE OR DELETE ON ships
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_voyages AFTER INSERT OR UPDATE OR DELETE ON voyages
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_fuel_consumption AFTER INSERT OR UPDATE OR DELETE ON fuel_consumption
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_eu_ets_data AFTER INSERT OR UPDATE OR DELETE ON eu_ets_data
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_fueleu_data AFTER INSERT OR UPDATE OR DELETE ON fueleu_data
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
