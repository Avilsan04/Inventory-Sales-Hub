import { z } from 'zod';

export const inventoryItemSchema = z.object({
  id: z.string().min(1),
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  price: z.number().int().nonnegative('Price cannot be negative'),
  currency: z.string().length(3).default('USD'),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
  category: z.string().optional(),
  reorderThreshold: z.number().int().nonnegative().optional(),
  isActive: z.boolean().default(true),
  lastUpdated: z.iso.datetime({ message: 'Must be a valid ISO datetime string' }),
  imageUrl: z.url().optional(),
});

export const inventoryListSchema = z.array(inventoryItemSchema);

export const createInventoryItemSchema = inventoryItemSchema.omit({
  id: true,
  lastUpdated: true,
  isActive: true,
});

export const updateInventoryItemSchema = inventoryItemSchema.omit({
  id: true,
  lastUpdated: true,
  isActive: true,
});

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  note: z.string().optional(),
});

export const inventoryMovementSchema = z.object({
  id: z.string().min(1),
  inventoryItemId: z.string().min(1),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().int(),
  previousQuantity: z.number().int().nonnegative(),
  newQuantity: z.number().int().nonnegative(),
  note: z.string().optional(),
  createdAt: z.iso.datetime(),
});

export const inventoryMovementListSchema = z.array(inventoryMovementSchema);
