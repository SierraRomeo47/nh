// Jest-style unit tests for the rules engine
import { 
  canBorrow, 
  validatePool, 
  calcPenaltyVsPool, 
  tcc, 
  etsCoveredShare,
  getEtsRampPercentage,
  calculateFuelEUCost,
  calculateEUACost,
  determineLegType,
  calculateEfficiencyScore,
  calculateLeaguePoints,
  validateActionThreshold
} from './rulesEngine';

describe('FuelEU borrowing rules', () => {
  test('blocked when pooled', () => {
    expect(canBorrow(true, 2025, 0.5, 0)).toBe(false);
  });
  
  test('cap respected', () => {
    expect(canBorrow(false, 2025, 0.01, 0)).toBe(true);
    expect(canBorrow(false, 2025, 0.03, 0)).toBe(false);
  });
  
  test('consecutive period limits', () => {
    expect(canBorrow(false, 2025, 0.01, 1)).toBe(true);
    expect(canBorrow(false, 2025, 0.01, 2)).toBe(false);
  });
});

describe('Pool validation', () => {
  test('allows pool when not already pooled', () => {
    expect(validatePool(false)).toBe(true);
  });
  
  test('blocks pool when already pooled', () => {
    expect(validatePool(true)).toBe(false);
  });
});

describe('ETS scope rules', () => {
  test('intra-EU = 100%', () => {
    expect(etsCoveredShare('intra')).toBe(100);
  });
  
  test('extra-EU = 50%', () => {
    expect(etsCoveredShare('extra')).toBe(50);
  });
  
  test('berth = 100%', () => {
    expect(etsCoveredShare('berth')).toBe(100);
  });
});

describe('ETS ramp schedule', () => {
  test('2025 = 40%', () => {
    expect(getEtsRampPercentage(2025)).toBe(40);
  });
  
  test('2026 = 70%', () => {
    expect(getEtsRampPercentage(2026)).toBe(70);
  });
  
  test('2027+ = 100%', () => {
    expect(getEtsRampPercentage(2027)).toBe(100);
    expect(getEtsRampPercentage(2030)).toBe(100);
  });
});

describe('Pool vs penalty decision', () => {
  test('prefer pool if cheaper than penalty', () => {
    // 1000 GJ * €60/GJ = €60,000 penalty
    // 1000 GJ * €0.04/g = €40,000 pool cost (assuming ~1000g/GJ deficit)
    expect(calcPenaltyVsPool(1000, 60, 0.04)).toBe('POOL');
  });
  
  test('prefer penalty if cheaper than pool', () => {
    expect(calcPenaltyVsPool(1000, 60, 0.08)).toBe('PAY_PENALTY');
  });
  
  test('indifferent when costs are similar', () => {
    expect(calcPenaltyVsPool(1000, 60, 0.057)).toBe('IN_DIFF'); // Within 5% threshold
  });
});

describe('TCC calculation', () => {
  test('sums correctly', () => {
    expect(tcc(10000, 3500, -500, 200)).toBe(13200);
  });
  
  test('handles negative values', () => {
    expect(tcc(10000, 3500, -2000, -500)).toBe(11000);
  });
});

describe('FuelEU cost calculation', () => {
  test('no cost for surplus', () => {
    expect(calculateFuelEUCost(1000000, 5000)).toBe(0);
  });
  
  test('penalty cost for deficit without pool', () => {
    expect(calculateFuelEUCost(-1000000, 1000)).toBe(60000); // 1000 GJ * €60/GJ
  });
  
  test('chooses cheaper option between pool and penalty', () => {
    const poolCost = calculateFuelEUCost(-1000000, 1000, 0.04); // €40/tonne
    const penaltyCost = calculateFuelEUCost(-1000000, 1000); // €60,000
    expect(poolCost).toBeLessThan(penaltyCost);
  });
});

describe('EUA cost calculation', () => {
  test('calculates with ramp and coverage', () => {
    // 100 tCO2, 50% coverage, €76/tCO2, 2025 (40% ramp)
    const cost = calculateEUACost(100, 50, 76, 2025);
    expect(cost).toBe(100 * 0.5 * 0.4 * 76); // 1520
  });
  
  test('full coverage in 2027+', () => {
    const cost = calculateEUACost(100, 100, 76, 2027);
    expect(cost).toBe(100 * 1.0 * 1.0 * 76); // 7600
  });
});

describe('Leg type determination', () => {
  test('identifies berth operations', () => {
    expect(determineLegType('Rotterdam (EU Berth Operations)')).toBe('berth');
  });
  
  test('identifies intra-EU', () => {
    expect(determineLegType('Hamburg (EU) → Rotterdam (EU)')).toBe('intra');
  });
  
  test('identifies extra-EU', () => {
    expect(determineLegType('Singapore (non-EU) → Rotterdam (EU)')).toBe('extra');
  });
  
  test('defaults to extra-EU for unknown', () => {
    expect(determineLegType('Unknown Port → Another Port')).toBe('extra');
  });
});

describe('Efficiency scoring', () => {
  test('calculates efficiency score correctly', () => {
    // 10% fuel improvement, 5% CO2 improvement
    const score = calculateEfficiencyScore(90, 100, 95, 100);
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
  });
  
  test('handles no improvement', () => {
    const score = calculateEfficiencyScore(100, 100, 100, 100);
    expect(score).toBe(50); // Baseline score
  });
  
  test('caps at 100', () => {
    const score = calculateEfficiencyScore(50, 100, 50, 100); // 50% improvement
    expect(score).toBe(100);
  });
});

describe('League points calculation', () => {
  test('awards points for fuel and CO2 savings', () => {
    const points = calculateLeaguePoints(-2.5, -7.8, 25); // Negative = savings
    expect(points).toBe(2.5 * 10 + 7.8 * 5 + 25); // 89 points
  });
  
  test('no points for increases', () => {
    const points = calculateLeaguePoints(2.5, 7.8, 0); // Positive = increase
    expect(points).toBe(0);
  });
  
  test('includes quest bonus', () => {
    const points = calculateLeaguePoints(-1, -2, 50);
    expect(points).toBe(1 * 10 + 2 * 5 + 50); // 70 points
  });
});

describe('Action validation thresholds', () => {
  test('validates significant fuel change', () => {
    expect(validateActionThreshold(-0.5, -0.1)).toBe(true);
  });
  
  test('validates significant CO2 change', () => {
    expect(validateActionThreshold(-0.05, -0.3)).toBe(true);
  });
  
  test('rejects insignificant changes', () => {
    expect(validateActionThreshold(-0.05, -0.1)).toBe(false);
  });
  
  test('uses custom thresholds', () => {
    expect(validateActionThreshold(-0.05, -0.1, 0.01, 0.05)).toBe(true);
  });
});

// Integration test
describe('Complete compliance scenario', () => {
  test('handles typical voyage compliance calculation', () => {
    // Scenario: Intra-EU voyage with deficit
    const co2Tons = 248.9;
    const coveredShare = 100;
    const euaPrice = 76;
    const year = 2025;
    const energyGJ = 8420;
    const deficitGco2e = -2.9e6;
    
    // Calculate EUA cost
    const euaCost = calculateEUACost(co2Tons, coveredShare, euaPrice, year);
    expect(euaCost).toBeCloseTo(248.9 * 1.0 * 0.4 * 76); // 7,566 EUR
    
    // Calculate FuelEU cost (penalty)
    const fuelEUCost = calculateFuelEUCost(deficitGco2e, energyGJ);
    expect(fuelEUCost).toBeCloseTo(8420 * 60); // 505,200 EUR
    
    // Total compliance cost (assuming 600 EUR/tonne fuel, 96.3t fuel)
    const fuelCost = 96.3 * 600; // 57,780 EUR
    const totalTCC = tcc(fuelCost, euaCost, fuelEUCost, 0);
    
    expect(totalTCC).toBeGreaterThan(500000); // Significant cost due to FuelEU deficit
  });
});

export {};

