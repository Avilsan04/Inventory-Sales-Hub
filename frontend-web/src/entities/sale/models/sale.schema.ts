import { z } from 'zod';

export const saleStatusSchema = z
  .string()
  .transform((s) => s.toLowerCase() as 'pending' | 'completed' | 'cancelled');

const rawSaleItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  subtotal: z.number().nonnegative(),
});

export const saleItemSchema = rawSaleItemSchema.transform(
  (item): {
    id: string;
    saleId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  } => ({
    id: String(item.id),
    saleId: '',
    productId: String(item.productId),
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.subtotal),
  })
);

const rawCustomerInSaleSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
});

const rawSaleSchema = z.object({
  id: z.number(),
  customer: rawCustomerInSaleSchema.nullish(),
  processedBy: z.string().nullish(),
  status: z.string(),
  subtotal: z.number().nonnegative().nullish(),
  taxRate: z.number().nonnegative().nullish(),
  taxAmount: z.number().nonnegative().nullish(),
  total: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(rawSaleItemSchema).default([]),
});

export const saleSchema = rawSaleSchema.transform(
  (s): {
    id: string;
    customerId?: string;
    customerName?: string;
    employeeId?: string;
    processedBy?: string;
    status: 'pending' | 'completed' | 'cancelled';
    subtotal?: number;
    discountPercent: number;
    discountAmount: number;
    taxPercent: number;
    taxAmount: number;
    total: number;
    currency: string;
    items: { id: string; saleId: string; productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number }[];
    createdAt: string;
    updatedAt: string;
  } => ({
    id: String(s.id),
    customerId: s.customer ? String(s.customer.id) : undefined,
    customerName: s.customer?.name ?? undefined,
    employeeId: undefined,
    processedBy: s.processedBy ?? undefined,
    status: s.status.toLowerCase() as 'pending' | 'completed' | 'cancelled',
    subtotal: s.subtotal != null ? Number(s.subtotal) : undefined,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: s.taxRate != null ? Number(s.taxRate) * 100 : 0,
    taxAmount: s.taxAmount != null ? Number(s.taxAmount) : 0,
    total: Number(s.total),
    currency: 'EUR',
    items: s.items.map((item) => ({
      id: String(item.id),
      saleId: String(s.id),
      productId: String(item.productId),
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  })
);

export const saleListSchema = z.array(saleSchema);

const rawSaleSummarySchema = z.object({
  today: z.object({
    revenue: z.number(),
    salesCount: z.number().int(),
    netProfit: z.number().nullish(),
  }),
  month: z.object({
    revenue: z.number(),
    salesCount: z.number().int(),
    netProfit: z.number().nullish(),
  }),
  topProducts: z
    .array(z.object({ productId: z.number(), name: z.string(), totalSold: z.number().int() }))
    .default([]),
});

export const saleSummarySchema = rawSaleSummarySchema.transform(
  (s): {
    totalSales: number;
    totalRevenue: number;
    currency: string;
    revenueToday: number;
    salesToday: number;
  } => ({
    totalSales: s.month.salesCount,
    totalRevenue: Number(s.month.revenue),
    currency: 'EUR',
    revenueToday: Number(s.today.revenue),
    salesToday: s.today.salesCount,
  })
);

const shippingDetailsSchema = z.object({
  address: z.string().min(5),
  contactName: z.string().min(1),
  contactPhone: z.string().min(6),
  notes: z.string().optional(),
});

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative().default(0),
      })
    )
    .min(1),
  currency: z.string().length(3).default('EUR'),
  discountPercent: z.number().min(0).max(100).default(0),
  taxPercent: z.number().min(0).max(100).default(0),
  shippingDetails: shippingDetailsSchema.optional(),
  paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cash_on_delivery']).optional(),
});

export const updateSaleStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']),
});
