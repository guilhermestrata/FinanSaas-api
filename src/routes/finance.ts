import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prisma } from '../db/prisma';
import { apiError } from '../lib/errors';
import { brlNumber, isoMonth } from '../lib/validation';

const USER_ID = 'demo-user';

export async function financeRoutes(app: FastifyInstance) {
  app.get('/profile', async (_req, reply) => {
    const profile = await prisma.financeProfile.findUnique({ where: { userId: USER_ID } });
    return reply.send({ netMonthlyIncome: profile?.netMonthlyIncome ?? 0 });
  });

  app.put('/profile', async (req, reply) => {
    const schema = z.object({ netMonthlyIncome: brlNumber });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    const profile = await prisma.financeProfile.upsert({
      where: { userId: USER_ID },
      create: { userId: USER_ID, netMonthlyIncome: parsed.data.netMonthlyIncome },
      update: { netMonthlyIncome: parsed.data.netMonthlyIncome },
    });

    return reply.send({ netMonthlyIncome: profile.netMonthlyIncome });
  });

  app.post('/monthly', async (req, reply) => {
    const schema = z.object({
      startMonth: isoMonth,
      months: z.number().int().min(1).max(60),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    const months = parsed.data.months;

    const profile = await prisma.financeProfile.findUnique({ where: { userId: USER_ID } });
    const income = profile?.netMonthlyIncome ?? 0;

    const fixed = await prisma.fixedExpense.findMany({ where: { userId: USER_ID } });
    const fixedSum = fixed.reduce((acc, x) => acc + x.amount, 0);

    const openBoletos = await prisma.boleto.findMany({ where: { userId: USER_ID, status: 'open' } });
    const boletosSum = openBoletos.reduce((acc, x) => acc + x.amount, 0);

    const rows = Array.from({ length: months }, (_, idx) => {
      const [yStr, mStr] = parsed.data.startMonth.split('-');
      const base = new Date(Number(yStr), Number(mStr) - 1, 1);
      base.setMonth(base.getMonth() + idx);
      const month = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}`;

      const balance = income - fixedSum - boletosSum;
      return { month, income, fixedExpenses: fixedSum, boletos: boletosSum, balance };
    });

    return reply.send({ rows });
  });
}
