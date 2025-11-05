import { describe, it, expect } from 'vitest';
import { InMemoryAuditRepo } from '../../src/repositories/audit.repo';

describe('Audit repository', () => {
  it('records audit events', async () => {
    const repo = new InMemoryAuditRepo();
    await repo.record({ type: 'USER_REGISTERED', userId: 'u1', metadata: { ok: true } });
    expect(repo.events.length).toBe(1);
    expect(repo.events[0].type).toBe('USER_REGISTERED');
  });
});
