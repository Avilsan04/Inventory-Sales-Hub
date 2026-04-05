import { httpClient } from '@core/http';
import {
  dashboardKpiSchema,
  salesAnalyticsSchema,
  topProductsSchema,
  topCustomersSchema,
  inventoryValueSchema,
  lowStockAlertsSchema,
} from '@entities/analytics';
import type { DashboardKpi, SalesPeriod, TopProduct, TopCustomer, InventoryValue, LowStockAlert, SalesAnalyticsParams } from '@entities/analytics';

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardKpi> => {
    const res = await httpClient.get<unknown>('/analytics/dashboard');
    return dashboardKpiSchema.parse(res);
  },

  getSalesAnalytics: async (params?: SalesAnalyticsParams): Promise<SalesPeriod[]> => {
    const res = await httpClient.get<unknown>('/analytics/sales', { params: params as Record<string, unknown> });
    return salesAnalyticsSchema.parse(res);
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const res = await httpClient.get<unknown>('/analytics/top-products');
    return topProductsSchema.parse(res);
  },

  getTopCustomers: async (): Promise<TopCustomer[]> => {
    const res = await httpClient.get<unknown>('/analytics/top-customers');
    return topCustomersSchema.parse(res);
  },

  getInventoryValue: async (): Promise<InventoryValue> => {
    const res = await httpClient.get<unknown>('/analytics/inventory-value');
    return inventoryValueSchema.parse(res);
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const res = await httpClient.get<unknown>('/analytics/low-stock-alerts');
    return lowStockAlertsSchema.parse(res);
  },
};
