import type { FastifyInstance } from 'fastify';
import { boletoRoutes } from './boleto';
import { aiRoutes } from './ai';
import { financeRoutes } from './finance';
import { fixedExpenseRoutes } from './fixed-expenses';
import { boletoCrudRoutes } from './boletos';
import { salaryChangeRoutes } from './salary-changes';


export async function registerRoutes(app: FastifyInstance) {
  await app.register(boletoRoutes, { prefix: '/api/boleto' });
  await app.register(aiRoutes, { prefix: '/api/ai' });
  await app.register(financeRoutes, { prefix: '/api/finance' });
  await app.register(fixedExpenseRoutes, { prefix: '/api/fixed-expenses' });
  await app.register(boletoCrudRoutes, { prefix: '/api/boletos' });
  await app.register(salaryChangeRoutes, { prefix: '/api/salary-changes' });
}
