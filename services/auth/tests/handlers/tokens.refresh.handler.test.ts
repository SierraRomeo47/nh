import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('/tokens/refresh handler', () => {
  it('returns 200 with new tokens for valid payload', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/tokens/refresh',
      payload: { refreshToken: 'stub' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('returns 400 for invalid payload', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'POST', url: '/tokens/refresh', payload: {} });
    expect(res.statusCode).toBe(400);
  });
});
