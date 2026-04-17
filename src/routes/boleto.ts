import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { apiError } from '../lib/errors';
import { parseBoletoCode } from '../lib/boleto';

export async function boletoRoutes(app: FastifyInstance) {
  app.post('/parse', async (req, reply) => {
    const schema = z.object({ code: z.string().min(1) });
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return reply
        .status(400)
        .send(apiError('INVALID_BODY', 'Body inválido.'));
    }

    try {
      const { normalized, kind } = parseBoletoCode(parsed.data.code);
      return reply.send({ normalized, kind });
    } catch (e: any) {
      if (e?.message === 'INVALID_BOLETO_CODE') {
        return reply.status(400).send(
          apiError(
            'INVALID_BOLETO_CODE',
            'Código inválido. Informe 44, 47 ou 48 dígitos.'
          )
        );
      }
      req.log.error(e);
      return reply
        .status(500)
        .send(apiError('INTERNAL_ERROR', 'Erro interno.'));
    }
  });
}
