import { FastifyInstance } from 'fastify';
import { registerRequestSchema, loginRequestSchema, refreshRequestSchema, mfaSetupVerifySchema } from '../schemas/auth.schemas';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const parsed = registerRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ code: 'BAD_REQUEST', message: parsed.error.errors[0]?.message ?? 'Invalid request', traceId: request.id });
    }
    return reply.code(201).send({ ok: true });
  });

  app.post('/login', async (request, reply) => {
    const parsed = loginRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ code: 'BAD_REQUEST', message: parsed.error.errors[0]?.message ?? 'Invalid request', traceId: request.id });
    }
    return reply.code(200).send({ accessToken: 'stub', refreshToken: 'stub' });
  });

  app.post('/tokens/refresh', async (request, reply) => {
    const parsed = refreshRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ code: 'BAD_REQUEST', message: parsed.error.errors[0]?.message ?? 'Invalid request', traceId: request.id });
    }
    return reply.code(200).send({ accessToken: 'stub', refreshToken: 'stub' });
  });

  app.get('/me', async (request, reply) => {
    const auth = request.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Missing or invalid token', traceId: request.id });
    }
    // Minimal stub profile
    return reply.code(200).send({ id: 'user-1', email: 'user@example.com', roles: ['USER'], mfaEnabled: false });
  });

  // MFA setup requires auth
  app.post('/mfa/setup', async (request, reply) => {
    const auth = request.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Missing or invalid token', traceId: request.id });
    }
    return reply.code(200).send({ otpauthUrl: 'otpauth://totp/Example:user@example.com', qr: 'data:image/png;base64,stub' });
  });

  // MFA verify for enrollment
  app.post('/mfa/verify', async (request, reply) => {
    const auth = request.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Missing or invalid token', traceId: request.id });
    }
    const parsed = mfaSetupVerifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ code: 'BAD_REQUEST', message: parsed.error.errors[0]?.message ?? 'Invalid request', traceId: request.id });
    }
    return reply.code(200).send({ enrolled: true });
  });
}

