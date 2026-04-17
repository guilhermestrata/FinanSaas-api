export type ApiErrorBody = { error: string; code: string };

export function apiError(code: string, error: string): ApiErrorBody {
  return { code, error };
}
