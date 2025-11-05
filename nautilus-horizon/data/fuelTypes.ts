/**
 * Comprehensive Fuel Types Database
 * 
 * Emission factors based on:
 * - EU RED II (Renewable Energy Directive II)
 * - EU ETS (Emissions Trading System)
 * - FuelEU Maritime Regulation
 * - IMO DCS (Data Collection System) - MEPC latest values
 * 
 * GWP (Global Warming Potential) values:
 * - CO2: 1
 * - CH4: 25 (GWP20) or 28-34 (GWP100)
 * - N2O: 265-298 (GWP100)
 * 
 * All values are in gCO2e/MJ unless otherwise specified
 */

export interface FuelEmissionFactors {
  fuelType: string;
  fuelCategory: 'FOSSIL' | 'BIOFUEL' | 'E_FUEL' | 'HYBRID' | 'ALTERNATIVE';
  
  // Physical Properties
  density_kg_m3: number;
  lower_calorific_value_mj_kg: number;
  carbon_content_pct: number;
  sulphur_content_pct: number;
  
  // Emission Factors - EU RED II (Well-to-Wake)
  redII_wtw_gco2e_mj: number;
  
  // Emission Factors - EU ETS (Tank-to-Wake)
  ets_ttw_gco2e_mj: number;
  
  // Emission Factors - FuelEU Maritime (Well-to-Wake)
  fueleu_wtw_gco2e_mj: number;
  
  // Emission Factors - IMO DCS (Tank-to-Wake)
  imo_dcs_ttw_co2e_mj: number;
  imo_dcs_ch4_gco2e_mj?: number;
  imo_dcs_n2o_gco2e_mj?: number;
  
  // Component breakdown
  well_to_tank_gco2e_mj: number;
  tank_to_wake_gco2e_mj: number;
}

export const FUEL_TYPES: FuelEmissionFactors[] = [
  // ===== FOSSIL FUELS =====
  
  {
    fuelType: 'MGO - Marine Gas Oil',
    fuelCategory: 'FOSSIL',
    density_kg_m3: 840,
    lower_calorific_value_mj_kg: 42.7,
    carbon_content_pct: 86.0,
    sulphur_content_pct: 0.1,
    redII_wtw_gco2e_mj: 89.0,
    ets_ttw_gco2e_mj: 77.0,
    fueleu_wtw_gco2e_mj: 89.0,
    imo_dcs_ttw_co2e_mj: 77.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.6,
    well_to_tank_gco2e_mj: 12.0,
    tank_to_wake_gco2e_mj: 77.0,
  },
  
  {
    fuelType: 'MDO - Marine Diesel Oil',
    fuelCategory: 'FOSSIL',
    density_kg_m3: 850,
    lower_calorific_value_mj_kg: 42.6,
    carbon_content_pct: 86.2,
    sulphur_content_pct: 0.5,
    redII_wtw_gco2e_mj: 90.0,
    ets_ttw_gco2e_mj: 78.0,
    fueleu_wtw_gco2e_mj: 90.0,
    imo_dcs_ttw_co2e_mj: 78.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.6,
    well_to_tank_gco2e_mj: 12.0,
    tank_to_wake_gco2e_mj: 78.0,
  },
  
  {
    fuelType: 'HFO - Heavy Fuel Oil',
    fuelCategory: 'FOSSIL',
    density_kg_m3: 980,
    lower_calorific_value_mj_kg: 40.2,
    carbon_content_pct: 87.0,
    sulphur_content_pct: 3.5,
    redII_wtw_gco2e_mj: 94.0,
    ets_ttw_gco2e_mj: 82.0,
    fueleu_wtw_gco2e_mj: 94.0,
    imo_dcs_ttw_co2e_mj: 82.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.6,
    well_to_tank_gco2e_mj: 12.0,
    tank_to_wake_gco2e_mj: 82.0,
  },
  
  {
    fuelType: 'VLSFO - Very Low Sulphur Fuel Oil',
    fuelCategory: 'FOSSIL',
    density_kg_m3: 920,
    lower_calorific_value_mj_kg: 42.5,
    carbon_content_pct: 86.5,
    sulphur_content_pct: 0.1,
    redII_wtw_gco2e_mj: 91.0,
    ets_ttw_gco2e_mj: 79.0,
    fueleu_wtw_gco2e_mj: 91.0,
    imo_dcs_ttw_co2e_mj: 79.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.6,
    well_to_tank_gco2e_mj: 12.0,
    tank_to_wake_gco2e_mj: 79.0,
  },
  
  {
    fuelType: 'LNG - Liquefied Natural Gas',
    fuelCategory: 'FOSSIL',
    density_kg_m3: 450,
    lower_calorific_value_mj_kg: 48.0,
    carbon_content_pct: 75.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 85.0,
    ets_ttw_gco2e_mj: 56.0,
    fueleu_wtw_gco2e_mj: 85.0,
    imo_dcs_ttw_co2e_mj: 56.0,
    imo_dcs_ch4_gco2e_mj: 2.5,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: 29.0,
    tank_to_wake_gco2e_mj: 56.0,
  },
  
  {
    fuelType: 'LPG - Liquefied Petroleum Gas',
    fuelCategory: 'FOSSIL',
    density_kg_m3: 510,
    lower_calorific_value_mj_kg: 46.0,
    carbon_content_pct: 82.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 82.0,
    ets_ttw_gco2e_mj: 66.0,
    fueleu_wtw_gco2e_mj: 82.0,
    imo_dcs_ttw_co2e_mj: 66.0,
    imo_dcs_ch4_gco2e_mj: 0.5,
    imo_dcs_n2o_gco2e_mj: 0.1,
    well_to_tank_gco2e_mj: 16.0,
    tank_to_wake_gco2e_mj: 66.0,
  },
  
  // ===== BIOFUELS =====
  
  {
    fuelType: 'FAME - Fatty Acid Methyl Esters (100%)',
    fuelCategory: 'BIOFUEL',
    density_kg_m3: 880,
    lower_calorific_value_mj_kg: 37.0,
    carbon_content_pct: 77.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 12.0,
    ets_ttw_gco2e_mj: 70.0,
    fueleu_wtw_gco2e_mj: 12.0,
    imo_dcs_ttw_co2e_mj: 70.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.3,
    well_to_tank_gco2e_mj: -58.0,
    tank_to_wake_gco2e_mj: 70.0,
  },
  
  {
    fuelType: 'HVO - Hydrotreated Vegetable Oil (100%)',
    fuelCategory: 'BIOFUEL',
    density_kg_m3: 780,
    lower_calorific_value_mj_kg: 44.0,
    carbon_content_pct: 85.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 10.0,
    ets_ttw_gco2e_mj: 75.0,
    fueleu_wtw_gco2e_mj: 10.0,
    imo_dcs_ttw_co2e_mj: 75.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.3,
    well_to_tank_gco2e_mj: -65.0,
    tank_to_wake_gco2e_mj: 75.0,
  },
  
  {
    fuelType: 'Bio-MGO (100%)',
    fuelCategory: 'BIOFUEL',
    density_kg_m3: 840,
    lower_calorific_value_mj_kg: 42.7,
    carbon_content_pct: 86.0,
    sulphur_content_pct: 0.1,
    redII_wtw_gco2e_mj: 20.0,
    ets_ttw_gco2e_mj: 77.0,
    fueleu_wtw_gco2e_mj: 20.0,
    imo_dcs_ttw_co2e_mj: 77.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.3,
    well_to_tank_gco2e_mj: -57.0,
    tank_to_wake_gco2e_mj: 77.0,
  },
  
  {
    fuelType: 'Bio-Methanol (100%)',
    fuelCategory: 'BIOFUEL',
    density_kg_m3: 790,
    lower_calorific_value_mj_kg: 19.9,
    carbon_content_pct: 37.5,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 15.0,
    ets_ttw_gco2e_mj: 70.0,
    fueleu_wtw_gco2e_mj: 15.0,
    imo_dcs_ttw_co2e_mj: 70.0,
    imo_dcs_ch4_gco2e_mj: 0.5,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: -55.0,
    tank_to_wake_gco2e_mj: 70.0,
  },
  
  {
    fuelType: 'Bio-LNG (100%)',
    fuelCategory: 'BIOFUEL',
    density_kg_m3: 450,
    lower_calorific_value_mj_kg: 48.0,
    carbon_content_pct: 75.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 8.0,
    ets_ttw_gco2e_mj: 56.0,
    fueleu_wtw_gco2e_mj: 8.0,
    imo_dcs_ttw_co2e_mj: 56.0,
    imo_dcs_ch4_gco2e_mj: 2.5,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: -48.0,
    tank_to_wake_gco2e_mj: 56.0,
  },
  
  {
    fuelType: 'Bio-Ethanol (100%)',
    fuelCategory: 'BIOFUEL',
    density_kg_m3: 790,
    lower_calorific_value_mj_kg: 26.4,
    carbon_content_pct: 52.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 12.0,
    ets_ttw_gco2e_mj: 65.0,
    fueleu_wtw_gco2e_mj: 12.0,
    imo_dcs_ttw_co2e_mj: 65.0,
    imo_dcs_ch4_gco2e_mj: 0.8,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: -53.0,
    tank_to_wake_gco2e_mj: 65.0,
  },
  
  // ===== E-FUELS (ELECTROFUELS) =====
  
  {
    fuelType: 'E-Methanol (100%)',
    fuelCategory: 'E_FUEL',
    density_kg_m3: 790,
    lower_calorific_value_mj_kg: 19.9,
    carbon_content_pct: 37.5,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 0.0,
    ets_ttw_gco2e_mj: 70.0,
    fueleu_wtw_gco2e_mj: 0.0,
    imo_dcs_ttw_co2e_mj: 70.0,
    imo_dcs_ch4_gco2e_mj: 0.5,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: -70.0,
    tank_to_wake_gco2e_mj: 70.0,
  },
  
  {
    fuelType: 'E-Ammonia (100%)',
    fuelCategory: 'E_FUEL',
    density_kg_m3: 680,
    lower_calorific_value_mj_kg: 18.6,
    carbon_content_pct: 0.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 0.0,
    ets_ttw_gco2e_mj: 0.0,
    fueleu_wtw_gco2e_mj: 0.0,
    imo_dcs_ttw_co2e_mj: 0.0,
    imo_dcs_ch4_gco2e_mj: 0.0,
    imo_dcs_n2o_gco2e_mj: 0.0,
    well_to_tank_gco2e_mj: 0.0,
    tank_to_wake_gco2e_mj: 0.0,
  },
  
  {
    fuelType: 'E-Hydrogen (100%)',
    fuelCategory: 'E_FUEL',
    density_kg_m3: 70,
    lower_calorific_value_mj_kg: 120.0,
    carbon_content_pct: 0.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 0.0,
    ets_ttw_gco2e_mj: 0.0,
    fueleu_wtw_gco2e_mj: 0.0,
    imo_dcs_ttw_co2e_mj: 0.0,
    imo_dcs_ch4_gco2e_mj: 0.0,
    imo_dcs_n2o_gco2e_mj: 0.0,
    well_to_tank_gco2e_mj: 0.0,
    tank_to_wake_gco2e_mj: 0.0,
  },
  
  {
    fuelType: 'E-Diesel (100%)',
    fuelCategory: 'E_FUEL',
    density_kg_m3: 840,
    lower_calorific_value_mj_kg: 42.8,
    carbon_content_pct: 85.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 0.0,
    ets_ttw_gco2e_mj: 77.0,
    fueleu_wtw_gco2e_mj: 0.0,
    imo_dcs_ttw_co2e_mj: 77.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.3,
    well_to_tank_gco2e_mj: -77.0,
    tank_to_wake_gco2e_mj: 77.0,
  },
  
  {
    fuelType: 'E-LNG (100%)',
    fuelCategory: 'E_FUEL',
    density_kg_m3: 450,
    lower_calorific_value_mj_kg: 48.0,
    carbon_content_pct: 75.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 0.0,
    ets_ttw_gco2e_mj: 56.0,
    fueleu_wtw_gco2e_mj: 0.0,
    imo_dcs_ttw_co2e_mj: 56.0,
    imo_dcs_ch4_gco2e_mj: 2.5,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: -56.0,
    tank_to_wake_gco2e_mj: 56.0,
  },
  
  // ===== ALTERNATIVE FOSSIL FUELS =====
  
  {
    fuelType: 'Methanol (Fossil)',
    fuelCategory: 'ALTERNATIVE',
    density_kg_m3: 790,
    lower_calorific_value_mj_kg: 19.9,
    carbon_content_pct: 37.5,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 75.0,
    ets_ttw_gco2e_mj: 70.0,
    fueleu_wtw_gco2e_mj: 75.0,
    imo_dcs_ttw_co2e_mj: 70.0,
    imo_dcs_ch4_gco2e_mj: 0.5,
    imo_dcs_n2o_gco2e_mj: 0.2,
    well_to_tank_gco2e_mj: 5.0,
    tank_to_wake_gco2e_mj: 70.0,
  },
  
  {
    fuelType: 'Ammonia (Fossil)',
    fuelCategory: 'ALTERNATIVE',
    density_kg_m3: 680,
    lower_calorific_value_mj_kg: 18.6,
    carbon_content_pct: 0.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 82.0,
    ets_ttw_gco2e_mj: 0.0,
    fueleu_wtw_gco2e_mj: 82.0,
    imo_dcs_ttw_co2e_mj: 0.0,
    imo_dcs_ch4_gco2e_mj: 0.0,
    imo_dcs_n2o_gco2e_mj: 0.0,
    well_to_tank_gco2e_mj: 82.0,
    tank_to_wake_gco2e_mj: 0.0,
  },
  
  {
    fuelType: 'Hydrogen (Fossil)',
    fuelCategory: 'ALTERNATIVE',
    density_kg_m3: 70,
    lower_calorific_value_mj_kg: 120.0,
    carbon_content_pct: 0.0,
    sulphur_content_pct: 0.0,
    redII_wtw_gco2e_mj: 90.0,
    ets_ttw_gco2e_mj: 0.0,
    fueleu_wtw_gco2e_mj: 90.0,
    imo_dcs_ttw_co2e_mj: 0.0,
    imo_dcs_ch4_gco2e_mj: 0.0,
    imo_dcs_n2o_gco2e_mj: 0.0,
    well_to_tank_gco2e_mj: 90.0,
    tank_to_wake_gco2e_mj: 0.0,
  },
  
  // ===== BLENDS =====
  
  {
    fuelType: 'MGO-B30 (30% Bio, 70% Fossil)',
    fuelCategory: 'HYBRID',
    density_kg_m3: 840,
    lower_calorific_value_mj_kg: 42.7,
    carbon_content_pct: 85.0,
    sulphur_content_pct: 0.1,
    redII_wtw_gco2e_mj: 65.0,
    ets_ttw_gco2e_mj: 77.0,
    fueleu_wtw_gco2e_mj: 65.0,
    imo_dcs_ttw_co2e_mj: 77.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.5,
    well_to_tank_gco2e_mj: -12.0,
    tank_to_wake_gco2e_mj: 77.0,
  },
  
  {
    fuelType: 'VLSFO-B20 (20% Bio, 80% Fossil)',
    fuelCategory: 'HYBRID',
    density_kg_m3: 920,
    lower_calorific_value_mj_kg: 42.5,
    carbon_content_pct: 86.0,
    sulphur_content_pct: 0.1,
    redII_wtw_gco2e_mj: 74.0,
    ets_ttw_gco2e_mj: 79.0,
    fueleu_wtw_gco2e_mj: 74.0,
    imo_dcs_ttw_co2e_mj: 79.0,
    imo_dcs_ch4_gco2e_mj: 0.1,
    imo_dcs_n2o_gco2e_mj: 0.6,
    well_to_tank_gco2e_mj: -5.0,
    tank_to_wake_gco2e_mj: 79.0,
  },
];

// Helper functions
export function getFuelByName(name: string): FuelEmissionFactors | undefined {
  return FUEL_TYPES.find(f => f.fuelType === name);
}

export function getFuelsByCategory(category: string): FuelEmissionFactors[] {
  return FUEL_TYPES.filter(f => f.fuelCategory === category);
}

export function getAllFuelTypes(): string[] {
  return FUEL_TYPES.map(f => f.fuelType);
}

