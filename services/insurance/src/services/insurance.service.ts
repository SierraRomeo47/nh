import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import {
  InsuranceQuoteRequest,
  InsuranceQuote,
  RiskAssessment,
  CoverageBreakdown,
  RiskFactor,
} from '../types';

class InsuranceService {
  private baseRates: Record<string, number> = {
    'Hull & Machinery': 0.008,
    'Protection & Indemnity': 0.015,
    'Cargo Insurance': 0.005,
    'War Risk': 0.003,
    'Pollution Liability': 0.004,
    'Loss of Hire': 0.012,
    'Crew Liability': 0.002,
    'Freight Liability': 0.006,
  };

  async generateQuote(request: InsuranceQuoteRequest): Promise<InsuranceQuote> {
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
      id: uuidv4(),
      quoteId,
      requestDate,
      expiryDate,
      vessel: {
        id: request.vesselId,
        name: request.vesselName,
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

    // Save to database
    await this.saveQuoteToDatabase(quote, request);

    return quote;
  }

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
    const routeRiskMap: Record<string, number> = {
      'Low Risk Zone': 10,
      'Medium Risk Zone': 35,
      'High Risk Zone (Piracy/War)': 85,
      'Polar Region': 65,
      'Coastal Waters': 25,
    };
    const routeScore = routeRiskMap[request.routeRiskZone] || 50;
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
    const safetyRiskMap: Record<string, number> = {
      Excellent: 5,
      Good: 20,
      Fair: 50,
      Poor: 90,
    };
    const safetyScore = safetyRiskMap[request.safetyRating] || 50;
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
      return sum + (factor.score * factor.weight) / 100;
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

  private calculateCoverages(
    request: InsuranceQuoteRequest,
    riskAssessment: RiskAssessment
  ): CoverageBreakdown[] {
    const coverages: CoverageBreakdown[] = [];
    const riskMultiplier = 1 + riskAssessment.totalScore / 100;

    // Estimate vessel value based on type and size
    const vesselValue = this.estimateVesselValue(request.vesselType, request.grossTonnage, request.vesselAge);

    for (const coverageType of request.coverageType) {
      let basePremium = 0;
      let limit = 0;
      let description = '';

      switch (coverageType) {
        case 'Hull & Machinery':
          limit = vesselValue;
          basePremium = vesselValue * this.baseRates[coverageType];
          description = 'Coverage for physical damage to vessel hull, machinery, and equipment';
          break;

        case 'Protection & Indemnity':
          limit = 500000000; // $500M standard P&I limit
          basePremium = limit * this.baseRates[coverageType] * 0.001;
          description = 'Third-party liability coverage for crew, cargo owners, and other parties';
          break;

        case 'Cargo Insurance':
          limit = request.cargoValue || vesselValue * 0.5;
          basePremium = limit * this.baseRates[coverageType];
          description = 'Coverage for cargo damage, loss, or theft during transit';
          break;

        case 'War Risk':
          limit = vesselValue;
          basePremium = vesselValue * this.baseRates[coverageType];
          if (request.routeRiskZone === 'High Risk Zone (Piracy/War)') {
            basePremium *= 3;
          }
          description = 'Coverage for war, terrorism, and piracy-related risks';
          break;

        case 'Pollution Liability':
          limit = 100000000; // $100M pollution limit
          basePremium = limit * this.baseRates[coverageType] * 0.001;
          description = 'Environmental damage and pollution cleanup liability';
          break;

        case 'Loss of Hire':
          const dailyRate = vesselValue * 0.0002;
          limit = dailyRate * 180; // 180 days coverage
          basePremium = limit * this.baseRates[coverageType];
          description = 'Loss of earnings due to vessel downtime from insured events';
          break;

        case 'Crew Liability':
          limit = 50000000; // $50M crew liability
          basePremium = limit * this.baseRates[coverageType] * 0.001;
          description = 'Coverage for crew injury, illness, and repatriation costs';
          break;

        case 'Freight Liability':
          limit = request.cargoValue || vesselValue * 0.3;
          basePremium = limit * this.baseRates[coverageType];
          description = 'Coverage for freight payment obligations and losses';
          break;

        default:
          continue;
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

  private estimateVesselValue(type: string, tonnage: number, age: number): number {
    const baseValuePerGT: Record<string, number> = {
      'Bulk Carrier': 2500,
      'Container Ship': 4000,
      Tanker: 3500,
      'LNG Carrier': 8000,
      'General Cargo': 2000,
      'Roll-on/Roll-off': 3000,
      'Refrigerated Cargo': 3500,
      'Cruise Ship': 10000,
      'Offshore Support': 5000,
    };

    const baseValue = tonnage * (baseValuePerGT[type] || 3000);

    // Depreciation: 3% per year for first 10 years, 2% thereafter
    let depreciationRate = 0;
    if (age <= 10) {
      depreciationRate = age * 0.03;
    } else {
      depreciationRate = 0.3 + (age - 10) * 0.02;
    }
    depreciationRate = Math.min(depreciationRate, 0.7); // Max 70% depreciation

    return Math.round(baseValue * (1 - depreciationRate));
  }

  private getTermsAndConditions(coverageTypes: string[]): string[] {
    const baseTerms = [
      'All coverage subject to policy terms and exclusions',
      'Deductible applies per occurrence',
      'Coverage territory as specified in route details',
      'Vessel must maintain valid class certification',
      'Immediate notification required for any incidents',
      'Annual survey and inspection requirements apply',
    ];

    const specificTerms: string[] = [];

    if (coverageTypes.includes('War Risk')) {
      specificTerms.push('War risk coverage subject to 7-day cancellation notice');
      specificTerms.push('Premium adjustment based on changing war zone designations');
    }

    if (coverageTypes.includes('Pollution Liability')) {
      specificTerms.push('Pollution response plan must be maintained and updated');
      specificTerms.push('SCOPIC and salvage costs covered up to policy limits');
    }

    return [...baseTerms, ...specificTerms];
  }

  private generateQuoteId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MIQ-${timestamp}-${random}`.toUpperCase();
  }

  private async saveQuoteToDatabase(quote: InsuranceQuote, request: InsuranceQuoteRequest): Promise<void> {
    const queryText = `
      INSERT INTO insurance_quotes (
        id, quote_id, request_date, expiry_date, valid_until,
        vessel_id, vessel_name, vessel_type, vessel_age, gross_tonnage,
        route_origin, route_destination, route_risk_zone, voyage_duration,
        cargo_type, cargo_value,
        safety_rating, compliance_score, previous_claims, deductible,
        total_premium, coverage_types, risk_assessment, coverage_breakdown,
        terms_and_conditions, status, underwriter, created_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23, $24,
        $25, $26, $27, $28
      )
    `;

    const values = [
      quote.id,
      quote.quoteId,
      quote.requestDate,
      quote.expiryDate,
      quote.validUntil,
      request.vesselId || null,
      quote.vessel.name,
      quote.vessel.type,
      quote.vessel.age,
      quote.vessel.tonnage,
      request.routeOrigin,
      request.routeDestination,
      request.routeRiskZone,
      request.voyageDuration,
      request.cargoType || null,
      request.cargoValue || null,
      request.safetyRating,
      request.complianceScore,
      request.previousClaims,
      quote.deductible,
      quote.totalPremium,
      request.coverageType,
      JSON.stringify(quote.riskAssessment),
      JSON.stringify(quote.coverage),
      quote.termsAndConditions,
      quote.status,
      quote.underwriter,
      request.userId || null,
    ];

    await query(queryText, values);
  }

  async getQuoteById(quoteId: string): Promise<InsuranceQuote | null> {
    const result = await query('SELECT * FROM insurance_quotes WHERE quote_id = $1', [quoteId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToQuote(row);
  }

  async getQuotesByVessel(vesselId: string): Promise<InsuranceQuote[]> {
    const result = await query('SELECT * FROM insurance_quotes WHERE vessel_id = $1 ORDER BY request_date DESC', [
      vesselId,
    ]);

    return result.rows.map((row) => this.mapRowToQuote(row));
  }

  async acceptQuote(quoteId: string): Promise<{ success: boolean; policyNumber: string; message: string }> {
    const policyNumber = `MIP-${Date.now().toString(36).toUpperCase()}`;

    // Update quote status
    await query(
      'UPDATE insurance_quotes SET status = $1, policy_number = $2, updated_at = NOW() WHERE quote_id = $3',
      ['ACCEPTED', policyNumber, quoteId]
    );

    // Get the quote details
    const quoteResult = await query('SELECT * FROM insurance_quotes WHERE quote_id = $1', [quoteId]);
    if (quoteResult.rows.length === 0) {
      throw new Error('Quote not found');
    }

    const quote = quoteResult.rows[0];

    // Create policy record
    const policyId = uuidv4();
    const effectiveDate = new Date();
    const expiryDate = new Date(effectiveDate);
    expiryDate.setDate(expiryDate.getDate() + quote.voyage_duration);

    await query(
      `INSERT INTO insurance_policies (
        id, policy_number, quote_id, issue_date, effective_date, expiry_date, status
      ) VALUES ($1, $2, $3, NOW(), $4, $5, 'ACTIVE')`,
      [policyId, policyNumber, quote.id, effectiveDate, expiryDate]
    );

    return {
      success: true,
      policyNumber,
      message: `Insurance policy ${policyNumber} has been issued successfully`,
    };
  }

  private mapRowToQuote(row: any): InsuranceQuote {
    return {
      id: row.id,
      quoteId: row.quote_id,
      requestDate: row.request_date,
      expiryDate: row.expiry_date,
      vessel: {
        id: row.vessel_id,
        name: row.vessel_name,
        type: row.vessel_type,
        age: row.vessel_age,
        tonnage: row.gross_tonnage,
      },
      coverage: row.coverage_breakdown,
      totalPremium: parseFloat(row.total_premium),
      deductible: parseFloat(row.deductible),
      riskAssessment: row.risk_assessment,
      termsAndConditions: row.terms_and_conditions,
      validUntil: row.valid_until,
      underwriter: row.underwriter,
      status: row.status,
      policyNumber: row.policy_number,
    };
  }
}

export default new InsuranceService();

