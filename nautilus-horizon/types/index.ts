
// Core entities
export interface Organization {
  id: string;
  name: string;
}

export interface Ship {
  id: string;
  imo: string;
  name: string;
  class?: string;
  segment?: string;
  orgId: string;
}

export interface Voyage {
  voyage_id: string;
  imo: string;
  ship_name: string;
  legs: string[];
  imo_dcs: {
    fuel_by_type_t: Record<string, number>;
    transport_work_tnm: number;
    submission_timeline: string;
  };
  eu_ets: {
    covered_share_pct: number;
    reported_year: number;
    surrender_deadline_iso: string;
    eua_exposure_tco2: number;
  };
  fueleu: {
    energy_in_scope_gj: number;
    ghg_intensity_gco2e_per_mj: number;
    compliance_balance_gco2e: number;
    pooling_status: string;
  };
}

// Energy and sensor data
export interface EnergyReading {
  id: string;
  shipId: string;
  timestamp: string;
  rpm: number;
  speedKn: number;
  meLoadPct: number;
  aeLoadPct: number;
  sfocGKwh: number;
  fuelRateTpd: number;
  cargoMode: string;
  seaState: string;
  trimM: number;
  notes?: string;
}

// Crew recommendations and gamification
export interface Recommendation {
  id: string;
  shipId: string;
  createdTs: string;
  type: 'SGM_ENABLE' | 'TRIM_OPTIMIZE' | 'ECO_RPM' | 'SPEED_OPTIMIZE' | 'VFD_ENABLE' | 'WHR_OPTIMIZE' | 'LIGHTS_OFF' | 'WATER_SAVING' | 'ENVIRONMENTAL_CHECK' | 'MAINTENANCE_ROUTINE';
  rationale: string;
  expectedDeltaTFuel: number;
  expectedDeltaTCo2: number;
  confidence01: number;
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
  assignedRole?: string; // Role-specific task assignment
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDuration: number; // in minutes
}

export interface ActionLog {
  id: string;
  recommendationId: string;
  crewUserId: string;
  appliedTs: string;
  beforeSnapshot: Record<string, any>;
  afterSnapshot: Record<string, any>;
  realizedDeltaTFuel: number;
  realizedDeltaTCo2: number;
}

export interface ScoreEvent {
  id: string;
  shipId: string;
  userId: string;
  timestamp: string;
  points: number;
  badge?: string;
  source: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: 'CREW' | 'COMPLIANCE_OFFICER' | 'TRADER' | 'ADMIN';
  orgId: string;
}

// FuelEU Maritime compliance
export interface FuelEUBalance {
  id: string;
  shipId: string;
  year: number;
  balanceGco2e: number;
  bankedGco2e: number;
  borrowedGco2e: number;
  inPool: boolean;
}

export interface FuelEUCompliance {
  id: string;
  shipId: string;
  year: number;
  balanceGco2e: number;
  bankedGco2e: number;
  borrowedGco2e: number;
  inPool: boolean;
}

export interface FuelEUCompliancePosition {
  currentYearNetBalanceGco2e: number;
  bankedSurplusGco2e: number;
  borrowedDeficitGco2e: number;
  borrowingLimitGco2e: number;
}

// Pooling and RFQ system
export enum RfqStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FILLED = 'FILLED',
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export interface PoolOffer {
  id: string;
  rfqId: string;
  counterparty: string;
  offeredGco2e: number;
  priceEurPerGco2e: number;
  validUntilTs: string;
  status: OfferStatus;
}

export interface PoolRFQ {
  id: string;
  orgId: string;
  year: number;
  needGco2e: number; // Positive for need, negative for surplus
  notes: string;
  status: RfqStatus;
  offers: PoolOffer[];
  priceRange?: {
    min: number;
    max: number;
  };
  preferredCounterpartyTypes?: string[];
}

// EU ETS trading
export interface EUAExposure {
  id: string;
  voyageId: string;
  scope: string;
  estimatedTco2: number;
  hedgedTco2: number;
  avgPriceEurT: number;
  realizedPnlEur: number;
}

export interface TradeHedge {
  id: string;
  voyageId: string;
  type: 'BUY' | 'SELL';
  quantityTco2: number;
  priceEurT: number;
  timestamp: string;
  externalRef?: string;
}

// Financial and audit
export interface LedgerEntry {
  id: string;
  timestamp: string;
  refType: string;
  refId: string;
  amountEur: number;
  currency: string;
  memo: string;
}

export interface AuditDecision {
  id: string;
  timestamp: string;
  decisionType: 'POOL_ACCEPT' | 'HEDGE_EXECUTE' | 'BORROW' | 'BANK';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  policies: Record<string, any>;
  userId: string;
}

// TCC and scenario modeling
export interface TccData {
  fuelCost: number;
  etsCost: number;
  fuelEUCost: number;
  total: number;
}

export interface VesselDetails {
  imo: string;
  name: string;
  ship_type?: string;
  gross_tonnage?: number;
  deadweight_tonnage?: number;
  engine_power_kw?: number;
  max_speed_knots?: number;
  min_speed_knots?: number;
}

export interface FuelSelection {
  fuelType: string;
  // Emission factors can be overridden (editable)
  redII_wtw_gco2e_mj?: number;
  ets_ttw_gco2e_mj?: number;
  fueleu_wtw_gco2e_mj?: number;
  imo_dcs_ttw_co2e_mj?: number;
}

export interface MultiFuelSelection extends FuelSelection {
  percentage: number; // Percentage of total fuel consumption
}

export interface ScenarioParams {
  vessel?: VesselDetails;
  fuelSelection?: FuelSelection;
  fuelSelections?: MultiFuelSelection[]; // Support multiple fuels
  originPort?: string;
  destinationPort?: string;
  distanceNauticalMiles?: number;
  speedKnots: number;
  portConsumptionPerDay?: number;
  seaConsumptionPerDay?: number;
  daysAtSea?: number;
  daysInPort?: number;
  sgmEnabled: boolean;
  vfdEnabled: boolean;
  whrEnabled: boolean; // Waste Heat Recovery
  weatherMargin: number;
  fuelPrice?: number;
  euaPrice?: number;
  carbonFactor?: number;
}

export interface ScenarioResult {
  deltaFuelT: number;
  deltaCo2T: number;
  deltaEtsEur: number;
  deltaFuelEUEur: number;
  netTccEur: number;
  voyageDistanceNm?: number;
  voyageDurationDays?: number;
  totalFuelConsumed?: number;
}

// Charter calculator
export type CharterType = 'SPOT_VOYAGE' | 'TIME' | 'BAREBOAT';
export type ClauseVariant = 'FREIGHT_INCLUSIVE' | 'SURCHARGE' | 'TRANSFER_OF_ALLOWANCES' | 'TIME_CLAUSE_2022';

export interface CharterCalculationInput {
  charterType: CharterType;
  clauseVariant: ClauseVariant;
  fuelTons: number;
  co2Tons: number;
  etsCoveredSharePct: number;
  euaPrice: number;
  fueleuEnergyGj: number;
  complianceBalanceGco2e: number;
  poolPrice?: number;
  penalty: number;
}

export interface CharterCalculationResult {
  ownerCostEur: number;
  chartererCostEur: number;
  voyageTccEur: number;
  breakdown: {
    fuel: { owner: number; charterer: number };
    ets: { owner: number; charterer: number };
    fueleu: { owner: number; charterer: number };
  };
}

// Policy and rules engine
export interface PolicyConfig {
  etsRampByYear: Record<string, number>;
  etsScopeRules: string;
  fueleuPenaltyEurPerGj: number;
  fueleuPoolingRules: string;
  fueleuBorrowCaps: string;
  dcsTimeline: string;
}

// League and gamification
export interface LeagueStanding {
  rank: number;
  shipId: string;
  shipName: string;
  totalPoints: number;
  weeklyPoints: number;
  badges: string[];
  efficiencyScore: number;
}

export interface Task {
  id: string;
  shipId: string;
  type: Recommendation['type'];
  title: string;
  description: string;
  expectedDeltaFuel: number;
  expectedDeltaCo2: number;
  points: number;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  completedAt?: string;
  assignedRole?: string; // Role-specific task assignment
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedDuration: number; // in minutes
  category: 'ENERGY_SAVING' | 'ENVIRONMENTAL' | 'MAINTENANCE' | 'OPERATIONAL' | 'SAFETY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  prerequisites?: string[]; // Task IDs that must be completed first
}

// Energy savings tracking for league leaderboard
export interface EnergySavingsMetrics {
  shipId: string;
  userId: string;
  role: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timestamp: string;
  
  // Energy savings by category
  fuelSaved: number; // tonnes
  co2Saved: number; // tonnes
  electricitySaved: number; // kWh
  waterSaved: number; // liters
  
  // Task completion metrics
  tasksCompleted: number;
  tasksInProgress: number;
  efficiencyScore: number; // 0-100
  
  // Role-specific metrics
  whrEfficiency?: number; // Waste Heat Recovery efficiency %
  sgmUptime?: number; // Shaft Generator Motor uptime %
  lightsOffCompliance?: number; // Lights off compliance %
  waterConservationScore?: number; // Water saving score %
  environmentalChecks?: number; // Number of environmental checks performed
  
  // Points and badges
  pointsEarned: number;
  badgesEarned: string[];
}

// Enhanced league standing with energy savings
export interface EnhancedLeagueStanding extends LeagueStanding {
  energySavings: EnergySavingsMetrics;
  roleBreakdown: {
    captain: { tasksCompleted: number; pointsEarned: number; };
    engineer: { tasksCompleted: number; pointsEarned: number; };
    crew: { tasksCompleted: number; pointsEarned: number; };
  };
  environmentalImpact: {
    totalCo2Saved: number;
    totalFuelSaved: number;
    environmentalScore: number; // 0-100
  };
}