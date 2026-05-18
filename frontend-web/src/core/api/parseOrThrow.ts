import { z } from 'zod';

/**
 * Parses `data` against `schema` and throws with additional context on failure.
 * Single hook point for API boundary validation — change parsing behavior here globally.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const summary = result.error.issues
      .slice(0, 3)
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    throw new Error(`API response parse error: ${summary}`);
  }
  return result.data;
}
