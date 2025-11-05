// Database Models for Maritime Compliance
// TypeScript interfaces matching the database schema

export interface Organization {
  id: string;
  name: string;
  imo_company_number?: string;
  registration_country: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Ship {
  id: string;
  imo_number: string;
  name: string;
  organization_id: string;
  ship_type?: string;
  gross_tonnage?: number;
  deadweight_tonnage?: number;
  engine_power_kw?: number;
  flag_state: string;
  year_built?: number;
  classification_society?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface Voyage {
  id: string;
  voyage_id: string;
  ship_id: string;
  voyage_type: string;
  start_date: Date;
  end_date?: Date;
  start_port?: string;
  end_port?: string;
  charter_type?: string;
  charterer_org_id?: string;
  created_at: Date;
  updated_at: Date;
  status: string;
}

export interface VoyageLeg {
  id: string;
  voyage_id: string;
  leg_number: number;
  departure_port: string;
  arrival_port: string;
  departure_date?: Date;
  arrival_date?: Date;
  distance_nm?: number;
  cargo_type?: string;
  cargo_quantity?: number;
  created_at: Date;
}

export interface FuelConsumption {
  id: string;
  voyage_id: string;
  leg_id: string;
  
  // Basic Fuel Information
  fuel_type: string;
  fuel_category: string;
  consumption_tonnes: number;
  consumption_date: Date;
  
  // Energy Source Type (for non-fuel energy)
  energy_source_type?: string;
  energy_consumption_kwh?: number;
  energy_consumption_gj?: number;
  
  // Fuel Supplier and Documentation
  fuel_supplier?: string;
  bunker_delivery_note?: string;
  certificate_of_origin?: string;
  sustainability_certificate?: string;
  
  // Physical Properties (DNV Standards)
  density_kg_m3?: number;
  lower_calorific_value_mj_kg?: number;
  higher_calorific_value_mj_kg?: number;
  viscosity_cst?: number;
  flash_point_c?: number;
  
  // Chemical Composition
  sulphur_content_pct?: number;
  carbon_content_pct?: number;
  hydrogen_content_pct?: number;
  nitrogen_content_pct?: number;
  oxygen_content_pct?: number;
  ash_content_pct?: number;
  water_content_pct?: number;
  
  // Biofuel Specific Properties (LR Standards)
  biofuel_feedstock?: string;
  biofuel_blend_ratio_pct?: number;
  biofuel_generation?: string;
  land_use_change_category?: string;
  
  // E-Fuel Specific Properties (ABS Standards)
  e_fuel_production_method?: string;
  renewable_electricity_source?: string;
  carbon_source?: string;
  well_to_tank_ghg_gco2e_mj?: number;
  tank_to_wake_ghg_gco2e_mj?: number;
  well_to_wake_ghg_gco2e_mj?: number;
  
  // Safety and Handling
  flash_point_category?: string;
  toxicity_level?: string;
  corrosiveness_rating?: string;
  storage_requirements?: string;
  handling_requirements?: string;
  
  // Engine Compatibility
  engine_type?: string;
  engine_manufacturer?: string;
  engine_model?: string;
  retrofit_required?: boolean;
  retrofit_certificate?: string;
  
  // Quality Assurance
  quality_test_results?: any;
  batch_number?: string;
  production_date?: Date;
  expiry_date?: Date;
  
  // Regulatory Compliance
  imo_annex_vi_compliant?: boolean;
  eu_red_ii_compliant?: boolean;
  iscc_certified?: boolean;
  rspo_certified?: boolean;
  
  // Onshore Power Supply (OPS) Specific Fields
  ops_connection_time_hours?: number;
  ops_power_consumption_kw?: number;
  ops_voltage_v?: number;
  ops_frequency_hz?: number;
  ops_connection_type?: string;
  ops_certification?: string;
  ops_emissions_factor_gco2e_kwh?: number;
  
  // Mewis Duct Efficiency Fields
  mewis_duct_installed?: boolean;
  mewis_duct_efficiency_gain_pct?: number;
  mewis_duct_fuel_savings_tonnes?: number;
  mewis_duct_installation_date?: Date;
  mewis_duct_certification?: string;
  
  // Wind Turbines/Wind Assistance Fields
  wind_turbines_installed?: boolean;
  wind_turbines_count?: number;
  wind_turbines_power_kw?: number;
  wind_turbines_efficiency_gain_pct?: number;
  wind_turbines_fuel_savings_tonnes?: number;
  wind_turbines_installation_date?: Date;
  wind_turbines_certification?: string;
  wind_speed_avg_ms?: number;
  wind_direction_avg_deg?: number;
  
  // Other Energy Efficiency Technologies
  energy_efficiency_technologies?: string[];
  total_efficiency_gain_pct?: number;
  total_fuel_savings_tonnes?: number;
  co2_reduction_tonnes?: number;
  
  // Verification and Audit
  created_at: Date;
  verified_at?: Date;
  verifier_id?: string;
  verification_certificate?: string;
  last_updated_by?: string;
  update_reason?: string;
}

export interface EuEtsData {
  id: string;
  voyage_id: string;
  reporting_year: number;
  covered_share_pct: number;
  total_co2_emissions_t: number;
  eu_covered_emissions_t: number;
  surrender_deadline: Date;
  allowances_required?: number;
  allowances_surrendered?: number;
  compliance_status: string;
  created_at: Date;
  verified_at?: Date;
  verifier_id?: string;
}

export interface FuelEuData {
  id: string;
  voyage_id: string;
  reporting_year: number;
  energy_in_scope_gj: number;
  ghg_intensity_gco2e_per_mj: number;
  compliance_balance_gco2e: number;
  pooling_status: string;
  pool_id?: string;
  created_at: Date;
  verified_at?: Date;
  verifier_id?: string;
}

export interface Verifier {
  id: string;
  name: string;
  accreditation_number: string;
  accreditation_body: string;
  accreditation_scope: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  created_at: Date;
  is_active: boolean;
}

export interface Verification {
  id: string;
  verifier_id: string;
  data_type: string;
  reference_id: string;
  verification_date: Date;
  verification_result: string;
  findings?: string;
  recommendations?: string;
  certificate_number?: string;
  created_at: Date;
}

export interface PoolingArrangement {
  id: string;
  pool_name: string;
  pool_leader_org_id: string;
  reporting_year: number;
  status: string;
  created_at: Date;
  closed_at?: Date;
}

export interface PoolParticipant {
  id: string;
  pool_id: string;
  organization_id: string;
  joined_at: Date;
  left_at?: Date;
}

export interface PoolRfq {
  id: string;
  organization_id: string;
  reporting_year: number;
  need_gco2e: number;
  price_range_min?: number;
  price_range_max?: number;
  notes?: string;
  status: string;
  created_at: Date;
  closed_at?: Date;
}

export interface PoolOffer {
  id: string;
  rfq_id: string;
  counterparty_org_id: string;
  offered_gco2e: number;
  price_eur_per_gco2e: number;
  valid_until: Date;
  status: string;
  created_at: Date;
}

export interface EuaTrade {
  id: string;
  organization_id: string;
  trade_type: string;
  quantity_tco2: number;
  price_eur_per_tco2: number;
  trade_date: Date;
  counterparty?: string;
  external_ref?: string;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  old_values?: any;
  new_values?: any;
  user_id?: string;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface ComplianceAlert {
  id: string;
  organization_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  due_date?: Date;
  status: string;
  created_at: Date;
  resolved_at?: Date;
}

export interface FuelSpecification {
  id: string;
  fuel_type: string;
  fuel_category: string;
  
  // Standard Properties (DNV Guidelines)
  standard_density_kg_m3?: number;
  standard_lower_calorific_value_mj_kg?: number;
  standard_higher_calorific_value_mj_kg?: number;
  standard_sulphur_content_pct?: number;
  standard_carbon_content_pct?: number;
  standard_hydrogen_content_pct?: number;
  
  // Default GHG Emissions (Well-to-Wake)
  default_well_to_wake_ghg_gco2e_mj?: number;
  default_tank_to_wake_ghg_gco2e_mj?: number;
  default_well_to_tank_ghg_gco2e_mj?: number;
  
  // Regulatory Classifications
  imo_annex_vi_category?: string;
  eu_red_ii_category?: string;
  carbon_intensity_factor?: number;
  
  // Safety Properties
  flash_point_c?: number;
  auto_ignition_temp_c?: number;
  toxicity_class?: string;
  corrosiveness_class?: string;
  
  // Engine Compatibility
  compatible_engine_types?: string[];
  retrofit_requirements?: string;
  
  // Certification Requirements
  required_certifications?: string[];
  quality_standards?: string[];
  
  // Classification Society Approvals
  dnv_approved?: boolean;
  lr_approved?: boolean;
  abs_approved?: boolean;
  approval_certificate_numbers?: string[];
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  notes?: string;
}

export interface EnergyEfficiencyTechnology {
  id: string;
  ship_id: string;
  technology_type: string;
  technology_name: string;
  manufacturer?: string;
  model?: string;
  installation_date: Date;
  certification?: string;
  
  // Performance Specifications
  rated_power_kw?: number;
  efficiency_gain_pct?: number;
  fuel_savings_potential_pct?: number;
  co2_reduction_potential_pct?: number;
  
  // Operational Parameters
  operational_hours?: number;
  availability_pct?: number;
  maintenance_interval_months?: number;
  last_maintenance_date?: Date;
  
  // Financial Information
  installation_cost_eur?: number;
  annual_maintenance_cost_eur?: number;
  payback_period_years?: number;
  
  // Status and Compliance
  status: string;
  compliance_status: string;
  verification_required?: boolean;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  notes?: string;
}

// Enums for type safety
export enum VoyageType {
  COMMERCIAL = 'COMMERCIAL',
  BALLAST = 'BALLAST',
  REPOSITIONING = 'REPOSITIONING'
}

export enum CharterType {
  SPOT_VOYAGE = 'SPOT_VOYAGE',
  TIME = 'TIME',
  BAREBOAT = 'BAREBOAT'
}

export enum FuelCategory {
  FOSSIL = 'FOSSIL',
  BIOFUEL = 'BIOFUEL',
  E_FUEL = 'E_FUEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
  EFFICIENCY = 'EFFICIENCY'
}

export enum FuelType {
  // Fossil Fuels
  MGO = 'MGO',
  MDO = 'MDO',
  HFO = 'HFO',
  LNG = 'LNG',
  LPG = 'LPG',
  
  // Biofuels
  BIO_MGO = 'BIO_MGO',
  BIO_MDO = 'BIO_MDO',
  BIO_HFO = 'BIO_HFO',
  FAME = 'FAME',
  HVO = 'HVO',
  BIO_LNG = 'BIO_LNG',
  BIO_METHANOL = 'BIO_METHANOL',
  BIO_ETHANOL = 'BIO_ETHANOL',
  
  // E-Fuels
  E_METHANOL = 'E_METHANOL',
  E_AMMONIA = 'E_AMMONIA',
  E_HYDROGEN = 'E_HYDROGEN',
  E_DIESEL = 'E_DIESEL',
  E_LNG = 'E_LNG',
  
  // Alternative Fuels
  METHANOL = 'METHANOL',
  AMMONIA = 'AMMONIA',
  HYDROGEN = 'HYDROGEN',
  DIMETHYL_ETHER = 'DIMETHYL_ETHER',
  
  // Hybrid Blends
  MGO_BIO_BLEND = 'MGO_BIO_BLEND',
  MDO_BIO_BLEND = 'MDO_BIO_BLEND',
  HFO_BIO_BLEND = 'HFO_BIO_BLEND',
  
  // Energy Efficiency Technologies
  OPS = 'OPS',
  MEWIS_DUCT = 'MEWIS_DUCT',
  WIND_TURBINES = 'WIND_TURBINES',
  SHAFT_GENERATOR = 'SHAFT_GENERATOR',
  WASTE_HEAT_RECOVERY = 'WASTE_HEAT_RECOVERY'
}

export enum BiofuelFeedstock {
  RAPESEED = 'RAPESEED',
  PALM = 'PALM',
  SOY = 'SOY',
  SUNFLOWER = 'SUNFLOWER',
  WASTE_COOKING_OIL = 'WASTE_COOKING_OIL',
  ANIMAL_FAT = 'ANIMAL_FAT',
  ALGAE = 'ALGAE',
  WOOD_RESIDUE = 'WOOD_RESIDUE',
  AGRICULTURAL_WASTE = 'AGRICULTURAL_WASTE',
  MUNICIPAL_WASTE = 'MUNICIPAL_WASTE'
}

export enum BiofuelGeneration {
  FIRST_GENERATION = '1G',
  SECOND_GENERATION = '2G',
  THIRD_GENERATION = '3G',
  FOURTH_GENERATION = '4G'
}

export enum LandUseChangeCategory {
  ILUC = 'ILUC',
  DLUC = 'DLUC',
  NO_LUC = 'NO_LUC'
}

export enum EFuelProductionMethod {
  ELECTROLYSIS = 'ELECTROLYSIS',
  POWER_TO_X = 'POWER_TO_X',
  FISCHER_TROPSCH = 'FISCHER_TROPSCH',
  METHANOL_SYNTHESIS = 'METHANOL_SYNTHESIS',
  AMMONIA_SYNTHESIS = 'AMMONIA_SYNTHESIS'
}

export enum RenewableElectricitySource {
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  HYDRO = 'HYDRO',
  GEOTHERMAL = 'GEOTHERMAL',
  TIDAL = 'TIDAL',
  WAVE = 'WAVE'
}

export enum CarbonSource {
  DIRECT_AIR_CAPTURE = 'DIRECT_AIR_CAPTURE',
  INDUSTRIAL_CO2 = 'INDUSTRIAL_CO2',
  BIOMASS_CO2 = 'BIOMASS_CO2',
  OCEAN_CO2 = 'OCEAN_CO2'
}

export enum ToxicityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH'
}

export enum CorrosivenessRating {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum FlashPointCategory {
  CATEGORY_A = 'CATEGORY_A',
  CATEGORY_B = 'CATEGORY_B',
  CATEGORY_C = 'CATEGORY_C',
  CATEGORY_D = 'CATEGORY_D'
}

export enum EnergySourceType {
  FUEL = 'FUEL',
  OPS = 'OPS',
  WIND_ASSISTED = 'WIND_ASSISTED',
  EFFICIENCY_GAIN = 'EFFICIENCY_GAIN',
  SHAFT_GENERATOR = 'SHAFT_GENERATOR',
  WASTE_HEAT_RECOVERY = 'WASTE_HEAT_RECOVERY'
}

export enum TechnologyType {
  MEWIS_DUCT = 'MEWIS_DUCT',
  WIND_TURBINES = 'WIND_TURBINES',
  OPS = 'OPS',
  SHAFT_GENERATOR = 'SHAFT_GENERATOR',
  WASTE_HEAT_RECOVERY = 'WASTE_HEAT_RECOVERY',
  AIR_LUBRICATION = 'AIR_LUBRICATION',
  PROPELLER_OPTIMIZATION = 'PROPELLER_OPTIMIZATION',
  HULL_CLEANING = 'HULL_CLEANING',
  SPEED_OPTIMIZATION = 'SPEED_OPTIMIZATION'
}

export enum TechnologyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSTALLATION = 'INSTALLATION'
}

export enum ComplianceStatus {
  PENDING = 'PENDING',
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  UNDER_REVIEW = 'UNDER_REVIEW'
}

export enum VerificationResult {
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  CONDITIONAL = 'CONDITIONAL',
  PENDING = 'PENDING'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertType {
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  NON_COMPLIANCE = 'NON_COMPLIANCE',
  VERIFICATION_DUE = 'VERIFICATION_DUE',
  POOLING_OPPORTUNITY = 'POOLING_OPPORTUNITY',
  HEDGING_ALERT = 'HEDGING_ALERT'
}
