import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { registerRoutes } from './routes';

export async function buildServer() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'FinanSaas API',
        version: '0.1.0',
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
  });

  await registerRoutes(app);

  app.get('/health', async () => ({ ok: true }));

  app.get('/', async () => ({
    name: 'FinanSaas API',
    version: '0.1.0',
    status: 'running',
}))

  return app;
}

async function main() {
  const app = await buildServer();
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';

  await app.listen({ port, host });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
