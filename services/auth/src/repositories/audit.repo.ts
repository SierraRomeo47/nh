export type AuditType =
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCEEDED'
  | 'LOGIN_FAILED'
  | 'MFA_ENROLLED'
  | 'MFA_VERIFIED'
  | 'TOKEN_REFRESHED'
  | 'TOKEN_REVOKED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'PASSWORD_CHANGED'
  | 'LOGOUT';

export interface AuditEvent {
  id: string;
  userId?: string;
  type: AuditType;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export class InMemoryAuditRepo {
  public events: AuditEvent[] = [];

  async record(event: Omit<AuditEvent, 'id' | 'createdAt'>) {
    this.events.push({ id: `${Date.now()}-${Math.random()}`, createdAt: new Date(), ...event });
  }
}
