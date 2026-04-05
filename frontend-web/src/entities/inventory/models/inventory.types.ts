import { z } from 'zod';
import {
  createInventoryItemSchema,
  inventoryItemSchema,
  updateInventoryItemSchema,
  stockAdjustmentSchema,
  inventoryMovementSchema,
} from './inventory.schema';

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type CreateInventoryItemDTO = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemDTO = z.infer<typeof updateInventoryItemSchema>;
export type StockAdjustmentDTO = z.infer<typeof stockAdjustmentSchema>;
export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;

export interface InventoryFilters {
  search?: string;
  status?: InventoryItem['status'];
  minQuantity?: number;
  maxQuantity?: number;
}