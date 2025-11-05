import { describe, it, expect } from 'vitest';
import { buildApp } from '../../src/app';

describe('/mfa/setup and /mfa/verify (enrollment)', () => {
  it('requires auth to setup MFA', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'POST', url: '/mfa/setup' });
    expect(res.statusCode).toBe(401);
  });

  it('returns provisioning data when authorized', async () => {
    const app = buildApp();
    const res = await app.inject({ method: 'POST', url: '/mfa/setup', headers: { Authorization: 'Bearer stub' } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('otpauthUrl');
    expect(body).toHaveProperty('qr');
  });

  it('verifies a 6-digit code to complete enrollment', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/mfa/verify',
      headers: { Authorization: 'Bearer stub' },
      payload: { code: '123456' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toMatchObject({ enrolled: true });
  });

  it('rejects invalid code format', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/mfa/verify',
      headers: { Authorization: 'Bearer stub' },
      payload: { code: 'abc' }
    });
    expect(res.statusCode).toBe(400);
  });
});
