import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('/register handler', () => {
  it('returns 201 for valid payload', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'user@example.com', password: 'GoodPassword!123' }
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body).toMatchObject({ ok: true });
  });

  it('returns 400 for invalid payload', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email: 'not-an-email', password: 'x' }
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body).toHaveProperty('code');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('traceId');
  });
});


