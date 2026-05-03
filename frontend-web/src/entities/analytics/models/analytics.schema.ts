import { z } from 'zod';

export const dashboardKpiSchema = z.object({
  totalRevenue: z.number().int().nonnegative(),
  totalOrders: z.number().int().nonnegative(),
  totalCustomers: z.number().int().nonnegative(),
  totalProducts: z.number().int().nonnegative(),
  revenueGrowth: z.number(),
  ordersGrowth: z.number(),
  currency: z.string().length(3).default('USD'),
});

export const salesPeriodSchema = z.object({
  period: z.string(),
  revenue: z.number().int().nonnegative(),
  orders: z.number().int().nonnegative(),
});

export const salesAnalyticsSchema = z.array(salesPeriodSchema);

export const topProductSchema = z.object({
  productId: z.string().min(1),
  productName: z.string(),
  sku: z.string(),
  totalSold: z.number().int().nonnegative(),
  revenue: z.number().int().nonnegative(),
});

export const topProductsSchema = z.array(topProductSchema);

export const topCustomerSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string(),
  email: z.email(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().int().nonnegative(),
});

export const topCustomersSchema = z.array(topCustomerSchema);

export const inventoryValueSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  totalValue: z.number().int().nonnegative(),
  currency: z.string().length(3).default('USD'),
  byStatus: z.array(
    z.object({
      status: z.string(),
      count: z.number().int().nonnegative(),
      value: z.number().int().nonnegative(),
    })
  ),
});

export const lowStockAlertSchema = z.object({
  itemId: z.string().min(1),
  sku: z.string(),
  name: z.string(),
  currentQuantity: z.number().int().nonnegative(),
  threshold: z.number().int().nonnegative(),
});

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
