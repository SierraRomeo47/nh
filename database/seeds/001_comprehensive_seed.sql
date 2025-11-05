-- Comprehensive Seed Data for Nautilus Horizon
-- Industry-standard synthetic data for voyages, compliance, and trading

-- ============================================================================
-- VOYAGES DATA
-- ============================================================================

-- Insert voyage data for existing vessels
-- Active voyages (current)
INSERT INTO voyages (id, voyage_id, ship_id, voyage_type, start_date, end_date, start_port, end_port, charter_type, status)
SELECT 
  gen_random_uuid(),
  'V-2025-' || LPAD(ROW_NUMBER() OVER ()::text, 4, '0'),
  s.id,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'COMMERCIAL'
    WHEN 1 THEN 'BALLAST'
    ELSE 'COMMERCIAL'
  END,
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  CASE (ROW_NUMBER() OVER ()) % 10
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
  CASE ((ROW_NUMBER() OVER ()) + 3) % 10
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
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'SPOT_VOYAGE'
    WHEN 1 THEN 'TIME'
    ELSE 'BAREBOAT'
  END,
  'ACTIVE'
FROM ships s
WHERE s.is_active = true
LIMIT 18;

-- Completed voyages (last 6 months)
INSERT INTO voyages (id, voyage_id, ship_id, voyage_type, start_date, end_date, start_port, end_port, charter_type, status)
SELECT 
  gen_random_uuid(),
  'V-2024-' || LPAD((ROW_NUMBER() OVER () + 100)::text, 4, '0'),
  s.id,
  'COMMERCIAL',
  CURRENT_DATE - INTERVAL '180 days' + (ROW_NUMBER() OVER () * INTERVAL '10 days'),
  CURRENT_DATE - INTERVAL '150 days' + (ROW_NUMBER() OVER () * INTERVAL '10 days'),
  CASE (ROW_NUMBER() OVER ()) % 10
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
  CASE ((ROW_NUMBER() OVER ()) + 5) % 10
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
  'SPOT_VOYAGE',
  'COMPLETED'
FROM ships s
WHERE s.is_active = true
LIMIT 25;

-- Insert voyage legs for active voyages
INSERT INTO voyage_legs (id, voyage_id, leg_number, departure_port, arrival_port, departure_date, arrival_date, distance_nm, cargo_type, cargo_quantity)
SELECT 
  gen_random_uuid(),
  v.id,
  1,
  v.start_port,
  v.end_port,
  v.start_date,
  v.end_date,
  CASE v.start_port || '-' || v.end_port
    WHEN 'Rotterdam-Singapore' THEN 8300
    WHEN 'Singapore-Houston' THEN 10500
    WHEN 'Houston-Shanghai' THEN 7200
    WHEN 'Shanghai-Rotterdam' THEN 10900
    WHEN 'Busan-Hamburg' THEN 11200
    WHEN 'Hamburg-Los Angeles' THEN 5800
    WHEN 'Los Angeles-Dubai' THEN 9200
    WHEN 'Dubai-Antwerp' THEN 6100
    WHEN 'Antwerp-Piraeus' THEN 2800
    ELSE 6500
  END,
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 0 THEN 'Containers'
    WHEN 1 THEN 'Crude Oil'
    WHEN 2 THEN 'LNG'
    WHEN 3 THEN 'Iron Ore'
    ELSE 'Coal'
  END,
  CASE 
    WHEN s.deadweight_tonnage > 0 THEN s.deadweight_tonnage * 0.85
    ELSE 50000
  END
FROM voyages v
JOIN ships s ON v.ship_id = s.id
WHERE v.status = 'ACTIVE';

-- Insert fuel consumption data for active voyages
INSERT INTO fuel_consumption (
  id, voyage_id, fuel_type, fuel_category, consumption_tonnes, consumption_date,
  fuel_supplier, density_kg_m3, lower_calorific_value_mj_kg, sulphur_content_pct,
  carbon_content_pct, well_to_wake_ghg_gco2e_mj, tank_to_wake_ghg_gco2e_mj
)
SELECT 
  gen_random_uuid(),
  v.id,
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 'VLSFO'
    WHEN 1 THEN 'LSMGO'
    WHEN 2 THEN 'LNG'
    WHEN 3 THEN 'BIO_MGO'
    WHEN 4 THEN 'BIO_VLSFO'
    WHEN 5 THEN 'E_METHANOL'
    WHEN 6 THEN 'E_AMMONIA'
    ELSE 'VLSFO'
  END,
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 'FOSSIL'
    WHEN 1 THEN 'FOSSIL'
    WHEN 2 THEN 'ALTERNATIVE'
    WHEN 3 THEN 'BIOFUEL'
    WHEN 4 THEN 'BIOFUEL'
    WHEN 5 THEN 'E_FUEL'
    WHEN 6 THEN 'E_FUEL'
    ELSE 'FOSSIL'
  END,
  -- Consumption based on vessel size and voyage duration
  (EXTRACT(EPOCH FROM (v.end_date - v.start_date)) / 86400) * 
  CASE 
    WHEN s.deadweight_tonnage > 100000 THEN 65.0
    WHEN s.deadweight_tonnage > 50000 THEN 45.0
    ELSE 25.0
  END * 
  -- Adjust for fuel type LCV
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 2 THEN 1.15  -- LNG has lower density
    WHEN 3 THEN 1.05  -- Biofuel slightly different
    WHEN 4 THEN 1.05
    WHEN 5 THEN 1.25  -- Methanol has much lower LCV
    WHEN 6 THEN 1.40  -- Ammonia has very low LCV
    ELSE 1.0
  END,
  v.start_date + ((ROW_NUMBER() OVER (PARTITION BY v.id)) * INTERVAL '3 days'),
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 0 THEN 'Shell Marine'
    WHEN 1 THEN 'BP Marine'
    WHEN 2 THEN 'TotalEnergies Marine'
    WHEN 3 THEN 'ExxonMobil Marine'
    ELSE 'Maersk Oil Trading'
  END,
  -- Density
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 991.0   -- VLSFO
    WHEN 1 THEN 890.0   -- LSMGO
    WHEN 2 THEN 450.0   -- LNG
    WHEN 3 THEN 885.0   -- BIO_MGO
    WHEN 4 THEN 980.0   -- BIO_VLSFO
    WHEN 5 THEN 792.0   -- E_METHANOL
    WHEN 6 THEN 682.0   -- E_AMMONIA
    ELSE 991.0
  END,
  -- Lower Calorific Value (MJ/kg)
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 40.2    -- VLSFO
    WHEN 1 THEN 42.7    -- LSMGO
    WHEN 2 THEN 48.6    -- LNG
    WHEN 3 THEN 42.5    -- BIO_MGO
    WHEN 4 THEN 40.0    -- BIO_VLSFO
    WHEN 5 THEN 19.9    -- E_METHANOL
    WHEN 6 THEN 18.6    -- E_AMMONIA
    ELSE 40.2
  END,
  -- Sulphur content (%)
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 0.45    -- VLSFO
    WHEN 1 THEN 0.05    -- LSMGO
    WHEN 2 THEN 0.00    -- LNG
    WHEN 3 THEN 0.05    -- BIO_MGO
    WHEN 4 THEN 0.40    -- BIO_VLSFO
    WHEN 5 THEN 0.00    -- E_METHANOL
    WHEN 6 THEN 0.00    -- E_AMMONIA
    ELSE 0.45
  END,
  -- Carbon content (%)
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 87.0    -- VLSFO
    WHEN 1 THEN 86.5    -- LSMGO
    WHEN 2 THEN 75.0    -- LNG
    WHEN 3 THEN 86.0    -- BIO_MGO (carbon neutral in lifecycle)
    WHEN 4 THEN 86.5    -- BIO_VLSFO
    WHEN 5 THEN 37.5    -- E_METHANOL
    WHEN 6 THEN 0.0     -- E_AMMONIA (no carbon)
    ELSE 87.0
  END,
  -- Well-to-Wake GHG (gCO2e/MJ)
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 94.1    -- VLSFO
    WHEN 1 THEN 91.2    -- LSMGO
    WHEN 2 THEN 69.5    -- LNG
    WHEN 3 THEN 13.5    -- BIO_MGO (advanced biofuel)
    WHEN 4 THEN 18.8    -- BIO_VLSFO
    WHEN 5 THEN 5.5     -- E_METHANOL (renewable electricity)
    WHEN 6 THEN 3.2     -- E_AMMONIA (renewable electricity)
    ELSE 94.1
  END,
  -- Tank-to-Wake GHG (gCO2e/MJ)
  CASE (ROW_NUMBER() OVER (PARTITION BY v.id)) % 8
    WHEN 0 THEN 77.4    -- VLSFO
    WHEN 1 THEN 75.5    -- LSMGO
    WHEN 2 THEN 56.1    -- LNG
    WHEN 3 THEN 75.0    -- BIO_MGO
    WHEN 4 THEN 77.0    -- BIO_VLSFO
    WHEN 5 THEN 68.9    -- E_METHANOL
    WHEN 6 THEN 0.0     -- E_AMMONIA (no carbon combustion)
    ELSE 77.4
  END
FROM voyages v
JOIN ships s ON v.ship_id = s.id
WHERE v.status = 'ACTIVE'
AND (ROW_NUMBER() OVER (PARTITION BY v.id)) <= 8;  -- 8 fuel consumption records per voyage

-- ============================================================================
-- COMPLIANCE DATA
-- ============================================================================

-- Insert compliance alerts
INSERT INTO compliance_alerts (
  id, ship_id, alert_type, severity, title, description, status, created_at
)
SELECT 
  gen_random_uuid(),
  s.id,
  CASE (ROW_NUMBER() OVER ()) % 10
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
  CASE (ROW_NUMBER() OVER ()) % 4
    WHEN 0 THEN 'CRITICAL'
    WHEN 1 THEN 'HIGH'
    WHEN 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END,
  CASE (ROW_NUMBER() OVER ()) % 10
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
  CASE (ROW_NUMBER() OVER ()) % 10
    WHEN 0 THEN 'Projected EUA shortfall of 1,250 allowances for Q4 2025 based on current voyage schedule and fuel mix. Immediate action required to avoid non-compliance.'
    WHEN 1 THEN 'Current fuel mix and voyage patterns indicate potential FuelEU penalty of €245,000 for 2025. Consider alternative fuel adoption.'
    WHEN 2 THEN 'IMO DCS annual report submission deadline approaching. Data validation and verifier review required within 45 days.'
    WHEN 3 THEN 'ISM Code Safety Management Certificate expires in 60 days. Schedule renewal audit with classification society.'
    WHEN 4 THEN 'Recent port measurements show NOx emissions exceeding IMO Tier III limits. Engine tuning or SCR system maintenance recommended.'
    WHEN 5 THEN 'Last bunker delivery note shows sulphur content of 0.52% (limit: 0.50%). Source verification and corrective action required.'
    WHEN 6 THEN 'Vessel due for SIRE 2.0 inspection. Pre-inspection checklist and crew briefing required.'
    WHEN 7 THEN '3 crew members STCW certificates expiring within 90 days. Arrange renewal training and certification.'
    WHEN 8 THEN 'Vessel entering high-risk PSC region. Pre-arrival inspection and documentation review recommended.'
    ELSE 'Current EUA spot price €65/tonne presents favorable purchase opportunity for projected Q1 2026 needs.'
  END,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'OPEN'
    WHEN 1 THEN 'IN_PROGRESS'
    ELSE 'OPEN'
  END,
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER () % 30))
FROM ships s
WHERE s.is_active = true
AND (ROW_NUMBER() OVER ()) <= 45;  -- 45 alerts across fleet

-- Insert compliance tasks
INSERT INTO compliance_tasks (
  id, task_type, title, description, priority, status, due_date, ship_id, created_at
)
SELECT 
  gen_random_uuid(),
  CASE (ROW_NUMBER() OVER ()) % 8
    WHEN 0 THEN 'ETS_REPORTING'
    WHEN 1 THEN 'FUELEU_CALCULATION'
    WHEN 2 THEN 'IMO_DCS_SUBMISSION'
    WHEN 3 THEN 'CERTIFICATE_RENEWAL'
    WHEN 4 THEN 'INSPECTION_PREPARATION'
    WHEN 5 THEN 'CREW_TRAINING'
    WHEN 6 THEN 'EUA_PROCUREMENT'
    ELSE 'DOCUMENTATION_UPDATE'
  END,
  CASE (ROW_NUMBER() OVER ()) % 8
    WHEN 0 THEN 'Submit Q3 2025 EU ETS Monitoring Report'
    WHEN 1 THEN 'Calculate FuelEU Maritime Compliance Balance'
    WHEN 2 THEN 'Prepare IMO DCS Annual Report 2024'
    WHEN 3 THEN 'Renew Class Certificates'
    WHEN 4 THEN 'Prepare for SIRE 2.0 Vetting Inspection'
    WHEN 5 THEN 'Conduct ECDIS Familiarization Training'
    WHEN 6 THEN 'Purchase 800 EUAs for Q4 2025'
    ELSE 'Update SEEMP Part III with Alternative Fuels'
  END,
  CASE (ROW_NUMBER() OVER ()) % 8
    WHEN 0 THEN 'Compile fuel consumption data, calculate emissions, and submit quarterly monitoring report to accredited verifier. Include BDNs and mass balance calculations.'
    WHEN 1 THEN 'Review voyage fuel consumption and calculate GHG intensity. Determine compliance surplus/penalty. Update FuelEU ledger.'
    WHEN 2 THEN 'Aggregate annual fuel consumption, distance traveled, and cargo carried. Submit to flag administration and IMO GISIS.'
    WHEN 3 THEN 'Coordinate with DNV for renewal survey. Prepare vessel for inspection. Update technical documentation.'
    WHEN 4 THEN 'Complete pre-inspection checklist, brief crew, prepare documentation (certificates, procedures, logs). Focus on cargo operations and navigation areas.'
    WHEN 5 THEN 'Arrange ECDIS training for new navigation equipment. Ensure all deck officers complete type-specific training and familiarization.'
    WHEN 6 THEN 'Analyze market conditions and execute EUA purchase order. Target price range €60-70/tonne. Secure allowances for compliance obligation.'
    ELSE 'Update Ship Energy Efficiency Management Plan with alternative fuel procedures, risk assessments, and operational guidelines.'
  END,
  CASE (ROW_NUMBER() OVER ()) % 4
    WHEN 0 THEN 'CRITICAL'
    WHEN 1 THEN 'HIGH'
    WHEN 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END,
  CASE (ROW_NUMBER() OVER ()) % 4
    WHEN 0 THEN 'PENDING'
    WHEN 1 THEN 'IN_PROGRESS'
    WHEN 2 THEN 'PENDING'
    ELSE 'PENDING'
  END,
  CURRENT_DATE + (INTERVAL '1 day' * ((ROW_NUMBER() OVER () % 60) + 5)),
  s.id,
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER () % 15))
FROM ships s
WHERE s.is_active = true
AND (ROW_NUMBER() OVER ()) <= 60;  -- 60 tasks across fleet

-- Insert compliance recommendations
INSERT INTO compliance_recommendations (
  id, ship_id, category, title, description, impact_level, estimated_savings_eur, implementation_cost_eur, payback_period_years, status, created_at
)
SELECT 
  gen_random_uuid(),
  s.id,
  CASE (ROW_NUMBER() OVER ()) % 6
    WHEN 0 THEN 'FUEL_OPTIMIZATION'
    WHEN 1 THEN 'EFFICIENCY_TECHNOLOGY'
    WHEN 2 THEN 'ALTERNATIVE_FUEL'
    WHEN 3 THEN 'ROUTE_OPTIMIZATION'
    WHEN 4 THEN 'OPERATIONAL_MEASURE'
    ELSE 'REGULATORY_STRATEGY'
  END,
  CASE (ROW_NUMBER() OVER ()) % 6
    WHEN 0 THEN 'Adopt 20% Biofuel Blend for EU Voyages'
    WHEN 1 THEN 'Install Air Lubrication System'
    WHEN 2 THEN 'Retrofit for LNG Dual-Fuel Operation'
    WHEN 3 THEN 'Implement Weather Routing Service'
    WHEN 4 THEN 'Optimize Trim and Ballast Management'
    ELSE 'Participate in FuelEU Pooling Mechanism'
  END,
  CASE (ROW_NUMBER() OVER ()) % 6
    WHEN 0 THEN 'Blend 20% advanced biofuel (FAME/HVO) with conventional fuel on EU-bound voyages. Reduces FuelEU penalties and ETS costs through lower WtW emissions. Meets RED II sustainability criteria with ISCC certification. Estimated 15% reduction in carbon intensity. Compatible with existing engines - no retrofit required.'
    WHEN 1 THEN 'Install micro-bubble air lubrication system to reduce hull friction. DNV-approved technology achieves 5-8% fuel savings. Proven track record in similar vessel class. System operates automatically, minimal crew training required. Annual maintenance cost €25,000.'
    WHEN 2 THEN 'Convert main engine to LNG dual-fuel capability. Achieves 20-25% CO2 reduction, eliminates SOx and particulate emissions. Meets IMO Tier III NOx limits. Enables compliance with upcoming regulations. Requires fuel storage tanks, gas supply system, and engine modification. Payback through fuel cost savings and avoided penalties.'
    WHEN 3 THEN 'Subscribe to advanced weather routing service using AI-powered optimization. Reduces voyage duration by 2-4%, fuel consumption by 3-5%. Real-time updates account for weather, currents, ice conditions. Includes performance monitoring and reporting. Proven savings in similar trade routes.'
    WHEN 4 THEN 'Implement dynamic trim optimization based on loading condition and sea state. Achieves 2-3% fuel savings through optimized hydrodynamic resistance. Requires crew training and ballast system automation. Supported by onboard stability computer calculations.'
    ELSE 'Join FuelEU Maritime pooling arrangement with compatible operators. Share compliance balance to offset penalties with surplus credits. Reduces individual compliance risk and cost. Enables phased alternative fuel adoption strategy.'
  END,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'HIGH'
    WHEN 1 THEN 'MEDIUM'
    ELSE 'LOW'
  END,
  -- Estimated annual savings
  CASE (ROW_NUMBER() OVER ()) % 6
    WHEN 0 THEN 185000 + (RANDOM() * 50000)::int
    WHEN 1 THEN 220000 + (RANDOM() * 80000)::int
    WHEN 2 THEN 450000 + (RANDOM() * 150000)::int
    WHEN 3 THEN 95000 + (RANDOM() * 30000)::int
    WHEN 4 THEN 75000 + (RANDOM() * 25000)::int
    ELSE 125000 + (RANDOM() * 40000)::int
  END,
  -- Implementation cost
  CASE (ROW_NUMBER() OVER ()) % 6
    WHEN 0 THEN 25000 + (RANDOM() * 10000)::int
    WHEN 1 THEN 1200000 + (RANDOM() * 300000)::int
    WHEN 2 THEN 8500000 + (RANDOM() * 1500000)::int
    WHEN 3 THEN 45000 + (RANDOM() * 15000)::int
    WHEN 4 THEN 125000 + (RANDOM() * 50000)::int
    ELSE 50000 + (RANDOM() * 20000)::int
  END,
  -- Payback period
  CASE (ROW_NUMBER() OVER ()) % 6
    WHEN 0 THEN 0.2
    WHEN 1 THEN 5.8
    WHEN 2 THEN 16.5
    WHEN 3 THEN 0.6
    WHEN 4 THEN 1.8
    ELSE 0.5
  END,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'PENDING'
    WHEN 1 THEN 'UNDER_REVIEW'
    ELSE 'PENDING'
  END,
  NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER () % 20))
FROM ships s
WHERE s.is_active = true
AND (ROW_NUMBER() OVER ()) <= 35;  -- 35 recommendations across fleet

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Create a summary view
DO $$
DECLARE
  active_voyages_count INTEGER;
  completed_voyages_count INTEGER;
  total_alerts INTEGER;
  critical_alerts INTEGER;
  total_tasks INTEGER;
  pending_tasks INTEGER;
  total_recommendations INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_voyages_count FROM voyages WHERE status = 'ACTIVE';
  SELECT COUNT(*) INTO completed_voyages_count FROM voyages WHERE status = 'COMPLETED';
  SELECT COUNT(*) INTO total_alerts FROM compliance_alerts;
  SELECT COUNT(*) INTO critical_alerts FROM compliance_alerts WHERE severity = 'CRITICAL';
  SELECT COUNT(*) INTO total_tasks FROM compliance_tasks;
  SELECT COUNT(*) INTO pending_tasks FROM compliance_tasks WHERE status = 'PENDING';
  SELECT COUNT(*) INTO total_recommendations FROM compliance_recommendations;

  RAISE NOTICE '================================================';
  RAISE NOTICE 'NAUTILUS HORIZON - DATABASE SEED COMPLETE';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Voyages:';
  RAISE NOTICE '  - Active: %', active_voyages_count;
  RAISE NOTICE '  - Completed: %', completed_voyages_count;
  RAISE NOTICE 'Compliance:';
  RAISE NOTICE '  - Total Alerts: % (Critical: %)', total_alerts, critical_alerts;
  RAISE NOTICE '  - Total Tasks: % (Pending: %)', total_tasks, pending_tasks;
  RAISE NOTICE '  - Recommendations: %', total_recommendations;
  RAISE NOTICE '================================================';
END $$;

