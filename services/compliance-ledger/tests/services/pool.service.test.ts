import { describe, it, expect, beforeEach } from 'vitest';
import { PoolService } from '../../src/services/pool.service';
import type { PrismaClient } from '@prisma/client';
import { createMockPrisma } from '../mocks/prisma.mock';

describe('PoolService - Invariants', () => {
  let service: PoolService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new PoolService(mockPrisma as unknown as PrismaClient);
  });

  describe('one pool per vessel per period', () => {
    it('should reject duplicate pool allocation for same vessel/period', async () => {
      const companyId = 'company-1';
      const vesselId = 'vessel-1';
      const periodYear = 2024;

      // Mock: vessel already has a pool allocation
      mockPrisma.poolAllocation.findUnique.mockResolvedValue({
        id: 'existing-pool',
        vessel_id: vesselId,
        period_year: periodYear,
        pool_id: 'pool-1',
        allocation_type: 'OUTFLOW',
      });

      await expect(
        service.allocate({
          companyId,
          vesselId,
          periodYear,
          poolId: 'pool-2',
          amountGco2e: BigInt(-500000),
          allocationType: 'OUTFLOW',
        })
      ).rejects.toThrow('Vessel already has pool allocation for this period');
    });

    it('should allow pool allocation for different vessel/period', async () => {
      const companyId = 'company-1';
      const vesselId = 'vessel-1';
      const periodYear = 2024;

      // Mock: vessel has no existing allocation
      mockPrisma.poolAllocation.findUnique.mockResolvedValue(null);

      // Mock: sufficient balance for OUTFLOW
      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(1000000), // sufficient balance
      });

      mockPrisma.poolAllocation.create.mockResolvedValue({
        id: 'new-pool',
        vessel_id: vesselId,
        period_year: periodYear,
        pool_id: 'pool-1',
        allocation_type: 'OUTFLOW',
        amount_gco2e: BigInt(-500000),
      });

      const result = await service.allocate({
        companyId,
        vesselId,
        periodYear,
        poolId: 'pool-1',
        amountGco2e: BigInt(-500000),
        allocationType: 'OUTFLOW',
      });

      expect(result.id).toBeDefined();
      expect(mockPrisma.poolAllocation.create).toHaveBeenCalled();
    });
  });

  describe('outflow before surrender', () => {
    it('should allow OUTFLOW allocation when balance is positive', async () => {
      const companyId = 'company-1';
      const vesselId = 'vessel-1';
      const periodYear = 2024;

      mockPrisma.poolAllocation.findUnique.mockResolvedValue(null);

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(1000000), // positive balance
      });

      mockPrisma.poolAllocation.create.mockResolvedValue({
        id: 'pool-1',
        allocation_type: 'OUTFLOW',
        amount_gco2e: BigInt(-500000),
      });

      const result = await service.allocate({
        companyId,
        vesselId,
        periodYear,
        poolId: 'pool-1',
        amountGco2e: BigInt(-500000),
        allocationType: 'OUTFLOW',
      });

      expect(result.allocation_type).toBe('OUTFLOW');
    });

    it('should reject OUTFLOW allocation when balance is insufficient', async () => {
      const companyId = 'company-1';
      const vesselId = 'vessel-1';
      const periodYear = 2024;

      mockPrisma.poolAllocation.findUnique.mockResolvedValue(null);

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(100000), // insufficient balance
      });

      await expect(
        service.allocate({
          companyId,
          vesselId,
          periodYear,
          poolId: 'pool-1',
          amountGco2e: BigInt(-500000), // trying to outflow more than balance
          allocationType: 'OUTFLOW',
        })
      ).rejects.toThrow('Insufficient balance for OUTFLOW');
    });
  });
});

