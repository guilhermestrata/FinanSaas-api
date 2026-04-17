import { digitsOnly } from './validation';

export type BoletoKind = 'barcode44' | 'linhaDigitavel47' | 'convenio48';

export function parseBoletoCode(code: string): { normalized: string; kind: BoletoKind } {
  const normalized = digitsOnly(code);
  const len = normalized.length;

  if (len === 44) return { normalized, kind: 'barcode44' };
  if (len === 47) return { normalized, kind: 'linhaDigitavel47' };
  if (len === 48) return { normalized, kind: 'convenio48' };

  const err = new Error('INVALID_BOLETO_CODE');
  (err as any).statusCode = 400;
  throw err;
}
