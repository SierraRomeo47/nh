import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { AuthRequest } from '../middleware/jwt.middleware';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          code: 'BAD_REQUEST',
          message: 'Email and password are required',
          traceId: req.headers['x-trace-id']
        });
      }

      const result = await authService.login(email, password);

      res.json({
        code: 'SUCCESS',
        message: 'Login successful',
        data: result,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: error.message || 'Invalid credentials',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          code: 'BAD_REQUEST',
          message: 'Refresh token is required',
          traceId: req.headers['x-trace-id']
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.json({
        code: 'SUCCESS',
        message: 'Token refreshed',
        data: result,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(401).json({
        code: 'UNAUTHORIZED',
        message: error.message || 'Invalid refresh token',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.json({
        code: 'SUCCESS',
        message: 'Logout successful',
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Logout failed',
        traceId: req.headers['x-trace-id']
      });
    }
  }

  async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          traceId: req.headers['x-trace-id']
        });
      }

      const user = await authService.getUserProfile(userId);

      res.json({
        code: 'SUCCESS',
        message: 'User profile retrieved',
        data: user,
        traceId: req.headers['x-trace-id']
      });
    } catch (error: any) {
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to get user profile',
        traceId: req.headers['x-trace-id']
      });
    }
  }
}

export default new AuthController();


