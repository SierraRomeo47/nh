-- Add missing columns to ships table
ALTER TABLE ships ADD COLUMN IF NOT EXISTS min_speed DECIMAL(4,1);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS max_speed DECIMAL(4,1);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS port_consumption DECIMAL(6,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS sea_consumption DECIMAL(6,2);

-- Create a default organization if it doesn't exist
INSERT INTO organizations (id, name, imo_company_number, registration_country)
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Fleet', 'IMO0000001', 'SG')
ON CONFLICT (id) DO NOTHING;

-- Clear existing ships (only if you want to start fresh)
-- TRUNCATE ships CASCADE;

-- Insert comprehensive vessel data
INSERT INTO ships (imo_number, name, organization_id, ship_type, gross_tonnage, deadweight_tonnage, engine_power_kw, flag_state, year_built, classification_society, min_speed, max_speed, port_consumption, sea_consumption, is_active) VALUES
('9391001', 'Aurora Spirit', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31500, 47000, 8200, 'MHL', 2010, 'DNV', 12.0, 16.0, 8.0, 45.0, true),
('9391002', 'Baltic Star', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31700, 47500, 8200, 'LBR', 2011, 'DNV', 12.0, 16.0, 8.0, 45.0, true),
('9391003', 'Coral Wave', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31400, 46800, 8200, 'SGP', 2012, 'DNV', 12.0, 16.0, 8.0, 45.0, true),
('9391004', 'Delta Horizon', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31600, 47200, 8200, 'MHL', 2013, 'ABS', 12.0, 16.0, 8.0, 45.0, true),
('9391005', 'Eastern Crest', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31650, 47300, 8200, 'PAN', 2014, 'DNV', 12.0, 16.0, 8.0, 45.0, true),
('9391006', 'Fjord Runner', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31550, 47100, 8200, 'NOR', 2015, 'DNV', 12.0, 16.0, 8.0, 45.0, true),
('9391007', 'Gulf Pioneer', '00000000-0000-0000-0000-000000000001', 'MR Tanker', 31700, 47400, 8200, 'ARE', 2016, 'ABS', 12.0, 16.0, 8.0, 45.0, true),
('9445123', 'Pacific Voyager', '00000000-0000-0000-0000-000000000001', 'Aframax Tanker', 59500, 105000, 12800, 'LBR', 2008, 'DNV', 13.0, 15.5, 10.0, 55.0, true),
('9445124', 'Atlantic Trader', '00000000-0000-0000-0000-000000000001', 'Aframax Tanker', 60500, 107000, 12800, 'MHL', 2009, 'ABS', 13.0, 15.5, 10.0, 55.0, true),
('9445125', 'Indian Ocean', '00000000-0000-0000-0000-000000000001', 'Aframax Tanker', 60200, 106500, 12800, 'SGP', 2010, 'DNV', 13.0, 15.5, 10.0, 55.0, true),
('9556789', 'Suezmax Glory', '00000000-0000-0000-0000-000000000001', 'Suezmax Tanker', 85000, 158000, 16500, 'GRC', 2012, 'DNV', 14.0, 16.0, 12.0, 65.0, true),
('9556790', 'Mediterranean Pride', '00000000-0000-0000-0000-000000000001', 'Suezmax Tanker', 86000, 160000, 16500, 'MLT', 2013, 'ABS', 14.0, 16.0, 12.0, 65.0, true),
('9667890', 'VLCC Titan', '00000000-0000-0000-0000-000000000001', 'VLCC', 162000, 310000, 22500, 'LBR', 2015, 'DNV', 14.5, 16.5, 15.0, 80.0, true),
('9667891', 'VLCC Colossus', '00000000-0000-0000-0000-000000000001', 'VLCC', 164000, 315000, 22500, 'MHL', 2016, 'ABS', 14.5, 16.5, 15.0, 80.0, true),
('9778901', 'Container Express', '00000000-0000-0000-0000-000000000001', 'Container Ship', 92000, 85000, 48000, 'SGP', 2014, 'DNV', 18.0, 22.0, 12.0, 70.0, true),
('9778902', 'Swift Carrier', '00000000-0000-0000-0000-000000000001', 'Container Ship', 94000, 87000, 48000, 'PAN', 2015, 'ABS', 18.0, 22.0, 12.0, 70.0, true),
('9889012', 'Bulk Champion', '00000000-0000-0000-0000-000000000001', 'Bulk Carrier', 46000, 82000, 9500, 'HKG', 2011, 'DNV', 13.0, 14.5, 9.0, 50.0, true),
('9889013', 'Ore Master', '00000000-0000-0000-0000-000000000001', 'Bulk Carrier', 98000, 180000, 14500, 'JPN', 2013, 'NK', 13.5, 15.0, 11.0, 60.0, true),
('9990123', 'LNG Explorer', '00000000-0000-0000-0000-000000000001', 'LNG Carrier', 110000, 140000, 28000, 'QAT', 2017, 'DNV', 17.0, 19.5, 14.0, 75.0, true),
('9990124', 'Gas Transporter', '00000000-0000-0000-0000-000000000001', 'LNG Carrier', 112000, 145000, 28000, 'NOR', 2018, 'DNV', 17.0, 19.5, 14.0, 75.0, true)
ON CONFLICT (imo_number) DO UPDATE SET
    name = EXCLUDED.name,
    ship_type = EXCLUDED.ship_type,
    gross_tonnage = EXCLUDED.gross_tonnage,
    deadweight_tonnage = EXCLUDED.deadweight_tonnage,
    engine_power_kw = EXCLUDED.engine_power_kw,
    flag_state = EXCLUDED.flag_state,
    year_built = EXCLUDED.year_built,
    classification_society = EXCLUDED.classification_society,
    min_speed = EXCLUDED.min_speed,
    max_speed = EXCLUDED.max_speed,
    port_consumption = EXCLUDED.port_consumption,
    sea_consumption = EXCLUDED.sea_consumption,
    is_active = EXCLUDED.is_active,
    updated_at = now();

