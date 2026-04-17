import { z } from 'zod';

export const brlNumber = z
  .number({ error: 'Valor deve ser número.' })
  .finite('Valor inválido.')
  .min(0, 'Valor deve ser maior ou igual a zero.');

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.');

export const isoMonth = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'Mês deve estar no formato YYYY-MM.');

export function digitsOnly(input: string) {
  return input.replace(/\D/g, '');
}
