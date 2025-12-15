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

      // Set HTTP-only cookies for security (K8s ready, no localStorage)
      const isProduction = process.env.NODE_ENV === 'production';
      
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction, // HTTPS only in production
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/auth/api/auth' // Only sent to auth endpoints
      });

      // Return user data without tokens (tokens in cookies only)
      res.json({
        code: 'SUCCESS',
        message: 'Login successful',
        data: {
          user: result.user
          // accessToken and refreshToken NOT returned (in cookies only)
        },
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
      // Get refresh token from cookie (not body)
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          code: 'BAD_REQUEST',
          message: 'Refresh token is required',
          traceId: req.headers['x-trace-id']
        });
      }

      const result = await authService.refreshToken(refreshToken);

      // Update accessToken cookie with new token
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/'
      });

      res.json({
        code: 'SUCCESS',
        message: 'Token refreshed',
        data: { refreshed: true },
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
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear cookies
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/auth/api/auth' });

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


