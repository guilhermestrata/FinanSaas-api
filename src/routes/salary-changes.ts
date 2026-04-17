import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prisma } from '../db/prisma';
import { apiError } from '../lib/errors';
import { brlNumber, isoDate } from '../lib/validation';

const USER_ID = 'demo-user';

export async function salaryChangeRoutes(app: FastifyInstance) {
  app.get('/', async (_req, reply) => {
    const items = await prisma.salaryChange.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: 'desc' } });
    return reply.send({ items });
  });

  app.post('/', async (req, reply) => {
    const schema = z.object({
      effectiveFrom: isoDate,
      newNetMonthly: brlNumber,
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    const item = await prisma.salaryChange.create({
      data: {
        userId: USER_ID,
        effectiveFrom: parsed.data.effectiveFrom,
        newNetMonthly: parsed.data.newNetMonthly,
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

    await prisma.salaryChange.deleteMany({ where: { id: params.data.id, userId: USER_ID } });
    return reply.status(204).send();
  });
}
