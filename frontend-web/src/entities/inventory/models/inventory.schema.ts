import { z } from 'zod';

// Strict runtime validation boundary
export const inventoryItemSchema = z.object({
  id: z.uuid({ message: 'Invalid entity ID format' }),
  sku: z.string().min(3, 'SKU must be at least 3 characters').max(50),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  price: z.number().nonnegative('Price cannot be negative'),
  currency: z.string().length(3).default('USD'),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
  lastUpdated: z.iso.datetime({ message: 'Must be a valid ISO datetime string' }),
});

export const inventoryListSchema = z.array(inventoryItemSchema);
export const createInventoryItemSchema = inventoryItemSchema.omit({
  id: true,
  lastUpdated: true,
});