-- Create vessels table
CREATE TABLE IF NOT EXISTS vessels (
    id SERIAL PRIMARY KEY,
    imo_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(100) NOT NULL,
    dwt INTEGER,
    built_year INTEGER,
    flag_state VARCHAR(100),
    min_speed DECIMAL(4,1),
    max_speed DECIMAL(4,1),
    port_consumption DECIMAL(6,2),
    sea_consumption DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert vessel data (expanding the mock data with more realistic information)
INSERT INTO vessels (imo_number, name, vessel_type, dwt, built_year, flag_state, min_speed, max_speed, port_consumption, sea_consumption) VALUES
('9391001', 'Aurora Spirit', 'MR Tanker', 47000, 2010, 'Marshall Islands', 12.0, 16.0, 8.0, 45.0),
('9391002', 'Baltic Star', 'MR Tanker', 47500, 2011, 'Liberia', 12.0, 16.0, 8.0, 45.0),
('9391003', 'Coral Wave', 'MR Tanker', 46800, 2012, 'Singapore', 12.0, 16.0, 8.0, 45.0),
('9391004', 'Delta Horizon', 'MR Tanker', 47200, 2013, 'Marshall Islands', 12.0, 16.0, 8.0, 45.0),
('9391005', 'Eastern Crest', 'MR Tanker', 47300, 2014, 'Panama', 12.0, 16.0, 8.0, 45.0),
('9391006', 'Fjord Runner', 'MR Tanker', 47100, 2015, 'Norway', 12.0, 16.0, 8.0, 45.0),
('9391007', 'Gulf Pioneer', 'MR Tanker', 47400, 2016, 'UAE', 12.0, 16.0, 8.0, 45.0),
('9445123', 'Pacific Voyager', 'Aframax Tanker', 105000, 2008, 'Liberia', 13.0, 15.5, 10.0, 55.0),
('9445124', 'Atlantic Trader', 'Aframax Tanker', 107000, 2009, 'Marshall Islands', 13.0, 15.5, 10.0, 55.0),
('9445125', 'Indian Ocean', 'Aframax Tanker', 106500, 2010, 'Singapore', 13.0, 15.5, 10.0, 55.0),
('9556789', 'Suezmax Glory', 'Suezmax Tanker', 158000, 2012, 'Greece', 14.0, 16.0, 12.0, 65.0),
('9556790', 'Mediterranean Pride', 'Suezmax Tanker', 160000, 2013, 'Malta', 14.0, 16.0, 12.0, 65.0),
('9667890', 'VLCC Titan', 'VLCC', 310000, 2015, 'Liberia', 14.5, 16.5, 15.0, 80.0),
('9667891', 'VLCC Colossus', 'VLCC', 315000, 2016, 'Marshall Islands', 14.5, 16.5, 15.0, 80.0),
('9778901', 'Container Express', 'Container Ship', 85000, 2014, 'Singapore', 18.0, 22.0, 12.0, 70.0),
('9778902', 'Swift Carrier', 'Container Ship', 87000, 2015, 'Panama', 18.0, 22.0, 12.0, 70.0),
('9889012', 'Bulk Champion', 'Bulk Carrier', 82000, 2011, 'Hong Kong', 13.0, 14.5, 9.0, 50.0),
('9889013', 'Ore Master', 'Bulk Carrier', 180000, 2013, 'Japan', 13.5, 15.0, 11.0, 60.0),
('9990123', 'LNG Explorer', 'LNG Carrier', 140000, 2017, 'Qatar', 17.0, 19.5, 14.0, 75.0),
('9990124', 'Gas Transporter', 'LNG Carrier', 145000, 2018, 'Norway', 17.0, 19.5, 14.0, 75.0)
ON CONFLICT (imo_number) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vessels_imo ON vessels(imo_number);
CREATE INDEX IF NOT EXISTS idx_vessels_type ON vessels(vessel_type);

