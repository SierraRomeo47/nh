import { FastifyRequest, FastifyReply } from 'fastify';

export function requireRoles(roles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user;
    if (!user) {
      return reply.code(401).send({ code: 'UNAUTHORIZED', message: 'Missing token', traceId: (req as any).id });
    }
    const has = Array.isArray(user.roles) && roles.some((r) => user.roles.includes(r));
    if (!has) {
      return reply.code(403).send({ code: 'FORBIDDEN', message: 'Insufficient role', traceId: (req as any).id });
    }
  };
}
