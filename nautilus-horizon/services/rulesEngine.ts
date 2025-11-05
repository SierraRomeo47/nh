import { PolicyConfig } from '../types/index';

// Default policy configuration based on the specification
export const DEFAULT_POLICIES: PolicyConfig = {
  etsRampByYear: {
    "2025": 40, // 2025 report for 2024
    "2026": 70, // 2026 report for 2025  
    "2027": 100 // 2027 and beyond
  },
  etsScopeRules: "100% intra-EU/EEA legs; 50% for extra-EU legs; 100% at berth.",
  fueleuPenaltyEurPerGj: 60,
  fueleuPoolingRules: "One pool per period per ship; pool must net positive to avoid penalties; surplus may be banked; deficit pays penalty.",
  fueleuBorrowCaps: "Borrowing limited by cap (e.g., 2%) and consecutive-period limits; borrowing prohibited while pooled.",
  dcsTimeline: "Amendments enter into force 1 Aug 2025; collection remains calendar year. Enhanced granularity (fuel by consumer type, transport work) applies with early application optional; widespread practical collection from 1 Jan 2026."
};

// Rules engine functions
export function canBorrow(
  inPool: boolean, 
  year: number, 
  borrowedSoFarPct: number, 
  consecutivePeriods: number
): boolean {
  // Borrowing prohibited while pooled
  if (inPool) return false;
  
  // Check borrowing cap (2%)
  if (borrowedSoFarPct >= 0.02) return false;
  
  // Check consecutive period limits (max 2)
  if (consecutivePeriods >= 2) return false;
  
  return true;
}

export function validatePool(alreadyPooled: boolean): boolean {
  // One pool per period per ship
  return !alreadyPooled;
}

export function calcPenaltyVsPool(
  nonCompliantGJ: number, 
  penaltyEURperGJ: number, 
  poolOfferPrice: number
): 'PAY_PENALTY' | 'POOL' | 'IN_DIFF' {
  const penaltyCost = nonCompliantGJ * penaltyEURperGJ;
  const poolCost = nonCompliantGJ * poolOfferPrice;
  
  const diff = Math.abs(penaltyCost - poolCost);
  const threshold = penaltyCost * 0.05; // 5% threshold for "indifferent"
  
  if (diff < threshold) return 'IN_DIFF';
  return poolCost < penaltyCost ? 'POOL' : 'PAY_PENALTY';
}

export function tcc(
  fuelCost: number, 
  euaCost: number, 
  fuelEUSettlement: number, 
  hedgePnL: number
): number {
  return fuelCost + euaCost + fuelEUSettlement + hedgePnL;
}

export function etsCoveredShare(legType: 'intra' | 'extra' | 'berth'): number {
  switch (legType) {
    case 'intra': return 100;
    case 'extra': return 50;
    case 'berth': return 100;
    default: return 0;
  }
}

// Calculate ETS ramp percentage for a given year
export function getEtsRampPercentage(year: number): number {
  const yearStr = year.toString();
  if (year <= 2025) return DEFAULT_POLICIES.etsRampByYear["2025"] || 40;
  if (year === 2026) return DEFAULT_POLICIES.etsRampByYear["2026"] || 70;
  return DEFAULT_POLICIES.etsRampByYear["2027"] || 100;
}

// Calculate FuelEU compliance cost
export function calculateFuelEUCost(
  complianceBalanceGco2e: number,
  energyInScopeGJ: number,
  poolPrice?: number
): number {
  if (complianceBalanceGco2e >= 0) return 0; // Surplus, no cost
  
  const deficitGco2e = Math.abs(complianceBalanceGco2e);
  const penaltyCost = (energyInScopeGJ * DEFAULT_POLICIES.fueleuPenaltyEurPerGj);
  
  if (poolPrice !== undefined) {
    const poolCost = deficitGco2e * poolPrice / 1e6; // Convert to tonnes
    return Math.min(poolCost, penaltyCost);
  }
  
  return penaltyCost;
}

// Calculate EUA cost for a voyage
export function calculateEUACost(
  co2Tons: number,
  coveredSharePct: number,
  euaPrice: number,
  year: number
): number {
  const rampPct = getEtsRampPercentage(year);
  const coveredCo2 = co2Tons * (coveredSharePct / 100) * (rampPct / 100);
  return coveredCo2 * euaPrice;
}

// Determine leg type from voyage description
export function determineLegType(legDescription: string): 'intra' | 'extra' | 'berth' {
  const lower = legDescription.toLowerCase();
  
  if (lower.includes('berth')) return 'berth';
  
  // Simple heuristic: if both ports seem to be EU, it's intra-EU
  const euPorts = ['rotterdam', 'hamburg', 'valencia', 'piraeus', 'oslo'];
  const nonEuPorts = ['new york', 'singapore', 'jeddah'];
  
  const hasEuPort = euPorts.some(port => lower.includes(port));
  const hasNonEuPort = nonEuPorts.some(port => lower.includes(port));
  
  if (hasEuPort && !hasNonEuPort) return 'intra';
  if (hasEuPort && hasNonEuPort) return 'extra';
  
  return 'extra'; // Default assumption
}

// Generate efficiency score (0-100) based on performance metrics
export function calculateEfficiencyScore(
  actualFuelTpd: number,
  baselineFuelTpd: number,
  actualCo2: number,
  baselineCo2: number
): number {
  const fuelEfficiency = Math.max(0, (baselineFuelTpd - actualFuelTpd) / baselineFuelTpd);
  const co2Efficiency = Math.max(0, (baselineCo2 - actualCo2) / baselineCo2);
  
  const avgEfficiency = (fuelEfficiency + co2Efficiency) / 2;
  return Math.min(100, Math.max(0, 50 + (avgEfficiency * 100))); // Scale around 50 baseline
}

// Calculate league points for an action
export function calculateLeaguePoints(
  deltaFuelT: number,
  deltaCo2T: number,
  questBonus: number = 0
): number {
  const fuelPoints = Math.max(0, -deltaFuelT) * 10; // 10 points per tonne fuel saved
  const co2Points = Math.max(0, -deltaCo2T) * 5;    // 5 points per tonne CO2 saved
  return fuelPoints + co2Points + questBonus;
}

// Validate if an action meets minimum thresholds (anti-gaming)
export function validateActionThreshold(
  deltaFuelT: number,
  deltaCo2T: number,
  minFuelThreshold: number = 0.1,
  minCo2Threshold: number = 0.2
): boolean {
  return Math.abs(deltaFuelT) >= minFuelThreshold || Math.abs(deltaCo2T) >= minCo2Threshold;
}

