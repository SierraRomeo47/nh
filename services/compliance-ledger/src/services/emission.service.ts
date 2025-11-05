import type { PrismaClient } from '@prisma/client';
import { RecordEmissionDto, VerificationDto } from '../models/dtos';

export class EmissionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Record verified emissions per voyage from MRV import
   */
  async recordEmission(data: {
    voyageId: string;
    periodYear: number;
    co2Tonnes: number;
    n2oTonnes?: number;
    ch4Tonnes?: number;
    energyGj: number;
    source: 'MRV_SYSTEM' | 'MANUAL';
  }) {
    // Validate input
    if (data.co2Tonnes <= 0) {
      throw new Error('CO2 emissions must be positive');
    }

    if (data.energyGj <= 0) {
      throw new Error('Energy must be positive');
    }

    this.validatePeriodYear(data.periodYear);

    // Check voyage exists
    const voyage = await this.prisma.voyage.findUnique({
      where: { id: data.voyageId },
    });

    if (!voyage) {
      throw new Error('Voyage not found');
    }

    // Create emission record
    const emission = await this.prisma.emissionRecord.create({
      data: {
        voyage_id: data.voyageId,
        period_year: data.periodYear,
        co2_tonnes: data.co2Tonnes,
        n2o_tonnes: data.n2oTonnes ?? 0,
        ch4_tonnes: data.ch4Tonnes ?? 0,
        energy_gj: data.energyGj,
        import_source: data.source,
      },
    });

    return emission;
  }

  /**
   * Validate period year is in reasonable range
   */
  validatePeriodYear(year: number): boolean {
    if (year < 2000 || year > 2100) {
      throw new Error('Invalid period year');
    }
    return true;
  }

  /**
   * Update emission record only if not verified
   */
  async updateEmission(
    emissionId: string,
    data: { co2Tonnes?: number; energyGj?: number }
  ) {
    // Check if emission is verified
    const emission = await this.prisma.emissionRecord.findUnique({
      where: { id: emissionId },
      include: { verification_records: true },
    });

    if (!emission) {
      throw new Error('Emission record not found');
    }

    const hasVerification = emission.verification_records.some(
      (v) => v.verification_status === 'VERIFIED'
    );

    if (hasVerification) {
      throw new Error('Cannot update verified emission');
    }

    // Update emission
    const updated = await this.prisma.emissionRecord.update({
      where: { id: emissionId },
      data: {
        ...(data.co2Tonnes && { co2_tonnes: data.co2Tonnes }),
        ...(data.energyGj && { energy_gj: data.energyGj }),
      },
    });

    return updated;
  }

  /**
   * Add verification record
   */
  async addVerification(data: {
    emissionRecordId: string;
    verifierId: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CONDITIONAL';
    certificateNumber?: string;
    findings?: string;
  }) {
    const verification = await this.prisma.verificationRecord.create({
      data: {
        emission_record_id: data.emissionRecordId,
        verifier_id: data.verifierId,
        verification_status: data.status,
        certificate_number: data.certificateNumber,
        findings: data.findings,
        verified_at: new Date(),
      },
    });

    return verification;
  }

  /**
   * Get emissions for voyages
   */
  async getEmissionsForVoyages(voyageIds: string[]) {
    return this.prisma.emissionRecord.findMany({
      where: {
        voyage_id: { in: voyageIds },
      },
    });
  }
}

