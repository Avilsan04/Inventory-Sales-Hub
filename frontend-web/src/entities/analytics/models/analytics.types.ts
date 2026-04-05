import { z } from 'zod';
import {
  dashboardKpiSchema,
  salesPeriodSchema,
  topProductSchema,
  topCustomerSchema,
  inventoryValueSchema,
  lowStockAlertSchema,
} from './analytics.schema';

export type DashboardKpi = z.infer<typeof dashboardKpiSchema>;
export type SalesPeriod = z.infer<typeof salesPeriodSchema>;
export type TopProduct = z.infer<typeof topProductSchema>;
export type TopCustomer = z.infer<typeof topCustomerSchema>;
export type InventoryValue = z.infer<typeof inventoryValueSchema>;
export type LowStockAlert = z.infer<typeof lowStockAlertSchema>;

export interface SalesAnalyticsParams {
  from?: string;
  to?: string;
  groupBy?: 'day' | 'week' | 'month';
}
