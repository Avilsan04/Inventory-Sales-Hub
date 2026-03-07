import { z } from 'zod';
import { createInventoryItemSchema, inventoryItemSchema } from './inventory.schema';

// Single Source of Truth: TypeScript interface inferred directly from the runtime schema.
// This guarantees that compile-time types and runtime validations never drift apart.
export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export type CreateInventoryItemDTO = z.infer<typeof createInventoryItemSchema>;

export interface InventoryFilters {
  search?: string;
  status?: InventoryItem['status'];
  minQuantity?: number;
  maxQuantity?: number;
}