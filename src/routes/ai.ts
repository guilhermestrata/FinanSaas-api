import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { apiError } from '../lib/errors';
import { brlNumber } from '../lib/validation';

export async function aiRoutes(app: FastifyInstance) {
  app.post('/projections', async (req, reply) => {
    const schema = z.object({
      netMonthlyIncome: brlNumber,
      fixedExpensesMonthly: brlNumber,
      boletoOpenMonthly: brlNumber,
      months: z.number().int().finite(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    const months = Math.max(3, Math.min(36, parsed.data.months));
    const { netMonthlyIncome, fixedExpensesMonthly, boletoOpenMonthly } = parsed.data;

    const monthlyBalance = netMonthlyIncome - fixedExpensesMonthly - boletoOpenMonthly;

    const series = Array.from({ length: months }, (_, idx) => {
      const monthIndex = idx + 1;
      return {
        monthIndex,
        projectedBalance: monthlyBalance * monthIndex,
      };
    });

    const savingsRate = netMonthlyIncome > 0 ? monthlyBalance / netMonthlyIncome : 0;

    const insights: string[] = [];
    if (monthlyBalance < 0) {
      insights.push('Atenção: seu saldo mensal projetado está negativo.');
    }
    if (netMonthlyIncome > 0 && savingsRate < 0.1) {
      insights.push('Sugestão: tente aumentar sua taxa de poupança para pelo menos 10%.');
    }
    if (boletoOpenMonthly > 0) {
      insights.push('Boletos em aberto impactam diretamente seu saldo mensal.');
    }

    return reply.send({
      months: series,
      summary: {
        projectedEndBalance: (monthlyBalance * months) || 0,
        savingsRate: Number.isFinite(savingsRate) ? savingsRate : 0,
      },
      insights,
    });
  });
}
