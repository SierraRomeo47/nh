import { Request, Response } from 'express';
import vesselsService from '../services/vessels.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class VesselsController {
  async getAllVessels(req: AuthRequest, res: Response) {
    try {
      // Default to ADMIN role for public access (shows all vessels)
      const userRole = req.userRole || 'ADMIN';
      const userId = req.userId || '';
      const organizationId = (req as any).organizationId || '00000000-0000-0000-0000-000000000001';
      
      const vessels = await vesselsService.getAllVessels(userRole, userId, organizationId);
      
      res.json({
        code: 'SUCCESS',
        message: 'Vessels retrieved successfully',
        data: vessels,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve vessels',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getVesselById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vessel = await vesselsService.getVesselById(id);
      
      if (!vessel) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'Vessel not found',
          traceId: req.headers['x-trace-id']
        });
      }
      
      res.json({
        code: 'SUCCESS',
        message: 'Vessel retrieved successfully',
        data: vessel,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve vessel',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getFleetOverview(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.organizationId || '00000000-0000-0000-0000-000000000001';
      const userRole = req.userRole || 'ADMIN';
      const overview = await vesselsService.getFleetOverview(organizationId, userRole);
      
      res.json({
        code: 'SUCCESS',
        message: 'Fleet overview retrieved successfully',
        data: overview,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve fleet overview',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

export default new VesselsController();

