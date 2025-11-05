-- Voyages and Fuel Consumption Schema
-- Uses existing comprehensive schema from nautilus-horizon/database/schema.sql

-- Copy fuel_specifications, energy_efficiency_technologies, fuel_consumption tables
-- These are comprehensive DNV/LR/ABS standards supporting:
-- - Biofuels, e-fuels, OPS, wind assistance
-- - Well-to-wake emissions calculations
-- - Energy efficiency technologies tracking

-- Note: This file references tables from the main schema.sql
-- The full schema should be loaded from nautilus-horizon/database/schema.sql

-- Additional indexes for voyage queries
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_voyage_date ON fuel_consumption(voyage_id, consumption_date);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_verifier ON fuel_consumption(verifier_id);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_fuel_type ON fuel_consumption(fuel_type);


