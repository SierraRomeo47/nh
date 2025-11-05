import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('/me handler', () => {
  it('returns 401 without Authorization header', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/me' });
    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('traceId');
  });

  it('returns 200 with minimal profile when authorized', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'GET', url: '/me', headers: { Authorization: 'Bearer stub' } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('roles');
    expect(Array.isArray(body.roles)).toBe(true);
  });
});
