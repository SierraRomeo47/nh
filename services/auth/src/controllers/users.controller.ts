import { Request, Response } from 'express';
import usersService from '../services/users.service';
import { AuthRequest } from '../middleware/jwt.middleware';

export class UsersController {
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const userRole = req.userRole || '';
      const organizationId = req.organizationId || '00000000-0000-0000-0000-000000000001';
      
      const users = await usersService.getAllUsers(userRole, organizationId);
      
      res.json({
        code: 'SUCCESS',
        message: 'Users retrieved successfully',
        data: users,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve users',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getUserStats(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.organizationId || '00000000-0000-0000-0000-000000000001';
      const stats = await usersService.getUserStats(organizationId);
      
      res.json({
        code: 'SUCCESS',
        message: 'User statistics retrieved successfully',
        data: stats,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve user statistics',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await usersService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          code: 'NOT_FOUND',
          message: 'User not found',
          traceId: req.headers['x-trace-id']
        });
      }
      
      res.json({
        code: 'SUCCESS',
        message: 'User retrieved successfully',
        data: user,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to retrieve user',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await usersService.createUser(userData);
      
      res.status(201).json({
        code: 'SUCCESS',
        message: 'User created successfully',
        data: user,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create user',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const user = await usersService.updateUser(id, userData);
      
      res.json({
        code: 'SUCCESS',
        message: 'User updated successfully',
        data: user,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update user',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await usersService.deleteUser(id);
      
      res.json({
        code: 'SUCCESS',
        message: 'User deleted successfully',
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      if (error.message?.includes('LAST_ADMIN_PROTECTION')) {
        return res.status(403).json({
          code: 'FORBIDDEN',
          message: error.message,
          traceId: req.headers['x-trace-id']
        });
      }
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to delete user',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async exportUsers(req: AuthRequest, res: Response) {
    try {
      const organizationId = req.organizationId || '00000000-0000-0000-0000-000000000001';
      const users = await usersService.exportUsers(organizationId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.json"`);
      
      res.json({
        code: 'SUCCESS',
        message: 'Users exported successfully',
        data: users,
        exportDate: new Date().toISOString(),
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to export users',
        traceId: req.headers['x-trace-id']
      });
    }
  }
  
  async updateUserPermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      
      await usersService.updateUserPermissions(id, permissions);
      
      res.json({
        code: 'SUCCESS',
        message: 'User permissions updated successfully',
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to update permissions',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

export default new UsersController();


