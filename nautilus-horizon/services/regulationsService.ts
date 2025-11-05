// Marine Regulations Service - Updated 2024
// Based on latest IMO, EU ETS, and FuelEU Maritime regulations

export interface MarineRegulation {
  id: string;
  name: string;
  type: 'IMO' | 'EU_ETS' | 'FuelEU' | 'SOLAS' | 'MARPOL' | 'STCW';
  category: 'emissions' | 'safety' | 'training' | 'operations' | 'technical';
  effectiveDate: string;
  description: string;
  requirements: string[];
  calculations?: {
    formula: string;
    parameters: string[];
    units: string;
  };
  penalties?: {
    nonCompliance: string;
    fines: string;
  };
  applicableRoles: string[];
}

export interface WasteHeatRecoverySystem {
  id: string;
  name: string;
  type: 'economizer' | 'organic_rankine_cycle' | 'steam_turbine' | 'heat_exchanger';
  efficiency: number; // percentage
  fuelSavings: number; // percentage
  co2Reduction: number; // percentage
  installationCost: number; // EUR
  paybackPeriod: number; // months
  maintenanceRequirements: string[];
  regulatoryCompliance: string[];
}

// Latest Marine Regulations (Updated 2024)
export const MARINE_REGULATIONS: MarineRegulation[] = [
  {
    id: 'imo-2024-ghg-strategy',
    name: 'IMO 2024 GHG Strategy Update',
    type: 'IMO',
    category: 'emissions',
    effectiveDate: '2024-01-01',
    description: 'Updated IMO strategy to reduce GHG emissions from ships by at least 20% by 2030 and 70% by 2040',
    requirements: [
      'Mandatory CII (Carbon Intensity Indicator) reporting',
      'Enhanced SEEMP (Ship Energy Efficiency Management Plan)',
      'Implementation of energy efficiency measures',
      'Regular monitoring and reporting of fuel consumption'
    ],
    calculations: {
      formula: 'CII = CO2 emissions / (DWT × distance)',
      parameters: ['CO2 emissions (tonnes)', 'Deadweight tonnage', 'Distance sailed (nautical miles)'],
      units: 'gCO2/t·nm'
    },
    applicableRoles: ['ENGINEER', 'OFFICER', 'COMPLIANCE_OFFICER', 'MANAGER']
  },
  {
    id: 'eu-ets-maritime-2024',
    name: 'EU ETS Maritime 2024',
    type: 'EU_ETS',
    category: 'emissions',
    effectiveDate: '2024-01-01',
    description: 'EU Emissions Trading System extended to maritime transport covering 100% of emissions for intra-EU voyages and 50% for extra-EU voyages',
    requirements: [
      'Monitor and report CO2 emissions',
      'Surrender EUAs (EU Allowances) for verified emissions',
      'Quarterly reporting to competent authority',
      'Annual verification by accredited verifier'
    ],
    calculations: {
      formula: 'EUA_Required = CO2_Emissions × 100% (intra-EU) or 50% (extra-EU)',
      parameters: ['CO2 emissions (tonnes)', 'Voyage type (intra-EU/extra-EU)'],
      units: 'EUAs'
    },
    applicableRoles: ['COMPLIANCE_OFFICER', 'MANAGER', 'ENGINEER']
  },
  {
    id: 'fuel-eu-maritime-2025',
    name: 'FuelEU Maritime 2025',
    type: 'FuelEU',
    category: 'emissions',
    effectiveDate: '2025-01-01',
    description: 'Regulation to increase the uptake of renewable and low-carbon fuels in maritime transport',
    requirements: [
      'Gradual reduction of greenhouse gas intensity of energy used on board',
      '6% reduction by 2030, 75% by 2050',
      'Mandatory use of on-shore power supply for container and passenger ships',
      'Pooling mechanism for compliance'
    ],
    calculations: {
      formula: 'GHG_Intensity = (Well_to_Wake_Emissions / Energy_Used) × 100',
      parameters: ['Well-to-wake emissions (gCO2e/MJ)', 'Energy used on board (MJ)'],
      units: 'gCO2e/MJ'
    },
    applicableRoles: ['COMPLIANCE_OFFICER', 'MANAGER', 'ENGINEER']
  },
  {
    id: 'marpol-annex-vi-2024',
    name: 'MARPOL Annex VI 2024 Updates',
    type: 'MARPOL',
    category: 'emissions',
    effectiveDate: '2024-01-01',
    description: 'Updated MARPOL Annex VI with stricter emission limits and new requirements for SOx and NOx',
    requirements: [
      'Global sulphur cap remains at 0.50%',
      'NOx Tier III standards for new ships in ECAs',
      'Enhanced monitoring and reporting requirements',
      'Ballast water management system compliance'
    ],
    calculations: {
      formula: 'SOx_Emissions = Fuel_Consumption × Sulphur_Content × 2',
      parameters: ['Fuel consumption (tonnes)', 'Sulphur content (%)'],
      units: 'tonnes SOx'
    },
    applicableRoles: ['ENGINEER', 'COMPLIANCE_OFFICER', 'OFFICER']
  },
  {
    id: 'waste-heat-recovery-2024',
    name: 'Waste Heat Recovery Systems 2024',
    type: 'IMO',
    category: 'technical',
    effectiveDate: '2024-01-01',
    description: 'New guidelines for waste heat recovery systems to improve energy efficiency and reduce emissions',
    requirements: [
      'Installation of WHR systems on new ships where technically feasible',
      'Regular maintenance and performance monitoring',
      'Documentation of energy savings and emissions reduction',
      'Integration with ship energy management systems'
    ],
    calculations: {
      formula: 'Energy_Recovered = Exhaust_Heat × System_Efficiency × Operating_Hours',
      parameters: ['Exhaust heat (kW)', 'System efficiency (%)', 'Operating hours'],
      units: 'kWh'
    },
    applicableRoles: ['ENGINEER', 'MANAGER']
  }
];

// Waste Heat Recovery Systems
export const WASTE_HEAT_RECOVERY_SYSTEMS: WasteHeatRecoverySystem[] = [
  {
    id: 'economizer-basic',
    name: 'Basic Economizer System',
    type: 'economizer',
    efficiency: 75,
    fuelSavings: 8,
    co2Reduction: 12,
    installationCost: 250000,
    paybackPeriod: 24,
    maintenanceRequirements: [
      'Monthly inspection of heat transfer surfaces',
      'Quarterly cleaning of soot deposits',
      'Annual inspection of pressure vessels',
      'Biannual calibration of temperature sensors'
    ],
    regulatoryCompliance: [
      'IMO GHG Strategy compliance',
      'SEEMP implementation',
      'CII improvement documentation'
    ]
  },
  {
    id: 'orc-system',
    name: 'Organic Rankine Cycle (ORC) System',
    type: 'organic_rankine_cycle',
    efficiency: 85,
    fuelSavings: 15,
    co2Reduction: 18,
    installationCost: 850000,
    paybackPeriod: 36,
    maintenanceRequirements: [
      'Daily monitoring of working fluid levels',
      'Weekly inspection of expander unit',
      'Monthly analysis of working fluid quality',
      'Quarterly inspection of heat exchangers',
      'Annual overhaul of turbine components'
    ],
    regulatoryCompliance: [
      'IMO GHG Strategy compliance',
      'EU ETS emission reduction',
      'FuelEU Maritime compliance'
    ]
  },
  {
    id: 'steam-turbine-whr',
    name: 'Steam Turbine WHR System',
    type: 'steam_turbine',
    efficiency: 80,
    fuelSavings: 12,
    co2Reduction: 15,
    installationCost: 650000,
    paybackPeriod: 30,
    maintenanceRequirements: [
      'Daily boiler water quality checks',
      'Weekly turbine vibration monitoring',
      'Monthly steam system inspection',
      'Quarterly turbine blade inspection',
      'Annual major overhaul'
    ],
    regulatoryCompliance: [
      'IMO GHG Strategy compliance',
      'MARPOL Annex VI compliance',
      'SEEMP energy efficiency measures'
    ]
  },
  {
    id: 'advanced-heat-exchanger',
    name: 'Advanced Heat Exchanger System',
    type: 'heat_exchanger',
    efficiency: 70,
    fuelSavings: 6,
    co2Reduction: 9,
    installationCost: 180000,
    paybackPeriod: 18,
    maintenanceRequirements: [
      'Weekly inspection of heat transfer surfaces',
      'Monthly cleaning of fouling deposits',
      'Quarterly pressure testing',
      'Annual thermal efficiency testing'
    ],
    regulatoryCompliance: [
      'IMO GHG Strategy compliance',
      'Basic energy efficiency measures'
    ]
  }
];

// Calculation functions for marine regulations
export const calculateCII = (co2Emissions: number, dwt: number, distance: number): number => {
  return (co2Emissions / (dwt * distance)) * 1000000; // Convert to gCO2/t·nm
};

export const calculateEUARequired = (co2Emissions: number, isIntraEU: boolean): number => {
  const percentage = isIntraEU ? 1.0 : 0.5;
  return co2Emissions * percentage;
};

export const calculateFuelEUIntensity = (emissions: number, energyUsed: number): number => {
  return (emissions / energyUsed) * 1000000; // Convert to gCO2e/MJ
};

export const calculateWHRSavings = (
  exhaustHeat: number,
  systemEfficiency: number,
  operatingHours: number,
  fuelCalorificValue: number
): number => {
  const energyRecovered = (exhaustHeat * systemEfficiency * operatingHours) / 100;
  return energyRecovered / fuelCalorificValue; // tonnes of fuel saved
};

// Get regulations applicable to a specific role
export const getRegulationsForRole = (role: string): MarineRegulation[] => {
  return MARINE_REGULATIONS.filter(regulation => 
    regulation.applicableRoles.includes(role)
  );
};

// Get waste heat recovery systems for engineers
export const getWHRSystems = (): WasteHeatRecoverySystem[] => {
  return WASTE_HEAT_RECOVERY_SYSTEMS;
};

// Get compliance status for a vessel
export const getComplianceStatus = (vesselData: any): any => {
  const currentDate = new Date();
  const compliance = {
    imo: { status: 'compliant', lastCheck: currentDate },
    euEts: { status: 'compliant', lastCheck: currentDate },
    fuelEu: { status: 'pending', lastCheck: currentDate },
    marpol: { status: 'compliant', lastCheck: currentDate }
  };

  // Add logic to check actual compliance based on vessel data
  return compliance;
};
