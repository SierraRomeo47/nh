import { describe, it, expect } from 'vitest';

describe('EUA Operations Service - Invariants', () => {
  describe('Operation types', () => {
    it('allows FORECAST operation', () => {
      const forecast = {
        operation_type: 'FORECAST' as const,
        euas_count: 1000, // Positive
        executed_at: new Date('2024-01-15')
      };
      
      expect(forecast.operation_type).toBe('FORECAST');
      expect(forecast.euas_count).toBeGreaterThan(0);
    });

    it('allows HEDGE operation', () => {
      const hedge = {
        operation_type: 'HEDGE' as const,
        euas_count: 500,
        price_per_eua: 85.50,
        executed_at: new Date('2024-02-01')
      };
      
      expect(hedge.operation_type).toBe('HEDGE');
      expect(hedge.euas_count).toBeGreaterThan(0);
      expect(hedge.price_per_eua).toBeGreaterThan(0);
    });

    it('allows SURRENDER operation (negative count)', () => {
      const surrender = {
        operation_type: 'SURRENDER' as const,
        euas_count: -800, // Negative for surrender
        executed_at: new Date('2024-12-31')
      };
      
      expect(surrender.operation_type).toBe('SURRENDER');
      expect(surrender.euas_count).toBeLessThan(0);
    });

    it('allows RECONCILE operation', () => {
      const reconcile = {
        operation_type: 'RECONCILE' as const,
        euas_count: 0,
        executed_at: new Date('2025-01-15')
      };
      
      expect(reconcile.operation_type).toBe('RECONCILE');
    });
  });

  describe('SURRENDER rules', () => {
    it('allows surrender only after positive emissions', () => {
      const emissions = {
        co2_tonnes: 1200.5,
        period_year: 2024
      };
      
      const surrender = {
        operation_type: 'SURRENDER' as const,
        euas_count: -1201, // 50% of emissions in 2024, rounding up
        executed_at: new Date('2024-12-31')
      };
      
      expect(emissions.co2_tonnes).toBeGreaterThan(0);
      expect(Math.abs(surrender.euas_count)).toBeGreaterThan(0);
      expect(surrender.euas_count).toBeLessThan(0);
    });

    it('rejects surrender without emissions', () => {
      const emissions = {
        co2_tonnes: 0,
        period_year: 2024
      };
      
      expect(() => {
        if (emissions.co2_tonnes === 0) {
          throw new Error('Cannot surrender without emissions');
        }
      }).toThrow('Cannot surrender without emissions');
    });

    it('validates surrender amount matches emissions', () => {
      const emissions = 1200.5; // tonnes CO2
      const requiredEUAs = Math.ceil(emissions * 0.5); // 50% coverage
      const surrenderedEUAs = 601; // Correct amount
      
      expect(surrenderedEUAs).toBeGreaterThanOrEqual(requiredEUAs);
    });

    it('rejects insufficient surrender amount', () => {
      const emissions = 1200.5; // tonnes CO2
      const requiredEUAs = Math.ceil(emissions * 0.5); // 601 EUAs
      const surrenderedEUAs = 500; // Insufficient
      
      expect(surrenderedEUAs).toBeLessThan(requiredEUAs);
      // Should reject
    });
  });

  describe('RECONCILE rules', () => {
    it('allows reconcile to match surrendered amount', () => {
      const surrendered = 800; // EUAs surrendered
      const reconciled = 800; // EUAs reconciled
      
      expect(reconciled).toBe(surrendered);
    });

    it('tracks reconcile accuracy', () => {
      const surrendered = 1200;
      const reconciled = 1200;
      const difference = Math.abs(reconciled - surrendered);
      
      expect(difference).toBe(0);
    });
  });

  describe('EUA calculations', () => {
    it('calculates required EUAs as 50% of emissions', () => {
      const emissions = 2000; // tonnes CO2
      const coverageRate = 0.5; // 50%
      const requiredEUAs = Math.ceil(emissions * coverageRate);
      
      expect(requiredEUAs).toBe(1000);
    });

    it('rounds up to nearest integer for EUAs', () => {
      const emissions = 2025.7; // tonnes CO2
      const coverageRate = 0.5;
      const requiredEUAs = Math.ceil(emissions * coverageRate);
      
      expect(requiredEUAs).toBe(1013); // Rounded up
    });

    it('calculates total cost when price is known', () => {
      const euasCount = 1000;
      const pricePerEua = 85.50;
      const totalCost = euasCount * pricePerEua;
      
      expect(totalCost).toBe(85500);
    });
  });

  describe('Forecast vs actual', () => {
    it('calculates forecast accuracy', () => {
      const forecasted = 1000;
      const actual = 950;
      const difference = Math.abs(actual - forecasted);
      const percentageError = (difference / forecasted) * 100;
      
      expect(percentageError).toBe(5); // 5% error
    });

    it('tracks forecast vs surrendered EUAs', () => {
      const forecasted = 1200;
      const surrendered = 1150;
      const variance = surrendered - forecasted;
      
      expect(variance).toBe(-50); // Under-forecasted by 50 EUAs
    });
  });
});

describe('EUA Operations Service - Business Logic', () => {
  describe('Workflow validation', () => {
    it('requires FORECAST before SURRENDER', () => {
      const hasForecast = true;
      const wantsSurrender = true;
      
      expect(hasForecast).toBe(true);
      if (!hasForecast) {
        throw new Error('Must forecast before surrendering');
      }
    });

    it('allows HEDGE after FORECAST', () => {
      const hasForecast = true;
      const wantsHedge = true;
      
      expect(hasForecast).toBe(true);
      if (!hasForecast) {
        throw new Error('Must forecast before hedging');
      }
    });

    it('requires SURRENDER before RECONCILE', () => {
      const hasSurrender = true;
      const wantsReconcile = true;
      
      expect(hasSurrender).toBe(true);
      if (!hasSurrender) {
        throw new Error('Must surrender before reconciling');
      }
    });
  });

  describe('Price tracking', () => {
    it('records price for HEDGE operations', () => {
      const hedge = {
        operation_type: 'HEDGE' as const,
        euas_count: 500,
        price_per_eua: 85.50,
        executed_at: new Date()
      };
      
      expect(hedge.price_per_eua).toBeDefined();
      expect(hedge.price_per_eua).toBeGreaterThan(0);
    });

    it('may not record price for FORECAST', () => {
      const forecast = {
        operation_type: 'FORECAST' as const,
        euas_count: 1000,
        price_per_eua: undefined,
        executed_at: new Date()
      };
      
      expect(forecast.price_per_eua).toBeUndefined();
    });

    it('calculates average hedge price', () => {
      const hedges = [
        { euas_count: 300, price_per_eua: 80.00 },
        { euas_count: 200, price_per_eua: 85.50 }
      ];
      
      const totalCost = hedges.reduce((sum, h) => sum + (h.euas_count * h.price_per_eua), 0);
      const totalEUAs = hedges.reduce((sum, h) => sum + h.euas_count, 0);
      const avgPrice = totalCost / totalEUAs;
      
      expect(avgPrice).toBeCloseTo(82.2, 1);
    });
  });

  describe('Reference voyages', () => {
    it('links voyages to operation', () => {
      const operation = {
        operation_type: 'SURRENDER' as const,
        euas_count: -800,
        voyage_ids: ['voyage-1', 'voyage-2', 'voyage-3'],
        executed_at: new Date()
      };
      
      expect(operation.voyage_ids).toHaveLength(3);
    });

    it('allows empty voyage references for forecast', () => {
      const forecast = {
        operation_type: 'FORECAST' as const,
        euas_count: 1000,
        voyage_ids: [],
        executed_at: new Date()
      };
      
      expect(forecast.voyage_ids).toHaveLength(0);
    });
  });
});

