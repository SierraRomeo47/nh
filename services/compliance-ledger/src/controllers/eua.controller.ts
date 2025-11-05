import { Request, Response } from 'express';
import { EUAService } from '../services/eua.service';
import { createEUAOperationSchema, CreateEUAOperationDto } from '../models/dtos';
import { ZodError } from 'zod';

export class EUAController {
  constructor(private euaService: EUAService) {}

  async forecast(req: Request, res: Response) {
    try {
      const validatedData = createEUAOperationSchema.parse(req.body);
      const operation = await this.euaService.forecast(validatedData);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'EUA forecast created',
        data: operation,
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

  async surrender(req: Request, res: Response) {
    try {
      const validatedData = SurrenderEUADto.parse(req.body);
      const operation = await this.euaService.surrender(validatedData);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'EUAs surrendered',
        data: operation,
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

  async reconcile(req: Request, res: Response) {
    try {
      const validatedData = ReconcileEUADto.parse(req.body);
      const operation = await this.euaService.reconcile(validatedData);

      res.status(201).json({
        code: 'SUCCESS',
        message: 'EUAs reconciled',
        data: operation,
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

  async getForecastAccuracy(req: Request, res: Response) {
    try {
      const { companyId, periodYear } = req.params;

      const accuracy = await this.euaService.calculateForecastAccuracy(
        companyId,
        parseInt(periodYear)
      );

      res.status(200).json({
        code: 'SUCCESS',
        message: 'Forecast accuracy calculated',
        data: { accuracy },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({
        code: 'ERROR',
        message,
      });
    }
  }
}

