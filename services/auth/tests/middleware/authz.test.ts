import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { requireRoles } from '../../src/middleware/authz';

describe('RBAC middleware', () => {
  it('denies without token', async () => {
    const app = Fastify();
    app.get('/admin', { preHandler: requireRoles(['ADMIN']) }, async () => ({ ok: true }));
    const res = await app.inject({ method: 'GET', url: '/admin' });
    expect(res.statusCode).toBe(401);
  });

  it('denies without required role', async () => {
    const app = Fastify();
    app.addHook('preHandler', async (req) => {
      (req as any).user = { id: 'u1', roles: ['USER'] };
    });
    app.get('/admin', { preHandler: requireRoles(['ADMIN']) }, async () => ({ ok: true }));
    const res = await app.inject({ method: 'GET', url: '/admin', headers: { Authorization: 'Bearer stub' } });
    expect(res.statusCode).toBe(403);
  });

  it('allows with required role', async () => {
    const app = Fastify();
    app.addHook('preHandler', async (req) => {
      (req as any).user = { id: 'u1', roles: ['ADMIN'] };
    });
    app.get('/admin', { preHandler: requireRoles(['ADMIN']) }, async () => ({ ok: true }));
    const res = await app.inject({ method: 'GET', url: '/admin', headers: { Authorization: 'Bearer stub' } });
    expect(res.statusCode).toBe(200);
  });
});
