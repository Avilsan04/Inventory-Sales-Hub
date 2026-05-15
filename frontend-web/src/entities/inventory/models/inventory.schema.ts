import { z } from 'zod';

const rawProductInInventorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish(),
  sku: z.string(),
  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  category: z
    .object({ id: z.number(), name: z.string(), description: z.string().nullish() })
    .nullish(),
  isActive: z.boolean(),
});

const rawInventoryItemSchema = z.object({
  id: z.number(),
  product: rawProductInInventorySchema,
  quantity: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  isLowStock: z.boolean(),
});

export const inventoryItemSchema = rawInventoryItemSchema.transform(
  (
    i
  ): {
    id: string;
    productId: string;
    sku: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    currency: string;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    category?: string;
    reorderThreshold: number;
    minStock: number;
    isActive: boolean;
    warehouseId?: string;
    warehouseName?: string;
    lastUpdated: string;
    imageUrl?: string;
  } => ({
    id: String(i.id),
    productId: String(i.product.id),
    sku: i.product.sku,
    name: i.product.name,
    description: i.product.description ?? undefined,
    quantity: i.quantity,
    price: i.product.salePrice,
    currency: 'EUR',
    status: i.quantity === 0 ? 'OUT_OF_STOCK' : i.isLowStock ? 'LOW_STOCK' : 'IN_STOCK',
    category: i.product.category?.name ?? undefined,
    reorderThreshold: i.minStock,
    minStock: i.minStock,
    isActive: i.product.isActive,
    warehouseId: undefined,
    warehouseName: undefined,
    lastUpdated: new Date().toISOString(),
    imageUrl: undefined,
  })
);

export const inventoryListSchema = z.array(inventoryItemSchema);

export const createInventoryItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sku: z.string().min(3).max(50),
  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  categoryId: z.number().optional(),
  quantity: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative().optional(),
});

export const updateInventoryItemSchema = z.object({
  minStock: z.number().int().nonnegative().optional(),
});

export const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  note: z.string().optional(),
});

const rawMovementSchema = z.object({
  id: z.number(),
  inventoryId: z.number(),
  type: z.string(),
  quantity: z.number().int(),
  previousStock: z.number().int().nonnegative(),
  newStock: z.number().int().nonnegative(),
  note: z.string().nullish(),
  createdAt: z.string(),
});

export const inventoryMovementSchema = rawMovementSchema.transform(
  (
    m
  ): {
    id: string;
    inventoryItemId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    note?: string;
    createdAt: string;
  } => ({
    id: String(m.id),
    inventoryItemId: String(m.inventoryId),
    type: m.type.toLowerCase() as 'in' | 'out' | 'adjustment',
    quantity: m.quantity,
    previousQuantity: m.previousStock,
    newQuantity: m.newStock,
    note: m.note ?? undefined,
    createdAt: m.createdAt,
  })
);

export const inventoryMovementListSchema = z.array(inventoryMovementSchema);

export const paginatedInventorySchema = z.object({
  data: inventoryListSchema,
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});

export type PaginatedInventoryResponse = z.infer<typeof paginatedInventorySchema>;
