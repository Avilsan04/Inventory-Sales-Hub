import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('http://localhost:8080'),
  VITE_MOCK_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  VITE_APP_VERSION: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
