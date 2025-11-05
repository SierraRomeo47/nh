-- Simplified Seed Data for Nautilus Horizon
-- Industry-standard synthetic data

-- ============================================================================
-- VOYAGES DATA
-- ============================================================================

-- Insert active voyages for existing vessels
WITH ship_list AS (
  SELECT id, deadweight_tonnage, ROW_NUMBER() OVER () as rn
  FROM ships 
  WHERE is_active = true
  ORDER BY id
  LIMIT 18
)
INSERT INTO voyages (id, voyage_id, ship_id, voyage_type, start_date, end_date, start_port, end_port, charter_type, status)
SELECT 
  gen_random_uuid(),
  'V-2025-' || LPAD(sl.rn::text, 4, '0'),
  sl.id,
  CASE sl.rn % 3
    WHEN 0 THEN 'COMMERCIAL'
    WHEN 1 THEN 'BALLAST'
    ELSE 'COMMERCIAL'
  END,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  CASE sl.rn % 10
    WHEN 0 THEN 'Rotterdam'
    WHEN 1 THEN 'Singapore'
    WHEN 2 THEN 'Houston'
    WHEN 3 THEN 'Shanghai'
    WHEN 4 THEN 'Busan'
    WHEN 5 THEN 'Hamburg'
    WHEN 6 THEN 'Los Angeles'
    WHEN 7 THEN 'Dubai'
    WHEN 8 THEN 'Antwerp'
    ELSE 'Piraeus'
  END,
  CASE (sl.rn + 3) % 10
    WHEN 0 THEN 'Rotterdam'
    WHEN 1 THEN 'Singapore'
    WHEN 2 THEN 'Houston'
    WHEN 3 THEN 'Shanghai'
    WHEN 4 THEN 'Busan'
    WHEN 5 THEN 'Hamburg'
    WHEN 6 THEN 'Los Angeles'
    WHEN 7 THEN 'Dubai'
    WHEN 8 THEN 'Antwerp'
    ELSE 'Piraeus'
  END,
  CASE sl.rn % 3
    WHEN 0 THEN 'SPOT_VOYAGE'
    WHEN 1 THEN 'TIME'
    ELSE 'BAREBOAT'
  END,
  'ACTIVE'
FROM ship_list sl;

-- Insert voyage legs for active voyages
INSERT INTO voyage_legs (id, voyage_id, leg_number, departure_port, arrival_port, departure_date, arrival_date, distance_nm, cargo_type, cargo_quantity)
SELECT 
  gen_random_uuid(),
  v.id,
  1,
  v.start_port,
  v.end_port,
  v.start_date::timestamp,
  v.end_date::timestamp,
  6500.0,
  CASE (SELECT COUNT(*) FROM voyages WHERE id <= v.id) % 5
    WHEN 0 THEN 'Containers'
    WHEN 1 THEN 'Crude Oil'
    WHEN 2 THEN 'LNG'
    WHEN 3 THEN 'Iron Ore'
    ELSE 'Coal'
  END,
  50000.0
FROM voyages v
WHERE v.status = 'ACTIVE';

-- Insert fuel consumption data for active voyages  
WITH voyage_fuel AS (
  SELECT 
    v.id as voyage_id,
    v.start_date,
    v.end_date,
    generate_series(1, 5) as fuel_record_num
  FROM voyages v
  WHERE v.status = 'ACTIVE'
)
INSERT INTO fuel_consumption (
  id, voyage_id, fuel_type, fuel_category, consumption_tonnes, consumption_date,
  fuel_supplier, density_kg_m3, lower_calorific_value_mj_kg, sulphur_content_pct,
  carbon_content_pct, well_to_wake_ghg_gco2e_mj, tank_to_wake_ghg_gco2e_mj
)
SELECT 
  gen_random_uuid(),
  vf.voyage_id,
  CASE vf.fuel_record_num % 8
    WHEN 0 THEN 'VLSFO'
    WHEN 1 THEN 'LSMGO'
    WHEN 2 THEN 'LNG'
    WHEN 3 THEN 'BIO_MGO'
    WHEN 4 THEN 'BIO_VLSFO'
    WHEN 5 THEN 'E_METHANOL'
    WHEN 6 THEN 'E_AMMONIA'
    ELSE 'VLSFO'
  END,
  CASE vf.fuel_record_num % 8
    WHEN 0 THEN 'FOSSIL'
    WHEN 1 THEN 'FOSSIL'
    WHEN 2 THEN 'ALTERNATIVE'
    WHEN 3 THEN 'BIOFUEL'
    WHEN 4 THEN 'BIOFUEL'
    WHEN 5 THEN 'E_FUEL'
    WHEN 6 THEN 'E_FUEL'
    ELSE 'FOSSIL'
  END,
  45.0,
  vf.start_date + (vf.fuel_record_num * INTERVAL '3 days'),
  'Shell Marine',
  991.0,
  40.2,
  0.45,
  87.0,
  94.1,
  77.4
FROM voyage_fuel vf;

-- ============================================================================
-- COMPLIANCE DATA
-- ============================================================================

-- Insert compliance alerts
WITH ship_list AS (
  SELECT id, name, ROW_NUMBER() OVER () as rn
  FROM ships
  WHERE is_active = true
  LIMIT 45
)
INSERT INTO compliance_alerts (
  id, ship_id, alert_type, severity, title, description, status, created_at
)
SELECT 
  gen_random_uuid(),
  sl.id,
  CASE sl.rn % 10
    WHEN 0 THEN 'ETS_COMPLIANCE'
    WHEN 1 THEN 'FUELEU_PENALTY'
    WHEN 2 THEN 'IMO_DCS_REPORTING'
    WHEN 3 THEN 'CERTIFICATE_EXPIRY'
    WHEN 4 THEN 'EMISSION_LIMIT'
    WHEN 5 THEN 'FUEL_QUALITY'
    WHEN 6 THEN 'SAFETY_INSPECTION'
    WHEN 7 THEN 'CREW_CERTIFICATION'
    WHEN 8 THEN 'PORT_STATE_CONTROL'
    ELSE 'EUA_SHORTAGE'
  END,
  CASE sl.rn % 4
    WHEN 0 THEN 'CRITICAL'
    WHEN 1 THEN 'HIGH'
    WHEN 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END,
  CASE sl.rn % 10
    WHEN 0 THEN 'EU ETS Allowances Shortfall Projected'
    WHEN 1 THEN 'FuelEU Maritime Penalty Risk'
    WHEN 2 THEN 'IMO DCS Annual Report Due'
    WHEN 3 THEN 'Safety Management Certificate Expiring'
    WHEN 4 THEN 'NOx Emission Limit Exceeded'
    WHEN 5 THEN 'Fuel Sulphur Content Non-Compliant'
    WHEN 6 THEN 'SIRE 2.0 Inspection Required'
    WHEN 7 THEN 'Crew STCW Certificates Expiring'
    WHEN 8 THEN 'Port State Control Detention Risk'
    ELSE 'EUA Purchase Recommendation'
  END,
  'Projected compliance issue requiring immediate attention. Please review and take appropriate action.',
  CASE sl.rn % 3
    WHEN 0 THEN 'OPEN'
    WHEN 1 THEN 'IN_PROGRESS'
    ELSE 'OPEN'
  END,
  NOW() - (sl.rn % 30 * INTERVAL '1 day')
FROM ship_list sl;

-- Insert compliance tasks
WITH ship_list AS (
  SELECT id, ROW_NUMBER() OVER () as rn
  FROM ships
  WHERE is_active = true
  LIMIT 60
)
INSERT INTO compliance_tasks (
  id, task_type, title, description, priority, status, due_date, ship_id, created_at
)
SELECT 
  gen_random_uuid(),
  CASE sl.rn % 8
    WHEN 0 THEN 'ETS_REPORTING'
    WHEN 1 THEN 'FUELEU_CALCULATION'
    WHEN 2 THEN 'IMO_DCS_SUBMISSION'
    WHEN 3 THEN 'CERTIFICATE_RENEWAL'
    WHEN 4 THEN 'INSPECTION_PREPARATION'
    WHEN 5 THEN 'CREW_TRAINING'
    WHEN 6 THEN 'EUA_PROCUREMENT'
    ELSE 'DOCUMENTATION_UPDATE'
  END,
  CASE sl.rn % 8
    WHEN 0 THEN 'Submit Q3 2025 EU ETS Monitoring Report'
    WHEN 1 THEN 'Calculate FuelEU Maritime Compliance Balance'
    WHEN 2 THEN 'Prepare IMO DCS Annual Report 2024'
    WHEN 3 THEN 'Renew Class Certificates'
    WHEN 4 THEN 'Prepare for SIRE 2.0 Vetting Inspection'
    WHEN 5 THEN 'Conduct ECDIS Familiarization Training'
    WHEN 6 THEN 'Purchase 800 EUAs for Q4 2025'
    ELSE 'Update SEEMP Part III with Alternative Fuels'
  END,
  'Complete regulatory compliance task as per industry standards and classification society requirements.',
  CASE sl.rn % 4
    WHEN 0 THEN 'CRITICAL'
    WHEN 1 THEN 'HIGH'
    WHEN 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END,
  CASE sl.rn % 4
    WHEN 0 THEN 'PENDING'
    WHEN 1 THEN 'IN_PROGRESS'
    WHEN 2 THEN 'PENDING'
    ELSE 'PENDING'
  END,
  CURRENT_DATE + ((sl.rn % 60 + 5) * INTERVAL '1 day'),
  sl.id,
  NOW() - (sl.rn % 15 * INTERVAL '1 day')
FROM ship_list sl;

-- Insert compliance recommendations
WITH ship_list AS (
  SELECT id, ROW_NUMBER() OVER () as rn
  FROM ships
  WHERE is_active = true
  LIMIT 35
)
INSERT INTO compliance_recommendations (
  id, ship_id, category, title, description, impact_level, 
  estimated_savings_eur, implementation_cost_eur, payback_period_years, 
  status, created_at
)
SELECT 
  gen_random_uuid(),
  sl.id,
  CASE sl.rn % 6
    WHEN 0 THEN 'FUEL_OPTIMIZATION'
    WHEN 1 THEN 'EFFICIENCY_TECHNOLOGY'
    WHEN 2 THEN 'ALTERNATIVE_FUEL'
    WHEN 3 THEN 'ROUTE_OPTIMIZATION'
    WHEN 4 THEN 'OPERATIONAL_MEASURE'
    ELSE 'REGULATORY_STRATEGY'
  END,
  CASE sl.rn % 6
    WHEN 0 THEN 'Adopt 20% Biofuel Blend for EU Voyages'
    WHEN 1 THEN 'Install Air Lubrication System'
    WHEN 2 THEN 'Retrofit for LNG Dual-Fuel Operation'
    WHEN 3 THEN 'Implement Weather Routing Service'
    WHEN 4 THEN 'Optimize Trim and Ballast Management'
    ELSE 'Participate in FuelEU Pooling Mechanism'
  END,
  'Industry-standard recommendation to improve compliance posture and reduce operational costs through proven technology and operational measures.',
  CASE sl.rn % 3
    WHEN 0 THEN 'HIGH'
    WHEN 1 THEN 'MEDIUM'
    ELSE 'LOW'
  END,
  200000.0,
  1500000.0,
  5.5,
  CASE sl.rn % 3
    WHEN 0 THEN 'PENDING'
    WHEN 1 THEN 'UNDER_REVIEW'
    ELSE 'PENDING'
  END,
  NOW() - (sl.rn % 20 * INTERVAL '1 day')
FROM ship_list sl;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 
  'Voyages: ' || COUNT(*) as summary
FROM voyages WHERE status = 'ACTIVE'
UNION ALL
SELECT 
  'Compliance Alerts: ' || COUNT(*)
FROM compliance_alerts
UNION ALL
SELECT 
  'Compliance Tasks: ' || COUNT(*)
FROM compliance_tasks
UNION ALL
SELECT 
  'Recommendations: ' || COUNT(*)
FROM compliance_recommendations;

