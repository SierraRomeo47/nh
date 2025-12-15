-- Add EEXI and EEDI regulation fields to ships table
-- Implements IMO MARPOL Annex VI requirements for energy efficiency

-- EEDI (Energy Efficiency Design Index) - For new ships
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_required DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_attained DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_reference_line DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_reduction_percentage DECIMAL(5,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_phase VARCHAR(20); -- Phase 0, 1, 2, 3
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_compliance_status VARCHAR(20) CHECK (eedi_compliance_status IN ('COMPLIANT', 'NON_COMPLIANT', 'EXEMPT', 'NOT_APPLICABLE'));
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_verification_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eedi_certificate_number VARCHAR(100);

-- EEXI (Energy Efficiency Existing Ship Index) - For existing ships
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_required DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_attained DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_reference_line DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_reduction_percentage DECIMAL(5,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_compliance_status VARCHAR(20) CHECK (eexi_compliance_status IN ('COMPLIANT', 'NON_COMPLIANT', 'EXEMPT', 'NOT_APPLICABLE'));
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_verification_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_certificate_number VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS eexi_survey_date DATE;

-- CII (Carbon Intensity Indicator) - Annual operational rating
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_rating VARCHAR(1) CHECK (cii_rating IN ('A', 'B', 'C', 'D', 'E'));
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_required DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_attained DECIMAL(10,4);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_year INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS cii_ship_type_category VARCHAR(50);

-- Energy Efficiency Technologies and Measures
ALTER TABLE ships ADD COLUMN IF NOT EXISTS shaft_generators BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS waste_heat_recovery BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS air_lubrication_system BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS wind_assisted_propulsion BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS hull_coating_type VARCHAR(50);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS propeller_optimization BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS engine_power_limitation BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS energy_saving_devices TEXT[]; -- Array of ESDs

-- Ship Energy Efficiency Management Plan (SEEMP)
ALTER TABLE ships ADD COLUMN IF NOT EXISTS seemp_version VARCHAR(20);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS seemp_approval_date DATE;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS seemp_part_ii_implemented BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS seemp_part_iii_implemented BOOLEAN DEFAULT false;

-- Main Engine Specifications (for EEXI/EEDI calculations)
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_manufacturer VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_model VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_type VARCHAR(50); -- Two-stroke, Four-stroke
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_cylinders INTEGER;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_stroke_mm DECIMAL(10,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_bore_mm DECIMAL(10,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_rpm DECIMAL(10,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS main_engine_sfoc DECIMAL(10,2); -- Specific Fuel Oil Consumption g/kWh
ALTER TABLE ships ADD COLUMN IF NOT EXISTS auxiliary_engine_power_kw DECIMAL(10,2);

-- Design and Performance Data
ALTER TABLE ships ADD COLUMN IF NOT EXISTS design_speed_knots DECIMAL(5,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS service_speed_knots DECIMAL(5,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS capacity_dwt DECIMAL(15,2); -- Same as deadweight_tonnage but for consistency
ALTER TABLE ships ADD COLUMN IF NOT EXISTS capacity_teu INTEGER; -- For container ships
ALTER TABLE ships ADD COLUMN IF NOT EXISTS capacity_cbm DECIMAL(15,2); -- Cubic meters for gas carriers
ALTER TABLE ships ADD COLUMN IF NOT EXISTS summer_draft_m DECIMAL(5,2);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS lightweight_tonnage DECIMAL(15,2);

-- Environmental and Compliance
ALTER TABLE ships ADD COLUMN IF NOT EXISTS nox_tier VARCHAR(20); -- Tier I, II, III
ALTER TABLE ships ADD COLUMN IF NOT EXISTS sox_scrubber_installed BOOLEAN DEFAULT false;
ALTER TABLE ships ADD COLUMN IF NOT EXISTS bwts_installed BOOLEAN DEFAULT false; -- Ballast Water Treatment System
ALTER TABLE ships ADD COLUMN IF NOT EXISTS bwts_manufacturer VARCHAR(100);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS ice_class VARCHAR(20);
ALTER TABLE ships ADD COLUMN IF NOT EXISTS double_hull BOOLEAN DEFAULT true;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ships_eedi_compliance ON ships(eedi_compliance_status);
CREATE INDEX IF NOT EXISTS idx_ships_eexi_compliance ON ships(eexi_compliance_status);
CREATE INDEX IF NOT EXISTS idx_ships_cii_rating ON ships(cii_rating);
CREATE INDEX IF NOT EXISTS idx_ships_cii_year ON ships(cii_year);

-- Add comments
COMMENT ON COLUMN ships.eedi_required IS 'Required EEDI value in gCO2/ton-mile based on IMO reference line';
COMMENT ON COLUMN ships.eedi_attained IS 'Attained EEDI value from ship design calculations';
COMMENT ON COLUMN ships.eexi_required IS 'Required EEXI value for existing ships';
COMMENT ON COLUMN ships.eexi_attained IS 'Attained EEXI value from technical file calculations';
COMMENT ON COLUMN ships.cii_rating IS 'Annual CII rating (A=best, E=worst)';
COMMENT ON COLUMN ships.cii_required IS 'Required CII value for the year';
COMMENT ON COLUMN ships.cii_attained IS 'Attained CII value from operational data';

-- Update existing vessels with sample EEXI/EEDI data based on year built and type
UPDATE ships SET
  -- EEDI for newer ships (built after 2013)
  eedi_phase = CASE
    WHEN year_built >= 2022 THEN 'Phase 3'
    WHEN year_built >= 2015 THEN 'Phase 2'
    WHEN year_built >= 2013 THEN 'Phase 1'
    ELSE 'Phase 0'
  END,
  eedi_required = CASE
    WHEN year_built >= 2013 THEN (deadweight_tonnage::DECIMAL / 1000) * 1.2
    ELSE NULL
  END,
  eedi_attained = CASE
    WHEN year_built >= 2013 THEN (deadweight_tonnage::DECIMAL / 1000) * 1.1
    ELSE NULL
  END,
  eedi_compliance_status = CASE
    WHEN year_built >= 2013 THEN 'COMPLIANT'
    ELSE 'NOT_APPLICABLE'
  END,
  -- EEXI for all existing ships (mandatory from 2023)
  eexi_required = (deadweight_tonnage::DECIMAL / 1000) * 1.15,
  eexi_attained = (deadweight_tonnage::DECIMAL / 1000) * 1.05,
  eexi_compliance_status = 'COMPLIANT',
  eexi_verification_date = '2023-01-01'::DATE,
  -- CII rating (2023 onwards)
  cii_rating = CASE 
    WHEN MOD(CAST(deadweight_tonnage AS INTEGER), 5) = 0 THEN 'A'
    WHEN MOD(CAST(deadweight_tonnage AS INTEGER), 5) = 1 THEN 'B'
    WHEN MOD(CAST(deadweight_tonnage AS INTEGER), 5) = 2 THEN 'C'
    WHEN MOD(CAST(deadweight_tonnage AS INTEGER), 5) = 3 THEN 'B'
    ELSE 'A'
  END,
  cii_year = 2025,
  cii_ship_type_category = ship_type,
  -- Main engine specifications
  main_engine_type = CASE
    WHEN ship_type LIKE '%LNG%' THEN 'Dual-Fuel Two-Stroke'
    WHEN deadweight_tonnage > 100000 THEN 'Two-Stroke Diesel'
    ELSE 'Four-Stroke Diesel'
  END,
  main_engine_sfoc = CASE
    WHEN ship_type LIKE '%LNG%' THEN 165.0
    WHEN deadweight_tonnage > 100000 THEN 172.0
    ELSE 185.0
  END,
  design_speed_knots = CASE
    WHEN ship_type LIKE '%Container%' THEN 22.0
    WHEN ship_type LIKE '%LNG%' THEN 19.5
    WHEN ship_type = 'VLCC' THEN 15.5
    ELSE 14.5
  END,
  service_speed_knots = CASE
    WHEN ship_type LIKE '%Container%' THEN 20.0
    WHEN ship_type LIKE '%LNG%' THEN 18.0
    WHEN ship_type = 'VLCC' THEN 14.0
    ELSE 13.5
  END,
  -- Energy efficiency technologies
  shaft_generators = CASE WHEN year_built >= 2015 THEN true ELSE false END,
  waste_heat_recovery = CASE WHEN year_built >= 2010 THEN true ELSE false END,
  propeller_optimization = CASE WHEN year_built >= 2018 THEN true ELSE false END,
  -- Environmental compliance
  nox_tier = CASE
    WHEN year_built >= 2016 THEN 'Tier III'
    WHEN year_built >= 2011 THEN 'Tier II'
    ELSE 'Tier I'
  END,
  sox_scrubber_installed = CASE 
    WHEN ship_type IN ('VLCC', 'TANKER_CRUDE') AND year_built >= 2018 THEN true
    ELSE false
  END,
  bwts_installed = CASE WHEN year_built >= 2017 THEN true ELSE false END,
  double_hull = true,
  -- SEEMP
  seemp_version = '3.0',
  seemp_approval_date = '2023-01-01'::DATE,
  seemp_part_ii_implemented = true,
  seemp_part_iii_implemented = CASE WHEN year_built >= 2020 THEN true ELSE false END
WHERE id IS NOT NULL;

-- Summary of EEXI/EEDI compliance
SELECT 
  ship_type,
  COUNT(*) as total_vessels,
  COUNT(CASE WHEN eedi_compliance_status = 'COMPLIANT' THEN 1 END) as eedi_compliant,
  COUNT(CASE WHEN eexi_compliance_status = 'COMPLIANT' THEN 1 END) as eexi_compliant,
  STRING_AGG(DISTINCT cii_rating, ', ' ORDER BY cii_rating) as cii_ratings,
  ROUND(AVG(eexi_attained)::NUMERIC, 2) as avg_eexi_attained
FROM ships
WHERE is_active = true
GROUP BY ship_type
ORDER BY ship_type;

