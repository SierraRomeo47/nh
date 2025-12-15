// Audit logging utility for OVD operations
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export type AuditActionType = 
  | 'IMPORT_FILE'
  | 'EXPORT_FILE'
  | 'DELETE_FILE'
  | 'CREATE_SYNC_CONFIG'
  | 'UPDATE_SYNC_CONFIG'
  | 'DELETE_SYNC_CONFIG'
  | 'TRIGGER_MANUAL_SYNC'
  | 'APPROVE_DATA'
  | 'REJECT_DATA'
  | 'UPDATE_FUEL_RECORD'
  | 'DELETE_FUEL_RECORD';

export type AuditEntityType = 
  | 'FILE'
  | 'SYNC_CONFIG'
  | 'FUEL_RECORD'
  | 'SYNC_OPERATION';

export type AuditResult = 'SUCCESS' | 'FAILED' | 'PARTIAL';

export interface AuditLogEntry {
  userId: string;
  userEmail?: string;
  userRole?: string;
  actionType: AuditActionType;
  entityType?: AuditEntityType;
  entityId?: string;
  changes?: any; // Before/after values
  metadata?: any; // Additional context
  ipAddress?: string;
  userAgent?: string;
  result: AuditResult;
  errorMessage?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const query = `
      INSERT INTO ovd_audit_log (
        user_id, user_email, user_role, action_type,
        entity_type, entity_id, changes, metadata,
        ip_address, user_agent, result, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    
    const values = [
      entry.userId,
      entry.userEmail,
      entry.userRole,
      entry.actionType,
      entry.entityType,
      entry.entityId,
      entry.changes ? JSON.stringify(entry.changes) : null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.ipAddress,
      entry.userAgent,
      entry.result,
      entry.errorMessage
    ];
    
    await pool.query(query, values);
  } catch (error) {
    // Log to console but don't throw - audit logging should not break application flow
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Create audit log entry from Express request
 */
export function createAuditEntry(
  req: AuthRequest,
  actionType: AuditActionType,
  result: AuditResult,
  options?: {
    entityType?: AuditEntityType;
    entityId?: string;
    changes?: any;
    metadata?: any;
    errorMessage?: string;
  }
): AuditLogEntry {
  return {
    userId: req.user?.id || 'unknown',
    userEmail: req.user?.email,
    userRole: req.user?.role,
    actionType,
    entityType: options?.entityType,
    entityId: options?.entityId,
    changes: options?.changes,
    metadata: options?.metadata,
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
    userAgent: req.headers['user-agent'],
    result,
    errorMessage: options?.errorMessage
  };
}

/**
 * Get audit log history for a specific entity
 */
export async function getAuditHistory(
  entityType: AuditEntityType,
  entityId: string,
  limit: number = 50
): Promise<any[]> {
  const query = `
    SELECT 
      id, user_id, user_email, user_role, action_type,
      changes, metadata, ip_address, result, error_message,
      created_at
    FROM ovd_audit_log
    WHERE entity_type = $1 AND entity_id = $2
    ORDER BY created_at DESC
    LIMIT $3
  `;
  
  const result = await pool.query(query, [entityType, entityId, limit]);
  return result.rows;
}

/**
 * Get audit log for a specific user
 */
export async function getUserAuditHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const query = `
    SELECT 
      id, action_type, entity_type, entity_id,
      changes, metadata, result, error_message, created_at
    FROM ovd_audit_log
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}

/**
 * Get recent audit logs (for monitoring)
 */
export async function getRecentAuditLogs(
  limit: number = 100,
  filters?: {
    actionType?: AuditActionType;
    result?: AuditResult;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<any[]> {
  let whereClause = 'WHERE 1=1';
  const values: any[] = [];
  let paramCount = 1;
  
  if (filters?.actionType) {
    whereClause += ` AND action_type = $${paramCount}`;
    values.push(filters.actionType);
    paramCount++;
  }
  
  if (filters?.result) {
    whereClause += ` AND result = $${paramCount}`;
    values.push(filters.result);
    paramCount++;
  }
  
  if (filters?.startDate) {
    whereClause += ` AND created_at >= $${paramCount}`;
    values.push(filters.startDate);
    paramCount++;
  }
  
  if (filters?.endDate) {
    whereClause += ` AND created_at <= $${paramCount}`;
    values.push(filters.endDate);
    paramCount++;
  }
  
  const query = `
    SELECT 
      id, user_id, user_email, user_role, action_type,
      entity_type, entity_id, result, error_message, created_at
    FROM ovd_audit_log
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramCount}
  `;
  
  values.push(limit);
  
  const result = await pool.query(query, values);
  return result.rows;
}

