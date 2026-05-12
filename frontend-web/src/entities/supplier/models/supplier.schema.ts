import { z } from 'zod';

const rawSupplierSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
});

export const supplierSchema = rawSupplierSchema.transform(
  (
    s
  ): {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
    createdAt: string;
    updatedAt: string;
  } => ({
    id: String(s.id),
    name: s.name,
    email: s.email ?? undefined,
    phone: s.phone ?? undefined,
    address: s.address ?? undefined,
    contactPerson: undefined,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  })
);

export const supplierOrderStatusSchema = z.enum(['pending', 'confirmed', 'delivered', 'cancelled']);

export const supplierOrderItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative().optional(),
});

const rawSupplierOrderSchema = z.object({
  id: z.number(),
  supplierId: z.number(),
  supplierName: z.string().nullish(),
  status: z.string(),
  totalAmount: z.number().nonnegative(),
  items: z.array(supplierOrderItemSchema).default([]),
  createdAt: z.string(),
});

export const supplierOrderSchema = rawSupplierOrderSchema.transform(
  (
    o
  ): {
    id: string;
    supplierId: string;
    status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    items: {
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
      subtotal?: number;
    }[];
    total: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
  } => ({
    id: String(o.id),
    supplierId: String(o.supplierId),
    status: o.status.toLowerCase() as 'pending' | 'confirmed' | 'delivered' | 'cancelled',
    items: o.items,
    total: o.totalAmount,
    currency: 'EUR',
    createdAt: o.createdAt,
    updatedAt: o.createdAt,
  })
);

export const supplierListSchema = z.array(supplierSchema);

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema;

export const createSupplierOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1),
});
