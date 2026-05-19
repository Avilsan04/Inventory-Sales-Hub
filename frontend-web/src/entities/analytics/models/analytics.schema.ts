import { z } from 'zod';

const rawDashboardSchema = z.object({
  revenueToday: z.number(),
  revenueThisMonth: z.number(),
  revenueThisYear: z.number(),
  salesToday: z.number().int(),
  salesThisMonth: z.number().int(),
  salesThisYear: z.number().int(),
  totalActiveProducts: z.number().int(),
  totalCustomers: z.number().int(),
  lowStockCount: z.number().int(),
  totalInventoryValue: z.number(),
});

export const dashboardKpiSchema = rawDashboardSchema.transform(
  (
    d
  ): {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    currency: string;
    revenueToday: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    salesToday: number;
    salesThisMonth: number;
    salesThisYear: number;
    lowStockCount: number;
    totalInventoryValue: number;
  } => ({
    totalRevenue: d.revenueThisMonth,
    totalOrders: d.salesThisMonth,
    totalCustomers: d.totalCustomers,
    totalProducts: d.totalActiveProducts,
    revenueGrowth: 0,
    ordersGrowth: 0,
    currency: 'EUR',
    revenueToday: d.revenueToday,
    revenueThisMonth: d.revenueThisMonth,
    revenueThisYear: d.revenueThisYear,
    salesToday: d.salesToday,
    salesThisMonth: d.salesThisMonth,
    salesThisYear: d.salesThisYear,
    lowStockCount: d.lowStockCount,
    totalInventoryValue: d.totalInventoryValue,
  })
);

const rawSalesPeriodSchema = z.object({
  date: z.string(),
  revenue: z.number(),
  ordersCount: z.number().int(),
});

export const salesPeriodSchema = rawSalesPeriodSchema.transform(
  (p): { period: string; revenue: number; orders: number } => ({
    period: p.date,
    revenue: p.revenue,
    orders: p.ordersCount,
  })
);

export const salesAnalyticsSchema = z.array(salesPeriodSchema);

const rawTopProductSchema = z.object({
  productId: z.number(),
  name: z.string(),
  totalSold: z.number().int(),
  revenue: z.number(),
  sku: z.string().default(''),
});

export const topProductSchema = rawTopProductSchema.transform(
  (
    p
  ): {
    productId: string;
    productName: string;
    sku: string;
    totalSold: number;
    revenue: number;
  } => ({
    productId: String(p.productId),
    productName: p.name,
    sku: p.sku,
    totalSold: p.totalSold,
    revenue: p.revenue,
  })
);

export const topProductsSchema = z.array(topProductSchema);

const rawTopCustomerSchema = z.object({
  customerId: z.number(),
  customerName: z.string(),
  ordersCount: z.number().int(),
  totalSpent: z.number(),
});

export const topCustomerSchema = rawTopCustomerSchema.transform(
  (
    c
  ): {
    customerId: string;
    customerName: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  } => ({
    customerId: String(c.customerId),
    customerName: c.customerName,
    email: '',
    totalOrders: c.ordersCount,
    totalSpent: c.totalSpent,
  })
);

export const topCustomersSchema = z.array(topCustomerSchema);

const rawInventoryValueSchema = z.object({
  totalPurchaseValue: z.number(),
  totalSaleValue: z.number(),
  totalUnits: z.number().int(),
  totalProducts: z.number().int(),
});

export const inventoryValueSchema = rawInventoryValueSchema.transform(
  (
    v
  ): {
    totalItems: number;
    totalValue: number;
    currency: string;
    byStatus: { status: string; count: number; value: number }[];
    totalPurchaseValue: number;
    totalSaleValue: number;
    totalProducts: number;
  } => ({
    totalItems: v.totalUnits,
    totalValue: v.totalSaleValue,
    currency: 'EUR',
    byStatus: [],
    totalPurchaseValue: v.totalPurchaseValue,
    totalSaleValue: v.totalSaleValue,
    totalProducts: v.totalProducts,
  })
);

// Low-stock alerts from analytics endpoint return InventoryResponse[]
const rawInventoryResponseSchema = z.object({
  id: z.number(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    sku: z.string(),
    description: z.string().nullish(),
  }),
  quantity: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  isLowStock: z.boolean(),
});

export const lowStockAlertSchema = rawInventoryResponseSchema.transform(
  (
    i
  ): { itemId: string; sku: string; name: string; currentQuantity: number; threshold: number } => ({
    itemId: String(i.id),
    sku: i.product.sku,
    name: i.product.name,
    currentQuantity: i.quantity,
    threshold: i.minStock,
  })
);

export const lowStockAlertsSchema = z.array(lowStockAlertSchema);

export const cashFlowEntrySchema = z.object({
  period: z.string(),
  inflow: z.number().int().nonnegative(),
  outflow: z.number().int().nonnegative(),
  net: z.number().int(),
});

export const cashFlowSchema = z.array(cashFlowEntrySchema);

export const wasteAlertSchema = z.object({
  productId: z.string().min(1),
  productName: z.string(),
  sku: z.string(),
  expiredUnits: z.number().int().nonnegative(),
  estimatedLoss: z.number().int().nonnegative(),
  currency: z.string().length(3).default('EUR'),
});

export const wasteAlertsSchema = z.array(wasteAlertSchema);
