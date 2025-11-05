import { Request, Response } from 'express';
import { EmissionService } from '../services/emission.service';
import { createEmissionRecordSchema, CreateEmissionRecordDto } from '../models/dtos';
import { ZodError } from 'zod';

export class EmissionsController {
  constructor(private emissionService: EmissionService) {}

  async recordEmission(req: Request, res: Response) {
    try {
      const validatedData = createEmissionRecordSchema.parse(req.body);
      const emission = await this.emissionService.recordEmission(validatedData);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'Emission recorded',
        data: emission,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          errors: error.errors,
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        code: 'ERROR',
        message,
      });
    }
  }

  async updateEmission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { co2Tonnes, energyGj } = req.body;

      const emission = await this.emissionService.updateEmission(id, {
        co2Tonnes,
        energyGj,
      });

      res.status(200).json({
        code: 'SUCCESS',
        message: 'Emission updated',
        data: emission,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('not found') ? 404 : 400;

      res.status(status).json({
        code: 'ERROR',
        message,
      });
    }
  }
}

