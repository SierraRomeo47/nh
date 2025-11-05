import { describe, it, expect, beforeEach } from 'vitest';
import { EUAService } from '../../src/services/eua.service';
import type { PrismaClient } from '@prisma/client';
import { createMockPrisma } from '../mocks/prisma.mock';

describe('EUAService - Invariants', () => {
  let service: EUAService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new EUAService(mockPrisma as unknown as PrismaClient);
  });

  describe('surrender only after positive emissions', () => {
    it('should allow surrender when emissions exist', async () => {
      const companyId = 'company-1';
      const voyageIds = ['voyage-1', 'voyage-2'];

      // Mock: emissions exist for these voyages
      mockPrisma.emissionRecord.findMany.mockResolvedValue([
        {
          id: 'emission-1',
          voyage_id: 'voyage-1',
          co2_tonnes: 100,
          period_year: 2024,
        },
        {
          id: 'emission-2',
          voyage_id: 'voyage-2',
          co2_tonnes: 150,
          period_year: 2024,
        },
      ]);

      mockPrisma.euaOperation.create.mockResolvedValue({
        id: 'eua-1',
        operation_type: 'SURRENDER',
        euas_count: 250, // matching total CO2
      });

      const result = await service.surrender({
        companyId,
        voyageIds,
        euasCount: 250,
      });

      expect(result.operation_type).toBe('SURRENDER');
      expect(mockPrisma.euaOperation.create).toHaveBeenCalled();
    });

    it('should reject surrender when emissions are zero or missing', async () => {
      const companyId = 'company-1';
      const voyageIds = ['voyage-1'];

      // Mock: no emissions found
      mockPrisma.emissionRecord.findMany.mockResolvedValue([]);

      await expect(
        service.surrender({
          companyId,
          voyageIds,
          euasCount: 100,
        })
      ).rejects.toThrow('No emissions found for surrender');
    });
  });

  describe('reconcile against surrendered EUAs', () => {
    it('should allow reconcile when surrendered EUAs exist', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      // Mock: surrendered EUAs exist
      mockPrisma.euaOperation.aggregate.mockResolvedValue({
        _sum: { euas_count: -100 }, // Negative for surrender
      });

      mockPrisma.euaOperation.create.mockResolvedValue({
        id: 'reconcile-1',
        operation_type: 'RECONCILE',
        euas_count: 100,
      });

      const result = await service.reconcile({
        companyId,
        periodYear,
        euasCount: 100,
      });

      expect(result.operation_type).toBe('RECONCILE');
    });

    it('should reject reconcile when surrendered amount is mismatched', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      // Mock: only 50 EUAs were surrendered
      mockPrisma.euaOperation.aggregate.mockResolvedValue({
        _sum: { euas_count: -50 },
      });

      await expect(
        service.reconcile({
          companyId,
          periodYear,
          euasCount: 100, // trying to reconcile more than surrendered
        })
      ).rejects.toThrow('Reconciled amount exceeds surrendered EUAs');
    });
  });

  describe('forecast accuracy calculation', () => {
    it('should calculate forecast accuracy correctly', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      // Mock: forecast was 100, actual surrender was 95
      mockPrisma.euaOperation.findMany.mockResolvedValue([
        {
          id: 'forecast-1',
          operation_type: 'FORECAST',
          euas_count: 100,
          executed_at: new Date('2024-01-01'),
        },
        {
          id: 'surrender-1',
          operation_type: 'SURRENDER',
          euas_count: 95,
          executed_at: new Date('2024-12-31'),
        },
      ]);

      const accuracy = await service.calculateForecastAccuracy(companyId, periodYear);

      // Accuracy = 1 - |actual - forecast| / forecast
      // = 1 - |95 - 100| / 100 = 1 - 0.05 = 0.95
      expect(accuracy).toBeCloseTo(0.95, 2);
    });

    it('should return null when no forecast exists', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      mockPrisma.euaOperation.findMany.mockResolvedValue([]);

      const accuracy = await service.calculateForecastAccuracy(companyId, periodYear);

      expect(accuracy).toBeNull();
    });
  });
});

