import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prisma } from '../db/prisma';
import { apiError } from '../lib/errors';
import { brlNumber } from '../lib/validation';

const USER_ID = 'demo-user';

export async function fixedExpenseRoutes(app: FastifyInstance) {
  app.get('/', async (_req, reply) => {
    const items = await prisma.fixedExpense.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: 'desc' } });
    return reply.send({ items });
  });

  app.post('/', async (req, reply) => {
    const schema = z.object({
      name: z.string().min(1),
      amount: brlNumber,
      dueDay: z.number().int().min(1).max(31),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    const item = await prisma.fixedExpense.create({
      data: {
        userId: USER_ID,
        name: parsed.data.name,
        amount: parsed.data.amount,
        dueDay: parsed.data.dueDay,
      },
    });

    return reply.status(201).send({ item });
  });

  app.delete('/:id', async (req, reply) => {
    const schema = z.object({ id: z.string().min(1) });
    const params = schema.safeParse(req.params);
    if (!params.success) {
      return reply.status(400).send(apiError('INVALID_PARAMS', 'Parâmetros inválidos.'));
    }

    await prisma.fixedExpense.deleteMany({ where: { id: params.data.id, userId: USER_ID } });
    return reply.status(204).send();
  });
}
