import { describe, it, expect } from 'vitest';
import { InMemoryRateLimiter, LoginLockout } from '../../src/services/rateLimit.service';

describe('Rate limiter and lockout', () => {
  it('rate limiter allows first N then blocks', async () => {
    const rl = new InMemoryRateLimiter();
    const key = 'ip:1.2.3.4';
    const windowMs = 1000;
    const allowed: boolean[] = [];
    for (let i = 0; i < 3; i++) allowed.push(await rl.tryRemoveToken(key, 3, windowMs));
    const blocked = await rl.tryRemoveToken(key, 3, windowMs);
    expect(allowed.every(Boolean)).toBe(true);
    expect(blocked).toBe(false);
  });

  it('lockout locks after threshold failures', () => {
    const lock = new LoginLockout(2, 60_000);
    const id = 'user@example.com';
    expect(lock.getState(id).isLocked).toBe(false);
    lock.recordFailure(id);
    expect(lock.getState(id).isLocked).toBe(false);
    lock.recordFailure(id);
    expect(lock.getState(id).isLocked).toBe(true);
    lock.reset(id);
    expect(lock.getState(id).isLocked).toBe(false);
  });
});
