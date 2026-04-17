import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { prisma } from '../db/prisma';
import { apiError } from '../lib/errors';
import { brlNumber, isoDate } from '../lib/validation';
import { parseBoletoCode } from '../lib/boleto';

const USER_ID = 'demo-user';

export async function boletoCrudRoutes(app: FastifyInstance) {
  app.get('/', async (req, reply) => {
    const schema = z.object({ status: z.enum(['open', 'paid']).optional() });
    const q = schema.safeParse(req.query);
    if (!q.success) {
      return reply.status(400).send(apiError('INVALID_QUERY', 'Query inválida.'));
    }

    const items = await prisma.boleto.findMany({
      where: {
        userId: USER_ID,
        ...(q.data.status ? { status: q.data.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ items });
  });

  app.post('/', async (req, reply) => {
    const schema = z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      amount: brlNumber,
      dueDate: isoDate.optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    let normalized: string;
    let kind: string;
    try {
      const res = parseBoletoCode(parsed.data.code);
      normalized = res.normalized;
      kind = res.kind;
    } catch (e: any) {
      if (e?.message === 'INVALID_BOLETO_CODE') {
        return reply.status(400).send(
          apiError(
            'INVALID_BOLETO_CODE',
            'Código inválido. Informe 44, 47 ou 48 dígitos.'
          )
        );
      }
      throw e;
    }

    const item = await prisma.boleto.create({
      data: {
        userId: USER_ID,
        name: parsed.data.name,
        barcode: normalized,
        kind,
        amount: parsed.data.amount,
        dueDate: parsed.data.dueDate,
        status: 'open',
      },
    });

    return reply.status(201).send({ item });
  });

  app.patch('/:id', async (req, reply) => {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const bodySchema = z.object({ status: z.enum(['open', 'paid']) });

    const params = paramsSchema.safeParse(req.params);
    const body = bodySchema.safeParse(req.body);

    if (!params.success) {
      return reply.status(400).send(apiError('INVALID_PARAMS', 'Parâmetros inválidos.'));
    }
    if (!body.success) {
      return reply.status(400).send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    const paidAt = body.data.status === 'paid' ? new Date() : null;

    const item = await prisma.boleto.update({
      where: { id: params.data.id },
      data: { status: body.data.status, paidAt },
    });

    if (item.userId !== USER_ID) {
      // simple containment for MVP
      await prisma.boleto.update({ where: { id: item.id }, data: { status: item.status, paidAt: item.paidAt } });
      return reply.status(404).send(apiError('NOT_FOUND', 'Boleto não encontrado.'));
    }

    return reply.send({ item });
  });

  app.delete('/:id', async (req, reply) => {
    const schema = z.object({ id: z.string().min(1) });
    const params = schema.safeParse(req.params);
    if (!params.success) {
      return reply.status(400).send(apiError('INVALID_PARAMS', 'Parâmetros inválidos.'));
    }

    await prisma.boleto.deleteMany({ where: { id: params.data.id, userId: USER_ID } });
    return reply.status(204).send();
  });
}
