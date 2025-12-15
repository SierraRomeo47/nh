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
  // Try cookie first (K8s/production ready), then header (backward compatibility)
  let token = (req as any).cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  }

  // Development mock bypass for demo
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
    req.organizationId = decoded.organizationId || '00000000-0000-0000-0000-000000000001';
    next();
  } catch (error) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Invalid or expired token', traceId: req.headers['x-trace-id'] });
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userPermissions) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'No permissions defined', traceId: req.headers['x-trace-id'] });
    }

    if (!req.userPermissions.includes(permission)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: `Permission required: ${permission}`, traceId: req.headers['x-trace-id'] });
    }

    next();
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'No role defined', traceId: req.headers['x-trace-id'] });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: `Role required: ${roles.join(' or ')}`, traceId: req.headers['x-trace-id'] });
    }

    next();
  };
};

// Fastify-compatible RBAC helper for tests in this service
export function requireRoles(roles: string[]) {
  return async (req: any, reply: any) => {
    const user = (req as any).user;
    if (!user) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Missing token', traceId: req.id });
    }
    const has = Array.isArray(user.roles) && roles.some((r) => user.roles.includes(r));
    if (!has) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'Insufficient role', traceId: req.id });
    }
  };
}

