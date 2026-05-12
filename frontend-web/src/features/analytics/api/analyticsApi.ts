import { httpClient } from '@core/http';
import { mapKeysCamel } from '@core/api/mappers';
import { parseOrThrow } from '@core/api/parseOrThrow';
import {
  dashboardKpiSchema,
  salesAnalyticsSchema,
  topProductsSchema,
  topCustomersSchema,
  inventoryValueSchema,
  lowStockAlertsSchema,
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
    const res = await httpClient.get<unknown>('/analytics/dashboard');
    return parseOrThrow(dashboardKpiSchema, res);
  },

  getSalesAnalytics: async (params?: SalesAnalyticsParams): Promise<SalesPeriod[]> => {
    const queryParams: Record<string, string> = {};
    if (params?.from) queryParams['start'] = params.from;
    if (params?.to) queryParams['end'] = params.to;
    const res = await httpClient.get<unknown>(
      '/analytics/sales',
      Object.keys(queryParams).length ? { params: queryParams } : undefined
    );
    return parseOrThrow(salesAnalyticsSchema, res);
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    const res = await httpClient.get<unknown>('/analytics/top-products');
    return parseOrThrow(topProductsSchema, res);
  },

  getTopCustomers: async (): Promise<TopCustomer[]> => {
    const res = await httpClient.get<unknown>('/analytics/top-customers');
    return parseOrThrow(topCustomersSchema, res);
  },

  getInventoryValue: async (): Promise<InventoryValue> => {
    const res = await httpClient.get<unknown>('/analytics/inventory-value');
    return parseOrThrow(inventoryValueSchema, res);
  },

  getLowStockAlerts: async (): Promise<LowStockAlert[]> => {
    const res = await httpClient.get<unknown>('/analytics/low-stock-alerts');
    return parseOrThrow(lowStockAlertsSchema, mapKeysCamel(res));
  },

  getCashFlow: async (): Promise<CashFlowEntry[]> => {
    return Promise.resolve([]);
  },

  getWasteAlerts: async (): Promise<WasteAlert[]> => {
    return Promise.resolve([]);
  },
};
