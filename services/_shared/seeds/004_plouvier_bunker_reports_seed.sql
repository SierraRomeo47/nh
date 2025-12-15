-- ========================================
-- PLOUVIER GROUP BUNKER REPORTS SEED DATA
-- Synthetic bunker delivery reports for performance analysis
-- Linked to Plouvier bunker barges
-- Matches actual bunker_reports table schema
-- ========================================

-- Generate bunker reports for the last 90 days
-- Each barge has multiple deliveries with realistic data
-- For barge_name, we'll use the ship name from the ships table via JOIN

INSERT INTO bunker_reports (
    ship_id, bunkering_port, bunker_date,
    fuel_type, quantity_mt, price_per_mt, total_cost,
    supplier_name, sulphur_content, density,
    created_at
) VALUES
-- Plouvier Rhine (2800 DWT) - Rotterdam deliveries
((SELECT id FROM ships WHERE imo_number = '9876543'), 'Rotterdam', CURRENT_DATE - INTERVAL '5 days',
 'VLSFO', 245.5, 580.00, 142390.00,
 'Shell Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '5 days'),

((SELECT id FROM ships WHERE imo_number = '9876543'), 'Rotterdam', CURRENT_DATE - INTERVAL '12 days',
 'VLSFO', 238.2, 582.50, 138753.50,
 'BP Marine', 0.0049, 0.8912,
 CURRENT_DATE - INTERVAL '12 days'),

((SELECT id FROM ships WHERE imo_number = '9876543'), 'Antwerp', CURRENT_DATE - INTERVAL '18 days',
 'VLSFO', 252.8, 578.75, 146432.00,
 'TotalEnergies Marine', 0.0047, 0.8898,
 CURRENT_DATE - INTERVAL '18 days'),

((SELECT id FROM ships WHERE imo_number = '9876543'), 'Rotterdam', CURRENT_DATE - INTERVAL '35 days',
 'VLSFO', 240.2, 575.00, 138115.00,
 'Shell Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '35 days'),

((SELECT id FROM ships WHERE imo_number = '9876543'), 'Antwerp', CURRENT_DATE - INTERVAL '60 days',
 'VLSFO', 235.8, 574.00, 135247.20,
 'ExxonMobil Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '60 days'),

-- Plouvier Danube (2200 DWT) - Antwerp deliveries
((SELECT id FROM ships WHERE imo_number = '9876544'), 'Antwerp', CURRENT_DATE - INTERVAL '3 days',
 'VLSFO', 195.5, 581.25, 113644.38,
 'ExxonMobil Marine', 0.0048, 0.8900,
 CURRENT_DATE - INTERVAL '3 days'),

((SELECT id FROM ships WHERE imo_number = '9876544'), 'Rotterdam', CURRENT_DATE - INTERVAL '10 days',
 'VLSFO', 188.3, 583.00, 109778.90,
 'Shell Marine', 0.0050, 0.8915,
 CURRENT_DATE - INTERVAL '10 days'),

((SELECT id FROM ships WHERE imo_number = '9876544'), 'Duisburg', CURRENT_DATE - INTERVAL '20 days',
 'VLSFO', 202.1, 579.50, 117116.95,
 'BP Marine', 0.0048, 0.8903,
 CURRENT_DATE - INTERVAL '20 days'),

((SELECT id FROM ships WHERE imo_number = '9876544'), 'Antwerp', CURRENT_DATE - INTERVAL '40 days',
 'VLSFO', 190.5, 576.50, 109923.25,
 'BP Marine', 0.0048, 0.8908,
 CURRENT_DATE - INTERVAL '40 days'),

-- Plouvier Main (1800 DWT) - Amsterdam deliveries
((SELECT id FROM ships WHERE imo_number = '9876545'), 'Amsterdam', CURRENT_DATE - INTERVAL '7 days',
 'VLSFO', 165.2, 580.75, 95940.00,
 'TotalEnergies Marine', 0.0049, 0.8908,
 CURRENT_DATE - INTERVAL '7 days'),

((SELECT id FROM ships WHERE imo_number = '9876545'), 'Rotterdam', CURRENT_DATE - INTERVAL '15 days',
 'VLSFO', 158.7, 582.00, 92366.34,
 'Shell Marine', 0.0048, 0.8910,
 CURRENT_DATE - INTERVAL '15 days'),

((SELECT id FROM ships WHERE imo_number = '9876545'), 'Antwerp', CURRENT_DATE - INTERVAL '25 days',
 'VLSFO', 172.4, 579.25, 99923.00,
 'BP Marine', 0.0047, 0.8902,
 CURRENT_DATE - INTERVAL '25 days'),

((SELECT id FROM ships WHERE imo_number = '9876545'), 'Amsterdam', CURRENT_DATE - INTERVAL '45 days',
 'VLSFO', 160.8, 574.75, 92340.00,
 'TotalEnergies Marine', 0.0047, 0.8902,
 CURRENT_DATE - INTERVAL '45 days'),

-- Plouvier Moselle (1500 DWT) - Cologne deliveries
((SELECT id FROM ships WHERE imo_number = '9876546'), 'Cologne', CURRENT_DATE - INTERVAL '4 days',
 'VLSFO', 138.5, 581.50, 80477.75,
 'ExxonMobil Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '4 days'),

((SELECT id FROM ships WHERE imo_number = '9876546'), 'Duisburg', CURRENT_DATE - INTERVAL '11 days',
 'VLSFO', 132.8, 583.25, 77456.00,
 'Shell Marine', 0.0049, 0.8912,
 CURRENT_DATE - INTERVAL '11 days'),

((SELECT id FROM ships WHERE imo_number = '9876546'), 'Rotterdam', CURRENT_DATE - INTERVAL '22 days',
 'VLSFO', 145.2, 578.50, 84028.20,
 'TotalEnergies Marine', 0.0047, 0.8900,
 CURRENT_DATE - INTERVAL '22 days'),

((SELECT id FROM ships WHERE imo_number = '9876546'), 'Cologne', CURRENT_DATE - INTERVAL '70 days',
 'VLSFO', 140.2, 576.75, 80920.50,
 'Shell Marine', 0.0049, 0.8912,
 CURRENT_DATE - INTERVAL '70 days'),

-- Plouvier Neckar (2500 DWT) - Duisburg deliveries
((SELECT id FROM ships WHERE imo_number = '9876547'), 'Duisburg', CURRENT_DATE - INTERVAL '6 days',
 'VLSFO', 218.5, 580.00, 126730.00,
 'BP Marine', 0.0048, 0.8903,
 CURRENT_DATE - INTERVAL '6 days'),

((SELECT id FROM ships WHERE imo_number = '9876547'), 'Rotterdam', CURRENT_DATE - INTERVAL '14 days',
 'VLSFO', 212.3, 582.75, 123738.83,
 'Shell Marine', 0.0049, 0.8910,
 CURRENT_DATE - INTERVAL '14 days'),

((SELECT id FROM ships WHERE imo_number = '9876547'), 'Antwerp', CURRENT_DATE - INTERVAL '24 days',
 'VLSFO', 225.8, 577.25, 130373.05,
 'ExxonMobil Marine', 0.0047, 0.8895,
 CURRENT_DATE - INTERVAL '24 days'),

((SELECT id FROM ships WHERE imo_number = '9876547'), 'Duisburg', CURRENT_DATE - INTERVAL '50 days',
 'VLSFO', 215.2, 576.00, 123955.20,
 'Shell Marine', 0.0049, 0.8910,
 CURRENT_DATE - INTERVAL '50 days'),

-- Plouvier Saar (2000 DWT) - Strasbourg deliveries
((SELECT id FROM ships WHERE imo_number = '9876548'), 'Strasbourg', CURRENT_DATE - INTERVAL '2 days',
 'VLSFO', 175.5, 581.00, 101755.50,
 'TotalEnergies Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '2 days'),

((SELECT id FROM ships WHERE imo_number = '9876548'), 'Basel', CURRENT_DATE - INTERVAL '9 days',
 'VLSFO', 168.2, 583.50, 98085.30,
 'BP Marine', 0.0049, 0.8912,
 CURRENT_DATE - INTERVAL '9 days'),

((SELECT id FROM ships WHERE imo_number = '9876548'), 'Duisburg', CURRENT_DATE - INTERVAL '19 days',
 'VLSFO', 182.7, 578.75, 105768.13,
 'Shell Marine', 0.0047, 0.8900,
 CURRENT_DATE - INTERVAL '19 days'),

((SELECT id FROM ships WHERE imo_number = '9876548'), 'Basel', CURRENT_DATE - INTERVAL '65 days',
 'VLSFO', 170.5, 575.25, 98050.13,
 'TotalEnergies Marine', 0.0048, 0.8908,
 CURRENT_DATE - INTERVAL '65 days'),

-- Plouvier Ruhr (1200 DWT) - Mannheim deliveries
((SELECT id FROM ships WHERE imo_number = '9876549'), 'Mannheim', CURRENT_DATE - INTERVAL '1 day',
 'VLSFO', 105.5, 581.75, 61374.63,
 'ExxonMobil Marine', 0.0048, 0.8908,
 CURRENT_DATE - INTERVAL '1 day'),

((SELECT id FROM ships WHERE imo_number = '9876549'), 'Cologne', CURRENT_DATE - INTERVAL '8 days',
 'VLSFO', 98.3, 584.00, 57347.20,
 'TotalEnergies Marine', 0.0050, 0.8915,
 CURRENT_DATE - INTERVAL '8 days'),

((SELECT id FROM ships WHERE imo_number = '9876549'), 'Duisburg', CURRENT_DATE - INTERVAL '17 days',
 'VLSFO', 112.8, 579.00, 65311.20,
 'BP Marine', 0.0047, 0.8902,
 CURRENT_DATE - INTERVAL '17 days'),

((SELECT id FROM ships WHERE imo_number = '9876549'), 'Mannheim', CURRENT_DATE - INTERVAL '75 days',
 'VLSFO', 103.5, 575.50, 59564.25,
 'BP Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '75 days'),

-- Plouvier Elbe (3000 DWT) - Rotterdam deliveries
((SELECT id FROM ships WHERE imo_number = '9876550'), 'Rotterdam', CURRENT_DATE - INTERVAL '13 days',
 'VLSFO', 262.5, 580.50, 152381.25,
 'Shell Marine', 0.0048, 0.8900,
 CURRENT_DATE - INTERVAL '13 days'),

((SELECT id FROM ships WHERE imo_number = '9876550'), 'Antwerp', CURRENT_DATE - INTERVAL '21 days',
 'VLSFO', 255.2, 582.25, 148614.20,
 'BP Marine', 0.0049, 0.8910,
 CURRENT_DATE - INTERVAL '21 days'),

((SELECT id FROM ships WHERE imo_number = '9876550'), 'Rotterdam', CURRENT_DATE - INTERVAL '30 days',
 'VLSFO', 270.8, 577.50, 156291.00,
 'TotalEnergies Marine', 0.0047, 0.8895,
 CURRENT_DATE - INTERVAL '30 days'),

((SELECT id FROM ships WHERE imo_number = '9876550'), 'Rotterdam', CURRENT_DATE - INTERVAL '55 days',
 'VLSFO', 258.5, 575.50, 148766.75,
 'BP Marine', 0.0048, 0.8900,
 CURRENT_DATE - INTERVAL '55 days'),

((SELECT id FROM ships WHERE imo_number = '9876550'), 'Rotterdam', CURRENT_DATE - INTERVAL '90 days',
 'VLSFO', 265.5, 573.50, 152203.25,
 'Shell Marine', 0.0047, 0.8898,
 CURRENT_DATE - INTERVAL '90 days'),

-- Plouvier Weser (1900 DWT) - Basel deliveries
((SELECT id FROM ships WHERE imo_number = '9876551'), 'Basel', CURRENT_DATE - INTERVAL '16 days',
 'VLSFO', 166.5, 581.25, 96658.13,
 'ExxonMobil Marine', 0.0048, 0.8905,
 CURRENT_DATE - INTERVAL '16 days'),

((SELECT id FROM ships WHERE imo_number = '9876551'), 'Strasbourg', CURRENT_DATE - INTERVAL '26 days',
 'VLSFO', 172.3, 583.75, 100595.13,
 'Shell Marine', 0.0049, 0.8912,
 CURRENT_DATE - INTERVAL '26 days'),

((SELECT id FROM ships WHERE imo_number = '9876551'), 'Basel', CURRENT_DATE - INTERVAL '80 days',
 'VLSFO', 164.8, 574.25, 94556.00,
 'ExxonMobil Marine', 0.0048, 0.8903,
 CURRENT_DATE - INTERVAL '80 days'),

-- Plouvier Oder (1350 DWT) - Karlsruhe deliveries
((SELECT id FROM ships WHERE imo_number = '9876552'), 'Karlsruhe', CURRENT_DATE - INTERVAL '23 days',
 'VLSFO', 118.5, 581.50, 68807.75,
 'BP Marine', 0.0048, 0.8908,
 CURRENT_DATE - INTERVAL '23 days'),

((SELECT id FROM ships WHERE imo_number = '9876552'), 'Mannheim', CURRENT_DATE - INTERVAL '28 days',
 'VLSFO', 112.2, 584.25, 65512.35,
 'TotalEnergies Marine', 0.0050, 0.8915,
 CURRENT_DATE - INTERVAL '28 days'),

((SELECT id FROM ships WHERE imo_number = '9876552'), 'Karlsruhe', CURRENT_DATE - INTERVAL '85 days',
 'VLSFO', 116.2, 575.75, 66901.50,
 'TotalEnergies Marine', 0.0048, 0.8908,
 CURRENT_DATE - INTERVAL '85 days');

COMMENT ON TABLE bunker_reports IS 'Bunker delivery reports for Plouvier Group fleet - includes volume measurement data for Coriolis meter analysis';
