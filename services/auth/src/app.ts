import Fastify from 'fastify';
import { authRoutes } from './routes/auth.routes';

export function buildApp() {
  const app = Fastify({ logger: false });
  app.register(authRoutes);
  return app;
}


