import { Request, Response } from 'express';
import userAssignmentsService from '../services/user-assignments.service';
import { AuthRequest } from '../middleware/jwt.middleware';

export class UserAssignmentsController {
  async assignVessels(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { vessel_ids } = req.body;
      
      await userAssignmentsService.assignVessels(userId, vessel_ids);
      
      res.json({
        code: 'SUCCESS',
        message: 'Vessels assigned successfully',
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to assign vessels',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async assignFleets(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { fleet_ids } = req.body;
      
      await userAssignmentsService.assignFleets(userId, fleet_ids);
      
      res.json({
        code: 'SUCCESS',
        message: 'Fleets assigned successfully',
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to assign fleets',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getUserAssignments(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const assignments = await userAssignmentsService.getUserAssignments(userId);
      
      res.json({
        code: 'SUCCESS',
        message: 'User assignments retrieved successfully',
        data: assignments,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve user assignments',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

export default new UserAssignmentsController();


