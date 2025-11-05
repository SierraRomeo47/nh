// Data Validation and Verification System
// Ensures data integrity and compliance with regulatory standards

import { FuelConsumption, EuEtsData, FuelEuData, Verification } from './models';

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export class DataValidator {
  
  // Fuel Consumption Validation (Enhanced for DNV/LR/ABS Standards)
  static validateFuelConsumption(data: Partial<FuelConsumption>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!data.fuel_type) {
      errors.push({ field: 'fuel_type', message: 'Fuel type is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.fuel_category) {
      errors.push({ field: 'fuel_category', message: 'Fuel category is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.consumption_tonnes || data.consumption_tonnes <= 0) {
      errors.push({ field: 'consumption_tonnes', message: 'Fuel consumption must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (!data.consumption_date) {
      errors.push({ field: 'consumption_date', message: 'Consumption date is required', code: 'REQUIRED_FIELD' });
    }

    // Fuel category validation
    const validFuelCategories = ['FOSSIL', 'BIOFUEL', 'E_FUEL', 'HYBRID'];
    if (data.fuel_category && !validFuelCategories.includes(data.fuel_category)) {
      errors.push({ field: 'fuel_category', message: `Invalid fuel category. Must be one of: ${validFuelCategories.join(', ')}`, code: 'INVALID_ENUM' });
    }

    // Fuel type validation (expanded list)
    const validFuelTypes = [
      // Fossil Fuels
      'MGO', 'MDO', 'HFO', 'LNG', 'LPG',
      // Biofuels
      'BIO_MGO', 'BIO_MDO', 'BIO_HFO', 'FAME', 'HVO', 'BIO_LNG', 'BIO_METHANOL', 'BIO_ETHANOL',
      // E-Fuels
      'E_METHANOL', 'E_AMMONIA', 'E_HYDROGEN', 'E_DIESEL', 'E_LNG',
      // Alternative Fuels
      'METHANOL', 'AMMONIA', 'HYDROGEN', 'DIMETHYL_ETHER',
      // Hybrid Blends
      'MGO_BIO_BLEND', 'MDO_BIO_BLEND', 'HFO_BIO_BLEND'
    ];
    
    if (data.fuel_type && !validFuelTypes.includes(data.fuel_type)) {
      errors.push({ field: 'fuel_type', message: `Invalid fuel type. Must be one of: ${validFuelTypes.join(', ')}`, code: 'INVALID_ENUM' });
    }

    // Calorific value validation (critical for biofuels and e-fuels)
    if (data.lower_calorific_value_mj_kg) {
      if (data.lower_calorific_value_mj_kg < 10 || data.lower_calorific_value_mj_kg > 120) {
        warnings.push({ field: 'lower_calorific_value_mj_kg', message: 'Calorific value seems unusual. Please verify.', code: 'UNUSUAL_VALUE' });
      }
    } else if (data.fuel_category === 'BIOFUEL' || data.fuel_category === 'E_FUEL') {
      errors.push({ field: 'lower_calorific_value_mj_kg', message: 'Calorific value is required for biofuels and e-fuels', code: 'REQUIRED_FIELD' });
    }

    // Density validation (enhanced ranges)
    if (data.density_kg_m3) {
      if (data.density_kg_m3 < 70 || data.density_kg_m3 > 1200) {
        warnings.push({ field: 'density_kg_m3', message: 'Fuel density seems unusual. Please verify.', code: 'UNUSUAL_VALUE' });
      }
    }

    // Sulphur content validation (regulatory compliance)
    if (data.sulphur_content_pct) {
      if (data.sulphur_content_pct > 3.5) {
        errors.push({ field: 'sulphur_content_pct', message: 'Sulphur content exceeds IMO global limit (3.5%)', code: 'REGULATORY_VIOLATION' });
      }
      if (data.sulphur_content_pct > 0.5) {
        warnings.push({ field: 'sulphur_content_pct', message: 'Sulphur content exceeds ECA limit (0.5%)', code: 'REGULATORY_WARNING' });
      }
    }

    // Biofuel-specific validation
    if (data.fuel_category === 'BIOFUEL') {
      if (!data.biofuel_feedstock) {
        errors.push({ field: 'biofuel_feedstock', message: 'Biofuel feedstock is required', code: 'REQUIRED_FIELD' });
      }
      if (!data.sustainability_certificate) {
        errors.push({ field: 'sustainability_certificate', message: 'Sustainability certificate is required for biofuels', code: 'REQUIRED_FIELD' });
      }
      if (data.biofuel_blend_ratio_pct && (data.biofuel_blend_ratio_pct < 0 || data.biofuel_blend_ratio_pct > 100)) {
        errors.push({ field: 'biofuel_blend_ratio_pct', message: 'Biofuel blend ratio must be between 0 and 100%', code: 'INVALID_RANGE' });
      }
    }

    // E-fuel specific validation
    if (data.fuel_category === 'E_FUEL') {
      if (!data.certificate_of_origin) {
        errors.push({ field: 'certificate_of_origin', message: 'Certificate of origin is required for e-fuels', code: 'REQUIRED_FIELD' });
      }
      if (!data.renewable_electricity_source) {
        errors.push({ field: 'renewable_electricity_source', message: 'Renewable electricity source must be specified for e-fuels', code: 'REQUIRED_FIELD' });
      }
      if (!data.well_to_wake_ghg_gco2e_mj) {
        warnings.push({ field: 'well_to_wake_ghg_gco2e_mj', message: 'Well-to-wake GHG emissions should be provided for e-fuels', code: 'RECOMMENDED_FIELD' });
      }
    }

    // Hybrid fuel validation
    if (data.fuel_category === 'HYBRID') {
      if (!data.biofuel_blend_ratio_pct) {
        errors.push({ field: 'biofuel_blend_ratio_pct', message: 'Biofuel blend ratio is required for hybrid fuels', code: 'REQUIRED_FIELD' });
      }
    }

    // Safety and handling validation
    if (data.toxicity_level === 'HIGH' || data.toxicity_level === 'VERY_HIGH') {
      if (!data.handling_requirements) {
        warnings.push({ field: 'handling_requirements', message: 'Handling requirements should be specified for toxic fuels', code: 'RECOMMENDED_FIELD' });
      }
    }

    if (data.corrosiveness_rating === 'HIGH') {
      if (!data.storage_requirements) {
        warnings.push({ field: 'storage_requirements', message: 'Storage requirements should be specified for corrosive fuels', code: 'RECOMMENDED_FIELD' });
      }
    }

    // Engine compatibility validation
    if (data.retrofit_required && !data.retrofit_certificate) {
      warnings.push({ field: 'retrofit_certificate', message: 'Retrofit certificate should be provided when retrofit is required', code: 'RECOMMENDED_FIELD' });
    }

    // Quality assurance validation
    if (data.expiry_date && data.production_date) {
      const productionDate = new Date(data.production_date);
      const expiryDate = new Date(data.expiry_date);
      if (expiryDate <= productionDate) {
        errors.push({ field: 'expiry_date', message: 'Expiry date must be after production date', code: 'INVALID_DATE' });
      }
    }

    // Regulatory compliance validation
    if (data.fuel_category === 'BIOFUEL' && !data.eu_red_ii_compliant) {
      warnings.push({ field: 'eu_red_ii_compliant', message: 'Biofuels should be EU RED II compliant', code: 'REGULATORY_WARNING' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // EU ETS Data Validation
  static validateEuEtsData(data: Partial<EuEtsData>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!data.reporting_year) {
      errors.push({ field: 'reporting_year', message: 'Reporting year is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.covered_share_pct) {
      errors.push({ field: 'covered_share_pct', message: 'Covered share percentage is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.total_co2_emissions_t || data.total_co2_emissions_t <= 0) {
      errors.push({ field: 'total_co2_emissions_t', message: 'Total CO2 emissions must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (!data.eu_covered_emissions_t || data.eu_covered_emissions_t <= 0) {
      errors.push({ field: 'eu_covered_emissions_t', message: 'EU covered emissions must be greater than 0', code: 'INVALID_VALUE' });
    }

    // Percentage validation
    if (data.covered_share_pct && (data.covered_share_pct < 0 || data.covered_share_pct > 100)) {
      errors.push({ field: 'covered_share_pct', message: 'Covered share percentage must be between 0 and 100', code: 'INVALID_RANGE' });
    }

    // Year validation
    const currentYear = new Date().getFullYear();
    if (data.reporting_year && (data.reporting_year < 2024 || data.reporting_year > currentYear + 1)) {
      warnings.push({ field: 'reporting_year', message: 'Reporting year seems unusual', code: 'UNUSUAL_VALUE' });
    }

    // Emissions consistency check
    if (data.total_co2_emissions_t && data.eu_covered_emissions_t && data.covered_share_pct) {
      const calculatedEuEmissions = (data.total_co2_emissions_t * data.covered_share_pct) / 100;
      const tolerance = 0.01; // 1% tolerance
      
      if (Math.abs(calculatedEuEmissions - data.eu_covered_emissions_t) > tolerance) {
        errors.push({ 
          field: 'eu_covered_emissions_t', 
          message: `EU covered emissions (${data.eu_covered_emissions_t}) doesn't match calculated value (${calculatedEuEmissions.toFixed(3)})`, 
          code: 'CALCULATION_MISMATCH' 
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // FuelEU Data Validation
  static validateFuelEuData(data: Partial<FuelEuData>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!data.reporting_year) {
      errors.push({ field: 'reporting_year', message: 'Reporting year is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.energy_in_scope_gj || data.energy_in_scope_gj <= 0) {
      errors.push({ field: 'energy_in_scope_gj', message: 'Energy in scope must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (!data.ghg_intensity_gco2e_per_mj || data.ghg_intensity_gco2e_per_mj <= 0) {
      errors.push({ field: 'ghg_intensity_gco2e_per_mj', message: 'GHG intensity must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (data.compliance_balance_gco2e === undefined || data.compliance_balance_gco2e === null) {
      errors.push({ field: 'compliance_balance_gco2e', message: 'Compliance balance is required', code: 'REQUIRED_FIELD' });
    }

    // GHG intensity validation (typical ranges)
    if (data.ghg_intensity_gco2e_per_mj) {
      if (data.ghg_intensity_gco2e_per_mj < 50) {
        warnings.push({ field: 'ghg_intensity_gco2e_per_mj', message: 'GHG intensity seems very low. Please verify.', code: 'UNUSUAL_VALUE' });
      }
      if (data.ghg_intensity_gco2e_per_mj > 120) {
        warnings.push({ field: 'ghg_intensity_gco2e_per_mj', message: 'GHG intensity seems very high. Please verify.', code: 'UNUSUAL_VALUE' });
      }
    }

    // Pooling status validation
    const validPoolingStatuses = ['STANDALONE', 'IN_POOL', 'POOL_LEADER'];
    if (data.pooling_status && !validPoolingStatuses.includes(data.pooling_status)) {
      errors.push({ field: 'pooling_status', message: `Invalid pooling status. Must be one of: ${validPoolingStatuses.join(', ')}`, code: 'INVALID_ENUM' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Cross-validation between different data types
  static validateDataConsistency(
    fuelData: FuelConsumption[],
    etsData: EuEtsData,
    fueleuData: FuelEuData
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Calculate total fuel consumption
    const totalFuelConsumption = fuelData.reduce((sum, fuel) => sum + fuel.consumption_tonnes, 0);

    // Estimate CO2 emissions from fuel consumption (rough calculation)
    const estimatedCo2Emissions = totalFuelConsumption * 3.1; // Rough factor for marine fuels
    const tolerance = 0.2; // 20% tolerance

    if (etsData.total_co2_emissions_t) {
      const difference = Math.abs(estimatedCo2Emissions - etsData.total_co2_emissions_t);
      const percentageDifference = (difference / etsData.total_co2_emissions_t) * 100;

      if (percentageDifference > tolerance * 100) {
        warnings.push({
          field: 'total_co2_emissions_t',
          message: `CO2 emissions (${etsData.total_co2_emissions_t}) differ significantly from fuel-based estimate (${estimatedCo2Emissions.toFixed(1)})`,
          code: 'ESTIMATION_MISMATCH'
        });
      }
    }

    // Check FuelEU energy calculation
    if (fueleuData.energy_in_scope_gj) {
      // Rough conversion: 1 tonne fuel ≈ 42 GJ
      const estimatedEnergy = totalFuelConsumption * 42;
      const energyDifference = Math.abs(estimatedEnergy - fueleuData.energy_in_scope_gj);
      const energyPercentageDifference = (energyDifference / fueleuData.energy_in_scope_gj) * 100;

      if (energyPercentageDifference > tolerance * 100) {
        warnings.push({
          field: 'energy_in_scope_gj',
          message: `Energy in scope (${fueleuData.energy_in_scope_gj}) differs significantly from fuel-based estimate (${estimatedEnergy.toFixed(1)})`,
          code: 'ESTIMATION_MISMATCH'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Verification validation
  static validateVerification(data: Partial<Verification>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!data.verifier_id) {
      errors.push({ field: 'verifier_id', message: 'Verifier ID is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.data_type) {
      errors.push({ field: 'data_type', message: 'Data type is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.reference_id) {
      errors.push({ field: 'reference_id', message: 'Reference ID is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.verification_date) {
      errors.push({ field: 'verification_date', message: 'Verification date is required', code: 'REQUIRED_FIELD' });
    }

    if (!data.verification_result) {
      errors.push({ field: 'verification_result', message: 'Verification result is required', code: 'REQUIRED_FIELD' });
    }

    // Data type validation
    const validDataTypes = ['FUEL_CONSUMPTION', 'EU_ETS', 'FUELEU'];
    if (data.data_type && !validDataTypes.includes(data.data_type)) {
      errors.push({ field: 'data_type', message: `Invalid data type. Must be one of: ${validDataTypes.join(', ')}`, code: 'INVALID_ENUM' });
    }

    // Verification result validation
    const validResults = ['VERIFIED', 'REJECTED', 'CONDITIONAL', 'PENDING'];
    if (data.verification_result && !validResults.includes(data.verification_result)) {
      errors.push({ field: 'verification_result', message: `Invalid verification result. Must be one of: ${validResults.join(', ')}`, code: 'INVALID_ENUM' });
    }

    // Date validation
    if (data.verification_date) {
      const verificationDate = new Date(data.verification_date);
      const now = new Date();
      
      if (verificationDate > now) {
        errors.push({ field: 'verification_date', message: 'Verification date cannot be in the future', code: 'INVALID_DATE' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export validation functions
export const validateFuelConsumption = DataValidator.validateFuelConsumption;
export const validateEuEtsData = DataValidator.validateEuEtsData;
export const validateFuelEuData = DataValidator.validateFuelEuData;
export const validateDataConsistency = DataValidator.validateDataConsistency;
export const validateVerification = DataValidator.validateVerification;
