import type { PrismaClient } from '@prisma/client';
import type { FuelEUBalance } from '../models/entities';

export class FuelEUBalanceService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Adjust FuelEU balance with banking or borrowing rules
   */
  async adjustBalance(data: {
    companyId: string;
    periodYear: number;
    vesselId: string;
    adjustmentGco2e: bigint;
    operation: 'BANK' | 'BORROW';
  }) {
    // Check if vessel is pooled - if so, reject borrowing
    if (data.operation === 'BORROW') {
      const poolAllocation = await this.prisma.poolAllocation.findUnique({
        where: {
          vessel_id_period_year: {
            vessel_id: data.vesselId,
            period_year: data.periodYear,
          },
        },
      });

      if (poolAllocation) {
        throw new Error('Cannot borrow when vessel is pooled');
      }
    }

    // Get or create balance
    let balance = await this.prisma.fuelEUBalance.findUnique({
      where: {
        company_id_period_year: {
          company_id: data.companyId,
          period_year: data.periodYear,
        },
      },
    });

    if (!balance) {
      balance = await this.prisma.fuelEUBalance.create({
        data: {
          company_id: data.companyId,
          period_year: data.periodYear,
          balance_gco2e: BigInt(0),
          banked_gco2e: BigInt(0),
          borrowed_gco2e: BigInt(0),
        },
      });
    }

    // Apply adjustment
    const updatedBalance = await this.prisma.fuelEUBalance.update({
      where: { id: balance.id },
      data: {
        balance_gco2e: balance.balance_gco2e + data.adjustmentGco2e,
        ...(data.operation === 'BANK' && {
          banked_gco2e: balance.banked_gco2e + data.adjustmentGco2e,
        }),
        ...(data.operation === 'BORROW' && {
          borrowed_gco2e: balance.borrowed_gco2e - data.adjustmentGco2e,
        }),
      },
    });

    return updatedBalance;
  }

  /**
   * Bank positive balance to next period
   */
  async bankToNextPeriod(companyId: string, periodYear: number): Promise<{
    success: boolean;
    bankedAmount: bigint;
  }> {
    const balance = await this.prisma.fuelEUBalance.findUnique({
      where: {
        company_id_period_year: {
          company_id: companyId,
          period_year: periodYear,
        },
      },
    });

    if (!balance) {
      throw new Error('Balance not found');
    }

    if (balance.balance_gco2e <= 0) {
      throw new Error('Cannot bank negative balance');
    }

    const nextYear = periodYear + 1;

    // Update current period: set balance to 0, record banking
    await this.prisma.fuelEUBalance.update({
      where: { id: balance.id },
      data: {
        balance_gco2e: BigInt(0),
        banked_gco2e: balance.banked_gco2e,
      },
    });

    // Create or update next period balance
    await this.prisma.fuelEUBalance.upsert({
      where: {
        company_id_period_year: {
          company_id: companyId,
          period_year: nextYear,
        },
      },
      create: {
        company_id: companyId,
        period_year: nextYear,
        balance_gco2e: balance.balance_gco2e,
        banked_gco2e: BigInt(0),
        borrowed_gco2e: BigInt(0),
      },
      update: {
        balance_gco2e: {
          increment: balance.balance_gco2e,
        },
      },
    });

    return {
      success: true,
      bankedAmount: balance.balance_gco2e,
    };
  }

  /**
   * Borrow from next period (max 1 year forward)
   */
  async borrowFromNextPeriod(
    companyId: string,
    periodYear: number,
    amount: bigint,
    fromYear?: number
  ): Promise<{
    success: boolean;
    borrowedAmount: bigint;
  }> {
    const borrowYear = fromYear ?? periodYear + 1;

    // Enforce borrowing only from next period
    if (borrowYear !== periodYear + 1) {
      throw new Error('Can only borrow from next period');
    }

    // Get next period balance
    const nextBalance = await this.prisma.fuelEUBalance.findUnique({
      where: {
        company_id_period_year: {
          company_id: companyId,
          period_year: borrowYear,
        },
      },
    });

    if (!nextBalance) {
      throw new Error('Next period balance not found');
    }

    if (nextBalance.balance_gco2e < amount) {
      throw new Error('Insufficient balance in next period');
    }

    // Update next period: reduce balance
    await this.prisma.fuelEUBalance.update({
      where: { id: nextBalance.id },
      data: {
        balance_gco2e: nextBalance.balance_gco2e - amount,
        borrowed_gco2e: nextBalance.borrowed_gco2e + amount,
      },
    });

    // Update current period: add borrowed amount
    const currentBalance = await this.prisma.fuelEUBalance.findUnique({
      where: {
        company_id_period_year: {
          company_id: companyId,
          period_year: periodYear,
        },
      },
    });

    if (!currentBalance) {
      await this.prisma.fuelEUBalance.create({
        data: {
          company_id: companyId,
          period_year: periodYear,
          balance_gco2e: amount,
          borrowed_gco2e: amount,
          banked_gco2e: BigInt(0),
        },
      });
    } else {
      await this.prisma.fuelEUBalance.update({
        where: { id: currentBalance.id },
        data: {
          balance_gco2e: currentBalance.balance_gco2e + amount,
          borrowed_gco2e: currentBalance.borrowed_gco2e + amount,
        },
      });
    }

    return {
      success: true,
      borrowedAmount: amount,
    };
  }

  /**
   * Get balance for company and period
   */
  async getBalance(companyId: string, periodYear: number): Promise<FuelEUBalance> {
    const balance = await this.prisma.fuelEUBalance.findUnique({
      where: {
        company_id_period_year: {
          company_id: companyId,
          period_year: periodYear,
        },
      },
    });

    if (!balance) {
      return {
        id: '',
        company_id: companyId,
        period_year: periodYear,
        balance_gco2e: BigInt(0),
        banked_gco2e: BigInt(0),
        borrowed_gco2e: BigInt(0),
        pool_allocation_id: null,
        updated_at: new Date(),
      };
    }

    return balance;
  }
}

