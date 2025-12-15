export interface InsuranceQuoteRequest {
  vesselId?: string;
  vesselName: string;
  vesselType: string;
  vesselAge: number; // years
  grossTonnage: number; // GT
  cargoValue?: number; // USD
  cargoType?: string;
  routeOrigin: string;
  routeDestination: string;
  routeRiskZone: string;
  voyageDuration: number; // days
  coverageType: string[];
  deductible: number; // USD
  previousClaims: number; // count in last 5 years
  safetyRating: string;
  complianceScore: number; // 0-100
  requestDate?: Date;
  userId?: string;
}

export interface InsuranceQuote {
  id: string;
  quoteId: string;
  requestDate: Date;
  expiryDate: Date;
  vessel: {
    id?: string;
    name: string;
    type: string;
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
  status: 'DRAFT' | 'QUOTED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  policyNumber?: string;
}

export interface CoverageBreakdown {
  type: string;
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

export interface QuoteResponse {
  success: boolean;
  quote?: InsuranceQuote;
  error?: string;
  message?: string;
}

export interface AcceptQuoteResponse {
  success: boolean;
  policyNumber?: string;
  message: string;
  error?: string;
}

