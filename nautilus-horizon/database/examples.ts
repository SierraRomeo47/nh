// Database Usage Examples
// Demonstrates how to use the enhanced voyage schema with DNV/LR/ABS standards

import { 
  FuelConsumption, 
  FuelSpecification, 
  FuelCategory, 
  FuelType,
  BiofuelFeedstock,
  BiofuelGeneration,
  EFuelProductionMethod,
  RenewableElectricitySource,
  CarbonSource,
  ToxicityLevel,
  CorrosivenessRating
} from './models';
import { calculateFuelConsumption, validateFuelProperties } from './fuelCalculations';
import { validateFuelConsumption } from './validation';

// Example 1: Fossil Fuel Consumption (Traditional MGO)
export const exampleFossilFuel: Partial<FuelConsumption> = {
  fuel_type: FuelType.MGO,
  fuel_category: FuelCategory.FOSSIL,
  consumption_tonnes: 150.5,
  consumption_date: new Date('2024-01-15'),
  fuel_supplier: 'Shell Marine',
  bunker_delivery_note: 'BDN-2024-001',
  density_kg_m3: 840,
  lower_calorific_value_mj_kg: 42.7,
  sulphur_content_pct: 0.1,
  carbon_content_pct: 86.0,
  engine_type: '4-stroke',
  engine_manufacturer: 'MAN',
  engine_model: 'L32/40',
  imo_annex_vi_compliant: true
};

// Example 2: Biofuel Consumption (HVO - Hydrotreated Vegetable Oil)
export const exampleBiofuel: Partial<FuelConsumption> = {
  fuel_type: FuelType.HVO,
  fuel_category: FuelCategory.BIOFUEL,
  consumption_tonnes: 120.0,
  consumption_date: new Date('2024-01-20'),
  fuel_supplier: 'Neste Marine',
  bunker_delivery_note: 'BDN-2024-002',
  certificate_of_origin: 'CO-2024-001',
  sustainability_certificate: 'ISCC-EU-123456',
  density_kg_m3: 780,
  lower_calorific_value_mj_kg: 44.0,
  sulphur_content_pct: 0.0,
  carbon_content_pct: 85.0,
  biofuel_feedstock: BiofuelFeedstock.WASTE_COOKING_OIL,
  biofuel_blend_ratio_pct: 100.0,
  biofuel_generation: BiofuelGeneration.SECOND_GENERATION,
  land_use_change_category: 'NO_LUC',
  engine_type: '4-stroke',
  engine_manufacturer: 'Wärtsilä',
  engine_model: 'W32',
  eu_red_ii_compliant: true,
  iscc_certified: true
};

// Example 3: E-Fuel Consumption (E-Methanol)
export const exampleEFuel: Partial<FuelConsumption> = {
  fuel_type: FuelType.E_METHANOL,
  fuel_category: FuelCategory.E_FUEL,
  consumption_tonnes: 200.0,
  consumption_date: new Date('2024-01-25'),
  fuel_supplier: 'Green Methanol Co.',
  bunker_delivery_note: 'BDN-2024-003',
  certificate_of_origin: 'CO-2024-002',
  density_kg_m3: 790,
  lower_calorific_value_mj_kg: 19.9,
  sulphur_content_pct: 0.0,
  carbon_content_pct: 37.5,
  e_fuel_production_method: EFuelProductionMethod.METHANOL_SYNTHESIS,
  renewable_electricity_source: RenewableElectricitySource.WIND,
  carbon_source: CarbonSource.DIRECT_AIR_CAPTURE,
  well_to_tank_ghg_gco2e_mj: -70.0,
  tank_to_wake_ghg_gco2e_mj: 70.0,
  well_to_wake_ghg_gco2e_mj: 0.0,
  toxicity_level: ToxicityLevel.MEDIUM,
  corrosiveness_rating: CorrosivenessRating.MEDIUM,
  storage_requirements: 'Store in dedicated methanol tanks with inert gas blanketing',
  handling_requirements: 'Use appropriate PPE and ensure adequate ventilation',
  engine_type: 'Dual-fuel',
  engine_manufacturer: 'MAN',
  engine_model: 'ME-LGIM',
  retrofit_required: true,
  retrofit_certificate: 'RETROFIT-2024-001'
};

// Example 4: Hybrid Fuel Consumption (MGO-Bio Blend)
export const exampleHybridFuel: Partial<FuelConsumption> = {
  fuel_type: FuelType.MGO_BIO_BLEND,
  fuel_category: FuelCategory.HYBRID,
  consumption_tonnes: 180.0,
  consumption_date: new Date('2024-01-30'),
  fuel_supplier: 'BP Marine',
  bunker_delivery_note: 'BDN-2024-004',
  certificate_of_origin: 'CO-2024-003',
  sustainability_certificate: 'ISCC-EU-789012',
  density_kg_m3: 830,
  lower_calorific_value_mj_kg: 42.5,
  sulphur_content_pct: 0.1,
  carbon_content_pct: 85.5,
  biofuel_feedstock: BiofuelFeedstock.RAPESEED,
  biofuel_blend_ratio_pct: 30.0,
  biofuel_generation: BiofuelGeneration.FIRST_GENERATION,
  land_use_change_category: 'ILUC',
  engine_type: '4-stroke',
  engine_manufacturer: 'Caterpillar',
  engine_model: 'C32',
  imo_annex_vi_compliant: true,
  eu_red_ii_compliant: true,
  iscc_certified: true
};

// Example 5: Fuel Specification (Standard HVO Properties)
export const exampleFuelSpecification: Partial<FuelSpecification> = {
  fuel_type: FuelType.HVO,
  fuel_category: FuelCategory.BIOFUEL,
  standard_density_kg_m3: 780,
  standard_lower_calorific_value_mj_kg: 44.0,
  standard_higher_calorific_value_mj_kg: 46.5,
  standard_sulphur_content_pct: 0.0,
  standard_carbon_content_pct: 85.0,
  standard_hydrogen_content_pct: 15.0,
  default_well_to_wake_ghg_gco2e_mj: 15.0,
  default_tank_to_wake_ghg_gco2e_mj: 75.0,
  default_well_to_tank_ghg_gco2e_mj: -60.0,
  imo_annex_vi_category: 'Category A',
  eu_red_ii_category: 'Advanced Biofuel',
  carbon_intensity_factor: 15.0,
  flash_point_c: 60.0,
  auto_ignition_temp_c: 300.0,
  toxicity_class: 'Low',
  corrosiveness_class: 'Low',
  compatible_engine_types: ['4-stroke', '2-stroke'],
  retrofit_requirements: 'No retrofit required for blends up to 30%',
  required_certifications: ['ISCC', 'RED II'],
  quality_standards: ['EN 14214', 'ASTM D975'],
  dnv_approved: true,
  lr_approved: true,
  abs_approved: true,
  approval_certificate_numbers: ['DNV-2024-001', 'LR-2024-001', 'ABS-2024-001']
};

// Usage Examples
export class VoyageSchemaExamples {
  
  // Example: Validate and calculate fossil fuel consumption
  static processFossilFuelConsumption() {
    console.log('=== Processing Fossil Fuel Consumption ===');
    
    // Validate the fuel data
    const validation = validateFuelConsumption(exampleFossilFuel);
    console.log('Validation Result:', validation);
    
    if (validation.isValid) {
      // Calculate emissions and energy consumption
      const calculation = calculateFuelConsumption(exampleFossilFuel as FuelConsumption);
      console.log('Calculation Result:', calculation);
      
      // Validate fuel properties
      const propertyValidation = validateFuelProperties(exampleFossilFuel as FuelConsumption);
      console.log('Property Validation:', propertyValidation);
    }
  }
  
  // Example: Process biofuel consumption with sustainability tracking
  static processBiofuelConsumption() {
    console.log('=== Processing Biofuel Consumption ===');
    
    const validation = validateFuelConsumption(exampleBiofuel);
    console.log('Validation Result:', validation);
    
    if (validation.isValid) {
      const calculation = calculateFuelConsumption(exampleBiofuel as FuelConsumption);
      console.log('Calculation Result:', calculation);
      
      // Check sustainability compliance
      if (exampleBiofuel.iscc_certified && exampleBiofuel.eu_red_ii_compliant) {
        console.log('✅ Biofuel meets sustainability requirements');
      }
      
      // Calculate FuelEU compliance benefit
      console.log(`FuelEU Compliance Balance: ${calculation.fueleuComplianceBalanceGco2e.toFixed(2)} gCO2e`);
    }
  }
  
  // Example: Process e-fuel consumption with carbon neutrality
  static processEFuelConsumption() {
    console.log('=== Processing E-Fuel Consumption ===');
    
    const validation = validateFuelConsumption(exampleEFuel);
    console.log('Validation Result:', validation);
    
    if (validation.isValid) {
      const calculation = calculateFuelConsumption(exampleEFuel as FuelConsumption);
      console.log('Calculation Result:', calculation);
      
      // Verify carbon neutrality
      if (calculation.wellToWakeEmissionsGco2e === 0) {
        console.log('✅ E-fuel is carbon neutral');
      }
      
      // Check safety requirements
      if (exampleEFuel.toxicity_level === ToxicityLevel.MEDIUM) {
        console.log('⚠️ Medium toxicity - ensure proper handling procedures');
      }
    }
  }
  
  // Example: Process hybrid fuel with blend tracking
  static processHybridFuelConsumption() {
    console.log('=== Processing Hybrid Fuel Consumption ===');
    
    const validation = validateFuelConsumption(exampleHybridFuel);
    console.log('Validation Result:', validation);
    
    if (validation.isValid) {
      const calculation = calculateFuelConsumption(exampleHybridFuel as FuelConsumption);
      console.log('Calculation Result:', calculation);
      
      // Calculate blend-specific emissions
      const blendRatio = exampleHybridFuel.biofuel_blend_ratio_pct || 0;
      console.log(`Biofuel blend ratio: ${blendRatio}%`);
      console.log(`Emissions reduction vs pure fossil: ${((90.0 - calculation.carbonIntensityGco2eMj) / 90.0 * 100).toFixed(1)}%`);
    }
  }
  
  // Example: Create fuel specification for new fuel type
  static createFuelSpecification() {
    console.log('=== Creating Fuel Specification ===');
    
    const spec = exampleFuelSpecification;
    console.log('Fuel Specification:', spec);
    
    // Check classification society approvals
    const approvals = [];
    if (spec.dnv_approved) approvals.push('DNV');
    if (spec.lr_approved) approvals.push('LR');
    if (spec.abs_approved) approvals.push('ABS');
    
    console.log(`Classification Society Approvals: ${approvals.join(', ')}`);
    console.log(`Default GHG Intensity: ${spec.default_well_to_wake_ghg_gco2e_mj} gCO2e/MJ`);
  }
  
  // Example: Comprehensive voyage fuel analysis
  static analyzeVoyageFuels() {
    console.log('=== Voyage Fuel Analysis ===');
    
    const fuels = [exampleFossilFuel, exampleBiofuel, exampleEFuel, exampleHybridFuel];
    let totalEnergy = 0;
    let totalEmissions = 0;
    let totalConsumption = 0;
    
    fuels.forEach((fuel, index) => {
      const validation = validateFuelConsumption(fuel);
      if (validation.isValid) {
        const calculation = calculateFuelConsumption(fuel as FuelConsumption);
        totalEnergy += calculation.energyConsumptionGj;
        totalEmissions += calculation.wellToWakeEmissionsGco2e;
        totalConsumption += fuel.consumption_tonnes || 0;
        
        console.log(`Fuel ${index + 1} (${fuel.fuel_type}):`);
        console.log(`  Consumption: ${fuel.consumption_tonnes} tonnes`);
        console.log(`  Energy: ${calculation.energyConsumptionGj.toFixed(1)} GJ`);
        console.log(`  Emissions: ${calculation.wellToWakeEmissionsGco2e.toFixed(1)} gCO2e`);
        console.log(`  Carbon Intensity: ${calculation.carbonIntensityGco2eMj.toFixed(1)} gCO2e/MJ`);
      }
    });
    
    console.log('\n=== Voyage Summary ===');
    console.log(`Total Consumption: ${totalConsumption.toFixed(1)} tonnes`);
    console.log(`Total Energy: ${totalEnergy.toFixed(1)} GJ`);
    console.log(`Total Emissions: ${totalEmissions.toFixed(1)} gCO2e`);
    console.log(`Average Carbon Intensity: ${(totalEmissions / totalEnergy).toFixed(1)} gCO2e/MJ`);
  }
}

// Export examples for use in other modules
export {
  exampleFossilFuel,
  exampleBiofuel,
  exampleEFuel,
  exampleHybridFuel,
  exampleFuelSpecification
};
