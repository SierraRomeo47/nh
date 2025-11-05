import type { PrismaClient } from '@prisma/client';
import type { EUAOperation } from '../models/entities';

export class EUAService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Forecast EUA requirements
   */
  async forecast(data: {
    companyId: string;
    periodYear: number;
    euasCount: number;
  }): Promise<EUAOperation> {
    const operation = await this.prisma.euaOperation.create({
      data: {
        company_id: data.companyId,
        operation_type: 'FORECAST',
        euas_count: data.euasCount,
        executed_at: new Date(),
        reference_voyage_ids: [],
      },
    });

    return operation;
  }

  /**
   * Surrender EUAs for emissions
   */
  async surrender(data: {
    companyId: string;
    voyageIds: string[];
    euasCount: number;
  }): Promise<EUAOperation> {
    // Check emissions exist
    const emissions = await this.prisma.emissionRecord.findMany({
      where: {
        voyage_id: { in: data.voyageIds },
      },
    });

    if (emissions.length === 0) {
      throw new Error('No emissions found for surrender');
    }

    // Validate surrendered amount matches emissions
    const totalCo2 = emissions.reduce(
      (sum, e) => sum + Number(e.co2_tonnes),
      0
    );

    // Allow some tolerance (e.g., 1%)
    if (Math.abs(data.euasCount - totalCo2) > totalCo2 * 0.01) {
      throw new Error('Surrendered EUAs do not match emissions');
    }

    const operation = await this.prisma.euaOperation.create({
      data: {
        company_id: data.companyId,
        operation_type: 'SURRENDER',
        euas_count: data.euasCount,
        executed_at: new Date(),
        reference_voyage_ids: data.voyageIds,
      },
    });

    return operation;
  }

  /**
   * Reconcile surrendered EUAs
   */
  async reconcile(data: {
    companyId: string;
    periodYear: number;
    euasCount: number;
  }): Promise<EUAOperation> {
    // Get total surrendered EUAs for this period
    const surrendered = await this.prisma.euaOperation.aggregate({
      where: {
        company_id: data.companyId,
        operation_type: 'SURRENDER',
        executed_at: {
          gte: new Date(data.periodYear, 0, 1),
          lt: new Date(data.periodYear + 1, 0, 1),
        },
      },
      _sum: {
        euas_count: true,
      },
    });

    const totalSurrendered = Math.abs(surrendered._sum.euas_count ?? 0);

    if (data.euasCount > totalSurrendered) {
      throw new Error('Reconciled amount exceeds surrendered EUAs');
    }

    const operation = await this.prisma.euaOperation.create({
      data: {
        company_id: data.companyId,
        operation_type: 'RECONCILE',
        euas_count: data.euasCount,
        executed_at: new Date(),
        reference_voyage_ids: [],
      },
    });

    return operation;
  }

  /**
   * Calculate forecast accuracy
   */
  async calculateForecastAccuracy(
    companyId: string,
    periodYear: number
  ): Promise<number | null> {
    // Get forecast and actual surrender operations
    const operations = await this.prisma.euaOperation.findMany({
      where: {
        company_id: companyId,
        executed_at: {
          gte: new Date(periodYear, 0, 1),
          lt: new Date(periodYear + 1, 0, 1),
        },
      },
    });

    const forecast = operations.find((o) => o.operation_type === 'FORECAST');
    const surrendered = operations.filter((o) => o.operation_type === 'SURRENDER');

    if (!forecast || surrendered.length === 0) {
      return null;
    }

    const totalSurrendered = surrendered.reduce((sum, o) => sum + o.euas_count, 0);

    // Accuracy = 1 - |actual - forecast| / forecast
    const error = Math.abs(totalSurrendered - forecast.euas_count);
    const accuracy = 1 - error / forecast.euas_count;

    return Math.max(0, Math.min(1, accuracy));
  }

  /**
   * Hedge EUA position
   */
  async hedge(data: {
    companyId: string;
    euasCount: number;
    pricePerEua: number;
  }): Promise<EUAOperation> {
    const operation = await this.prisma.euaOperation.create({
      data: {
        company_id: data.companyId,
        operation_type: 'HEDGE',
        euas_count: data.euasCount,
        price_per_eua: data.pricePerEua,
        executed_at: new Date(),
        reference_voyage_ids: [],
      },
    });

    return operation;
  }
}

