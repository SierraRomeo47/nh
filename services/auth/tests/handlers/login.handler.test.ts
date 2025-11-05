import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('/login handler', () => {
  it('returns 200 with tokens for valid payload (no MFA)', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'user@example.com', password: 'AnyPassword123!' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('returns 400 for invalid payload', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'POST', url: '/login', payload: { email: 'x', password: '' } });
    expect(res.statusCode).toBe(400);
  });
});
