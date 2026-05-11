import { z } from 'zod';

/**
 * Parses `data` against `schema` and throws a ZodError on failure.
 * Use at API layer boundaries to enforce runtime type contracts.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
