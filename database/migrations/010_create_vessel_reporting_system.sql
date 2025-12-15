-- DNV-Standard Vessel Reporting System
-- Implements Noon Reports, Bunker Reports, and SOF (Statement of Facts)
-- Based on DNV OVD and maritime industry standards

-- ==============================================
-- NOON REPORTS (Daily Position and Performance)
-- ==============================================
CREATE TABLE IF NOT EXISTS noon_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    report_time TIME,
    report_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Position Information
    latitude_degrees DECIMAL(8,6),
    latitude_direction VARCHAR(1) CHECK (latitude_direction IN ('N', 'S')),
    longitude_degrees DECIMAL(9,6),
    longitude_direction VARCHAR(1) CHECK (longitude_direction IN ('E', 'W')),
    position_description TEXT,
    
    -- Voyage Information
    voyage_leg INTEGER,
    voyage_type VARCHAR(20) CHECK (voyage_type IN ('LADEN', 'BALLAST', 'IN_PORT')),
    course_degrees DECIMAL(5,2),
    distance_to_go_nm DECIMAL(10,2),
    distance_sailed_24h_nm DECIMAL(10,2),
    eta_next_port TIMESTAMP WITH TIME ZONE,
    next_port VARCHAR(100),
    
    -- Speed and Performance
    average_speed_knots DECIMAL(5,2),
    engine_rpm DECIMAL(6,2),
    slip_percentage DECIMAL(5,2),
    
    -- Weather Conditions
    wind_direction_degrees DECIMAL(5,2),
    wind_force_beaufort INTEGER CHECK (wind_force_beaufort BETWEEN 0 AND 12),
    wind_speed_knots DECIMAL(5,2),
    sea_state INTEGER CHECK (sea_state BETWEEN 0 AND 9),
    swell_height_m DECIMAL(4,2),
    swell_direction_degrees DECIMAL(5,2),
    current_direction_degrees DECIMAL(5,2),
    current_speed_knots DECIMAL(4,2),
    air_temperature_c DECIMAL(5,2),
    sea_temperature_c DECIMAL(5,2),
    barometric_pressure_mbar DECIMAL(7,2),
    visibility VARCHAR(20),
    
    -- Cargo Information
    cargo_on_board_mt DECIMAL(15,3),
    cargo_grade VARCHAR(100),
    cargo_temperature_c DECIMAL(5,2),
    ballast_on_board_mt DECIMAL(15,3),
    
    -- Fuel Consumption (24 hours)
    me_fo_consumption_mt DECIMAL(8,3), -- Main Engine Fuel Oil
    me_do_consumption_mt DECIMAL(8,3), -- Main Engine Diesel Oil
    me_lng_consumption_mt DECIMAL(8,3), -- Main Engine LNG
    ae_consumption_mt DECIMAL(8,3), -- Auxiliary Engine
    boiler_consumption_mt DECIMAL(8,3),
    total_fo_consumption_mt DECIMAL(8,3),
    
    -- Fuel ROB (Remain On Board)
    fo_rob_mt DECIMAL(10,3),
    do_rob_mt DECIMAL(10,3),
    lng_rob_mt DECIMAL(10,3),
    lub_oil_rob_mt DECIMAL(8,3),
    fresh_water_rob_mt DECIMAL(10,3),
    
    -- Engine Performance
    me_running_hours DECIMAL(6,2),
    ae_running_hours DECIMAL(6,2),
    me_power_output_percentage DECIMAL(5,2),
    
    -- Remarks and Events
    remarks TEXT,
    heavy_weather BOOLEAN DEFAULT false,
    reduced_speed BOOLEAN DEFAULT false,
    engine_trouble BOOLEAN DEFAULT false,
    delays TEXT,
    
    -- Reporting
    reported_by VARCHAR(100),
    reported_to VARCHAR(100),
    master_name VARCHAR(100),
    chief_engineer_name VARCHAR(100),
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(ship_id, report_date)
);

-- ==============================================
-- BUNKER REPORTS (Fuel Bunkering Operations)
-- ==============================================
CREATE TABLE IF NOT EXISTS bunker_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    voyage_id UUID REFERENCES voyages(id) ON DELETE SET NULL,
    
    -- Bunker Operation Details
    bunkering_port VARCHAR(100) NOT NULL,
    bunkering_port_unlocode VARCHAR(10),
    bunker_date DATE NOT NULL,
    bunker_start_time TIMESTAMP WITH TIME ZONE,
    bunker_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Fuel Details
    fuel_type VARCHAR(50) NOT NULL, -- HFO, VLSFO, LSMGO, MGO, LNG, etc.
    fuel_grade VARCHAR(50),
    quantity_received_mt DECIMAL(10,3) NOT NULL,
    quantity_ordered_mt DECIMAL(10,3),
    temperature_c DECIMAL(5,2),
    
    -- Supplier Information
    supplier_name VARCHAR(200) NOT NULL,
    supplier_contact VARCHAR(200),
    barge_name VARCHAR(100),
    delivery_note_number VARCHAR(100) UNIQUE,
    delivery_note_date DATE,
    
    -- Fuel Quality Specifications
    density_15c_kg_m3 DECIMAL(8,4),
    viscosity_50c_cst DECIMAL(8,4),
    sulphur_content_pct DECIMAL(6,4),
    flash_point_c DECIMAL(5,2),
    pour_point_c DECIMAL(5,2),
    water_content_pct DECIMAL(5,4),
    ash_content_pct DECIMAL(5,4),
    carbon_residue_pct DECIMAL(5,4),
    
    -- Calorific Values
    lower_calorific_value_mj_kg DECIMAL(8,4),
    higher_calorific_value_mj_kg DECIMAL(8,4),
    
    -- Chemical Composition (for emissions calculations)
    carbon_content_pct DECIMAL(6,4),
    hydrogen_content_pct DECIMAL(6,4),
    nitrogen_content_pct DECIMAL(6,4),
    
    -- Biofuel/Alternative Fuel Properties
    biofuel_component BOOLEAN DEFAULT false,
    biofuel_percentage DECIMAL(5,2),
    biofuel_type VARCHAR(50),
    sustainability_certificate VARCHAR(100),
    ghg_emission_factor_gco2_mj DECIMAL(8,4),
    
    -- Financial
    unit_price_usd_per_mt DECIMAL(10,2),
    total_cost_usd DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- ROB Before and After
    rob_before_mt DECIMAL(10,3),
    rob_after_mt DECIMAL(10,3),
    
    -- Quality Testing
    sample_taken BOOLEAN DEFAULT false,
    sample_number VARCHAR(50),
    lab_test_results JSONB,
    quality_acceptance_status VARCHAR(20) CHECK (quality_acceptance_status IN ('ACCEPTED', 'DISPUTED', 'REJECTED', 'PENDING')),
    
    -- Certificates and Documentation
    certificate_of_quality TEXT,
    certificate_of_origin VARCHAR(100),
    marpol_certificate TEXT,
    
    -- Approval and Verification
    approved_by VARCHAR(100),
    approved_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(100),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- SOF REPORTS (Statement of Facts - Port Events)
-- ==============================================
CREATE TABLE IF NOT EXISTS sof_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    voyage_id UUID REFERENCES voyages(id) ON DELETE SET NULL,
    
    -- Port Information
    port_name VARCHAR(100) NOT NULL,
    port_unlocode VARCHAR(10),
    terminal_name VARCHAR(200),
    berth_number VARCHAR(50),
    
    -- Arrival Information
    arrival_pilot_station TIMESTAMP WITH TIME ZONE,
    arrival_anchorage TIMESTAMP WITH TIME ZONE,
    arrival_berth TIMESTAMP WITH TIME ZONE,
    all_fast TIMESTAMP WITH TIME ZONE, -- Moored and secure
    
    -- Documentation
    nor_tendered TIMESTAMP WITH TIME ZONE, -- Notice of Readiness
    nor_accepted TIMESTAMP WITH TIME ZONE,
    free_pratique_granted TIMESTAMP WITH TIME ZONE,
    customs_clearance TIMESTAMP WITH TIME ZONE,
    
    -- Cargo Operations
    cargo_operation_commenced TIMESTAMP WITH TIME ZONE,
    cargo_operation_completed TIMESTAMP WITH TIME ZONE,
    hoses_connected TIMESTAMP WITH TIME ZONE,
    hoses_disconnected TIMESTAMP WITH TIME ZONE,
    
    -- Cargo Details
    cargo_type VARCHAR(100),
    cargo_loaded_mt DECIMAL(15,3),
    cargo_discharged_mt DECIMAL(15,3),
    loading_rate_mt_hr DECIMAL(10,2),
    discharge_rate_mt_hr DECIMAL(10,2),
    
    -- Ballast Operations
    ballast_loaded_mt DECIMAL(10,3),
    ballast_discharged_mt DECIMAL(10,3),
    
    -- Delays and Interruptions
    waiting_for_berth_hours DECIMAL(8,2),
    weather_delay_hours DECIMAL(8,2),
    cargo_delay_hours DECIMAL(8,2),
    equipment_delay_hours DECIMAL(8,2),
    other_delay_hours DECIMAL(8,2),
    delay_reasons TEXT,
    
    -- Departure Information
    cargo_documents_received TIMESTAMP WITH TIME ZONE,
    port_clearance_granted TIMESTAMP WITH TIME ZONE,
    pilot_on_board_departure TIMESTAMP WITH TIME ZONE,
    last_line_let_go TIMESTAMP WITH TIME ZONE,
    departure_pilot_station TIMESTAMP WITH TIME ZONE,
    
    -- Time Calculations
    time_at_berth_hours DECIMAL(8,2),
    time_in_port_hours DECIMAL(8,2),
    laytime_used_hours DECIMAL(8,2),
    allowed_laytime_hours DECIMAL(8,2),
    demurrage_hours DECIMAL(8,2),
    despatch_hours DECIMAL(8,2),
    
    -- Port Costs and Services
    port_charges_usd DECIMAL(12,2),
    pilotage_charges_usd DECIMAL(10,2),
    tug_charges_usd DECIMAL(10,2),
    agency_fees_usd DECIMAL(10,2),
    other_charges_usd DECIMAL(10,2),
    
    -- Services
    tugs_used INTEGER,
    pilots_used INTEGER,
    surveyors_attended TEXT[],
    
    -- Bunker Operations During Port Stay
    bunker_operation BOOLEAN DEFAULT false,
    bunker_quantity_mt DECIMAL(10,3),
    bunker_type VARCHAR(50),
    
    -- Fresh Water
    fresh_water_received_mt DECIMAL(8,3),
    
    -- Agent and Officials
    agent_name VARCHAR(200),
    agent_contact VARCHAR(200),
    port_captain_name VARCHAR(100),
    customs_officer_name VARCHAR(100),
    
    -- Remarks
    general_remarks TEXT,
    protest_issued BOOLEAN DEFAULT false,
    protest_details TEXT,
    
    -- Sign-off
    master_signature VARCHAR(100),
    chief_officer_signature VARCHAR(100),
    agent_signature VARCHAR(100),
    sof_issued_date DATE,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_noon_reports_ship_date ON noon_reports(ship_id, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_noon_reports_voyage ON noon_reports(voyage_id);
CREATE INDEX IF NOT EXISTS idx_noon_reports_date ON noon_reports(report_date DESC);

CREATE INDEX IF NOT EXISTS idx_bunker_reports_ship ON bunker_reports(ship_id, bunker_date DESC);
CREATE INDEX IF NOT EXISTS idx_bunker_reports_port ON bunker_reports(bunkering_port);
CREATE INDEX IF NOT EXISTS idx_bunker_reports_supplier ON bunker_reports(supplier_name);
CREATE INDEX IF NOT EXISTS idx_bunker_reports_bdn ON bunker_reports(delivery_note_number);

CREATE INDEX IF NOT EXISTS idx_sof_reports_ship ON sof_reports(ship_id);
CREATE INDEX IF NOT EXISTS idx_sof_reports_port ON sof_reports(port_name);
CREATE INDEX IF NOT EXISTS idx_sof_reports_arrival ON sof_reports(arrival_berth);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_noon_reports_updated_at
    BEFORE UPDATE ON noon_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bunker_reports_updated_at
    BEFORE UPDATE ON bunker_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sof_reports_updated_at
    BEFORE UPDATE ON sof_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE noon_reports IS 'Daily vessel position and performance reports following DNV OVD standards';
COMMENT ON TABLE bunker_reports IS 'Fuel bunkering operations with quality specifications per ISO 8217';
COMMENT ON TABLE sof_reports IS 'Statement of Facts for port calls with laytime calculations';

COMMENT ON COLUMN noon_reports.me_fo_consumption_mt IS 'Main Engine Fuel Oil consumption in last 24 hours';
COMMENT ON COLUMN noon_reports.distance_sailed_24h_nm IS 'Distance sailed in last 24 hours (noon to noon)';
COMMENT ON COLUMN bunker_reports.delivery_note_number IS 'Bunker Delivery Note (BDN) number - unique identifier';
COMMENT ON COLUMN sof_reports.all_fast IS 'Vessel moored and all lines secured';
COMMENT ON COLUMN sof_reports.nor_tendered IS 'Notice of Readiness tendered to charterer/receiver';

