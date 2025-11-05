import { describe, it, expect, beforeEach } from 'vitest';
import { EmissionService } from '../../src/services/emission.service';
import type { PrismaClient } from '@prisma/client';
import { createMockPrisma } from '../mocks/prisma.mock';

describe('EmissionService - Validation', () => {
  let service: EmissionService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    service = new EmissionService(mockPrisma as unknown as PrismaClient);
  });

  describe('record verified emissions', () => {
    it('should create emission record with valid data', async () => {
      const mockData = {
        voyageId: 'voyage-1',
        periodYear: 2024,
        co2Tonnes: 100.5,
        energyGj: 4200.0,
        source: 'MRV_SYSTEM' as const,
      };

      mockPrisma.voyage.findUnique.mockResolvedValue({
        id: 'voyage-1',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
      });

      mockPrisma.emissionRecord.create.mockResolvedValue({
        id: 'emission-1',
        voyage_id: 'voyage-1',
        co2_tonnes: 100.5,
        energy_gj: 4200.0,
        period_year: 2024,
        import_source: 'MRV_SYSTEM',
      });

      const result = await service.recordEmission(mockData);

      expect(result.id).toBeDefined();
      expect(result.co2_tonnes).toBe(100.5);
      expect(mockPrisma.emissionRecord.create).toHaveBeenCalled();
    });

    it('should reject negative CO2 emissions', async () => {
      const mockData = {
        voyageId: 'voyage-1',
        periodYear: 2024,
        co2Tonnes: -50, // invalid: negative
        energyGj: 4200.0,
        source: 'MRV_SYSTEM' as const,
      };

      await expect(service.recordEmission(mockData)).rejects.toThrow(
        'CO2 emissions must be positive'
      );
    });

    it('should reject negative energy values', async () => {
      const mockData = {
        voyageId: 'voyage-1',
        periodYear: 2024,
        co2Tonnes: 100,
        energyGj: -100, // invalid: negative
        source: 'MRV_SYSTEM' as const,
      };

      await expect(service.recordEmission(mockData)).rejects.toThrow(
        'Energy must be positive'
      );
    });

    it('should reject invalid period year', async () => {
      const mockData = {
        voyageId: 'voyage-1',
        periodYear: 1999, // invalid: too old
        co2Tonnes: 100,
        energyGj: 4200.0,
        source: 'MRV_SYSTEM' as const,
      };

      await expect(service.recordEmission(mockData)).rejects.toThrow('Invalid period year');
    });

    it('should reject if voyage does not exist', async () => {
      const mockData = {
        voyageId: 'nonexistent-voyage',
        periodYear: 2024,
        co2Tonnes: 100,
        energyGj: 4200.0,
        source: 'MRV_SYSTEM' as const,
      };

      mockPrisma.voyage.findUnique.mockResolvedValue(null);

      await expect(service.recordEmission(mockData)).rejects.toThrow('Voyage not found');
    });
  });

  describe('period year validation', () => {
    it('should accept current year', async () => {
      const currentYear = new Date().getFullYear();
      
      const result = service.validatePeriodYear(currentYear);
      expect(result).toBe(true);
    });

    it('should accept year in reasonable range (2000-2100)', async () => {
      expect(service.validatePeriodYear(2000)).toBe(true);
      expect(service.validatePeriodYear(2100)).toBe(true);
    });

    it('should reject years outside reasonable range', async () => {
      expect(() => service.validatePeriodYear(1999)).toThrow();
      expect(() => service.validatePeriodYear(2101)).toThrow();
    });
  });

  describe('immutability after verification', () => {
    it('should allow updating unverified emissions', async () => {
      const emissionId = 'emission-1';

      mockPrisma.emissionRecord.findUnique.mockResolvedValue({
        id: emissionId,
        co2_tonnes: 100,
        verification_records: [], // no verification
      });

      mockPrisma.emissionRecord.update.mockResolvedValue({
        id: emissionId,
        co2_tonnes: 150,
      });

      const result = await service.updateEmission(emissionId, { co2Tonnes: 150 });

      expect(result.co2_tonnes).toBe(150);
      expect(mockPrisma.emissionRecord.update).toHaveBeenCalled();
    });

    it('should reject updating verified emissions', async () => {
      const emissionId = 'emission-1';

      mockPrisma.emissionRecord.findUnique.mockResolvedValue({
        id: emissionId,
        co2_tonnes: 100,
        verification_records: [
          { id: 'verify-1', verification_status: 'VERIFIED' },
        ],
      });

      await expect(
        service.updateEmission(emissionId, { co2Tonnes: 150 })
      ).rejects.toThrow('Cannot update verified emission');
    });
  });
});

