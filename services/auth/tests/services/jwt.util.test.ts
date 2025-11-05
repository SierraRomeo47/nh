import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../../src/crypto/jwt';

describe('JWT utils', () => {
  it('signs and verifies an access token', async () => {
    const token = await signAccessToken({ sub: 'u1', roles: ['USER'], mfa: true }, { ttlSeconds: 900 });
    expect(typeof token).toBe('string');
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe('u1');
    expect(payload.roles).toContain('USER');
    expect(payload.mfa).toBe(true);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });
});
