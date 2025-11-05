import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userPermissions?: string[];
  organizationId?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Development mock bypass
  if (token === 'mock-token') {
    req.userId = '20000000-0000-0000-0000-000000000001';
    req.userRole = 'ADMIN';
    req.userPermissions = [];
    req.organizationId = '00000000-0000-0000-0000-000000000001';
    return next();
  }

  if (!token) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Access token required', traceId: req.headers['x-trace-id'] });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userPermissions = decoded.permissions;
    // TODO: Fetch organizationId from user table
    req.organizationId = '00000000-0000-0000-0000-000000000001'; // Default org for now
    next();
  } catch (error) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Invalid or expired token', traceId: req.headers['x-trace-id'] });
  }
};

