import { Request, Response } from 'express';
import { FuelEUBalanceService } from '../services/balance.service';
import { updateFuelEUBalanceSchema, UpdateFuelEUBalanceDto } from '../models/dtos';
import { ZodError } from 'zod';

export class FuelEUController {
  constructor(private balanceService: FuelEUBalanceService) {}

  async adjustBalance(req: Request, res: Response) {
    try {
      const validatedData = updateFuelEUBalanceSchema.parse(req.body);
      
      // Convert string to bigint if needed
      const adjustmentGco2e = typeof validatedData.adjustmentGco2e === 'string' 
        ? BigInt(validatedData.adjustmentGco2e)
        : validatedData.adjustmentGco2e;

      const balance = await this.balanceService.adjustBalance({
        ...validatedData,
        adjustmentGco2e,
      });

      res.status(200).json({
        code: 'SUCCESS',
        message: 'Balance adjusted',
        data: balance,
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

  async getBalance(req: Request, res: Response) {
    try {
      const validatedData = GetBalanceDto.parse(req.query);
      const balance = await this.balanceService.getBalance(
        validatedData.companyId,
        validatedData.periodYear
      );

      res.status(200).json({
        code: 'SUCCESS',
        message: 'Balance retrieved',
        data: balance,
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

  async bankToNextPeriod(req: Request, res: Response) {
    try {
      const { companyId, periodYear } = req.params;

      const result = await this.balanceService.bankToNextPeriod(companyId, parseInt(periodYear));

      res.status(200).json({
        code: 'SUCCESS',
        message: 'Balance banked to next period',
        data: result,
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

