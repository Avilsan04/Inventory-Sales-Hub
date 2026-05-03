import { z } from 'zod';

export const saleStatusSchema = z.enum(['pending', 'completed', 'cancelled']);

export const saleItemSchema = z.object({
  id: z.string().min(1),
  saleId: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().int().nonnegative(),
  subtotal: z.number().int().nonnegative(),
});

export const saleSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1).optional(),
  employeeId: z.string().min(1).optional(),
  status: saleStatusSchema,
  total: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  items: z.array(saleItemSchema).default([]),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const saleListSchema = z.array(saleSchema);

export const saleSummarySchema = z.object({
  totalSales: z.number().int().nonnegative(),
  totalRevenue: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  byStatus: z
    .array(
      z.object({
        status: saleStatusSchema,
        count: z.number().int().nonnegative(),
        revenue: z.number().int().nonnegative(),
      })
    )
    .optional(),
});

const shippingDetailsSchema = z.object({
  address: z.string().min(5),
  contactName: z.string().min(1),
  contactPhone: z.string().min(6),
  notes: z.string().optional(),
});

export const createSaleSchema = z.object({
  customerId: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().nonnegative(),
      })
    )
    .min(1),
  currency: z.string().length(3).default('USD'),
  shippingDetails: shippingDetailsSchema.optional(),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash_on_delivery']).optional(),
});

export const updateSaleStatusSchema = z.object({ status: saleStatusSchema });
