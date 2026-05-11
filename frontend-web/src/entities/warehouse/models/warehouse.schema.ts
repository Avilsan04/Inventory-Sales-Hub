import { z } from 'zod';

export const warehouseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const warehouseListSchema = z.array(warehouseSchema);
