-- Fleets Schema
-- Allow users to be assigned to multiple vessels or fleets

CREATE TABLE IF NOT EXISTS fleets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_vessels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fleet_id UUID REFERENCES fleets(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(fleet_id, ship_id)
);

CREATE TABLE IF NOT EXISTS user_fleet_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fleet_id UUID REFERENCES fleets(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, fleet_id)
);

CREATE TABLE IF NOT EXISTS user_vessel_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, ship_id)
);

-- Indexes
CREATE INDEX idx_fleet_vessels_fleet_id ON fleet_vessels(fleet_id);
CREATE INDEX idx_fleet_vessels_ship_id ON fleet_vessels(ship_id);
CREATE INDEX idx_user_fleet_assignments_user_id ON user_fleet_assignments(user_id);
CREATE INDEX idx_user_fleet_assignments_fleet_id ON user_fleet_assignments(fleet_id);
CREATE INDEX idx_user_vessel_assignments_user_id ON user_vessel_assignments(user_id);
CREATE INDEX idx_user_vessel_assignments_ship_id ON user_vessel_assignments(ship_id);

-- Insert 5 default fleets
INSERT INTO fleets (id, name, organization_id, description) VALUES
('f0000000-0000-0000-0000-000000000001', 'Container Fleet', '00000000-0000-0000-0000-000000000001', 'High-speed container shipping operations'),
('f0000000-0000-0000-0000-000000000002', 'Bulk Carrier Fleet', '00000000-0000-0000-0000-000000000001', 'Dry bulk cargo transportation'),
('f0000000-0000-0000-0000-000000000003', 'Tanker Fleet', '00000000-0000-0000-0000-000000000003', 'Crude oil and product tankers'),
('f0000000-0000-0000-0000-000000000004', 'LNG Fleet', '00000000-0000-0000-0000-000000000005', 'Liquefied natural gas carriers'),
('f0000000-0000-0000-0000-000000000005', 'Specialized Fleet', '00000000-0000-0000-0000-000000000001', 'Reefer, car carriers, and offshore support vessels');

-- Assign vessels to fleets
INSERT INTO fleet_vessels (fleet_id, ship_id) 
SELECT 'f0000000-0000-0000-0000-000000000001', id FROM ships WHERE ship_type = 'CONTAINER';

INSERT INTO fleet_vessels (fleet_id, ship_id) 
SELECT 'f0000000-0000-0000-0000-000000000002', id FROM ships WHERE ship_type = 'BULK_CARRIER';

INSERT INTO fleet_vessels (fleet_id, ship_id) 
SELECT 'f0000000-0000-0000-0000-000000000003', id FROM ships WHERE ship_type IN ('TANKER_CRUDE', 'TANKER_PRODUCT');

INSERT INTO fleet_vessels (fleet_id, ship_id) 
SELECT 'f0000000-0000-0000-0000-000000000004', id FROM ships WHERE ship_type = 'LNG_CARRIER';

INSERT INTO fleet_vessels (fleet_id, ship_id) 
SELECT 'f0000000-0000-0000-0000-000000000005', id FROM ships WHERE ship_type IN ('REEFER', 'CAR_CARRIER', 'OFFSHORE_SUPPORT', 'CEMENT_CARRIER', 'GENERAL_CARGO');

CREATE TRIGGER update_fleets_updated_at BEFORE UPDATE ON fleets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_fleet_assignments_updated_at BEFORE UPDATE ON user_fleet_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vessel_assignments_updated_at BEFORE UPDATE ON user_vessel_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


