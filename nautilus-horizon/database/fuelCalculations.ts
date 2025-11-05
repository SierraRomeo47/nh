// Fuel Calculation Service
// Implements DNV, LR, and ABS standards for fuel consumption and emissions calculations

import { 
  FuelConsumption, 
  FuelSpecification, 
  FuelCategory, 
  FuelType,
  BiofuelFeedstock,
  BiofuelGeneration,
  EFuelProductionMethod,
  RenewableElectricitySource,
  CarbonSource
} from './models';

export interface FuelCalculationResult {
  energyConsumptionGj: number;
  co2EmissionsT: number;
  ghgEmissionsGco2e: number;
  wellToWakeEmissionsGco2e: number;
  tankToWakeEmissionsGco2e: number;
  wellToTankEmissionsGco2e: number;
  carbonIntensityGco2eMj: number;
  fueleuComplianceBalanceGco2e: number;
}

export interface FuelEfficiencyMetrics {
  specificFuelConsumption: number; // g/kWh
  energyEfficiencyIndex: number; // EEOI
  carbonIntensityIndicator: number; // CII
  fuelEfficiencyRatio: number; // FER
}

export class FuelCalculationService {
  
  // Standard fuel properties (DNV Guidelines)
  private static readonly STANDARD_FUEL_PROPERTIES: Record<string, Partial<FuelSpecification>> = {
    // Fossil Fuels
    [FuelType.MGO]: {
      standard_density_kg_m3: 840,
      standard_lower_calorific_value_mj_kg: 42.7,
      standard_sulphur_content_pct: 0.1,
      standard_carbon_content_pct: 86.0,
      default_well_to_wake_ghg_gco2e_mj: 89.0,
      default_tank_to_wake_ghg_gco2e_mj: 77.0,
      default_well_to_tank_ghg_gco2e_mj: 12.0
    },
    [FuelType.MDO]: {
      standard_density_kg_m3: 850,
      standard_lower_calorific_value_mj_kg: 42.6,
      standard_sulphur_content_pct: 0.5,
      standard_carbon_content_pct: 86.2,
      default_well_to_wake_ghg_gco2e_mj: 90.0,
      default_tank_to_wake_ghg_gco2e_mj: 78.0,
      default_well_to_tank_ghg_gco2e_mj: 12.0
    },
    [FuelType.HFO]: {
      standard_density_kg_m3: 980,
      standard_lower_calorific_value_mj_kg: 40.2,
      standard_sulphur_content_pct: 3.5,
      standard_carbon_content_pct: 87.0,
      default_well_to_wake_ghg_gco2e_mj: 94.0,
      default_tank_to_wake_ghg_gco2e_mj: 82.0,
      default_well_to_tank_ghg_gco2e_mj: 12.0
    },
    [FuelType.LNG]: {
      standard_density_kg_m3: 450,
      standard_lower_calorific_value_mj_kg: 48.0,
      standard_sulphur_content_pct: 0.0,
      standard_carbon_content_pct: 75.0,
      default_well_to_wake_ghg_gco2e_mj: 85.0,
      default_tank_to_wake_ghg_gco2e_mj: 56.0,
      default_well_to_tank_ghg_gco2e_mj: 29.0
    },
    
    // Biofuels
    [FuelType.BIO_MGO]: {
      standard_density_kg_m3: 840,
      standard_lower_calorific_value_mj_kg: 42.7,
      standard_sulphur_content_pct: 0.1,
      standard_carbon_content_pct: 86.0,
      default_well_to_wake_ghg_gco2e_mj: 25.0, // Varies by feedstock
      default_tank_to_wake_ghg_gco2e_mj: 77.0,
      default_well_to_tank_ghg_gco2e_mj: -52.0 // Negative due to biogenic CO2
    },
    [FuelType.BIO_MDO]: {
      standard_density_kg_m3: 850,
      standard_lower_calorific_value_mj_kg: 42.6,
      standard_sulphur_content_pct: 0.5,
      standard_carbon_content_pct: 86.2,
      default_well_to_wake_ghg_gco2e_mj: 30.0,
      default_tank_to_wake_ghg_gco2e_mj: 78.0,
      default_well_to_tank_ghg_gco2e_mj: -48.0
    },
    [FuelType.FAME]: {
      standard_density_kg_m3: 880,
      standard_lower_calorific_value_mj_kg: 37.0,
      standard_sulphur_content_pct: 0.0,
      standard_carbon_content_pct: 77.0,
      default_well_to_wake_ghg_gco2e_mj: 20.0,
      default_tank_to_wake_ghg_gco2e_mj: 70.0,
      default_well_to_tank_ghg_gco2e_mj: -50.0
    },
    [FuelType.HVO]: {
      standard_density_kg_m3: 780,
      standard_lower_calorific_value_mj_kg: 44.0,
      standard_sulphur_content_pct: 0.0,
      standard_carbon_content_pct: 85.0,
      default_well_to_wake_ghg_gco2e_mj: 15.0,
      default_tank_to_wake_ghg_gco2e_mj: 75.0,
      default_well_to_tank_ghg_gco2e_mj: -60.0
    },
    
    // E-Fuels
    [FuelType.E_METHANOL]: {
      standard_density_kg_m3: 790,
      standard_lower_calorific_value_mj_kg: 19.9,
      standard_sulphur_content_pct: 0.0,
      standard_carbon_content_pct: 37.5,
      default_well_to_wake_ghg_gco2e_mj: 0.0, // Carbon neutral
      default_tank_to_wake_ghg_gco2e_mj: 70.0,
      default_well_to_tank_ghg_gco2e_mj: -70.0
    },
    [FuelType.E_AMMONIA]: {
      standard_density_kg_m3: 680,
      standard_lower_calorific_value_mj_kg: 18.6,
      standard_sulphur_content_pct: 0.0,
      standard_carbon_content_pct: 0.0,
      default_well_to_wake_ghg_gco2e_mj: 0.0,
      default_tank_to_wake_ghg_gco2e_mj: 0.0,
      default_well_to_tank_ghg_gco2e_mj: 0.0
    },
    [FuelType.E_HYDROGEN]: {
      standard_density_kg_m3: 70,
      standard_lower_calorific_value_mj_kg: 120.0,
      standard_sulphur_content_pct: 0.0,
      standard_carbon_content_pct: 0.0,
      default_well_to_wake_ghg_gco2e_mj: 0.0,
      default_tank_to_wake_ghg_gco2e_mj: 0.0,
      default_well_to_tank_ghg_gco2e_mj: 0.0
    }
  };

  // Biofuel feedstock emission factors (LR Standards)
  private static readonly BIOFUEL_EMISSION_FACTORS: Record<BiofuelFeedstock, number> = {
    [BiofuelFeedstock.RAPESEED]: 25.0,
    [BiofuelFeedstock.PALM]: 35.0,
    [BiofuelFeedstock.SOY]: 30.0,
    [BiofuelFeedstock.SUNFLOWER]: 20.0,
    [BiofuelFeedstock.WASTE_COOKING_OIL]: 10.0,
    [BiofuelFeedstock.ANIMAL_FAT]: 15.0,
    [BiofuelFeedstock.ALGAE]: 5.0,
    [BiofuelFeedstock.WOOD_RESIDUE]: 8.0,
    [BiofuelFeedstock.AGRICULTURAL_WASTE]: 12.0,
    [BiofuelFeedstock.MUNICIPAL_WASTE]: 18.0
  };

  // E-fuel production emission factors (ABS Standards)
  private static readonly EFUEL_EMISSION_FACTORS: Record<EFuelProductionMethod, number> = {
    [EFuelProductionMethod.ELECTROLYSIS]: 0.0,
    [EFuelProductionMethod.POWER_TO_X]: 0.0,
    [EFuelProductionMethod.FISCHER_TROPSCH]: 0.0,
    [EFuelProductionMethod.METHANOL_SYNTHESIS]: 0.0,
    [EFuelProductionMethod.AMMONIA_SYNTHESIS]: 0.0
  };

  /**
   * Calculate comprehensive fuel consumption and emissions
   * Includes OPS, Mewis Duct, Wind Turbines, and other efficiency technologies
   */
  static calculateFuelConsumption(
    fuelData: FuelConsumption,
    fuelSpec?: FuelSpecification
  ): FuelCalculationResult {
    const consumptionTonnes = fuelData.consumption_tonnes;
    const fuelType = fuelData.fuel_type as FuelType;
    
    // Get fuel properties (use provided spec or standard values)
    const fuelProps = fuelSpec || this.STANDARD_FUEL_PROPERTIES[fuelType];
    if (!fuelProps) {
      throw new Error(`No fuel properties found for fuel type: ${fuelType}`);
    }

    // Use actual values if available, otherwise use standard values
    const calorificValue = fuelData.lower_calorific_value_mj_kg || 
                          fuelProps.standard_lower_calorific_value_mj_kg || 42.0;
    const carbonContent = fuelData.carbon_content_pct || 
                         fuelProps.standard_carbon_content_pct || 86.0;

    // Calculate energy consumption
    const energyConsumptionGj = consumptionTonnes * calorificValue;

    // Calculate CO2 emissions (tank-to-wake)
    const co2EmissionsT = (consumptionTonnes * carbonContent / 100) * (44 / 12); // CO2 = C * 44/12

    // Calculate GHG emissions based on fuel category
    let wellToWakeEmissionsGco2e = 0;
    let tankToWakeEmissionsGco2e = 0;
    let wellToTankEmissionsGco2e = 0;

    if (fuelData.fuel_category === FuelCategory.FOSSIL) {
      // Use standard fossil fuel factors
      wellToWakeEmissionsGco2e = energyConsumptionGj * (fuelProps.default_well_to_wake_ghg_gco2e_mj || 90.0);
      tankToWakeEmissionsGco2e = energyConsumptionGj * (fuelProps.default_tank_to_wake_ghg_gco2e_mj || 78.0);
      wellToTankEmissionsGco2e = energyConsumptionGj * (fuelProps.default_well_to_tank_ghg_gco2e_mj || 12.0);
    } else if (fuelData.fuel_category === FuelCategory.BIOFUEL) {
      // Calculate biofuel emissions based on feedstock
      const feedstock = fuelData.biofuel_feedstock as BiofuelFeedstock;
      const feedstockFactor = this.BIOFUEL_EMISSION_FACTORS[feedstock] || 25.0;
      const blendRatio = fuelData.biofuel_blend_ratio_pct || 100.0;
      
      wellToWakeEmissionsGco2e = energyConsumptionGj * feedstockFactor * (blendRatio / 100);
      tankToWakeEmissionsGco2e = energyConsumptionGj * (fuelProps.default_tank_to_wake_ghg_gco2e_mj || 77.0);
      wellToTankEmissionsGco2e = wellToWakeEmissionsGco2e - tankToWakeEmissionsGco2e;
    } else if (fuelData.fuel_category === FuelCategory.E_FUEL) {
      // E-fuels are carbon neutral
      wellToWakeEmissionsGco2e = 0;
      tankToWakeEmissionsGco2e = 0;
      wellToTankEmissionsGco2e = 0;
    } else if (fuelData.fuel_category === FuelCategory.HYBRID) {
      // Calculate hybrid fuel emissions
      const blendRatio = fuelData.biofuel_blend_ratio_pct || 50.0;
      const biofuelEmissions = this.calculateBiofuelEmissions(fuelData, energyConsumptionGj);
      const fossilEmissions = this.calculateFossilEmissions(fuelData, energyConsumptionGj);
      
      wellToWakeEmissionsGco2e = (biofuelEmissions * blendRatio / 100) + 
                                (fossilEmissions * (100 - blendRatio) / 100);
      tankToWakeEmissionsGco2e = energyConsumptionGj * (fuelProps.default_tank_to_wake_ghg_gco2e_mj || 77.0);
      wellToTankEmissionsGco2e = wellToWakeEmissionsGco2e - tankToWakeEmissionsGco2e;
    }

    // Calculate carbon intensity
    const carbonIntensityGco2eMj = wellToWakeEmissionsGco2e / energyConsumptionGj;

    // Calculate efficiency gains from installed technologies
    const efficiencyGains = this.calculateEfficiencyGains(fuelData);
    
    // Apply efficiency gains to reduce actual consumption
    const adjustedConsumptionTonnes = consumptionTonnes * (1 - efficiencyGains.totalEfficiencyGainPct / 100);
    const adjustedEnergyGj = energyConsumptionGj * (1 - efficiencyGains.totalEfficiencyGainPct / 100);
    const adjustedEmissionsGco2e = wellToWakeEmissionsGco2e * (1 - efficiencyGains.totalEfficiencyGainPct / 100);

    // Calculate FuelEU compliance balance (simplified)
    const fueleuComplianceBalanceGco2e = this.calculateFuelEUComplianceBalance(
      fuelData, 
      adjustedEmissionsGco2e, 
      adjustedEnergyGj
    );

    return {
      energyConsumptionGj: adjustedEnergyGj,
      co2EmissionsT: co2EmissionsT * (1 - efficiencyGains.totalEfficiencyGainPct / 100),
      ghgEmissionsGco2e: adjustedEmissionsGco2e,
      wellToWakeEmissionsGco2e: adjustedEmissionsGco2e,
      tankToWakeEmissionsGco2e: tankToWakeEmissionsGco2e * (1 - efficiencyGains.totalEfficiencyGainPct / 100),
      wellToTankEmissionsGco2e: wellToTankEmissionsGco2e * (1 - efficiencyGains.totalEfficiencyGainPct / 100),
      carbonIntensityGco2eMj: adjustedEmissionsGco2e / adjustedEnergyGj,
      fueleuComplianceBalanceGco2e
    };
  }

  /**
   * Calculate biofuel-specific emissions
   */
  private static calculateBiofuelEmissions(fuelData: FuelConsumption, energyGj: number): number {
    const feedstock = fuelData.biofuel_feedstock as BiofuelFeedstock;
    const feedstockFactor = this.BIOFUEL_EMISSION_FACTORS[feedstock] || 25.0;
    const generation = fuelData.biofuel_generation as BiofuelGeneration;
    
    // Apply generation-specific factors
    let generationFactor = 1.0;
    switch (generation) {
      case BiofuelGeneration.FIRST_GENERATION:
        generationFactor = 1.2; // Higher ILUC risk
        break;
      case BiofuelGeneration.SECOND_GENERATION:
        generationFactor = 0.8; // Lower ILUC risk
        break;
      case BiofuelGeneration.THIRD_GENERATION:
        generationFactor = 0.5; // Very low ILUC risk
        break;
      case BiofuelGeneration.FOURTH_GENERATION:
        generationFactor = 0.2; // Minimal ILUC risk
        break;
    }
    
    return energyGj * feedstockFactor * generationFactor;
  }

  /**
   * Calculate fossil fuel emissions
   */
  private static calculateFossilEmissions(fuelData: FuelConsumption, energyGj: number): number {
    const fuelType = fuelData.fuel_type as FuelType;
    const fuelProps = this.STANDARD_FUEL_PROPERTIES[fuelType];
    
    if (!fuelProps) {
      return energyGj * 90.0; // Default fossil fuel factor
    }
    
    return energyGj * (fuelProps.default_well_to_wake_ghg_gco2e_mj || 90.0);
  }

  /**
   * Calculate efficiency gains from installed technologies
   */
  private static calculateEfficiencyGains(fuelData: FuelConsumption): {
    totalEfficiencyGainPct: number;
    mewisDuctGainPct: number;
    windTurbinesGainPct: number;
    opsGainPct: number;
    otherTechnologiesGainPct: number;
  } {
    let totalEfficiencyGainPct = 0;
    let mewisDuctGainPct = 0;
    let windTurbinesGainPct = 0;
    let opsGainPct = 0;
    let otherTechnologiesGainPct = 0;

    // Mewis Duct efficiency gain
    if (fuelData.mewis_duct_installed && fuelData.mewis_duct_efficiency_gain_pct) {
      mewisDuctGainPct = fuelData.mewis_duct_efficiency_gain_pct;
      totalEfficiencyGainPct += mewisDuctGainPct;
    }

    // Wind Turbines efficiency gain
    if (fuelData.wind_turbines_installed && fuelData.wind_turbines_efficiency_gain_pct) {
      windTurbinesGainPct = fuelData.wind_turbines_efficiency_gain_pct;
      totalEfficiencyGainPct += windTurbinesGainPct;
    }

    // OPS efficiency gain (when connected)
    if (fuelData.energy_source_type === 'OPS' && fuelData.ops_connection_time_hours && fuelData.ops_connection_time_hours > 0) {
      // OPS typically provides 100% efficiency gain for auxiliary power
      // Assuming 30% of total power is auxiliary power
      opsGainPct = 30.0; // 30% of total power consumption
      totalEfficiencyGainPct += opsGainPct;
    }

    // Other efficiency technologies
    if (fuelData.total_efficiency_gain_pct) {
      otherTechnologiesGainPct = fuelData.total_efficiency_gain_pct;
      totalEfficiencyGainPct += otherTechnologiesGainPct;
    }

    // Cap total efficiency gain at 100%
    totalEfficiencyGainPct = Math.min(totalEfficiencyGainPct, 100);

    return {
      totalEfficiencyGainPct,
      mewisDuctGainPct,
      windTurbinesGainPct,
      opsGainPct,
      otherTechnologiesGainPct
    };
  }

  /**
   * Calculate OPS emissions and savings
   */
  static calculateOPSEmissions(fuelData: FuelConsumption): {
    opsEmissionsGco2e: number;
    fuelSavingsTonnes: number;
    co2SavingsGco2e: number;
  } {
    if (fuelData.energy_source_type !== 'OPS' || !fuelData.ops_connection_time_hours) {
      return { opsEmissionsGco2e: 0, fuelSavingsTonnes: 0, co2SavingsGco2e: 0 };
    }

    const connectionHours = fuelData.ops_connection_time_hours;
    const powerConsumption = fuelData.ops_power_consumption_kw || 1000; // Default 1MW
    const gridEmissionsFactor = fuelData.ops_emissions_factor_gco2e_kwh || 400; // Default 400 gCO2e/kWh

    // Calculate OPS emissions
    const opsEmissionsGco2e = connectionHours * powerConsumption * gridEmissionsFactor;

    // Calculate fuel savings (assuming MGO equivalent)
    const fuelSavingsTonnes = (connectionHours * powerConsumption * 0.0002); // 0.2 kg/kWh for MGO
    const co2SavingsGco2e = fuelSavingsTonnes * 3200; // 3.2 tCO2e per tonne MGO

    return {
      opsEmissionsGco2e,
      fuelSavingsTonnes,
      co2SavingsGco2e
    };
  }

  /**
   * Calculate FuelEU compliance balance
   */
  private static calculateFuelEUComplianceBalance(
    fuelData: FuelConsumption, 
    wellToWakeEmissionsGco2e: number, 
    energyGj: number
  ): number {
    // FuelEU reference values (gCO2e/MJ)
    const referenceValues: Record<string, number> = {
      [FuelType.MGO]: 89.0,
      [FuelType.MDO]: 90.0,
      [FuelType.HFO]: 94.0,
      [FuelType.LNG]: 85.0,
      [FuelType.BIO_MGO]: 25.0,
      [FuelType.BIO_MDO]: 30.0,
      [FuelType.FAME]: 20.0,
      [FuelType.HVO]: 15.0,
      [FuelType.E_METHANOL]: 0.0,
      [FuelType.E_AMMONIA]: 0.0,
      [FuelType.E_HYDROGEN]: 0.0
    };

    const fuelType = fuelData.fuel_type as FuelType;
    const referenceValue = referenceValues[fuelType] || 90.0;
    const actualIntensity = wellToWakeEmissionsGco2e / energyGj;
    
    // Compliance balance = (Reference - Actual) * Energy
    return (referenceValue - actualIntensity) * energyGj;
  }

  /**
   * Calculate fuel efficiency metrics
   */
  static calculateFuelEfficiencyMetrics(
    fuelData: FuelConsumption[],
    enginePowerKw: number,
    operatingHours: number,
    transportWorkTnm: number
  ): FuelEfficiencyMetrics {
    const totalConsumption = fuelData.reduce((sum, fuel) => sum + fuel.consumption_tonnes, 0);
    const totalEnergy = fuelData.reduce((sum, fuel) => {
      const calc = this.calculateFuelConsumption(fuel);
      return sum + calc.energyConsumptionGj;
    }, 0);

    // Specific Fuel Consumption (g/kWh)
    const specificFuelConsumption = (totalConsumption * 1000000) / (enginePowerKw * operatingHours);

    // Energy Efficiency Operational Indicator (EEOI)
    const energyEfficiencyIndex = totalEnergy / transportWorkTnm;

    // Carbon Intensity Indicator (CII) - simplified
    const totalEmissions = fuelData.reduce((sum, fuel) => {
      const calc = this.calculateFuelConsumption(fuel);
      return sum + calc.wellToWakeEmissionsGco2e;
    }, 0);
    const carbonIntensityIndicator = totalEmissions / transportWorkTnm;

    // Fuel Efficiency Ratio (FER)
    const fuelEfficiencyRatio = transportWorkTnm / totalConsumption;

    return {
      specificFuelConsumption,
      energyEfficiencyIndex,
      carbonIntensityIndicator,
      fuelEfficiencyRatio
    };
  }

  /**
   * Validate fuel properties against classification society standards
   */
  static validateFuelProperties(fuelData: FuelConsumption): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check calorific value ranges
    if (fuelData.lower_calorific_value_mj_kg) {
      const fuelType = fuelData.fuel_type as FuelType;
      const standardProps = this.STANDARD_FUEL_PROPERTIES[fuelType];
      
      if (standardProps?.standard_lower_calorific_value_mj_kg) {
        const deviation = Math.abs(fuelData.lower_calorific_value_mj_kg - standardProps.standard_lower_calorific_value_mj_kg);
        const percentDeviation = (deviation / standardProps.standard_lower_calorific_value_mj_kg) * 100;
        
        if (percentDeviation > 10) {
          warnings.push(`Calorific value deviates ${percentDeviation.toFixed(1)}% from standard`);
        }
      }
    }

    // Check sulphur content compliance
    if (fuelData.sulphur_content_pct && fuelData.sulphur_content_pct > 0.5) {
      warnings.push('Sulphur content exceeds 0.5% - may not be compliant with ECA requirements');
    }

    // Check biofuel certification
    if (fuelData.fuel_category === FuelCategory.BIOFUEL) {
      if (!fuelData.sustainability_certificate) {
        errors.push('Sustainability certificate required for biofuels');
      }
      if (!fuelData.biofuel_feedstock) {
        errors.push('Biofuel feedstock must be specified');
      }
    }

    // Check e-fuel certification
    if (fuelData.fuel_category === FuelCategory.E_FUEL) {
      if (!fuelData.certificate_of_origin) {
        errors.push('Certificate of origin required for e-fuels');
      }
      if (!fuelData.renewable_electricity_source) {
        errors.push('Renewable electricity source must be specified for e-fuels');
      }
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}

// Export calculation functions
export const calculateFuelConsumption = FuelCalculationService.calculateFuelConsumption;
export const calculateFuelEfficiencyMetrics = FuelCalculationService.calculateFuelEfficiencyMetrics;
export const validateFuelProperties = FuelCalculationService.validateFuelProperties;
