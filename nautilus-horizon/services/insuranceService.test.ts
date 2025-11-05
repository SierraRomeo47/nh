/**
 * Tests for Maritime Insurance Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  insuranceService,
  VesselType,
  CargoType,
  RouteRiskZone,
  CoverageType,
  SafetyRating,
  InsuranceQuoteRequest,
} from './insuranceService';

describe('InsuranceService', () => {
  let sampleQuoteRequest: InsuranceQuoteRequest;

  beforeEach(() => {
    sampleQuoteRequest = {
      vesselName: 'Test Vessel',
      vesselType: VesselType.CONTAINER,
      vesselAge: 5,
      grossTonnage: 50000,
      cargoValue: 5000000,
      cargoType: CargoType.CONTAINER,
      routeOrigin: 'Singapore',
      routeDestination: 'Rotterdam',
      routeRiskZone: RouteRiskZone.LOW,
      voyageDuration: 30,
      coverageType: [CoverageType.HULL_AND_MACHINERY, CoverageType.PROTECTION_INDEMNITY],
      deductible: 50000,
      previousClaims: 0,
      safetyRating: SafetyRating.GOOD,
      complianceScore: 85,
      requestDate: new Date(),
    };
  });

  describe('generateQuote', () => {
    it('should generate a valid insurance quote', async () => {
      const quote = await insuranceService.generateQuote(sampleQuoteRequest);

      expect(quote).toBeDefined();
      expect(quote.quoteId).toContain('MIQ-');
      expect(quote.vessel.name).toBe('Test Vessel');
      expect(quote.vessel.type).toBe(VesselType.CONTAINER);
      expect(quote.totalPremium).toBeGreaterThan(0);
      expect(quote.status).toBe('QUOTED');
    });

    it('should include risk assessment', async () => {
      const quote = await insuranceService.generateQuote(sampleQuoteRequest);

      expect(quote.riskAssessment).toBeDefined();
      expect(quote.riskAssessment.overallRisk).toMatch(/LOW|MEDIUM|HIGH|CRITICAL/);
      expect(quote.riskAssessment.riskFactors).toBeInstanceOf(Array);
      expect(quote.riskAssessment.riskFactors.length).toBeGreaterThan(0);
      expect(quote.riskAssessment.totalScore).toBeGreaterThanOrEqual(0);
      expect(quote.riskAssessment.totalScore).toBeLessThanOrEqual(100);
    });

    it('should calculate coverage breakdown correctly', async () => {
      const quote = await insuranceService.generateQuote(sampleQuoteRequest);

      expect(quote.coverage).toBeDefined();
      expect(quote.coverage.length).toBe(2); // Two coverage types requested
      
      const hullCoverage = quote.coverage.find(c => c.type === CoverageType.HULL_AND_MACHINERY);
      expect(hullCoverage).toBeDefined();
      expect(hullCoverage!.premium).toBeGreaterThan(0);
      expect(hullCoverage!.limit).toBeGreaterThan(0);
      
      const piCoverage = quote.coverage.find(c => c.type === CoverageType.PROTECTION_INDEMNITY);
      expect(piCoverage).toBeDefined();
      expect(piCoverage!.premium).toBeGreaterThan(0);
    });

    it('should apply higher premiums for high-risk scenarios', async () => {
      const lowRiskQuote = await insuranceService.generateQuote(sampleQuoteRequest);
      
      const highRiskRequest = {
        ...sampleQuoteRequest,
        vesselAge: 20, // Older vessel
        routeRiskZone: RouteRiskZone.HIGH, // War risk zone
        previousClaims: 5, // Many claims
        safetyRating: SafetyRating.POOR,
        complianceScore: 40, // Low compliance
      };
      
      const highRiskQuote = await insuranceService.generateQuote(highRiskRequest);
      
      expect(highRiskQuote.totalPremium).toBeGreaterThan(lowRiskQuote.totalPremium);
      expect(highRiskQuote.riskAssessment.overallRisk).not.toBe('LOW');
    });

    it('should include terms and conditions', async () => {
      const quote = await insuranceService.generateQuote(sampleQuoteRequest);

      expect(quote.termsAndConditions).toBeDefined();
      expect(quote.termsAndConditions.length).toBeGreaterThan(0);
    });

    it('should set expiry date 30 days from request', async () => {
      const quote = await insuranceService.generateQuote(sampleQuoteRequest);

      const daysDiff = Math.floor((quote.expiryDate.getTime() - quote.requestDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(30);
    });
  });

  describe('risk assessment', () => {
    it('should classify young vessel with good history as low risk', async () => {
      const lowRiskRequest = {
        ...sampleQuoteRequest,
        vesselAge: 2,
        routeRiskZone: RouteRiskZone.LOW,
        previousClaims: 0,
        safetyRating: SafetyRating.EXCELLENT,
        complianceScore: 95,
      };

      const quote = await insuranceService.generateQuote(lowRiskRequest);
      expect(quote.riskAssessment.overallRisk).toBe('LOW');
    });

    it('should classify old vessel in high-risk zone as high/critical risk', async () => {
      const highRiskRequest = {
        ...sampleQuoteRequest,
        vesselAge: 25,
        routeRiskZone: RouteRiskZone.HIGH,
        previousClaims: 8,
        safetyRating: SafetyRating.POOR,
        complianceScore: 30,
      };

      const quote = await insuranceService.generateQuote(highRiskRequest);
      expect(['HIGH', 'CRITICAL']).toContain(quote.riskAssessment.overallRisk);
    });
  });

  describe('vessel value estimation', () => {
    it('should estimate higher value for LNG carriers than bulk carriers', async () => {
      const bulkRequest = {
        ...sampleQuoteRequest,
        vesselType: VesselType.BULK_CARRIER,
        coverageType: [CoverageType.HULL_AND_MACHINERY],
      };
      const bulkQuote = await insuranceService.generateQuote(bulkRequest);

      const lngRequest = {
        ...sampleQuoteRequest,
        vesselType: VesselType.LNG_CARRIER,
        coverageType: [CoverageType.HULL_AND_MACHINERY],
      };
      const lngQuote = await insuranceService.generateQuote(lngRequest);

      const bulkHullPremium = bulkQuote.coverage[0].premium;
      const lngHullPremium = lngQuote.coverage[0].premium;

      expect(lngHullPremium).toBeGreaterThan(bulkHullPremium);
    });

    it('should apply depreciation for older vessels', async () => {
      const newVesselRequest = {
        ...sampleQuoteRequest,
        vesselAge: 1,
        coverageType: [CoverageType.HULL_AND_MACHINERY],
      };
      const newVesselQuote = await insuranceService.generateQuote(newVesselRequest);

      const oldVesselRequest = {
        ...sampleQuoteRequest,
        vesselAge: 15,
        coverageType: [CoverageType.HULL_AND_MACHINERY],
      };
      const oldVesselQuote = await insuranceService.generateQuote(oldVesselRequest);

      const newVesselLimit = newVesselQuote.coverage[0].limit;
      const oldVesselLimit = oldVesselQuote.coverage[0].limit;

      expect(oldVesselLimit).toBeLessThan(newVesselLimit);
    });
  });

  describe('acceptQuote', () => {
    it('should successfully accept a quote and return policy number', async () => {
      const result = await insuranceService.acceptQuote('MIQ-TEST-123');

      expect(result.success).toBe(true);
      expect(result.policyNumber).toBeDefined();
      expect(result.policyNumber).toContain('MIP-');
      expect(result.message).toContain('issued successfully');
    });
  });

  describe('coverage types', () => {
    it('should calculate war risk premium with higher multiplier for high-risk zones', async () => {
      const lowRiskRequest = {
        ...sampleQuoteRequest,
        routeRiskZone: RouteRiskZone.LOW,
        coverageType: [CoverageType.WAR_RISK],
      };
      const lowRiskQuote = await insuranceService.generateQuote(lowRiskRequest);

      const highRiskRequest = {
        ...sampleQuoteRequest,
        routeRiskZone: RouteRiskZone.HIGH,
        coverageType: [CoverageType.WAR_RISK],
      };
      const highRiskQuote = await insuranceService.generateQuote(highRiskRequest);

      expect(highRiskQuote.totalPremium).toBeGreaterThan(lowRiskQuote.totalPremium * 2);
    });

    it('should calculate cargo insurance based on cargo value', async () => {
      const lowValueRequest = {
        ...sampleQuoteRequest,
        cargoValue: 1000000,
        coverageType: [CoverageType.CARGO],
      };
      const lowValueQuote = await insuranceService.generateQuote(lowValueRequest);

      const highValueRequest = {
        ...sampleQuoteRequest,
        cargoValue: 10000000,
        coverageType: [CoverageType.CARGO],
      };
      const highValueQuote = await insuranceService.generateQuote(highValueRequest);

      expect(highValueQuote.totalPremium).toBeGreaterThan(lowValueQuote.totalPremium);
    });
  });
});

