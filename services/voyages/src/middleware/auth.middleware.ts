// Authentication and authorization middleware
import { Request, Response, NextFunction } from 'express';

// Extended Request type to include user information
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

// Allowed roles for OVD operations
const OVD_ALLOWED_ROLES = [
  'ENGINEER',
  'CHIEF_ENGINEER',
  'OPERATIONS_SUPERINTENDENT',
  'TECHNICAL_SUPERINTENDENT',
  'COMPLIANCE_OFFICER',
  'ADMIN'
];

/**
 * Middleware to require specific roles
 * @param allowedRoles Array of allowed role names
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Extract user from request (set by upstream auth service)
    const user = req.user || extractUserFromHeader(req);
    
    if (!user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        traceId: req.headers['x-trace-id']
      });
    }
    
    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        traceId: req.headers['x-trace-id']
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  };
};

/**
 * Middleware specifically for OVD operations
 */
export const requireOVDAccess = requireRole(OVD_ALLOWED_ROLES);

/**
 * Extract user information from headers (for development/testing)
 * In production, this would be replaced with JWT validation
 */
function extractUserFromHeader(req: Request): AuthRequest['user'] | undefined {
  // Check for user ID and role in headers (set by API gateway)
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const userRole = req.headers['x-user-role'] as string;
  const orgId = req.headers['x-organization-id'] as string;
  
  if (userId && userRole) {
    return {
      id: userId,
      email: userEmail || '',
      role: userRole,
      organizationId: orgId
    };
  }
  
  return undefined;
}

/**
 * Mock authentication middleware for development
 * TODO: Replace with proper JWT validation in production
 */
export const mockAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // For development, allow mock user from headers or use default admin
  const user = extractUserFromHeader(req) || {
    id: '00000000-0000-0000-0000-000000000001', // Valid UUID
    email: 'dev@nautilus.com',
    role: 'ADMIN',
    organizationId: '00000000-0000-0000-0000-000000000002' // Valid UUID
  };
  
  req.user = user;
  next();
};

