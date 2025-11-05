/**
 * Maritime Insurance Service
 * Provides insurance quote calculations based on real maritime risk factors
 * 
 * This service simulates an open-source insurance rates provider API
 * that calculates premiums based on standard maritime insurance underwriting criteria
 */

export interface InsuranceQuoteRequest {
  vesselId?: string;
  vesselName?: string;
  vesselType: VesselType;
  vesselAge: number; // years
  grossTonnage: number; // GT
  cargoValue?: number; // USD
  cargoType?: CargoType;
  routeOrigin: string;
  routeDestination: string;
  routeRiskZone: RouteRiskZone;
  voyageDuration: number; // days
  coverageType: CoverageType[];
  deductible: number; // USD
  previousClaims: number; // count in last 5 years
  safetyRating: SafetyRating;
  complianceScore: number; // 0-100
  requestDate: Date;
}

export interface InsuranceQuote {
  quoteId: string;
  requestDate: Date;
  expiryDate: Date;
  vessel: {
    id?: string;
    name: string;
    type: VesselType;
    age: number;
    tonnage: number;
  };
  coverage: CoverageBreakdown[];
  totalPremium: number; // USD
  deductible: number;
  riskAssessment: RiskAssessment;
  termsAndConditions: string[];
  validUntil: Date;
  underwriter: string;
  status: 'DRAFT' | 'QUOTED' | 'ACCEPTED' | 'DECLINED';
}

export interface CoverageBreakdown {
  type: CoverageType;
  premium: number;
  limit: number;
  description: string;
}

export interface RiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: RiskFactor[];
  totalScore: number; // 0-100, lower is better
  recommendation: string;
}

export interface RiskFactor {
  category: string;
  score: number; // 0-100
  weight: number; // percentage
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export enum VesselType {
  BULK_CARRIER = 'Bulk Carrier',
  CONTAINER = 'Container Ship',
  TANKER = 'Tanker',
  LNG_CARRIER = 'LNG Carrier',
  GENERAL_CARGO = 'General Cargo',
  RO_RO = 'Roll-on/Roll-off',
  REEFER = 'Refrigerated Cargo',
  CRUISE = 'Cruise Ship',
  OFFSHORE = 'Offshore Support',
}

export enum CargoType {
  DRY_BULK = 'Dry Bulk',
  CONTAINER = 'Containerized',
  CRUDE_OIL = 'Crude Oil',
  REFINED_PRODUCTS = 'Refined Products',
  CHEMICALS = 'Chemicals',
  LNG = 'Liquefied Natural Gas',
  LPG = 'Liquefied Petroleum Gas',
  VEHICLES = 'Vehicles',
  PERISHABLES = 'Perishables',
  GENERAL = 'General Cargo',
  DANGEROUS_GOODS = 'Dangerous Goods',
}

export enum RouteRiskZone {
  LOW = 'Low Risk Zone',
  MEDIUM = 'Medium Risk Zone',
  HIGH = 'High Risk Zone (Piracy/War)',
  POLAR = 'Polar Region',
  COASTAL = 'Coastal Waters',
}

export enum CoverageType {
  HULL_AND_MACHINERY = 'Hull & Machinery',
  PROTECTION_INDEMNITY = 'Protection & Indemnity',
  CARGO = 'Cargo Insurance',
  WAR_RISK = 'War Risk',
  POLLUTION_LIABILITY = 'Pollution Liability',
  LOSS_OF_HIRE = 'Loss of Hire',
  CREW_LIABILITY = 'Crew Liability',
  FREIGHT_LIABILITY = 'Freight Liability',
}

export enum SafetyRating {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
}

/**
 * Maritime Insurance Service Class
 */
class InsuranceService {
  private baseRates = {
    [CoverageType.HULL_AND_MACHINERY]: 0.008, // 0.8% of vessel value
    [CoverageType.PROTECTION_INDEMNITY]: 0.015, // 1.5% of limit
    [CoverageType.CARGO]: 0.005, // 0.5% of cargo value
    [CoverageType.WAR_RISK]: 0.003, // 0.3% of insured value
    [CoverageType.POLLUTION_LIABILITY]: 0.004, // 0.4% of limit
    [CoverageType.LOSS_OF_HIRE]: 0.012, // 1.2% of daily rate
    [CoverageType.CREW_LIABILITY]: 0.002, // 0.2% of limit
    [CoverageType.FREIGHT_LIABILITY]: 0.006, // 0.6% of freight value
  };

  /**
   * Generate insurance quote based on request parameters
   */
  async generateQuote(request: InsuranceQuoteRequest): Promise<InsuranceQuote> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const quoteId = this.generateQuoteId();
    const requestDate = request.requestDate || new Date();
    const expiryDate = new Date(requestDate);
    expiryDate.setDate(expiryDate.getDate() + 30); // Quote valid for 30 days

    // Calculate risk assessment
    const riskAssessment = this.calculateRiskAssessment(request);

    // Calculate coverage premiums
    const coverageBreakdown = this.calculateCoverages(request, riskAssessment);

    // Calculate total premium
    const totalPremium = coverageBreakdown.reduce((sum, c) => sum + c.premium, 0);

    const quote: InsuranceQuote = {
      quoteId,
      requestDate,
      expiryDate,
      vessel: {
        id: request.vesselId,
        name: request.vesselName || 'Unnamed Vessel',
        type: request.vesselType,
        age: request.vesselAge,
        tonnage: request.grossTonnage,
      },
      coverage: coverageBreakdown,
      totalPremium,
      deductible: request.deductible,
      riskAssessment,
      termsAndConditions: this.getTermsAndConditions(request.coverageType),
      validUntil: expiryDate,
      underwriter: 'Nautilus Marine Insurance Ltd.',
      status: 'QUOTED',
    };

    return quote;
  }

  /**
   * Calculate risk assessment based on multiple factors
   */
  private calculateRiskAssessment(request: InsuranceQuoteRequest): RiskAssessment {
    const riskFactors: RiskFactor[] = [];

    // Vessel Age Risk
    const ageScore = Math.min(request.vesselAge * 3, 100);
    riskFactors.push({
      category: 'Vessel Age',
      score: ageScore,
      weight: 20,
      impact: ageScore > 60 ? 'HIGH' : ageScore > 30 ? 'MEDIUM' : 'LOW',
      description: `Vessel is ${request.vesselAge} years old`,
    });

    // Route Risk
    const routeRiskMap = {
      [RouteRiskZone.LOW]: 10,
      [RouteRiskZone.MEDIUM]: 35,
      [RouteRiskZone.HIGH]: 85,
      [RouteRiskZone.POLAR]: 65,
      [RouteRiskZone.COASTAL]: 25,
    };
    const routeScore = routeRiskMap[request.routeRiskZone];
    riskFactors.push({
      category: 'Route Risk',
      score: routeScore,
      weight: 30,
      impact: routeScore > 60 ? 'HIGH' : routeScore > 30 ? 'MEDIUM' : 'LOW',
      description: `Route through ${request.routeRiskZone}`,
    });

    // Claims History Risk
    const claimsScore = Math.min(request.previousClaims * 15, 100);
    riskFactors.push({
      category: 'Claims History',
      score: claimsScore,
      weight: 15,
      impact: claimsScore > 45 ? 'HIGH' : claimsScore > 15 ? 'MEDIUM' : 'LOW',
      description: `${request.previousClaims} claims in last 5 years`,
    });

    // Safety Rating Risk
    const safetyRiskMap = {
      [SafetyRating.EXCELLENT]: 5,
      [SafetyRating.GOOD]: 20,
      [SafetyRating.FAIR]: 50,
      [SafetyRating.POOR]: 90,
    };
    const safetyScore = safetyRiskMap[request.safetyRating];
    riskFactors.push({
      category: 'Safety Rating',
      score: safetyScore,
      weight: 20,
      impact: safetyScore > 60 ? 'HIGH' : safetyScore > 30 ? 'MEDIUM' : 'LOW',
      description: `Safety rating: ${request.safetyRating}`,
    });

    // Compliance Score Risk
    const complianceScore = 100 - request.complianceScore;
    riskFactors.push({
      category: 'Compliance',
      score: complianceScore,
      weight: 15,
      impact: complianceScore > 50 ? 'HIGH' : complianceScore > 20 ? 'MEDIUM' : 'LOW',
      description: `Compliance score: ${request.complianceScore}%`,
    });

    // Calculate weighted total score
    const totalScore = riskFactors.reduce((sum, factor) => {
      return sum + (factor.score * factor.weight / 100);
    }, 0);

    // Determine overall risk level
    let overallRisk: RiskAssessment['overallRisk'];
    let recommendation: string;

    if (totalScore <= 25) {
      overallRisk = 'LOW';
      recommendation = 'Excellent risk profile. Recommended for standard underwriting.';
    } else if (totalScore <= 50) {
      overallRisk = 'MEDIUM';
      recommendation = 'Acceptable risk profile. Standard terms with possible premium adjustment.';
    } else if (totalScore <= 75) {
      overallRisk = 'HIGH';
      recommendation = 'Elevated risk profile. Requires enhanced terms and higher premiums.';
    } else {
      overallRisk = 'CRITICAL';
      recommendation = 'Critical risk profile. May require additional risk mitigation measures or decline.';
    }

    return {
      overallRisk,
      riskFactors,
      totalScore,
      recommendation,
    };
  }

  /**
   * Calculate coverage premiums
   */
  private calculateCoverages(
    request: InsuranceQuoteRequest,
    riskAssessment: RiskAssessment
  ): CoverageBreakdown[] {
    const coverages: CoverageBreakdown[] = [];
    const riskMultiplier = 1 + (riskAssessment.totalScore / 100);

    // Estimate vessel value based on type and size
    const vesselValue = this.estimateVesselValue(request.vesselType, request.grossTonnage, request.vesselAge);

    for (const coverageType of request.coverageType) {
      let basePremium = 0;
      let limit = 0;
      let description = '';

      switch (coverageType) {
        case CoverageType.HULL_AND_MACHINERY:
          limit = vesselValue;
          basePremium = vesselValue * this.baseRates[coverageType];
          description = 'Coverage for physical damage to vessel hull, machinery, and equipment';
          break;

        case CoverageType.PROTECTION_INDEMNITY:
          limit = 500000000; // $500M standard P&I limit
          basePremium = limit * this.baseRates[coverageType] * 0.001; // Adjusted for large limit
          description = 'Third-party liability coverage for crew, cargo owners, and other parties';
          break;

        case CoverageType.CARGO:
          limit = request.cargoValue || vesselValue * 0.5;
          basePremium = limit * this.baseRates[coverageType];
          description = 'Coverage for cargo damage, loss, or theft during transit';
          break;

        case CoverageType.WAR_RISK:
          limit = vesselValue;
          basePremium = vesselValue * this.baseRates[coverageType];
          // Higher multiplier for war risk zones
          if (request.routeRiskZone === RouteRiskZone.HIGH) {
            basePremium *= 3;
          }
          description = 'Coverage for war, terrorism, and piracy-related risks';
          break;

        case CoverageType.POLLUTION_LIABILITY:
          limit = 100000000; // $100M pollution limit
          basePremium = limit * this.baseRates[coverageType] * 0.001;
          description = 'Environmental damage and pollution cleanup liability';
          break;

        case CoverageType.LOSS_OF_HIRE:
          const dailyRate = vesselValue * 0.0002; // Estimate daily charter rate
          limit = dailyRate * 180; // 180 days coverage
          basePremium = limit * this.baseRates[coverageType];
          description = 'Loss of earnings due to vessel downtime from insured events';
          break;

        case CoverageType.CREW_LIABILITY:
          limit = 50000000; // $50M crew liability
          basePremium = limit * this.baseRates[coverageType] * 0.001;
          description = 'Coverage for crew injury, illness, and repatriation costs';
          break;

        case CoverageType.FREIGHT_LIABILITY:
          limit = request.cargoValue || vesselValue * 0.3;
          basePremium = limit * this.baseRates[coverageType];
          description = 'Coverage for freight payment obligations and losses';
          break;
      }

      // Apply risk multiplier and voyage duration factor
      const durationMultiplier = 1 + (request.voyageDuration / 365) * 0.1;
      const finalPremium = Math.round(basePremium * riskMultiplier * durationMultiplier);

      coverages.push({
        type: coverageType,
        premium: finalPremium,
        limit,
        description,
      });
    }

    return coverages;
  }

  /**
   * Estimate vessel value based on type, size, and age
   */
  private estimateVesselValue(type: VesselType, tonnage: number, age: number): number {
    const baseValuePerGT: Record<VesselType, number> = {
      [VesselType.BULK_CARRIER]: 2500,
      [VesselType.CONTAINER]: 4000,
      [VesselType.TANKER]: 3500,
      [VesselType.LNG_CARRIER]: 8000,
      [VesselType.GENERAL_CARGO]: 2000,
      [VesselType.RO_RO]: 3000,
      [VesselType.REEFER]: 3500,
      [VesselType.CRUISE]: 10000,
      [VesselType.OFFSHORE]: 5000,
    };

    const baseValue = tonnage * baseValuePerGT[type];
    
    // Depreciation: 3% per year for first 10 years, 2% thereafter
    let depreciationRate = 0;
    if (age <= 10) {
      depreciationRate = age * 0.03;
    } else {
      depreciationRate = 0.30 + ((age - 10) * 0.02);
    }
    depreciationRate = Math.min(depreciationRate, 0.70); // Max 70% depreciation

    return Math.round(baseValue * (1 - depreciationRate));
  }

  /**
   * Get terms and conditions based on coverage types
   */
  private getTermsAndConditions(coverageTypes: CoverageType[]): string[] {
    const baseTerms = [
      'All coverage subject to policy terms and exclusions',
      'Deductible applies per occurrence',
      'Coverage territory as specified in route details',
      'Vessel must maintain valid class certification',
      'Immediate notification required for any incidents',
      'Annual survey and inspection requirements apply',
    ];

    const specificTerms: string[] = [];

    if (coverageTypes.includes(CoverageType.WAR_RISK)) {
      specificTerms.push('War risk coverage subject to 7-day cancellation notice');
      specificTerms.push('Premium adjustment based on changing war zone designations');
    }

    if (coverageTypes.includes(CoverageType.POLLUTION_LIABILITY)) {
      specificTerms.push('Pollution response plan must be maintained and updated');
      specificTerms.push('SCOPIC and salvage costs covered up to policy limits');
    }

    return [...baseTerms, ...specificTerms];
  }

  /**
   * Generate unique quote ID
   */
  private generateQuoteId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MIQ-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get insurance history for a vessel
   */
  async getInsuranceHistory(vesselId: string): Promise<InsuranceQuote[]> {
    // Simulate API call - in production, this would fetch from database
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - return empty for now
    return [];
  }

  /**
   * Accept/Bind insurance quote
   */
  async acceptQuote(quoteId: string): Promise<{ success: boolean; policyNumber?: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const policyNumber = `MIP-${Date.now().toString(36).toUpperCase()}`;
    
    return {
      success: true,
      policyNumber,
      message: `Insurance policy ${policyNumber} has been issued successfully`,
    };
  }
}

// Export singleton instance
export const insuranceService = new InsuranceService();
export default insuranceService;

