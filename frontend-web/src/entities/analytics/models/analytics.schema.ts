import { z } from 'zod';

export const dashboardKpiSchema = z.object({
  totalRevenue: z.number().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  totalCustomers: z.number().int().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  revenueGrowth: z.number(),
  ordersGrowth: z.number(),
  currency: z.string().length(3).default('USD'),
});

export const salesPeriodSchema = z.object({
  period: z.string(),
  revenue: z.number().nonnegative(),
  orders: z.number().int().nonnegative(),
});

export const salesAnalyticsSchema = z.array(salesPeriodSchema);

export const topProductSchema = z.object({
  productId: z.uuid(),
  productName: z.string(),
  sku: z.string(),
  totalSold: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
});

export const topProductsSchema = z.array(topProductSchema);

export const topCustomerSchema = z.object({
  customerId: z.uuid(),
  customerName: z.string(),
  email: z.email(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
});

export const topCustomersSchema = z.array(topCustomerSchema);

export const inventoryValueSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  totalValue: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  byStatus: z.array(z.object({
    status: z.string(),
    count: z.number().int().nonnegative(),
    value: z.number().nonnegative(),
  })),
});

export const lowStockAlertSchema = z.object({
  itemId: z.uuid(),
  sku: z.string(),
  name: z.string(),
  currentQuantity: z.number().int().nonnegative(),
  threshold: z.number().int().nonnegative(),
});

export const lowStockAlertsSchema = z.array(lowStockAlertSchema);
