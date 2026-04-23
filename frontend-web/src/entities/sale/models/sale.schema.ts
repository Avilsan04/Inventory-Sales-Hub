import { z } from 'zod';

export const saleStatusSchema = z.enum(['pending', 'completed', 'cancelled']);

export const saleItemSchema = z.object({
  id: z.uuid(),
  saleId: z.uuid(),
  productId: z.uuid(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const saleSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid().optional(),
  employeeId: z.uuid().optional(),
  status: saleStatusSchema,
  total: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  items: z.array(saleItemSchema).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const saleListSchema = z.array(saleSchema);

export const saleSummarySchema = z.object({
  totalSales: z.number().int().nonnegative(),
  totalRevenue: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  byStatus: z.array(z.object({
    status: saleStatusSchema,
    count: z.number().int().nonnegative(),
    revenue: z.number().nonnegative(),
  })).optional(),
});

export const createSaleSchema = z.object({
  customerId: z.uuid().optional(),
  items: z.array(z.object({
    productId: z.uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
  })).min(1),
  currency: z.string().length(3).default('USD'),
});

export const updateSaleStatusSchema = z.object({ status: saleStatusSchema });
