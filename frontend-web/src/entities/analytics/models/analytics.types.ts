import { z } from 'zod';
import {
  dashboardKpiSchema,
  salesPeriodSchema,
  topProductSchema,
  topCustomerSchema,
  inventoryValueSchema,
  lowStockAlertSchema,
  cashFlowEntrySchema,
  wasteAlertSchema,
} from './analytics.schema';

export type DashboardKpi = z.infer<typeof dashboardKpiSchema>;
export type SalesPeriod = z.infer<typeof salesPeriodSchema>;
export type TopProduct = z.infer<typeof topProductSchema>;
export type TopCustomer = z.infer<typeof topCustomerSchema>;
export type InventoryValue = z.infer<typeof inventoryValueSchema>;
export type LowStockAlert = z.infer<typeof lowStockAlertSchema>;
export type CashFlowEntry = z.infer<typeof cashFlowEntrySchema>;
export type WasteAlert = z.infer<typeof wasteAlertSchema>;

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '12m';

export interface SalesAnalyticsParams {
  period?: AnalyticsPeriod;
  from?: string;
  to?: string;
  groupBy?: 'day' | 'week' | 'month';
}
