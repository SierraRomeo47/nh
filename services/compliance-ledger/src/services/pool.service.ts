import type { PrismaClient } from '@prisma/client';
import type { PoolAllocation } from '../models/entities';

export class PoolService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Allocate vessel to pool for a period
   * Guardrails: one pool per ship per period
   */
  async allocate(data: {
    companyId: string;
    vesselId: string;
    periodYear: number;
    poolId: string;
    amountGco2e: bigint;
    allocationType: 'OUTFLOW' | 'INFLOW';
  }): Promise<PoolAllocation> {
    // Check if vessel already has pool allocation for this period
    const existing = await this.prisma.poolAllocation.findUnique({
      where: {
        vessel_id_period_year: {
          vessel_id: data.vesselId,
          period_year: data.periodYear,
        },
      },
    });

    if (existing) {
      throw new Error('Vessel already has pool allocation for this period');
    }

    // For OUTFLOW, validate sufficient balance
    if (data.allocationType === 'OUTFLOW') {
      const balance = await this.prisma.fuelEUBalance.findUnique({
        where: {
          company_id_period_year: {
            company_id: data.companyId,
            period_year: data.periodYear,
          },
        },
      });

      if (!balance || balance.balance_gco2e < -data.amountGco2e) {
        throw new Error('Insufficient balance for OUTFLOW');
      }
    }

    // Create pool allocation
    const allocation = await this.prisma.poolAllocation.create({
      data: {
        company_id: data.companyId,
        vessel_id: data.vesselId,
        period_year: data.periodYear,
        pool_id: data.poolId,
        allocation_type: data.allocationType,
        amount_gco2e: data.amountGco2e,
        effective_from: new Date(),
      },
    });

    return allocation;
  }

  /**
   * Get pool allocation for vessel and period
   */
  async getAllocation(vesselId: string, periodYear: number): Promise<PoolAllocation | null> {
    return this.prisma.poolAllocation.findUnique({
      where: {
        vessel_id_period_year: {
          vessel_id: vesselId,
          period_year: periodYear,
        },
      },
    });
  }

  /**
   * Get all allocations for a pool
   */
  async getPoolAllocations(poolId: string, periodYear: number) {
    return this.prisma.poolAllocation.findMany({
      where: {
        pool_id: poolId,
        period_year: periodYear,
      },
      include: {
        vessel: true,
      },
    });
  }

  /**
   * Calculate net pool benefit
   */
  async calculatePoolPerformance(poolId: string, periodYear: number): Promise<{
    totalInflowGco2e: bigint;
    totalOutflowGco2e: bigint;
    netBenefitGco2e: bigint;
    vesselsParticipating: number;
  }> {
    const allocations = await this.prisma.poolAllocation.findMany({
      where: {
        pool_id: poolId,
        period_year: periodYear,
      },
    });

    const totalInflow = allocations
      .filter((a) => a.allocation_type === 'INFLOW')
      .reduce((sum, a) => sum + a.amount_gco2e, BigInt(0));

    const totalOutflow = allocations
      .filter((a) => a.allocation_type === 'OUTFLOW')
      .reduce((sum, a) => sum + a.amount_gco2e, BigInt(0));

    const vesselsParticipating = new Set(allocations.map((a) => a.vessel_id)).size;

    return {
      totalInflowGco2e: totalInflow,
      totalOutflowGco2e: totalOutflow,
      netBenefitGco2e: totalInflow + totalOutflow, // OUTFLOW is negative
      vesselsParticipating,
    };
  }
}

