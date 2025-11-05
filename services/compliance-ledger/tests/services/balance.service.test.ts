import { describe, it, expect, beforeEach } from 'vitest';
import { FuelEUBalanceService } from '../../src/services/balance.service';
import type { PrismaClient } from '@prisma/client';
import { createMockPrisma } from '../mocks/prisma.mock';

describe('FuelEUBalanceService - Invariants', () => {
  let service: FuelEUBalanceService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new FuelEUBalanceService(mockPrisma as unknown as PrismaClient);
  });

  describe('prevent borrowing when vessel is pooled', () => {
    it('should reject borrowing if vessel has active pool allocation', async () => {
      const companyId = 'company-1';
      const vesselId = 'vessel-1';
      const periodYear = 2024;

      // Mock: vessel is pooled for this period
      mockPrisma.poolAllocation.findUnique.mockResolvedValue({
        id: 'pool-1',
        vessel_id: vesselId,
        period_year: periodYear,
        allocation_type: 'OUTFLOW',
        amount_gco2e: BigInt(-1000000),
      });

      await expect(
        service.adjustBalance({
          companyId,
          periodYear,
          vesselId,
          adjustmentGco2e: BigInt(-500000), // attempting to borrow
          operation: 'BORROW',
        })
      ).rejects.toThrow('Cannot borrow when vessel is pooled');
    });

    it('should allow banking when vessel is pooled', async () => {
      const companyId = 'company-1';
      const vesselId = 'vessel-1';
      const periodYear = 2024;

      mockPrisma.poolAllocation.findUnique.mockResolvedValue({
        id: 'pool-1',
        vessel_id: vesselId,
        period_year: periodYear,
        allocation_type: 'OUTFLOW',
      });

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(1000000),
        banked_gco2e: BigInt(0),
        borrowed_gco2e: BigInt(0),
      });

      mockPrisma.fuelEUBalance.update.mockResolvedValue({
        balance_gco2e: BigInt(2000000),
        banked_gco2e: BigInt(1000000),
      });

      const result = await service.adjustBalance({
        companyId,
        periodYear,
        vesselId,
        adjustmentGco2e: BigInt(1000000), // banking
        operation: 'BANK',
      });

      expect(result.balance_gco2e).toBeGreaterThan(0);
      expect(mockPrisma.fuelEUBalance.update).toHaveBeenCalled();
    });
  });

  describe('banking rules', () => {
    it('should allow banking positive balance to next period', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(1000000),
        banked_gco2e: BigInt(0),
        borrowed_gco2e: BigInt(0),
      });

      mockPrisma.fuelEUBalance.upsert.mockImplementation((args: any) => {
        if (args.where.period_year === 2025) {
          // next period created
          return Promise.resolve({
            company_id: companyId,
            period_year: 2025,
            balance_gco2e: BigInt(1000000),
          });
        }
        // current period updated
        return Promise.resolve({
          company_id: companyId,
          period_year: periodYear,
          balance_gco2e: BigInt(0),
          banked_gco2e: BigInt(1000000),
        });
      });

      const result = await service.bankToNextPeriod(companyId, periodYear);

      expect(result.success).toBe(true);
      expect(mockPrisma.fuelEUBalance.upsert).toHaveBeenCalled();
    });

    it('should reject banking negative balance', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(-1000000), // negative balance
        banked_gco2e: BigInt(0),
        borrowed_gco2e: BigInt(0),
      });

      await expect(service.bankToNextPeriod(companyId, periodYear)).rejects.toThrow(
        'Cannot bank negative balance'
      );
    });
  });

  describe('borrowing rules', () => {
    it('should allow borrowing up to 1 year forward', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      // First call: get next period balance (2025)
      mockPrisma.fuelEUBalance.findUnique.mockResolvedValueOnce({
        id: 'balance-2',
        company_id: companyId,
        period_year: 2025, // next year
        balance_gco2e: BigInt(1000000),
        borrowed_gco2e: BigInt(0),
      });

      // Second call: get current period balance (2024) - can be null
      mockPrisma.fuelEUBalance.findUnique.mockResolvedValueOnce(null);

      // Updates
      mockPrisma.fuelEUBalance.update.mockResolvedValueOnce({
        balance_gco2e: BigInt(500000),
        borrowed_gco2e: BigInt(500000),
      });

      mockPrisma.fuelEUBalance.create.mockResolvedValueOnce({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(500000),
        borrowed_gco2e: BigInt(500000),
        banked_gco2e: BigInt(0),
      });

      const result = await service.borrowFromNextPeriod(companyId, periodYear, BigInt(500000));

      expect(result.success).toBe(true);
      expect(result.borrowedAmount).toBe(BigInt(500000));
    });

    it('should reject borrowing beyond 1 year forward', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(-1000000),
      });

      await expect(
        service.borrowFromNextPeriod(companyId, periodYear, BigInt(500000), 2026) // 2 years ahead
      ).rejects.toThrow('Can only borrow from next period');
    });
  });

  describe('balance calculation invariant', () => {
    it('should ensure balance = banked - borrowed', async () => {
      const companyId = 'company-1';
      const periodYear = 2024;

      mockPrisma.fuelEUBalance.findUnique.mockResolvedValue({
        id: 'balance-1',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(500000),
        banked_gco2e: BigInt(1000000),
        borrowed_gco2e: BigInt(500000),
      });

      const balance = await service.getBalance(companyId, periodYear);
      
      // balance should equal banked - borrowed
      expect(balance.balance_gco2e).toBe(
        BigInt(Number(balance.banked_gco2e) - Number(balance.borrowed_gco2e))
      );
    });
  });
});

