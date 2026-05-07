import { httpClient } from '@core/http';
import {
  dashboardKpiSchema,
  salesAnalyticsSchema,
  topProductsSchema,
  topCustomersSchema,
  inventoryValueSchema,
  lowStockAlertsSchema,
  cashFlowSchema,
  wasteAlertsSchema,
} from '@entities/analytics';
import type {
  DashboardKpi,
  SalesPeriod,
  TopProduct,
  TopCustomer,
  InventoryValue,
  LowStockAlert,
  CashFlowEntry,
  WasteAlert,
  SalesAnalyticsParams,
} from '@entities/analytics';

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardKpi> => {
    const res = await httpClient.get<DashboardKpi>('/analytics/dashboard');
    return dashboardKpiSchema.parse(res);
  },

  getSalesAnalytics: async (params?: SalesAnalyticsParams): Promise<SalesPeriod[]> => {
    const res = await httpClient.get<SalesPeriod[]>('/analytics/sales', {
      params: params as Record<string, unknown>,
    });
    return salesAnalyticsSchema.parse(res);
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const res = await httpClient.get<TopProduct[]>('/analytics/top-products');
    return topProductsSchema.parse(res);
  },

  getTopCustomers: async (): Promise<TopCustomer[]> => {
    const res = await httpClient.get<TopCustomer[]>('/analytics/top-customers');
    return topCustomersSchema.parse(res);
  },

  getInventoryValue: async (): Promise<InventoryValue> => {
    const res = await httpClient.get<InventoryValue>('/analytics/inventory-value');
    return inventoryValueSchema.parse(res);
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const res = await httpClient.get<LowStockAlert[]>('/analytics/low-stock-alerts');
    return lowStockAlertsSchema.parse(res);
  },

  getCashFlow: async (): Promise<CashFlowEntry[]> => {
    const res = await httpClient.get<CashFlowEntry[]>('/analytics/cash-flow');
    return cashFlowSchema.parse(res);
  },

  getWasteAlerts: async (): Promise<WasteAlert[]> => {
    const res = await httpClient.get<WasteAlert[]>('/analytics/waste-alerts');
    return wasteAlertsSchema.parse(res);
  },
};
