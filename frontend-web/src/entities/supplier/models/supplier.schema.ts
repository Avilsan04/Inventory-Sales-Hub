import { z } from 'zod';

export const supplierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const supplierOrderStatusSchema = z.enum(['pending', 'confirmed', 'delivered', 'cancelled']);

export const supplierOrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const supplierOrderSchema = z.object({
  id: z.string().min(1),
  supplierId: z.string().min(1),
  status: supplierOrderStatusSchema,
  items: z.array(supplierOrderItemSchema).default([]),
  total: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const supplierListSchema = z.array(supplierSchema);
export const createSupplierSchema = supplierSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateSupplierSchema = createSupplierSchema;
export const createSupplierOrderSchema = z.object({
  items: z.array(supplierOrderItemSchema).min(1),
  currency: z.string().length(3).default('USD'),
});
