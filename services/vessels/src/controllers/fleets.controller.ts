import { Request, Response } from 'express';
import fleetsService from '../services/fleets.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class FleetsController {
  async getAllFleets(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.organizationId || '00000000-0000-0000-0000-000000000001';
      const userRole = req.userRole || '';
      const fleets = await fleetsService.getAllFleets(organizationId, userRole);
      
      res.json({
        code: 'SUCCESS',
        message: 'Fleets retrieved successfully',
        data: fleets,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve fleets',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getFleetById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fleet = await fleetsService.getFleetById(id);
      
      if (!fleet) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Fleet not found',
          traceId: req.headers['x-trace-id']
        });
      }
      
      res.json({
        code: 'SUCCESS',
        message: 'Fleet retrieved successfully',
        data: fleet,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve fleet',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getFleetVessels(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vessels = await fleetsService.getFleetVessels(id);
      
      res.json({
        code: 'SUCCESS',
        message: 'Fleet vessels retrieved successfully',
        data: vessels,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve fleet vessels',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

export default new FleetsController();

