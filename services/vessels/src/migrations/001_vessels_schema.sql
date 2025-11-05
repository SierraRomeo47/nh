-- Vessels and Organizations Schema
-- Core maritime entity tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Utility function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Indexes
CREATE INDEX idx_ships_imo ON ships(imo_number);
CREATE INDEX idx_ships_organization_id ON ships(organization_id);
CREATE INDEX idx_voyages_ship_id ON voyages(ship_id);
CREATE INDEX idx_voyages_start_date ON voyages(start_date);
CREATE INDEX idx_voyage_legs_voyage_id ON voyage_legs(voyage_id);

-- Triggers
CREATE TRIGGER update_ships_updated_at BEFORE UPDATE ON ships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voyages_updated_at BEFORE UPDATE ON voyages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
