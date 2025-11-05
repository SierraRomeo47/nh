import { Request, Response } from 'express';
import { PoolService } from '../services/pool.service';
import { createPoolAllocationSchema, CreatePoolAllocationDto } from '../models/dtos';
import { ZodError } from 'zod';

export class PoolController {
  constructor(private poolService: PoolService) {}

  async allocate(req: Request, res: Response) {
    try {
      const validatedData = createPoolAllocationSchema.parse(req.body);
      
      // Convert string to bigint if needed
      const amountGco2e = typeof validatedData.amountGco2e === 'string'
        ? BigInt(validatedData.amountGco2e)
        : validatedData.amountGco2e;

      const allocation = await this.poolService.allocate({
        ...validatedData,
        amountGco2e,
      });

      res.status(201).json({
        code: 'SUCCESS',
        message: 'Pool allocation created',
        data: allocation,
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

  async getPoolPerformance(req: Request, res: Response) {
    try {
      const { poolId, periodYear } = req.params;

      const performance = await this.poolService.calculatePoolPerformance(
        poolId,
        parseInt(periodYear)
      );

      res.status(200).json({
        code: 'SUCCESS',
        message: 'Pool performance calculated',
        data: performance,
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

