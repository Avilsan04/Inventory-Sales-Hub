import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
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
import type { Sale } from '@entities/sale';

import { withTenant } from '@core/api/queryKeys';

export const analyticsKeys = {
  all: (): readonly unknown[] => withTenant(['analytics'] as const),
  dashboard: (): readonly unknown[] => withTenant(['analytics', 'dashboard'] as const),
  sales: (params?: SalesAnalyticsParams): readonly unknown[] =>
    withTenant(['analytics', 'sales', params] as const),
  topProducts: (): readonly unknown[] => withTenant(['analytics', 'top-products'] as const),
  topCustomers: (): readonly unknown[] => withTenant(['analytics', 'top-customers'] as const),
  inventoryValue: (): readonly unknown[] => withTenant(['analytics', 'inventory-value'] as const),
  lowStockAlerts: (): readonly unknown[] => withTenant(['analytics', 'low-stock-alerts'] as const),
  cashFlow: (): readonly unknown[] => withTenant(['analytics', 'cash-flow'] as const),
  wasteAlerts: (): readonly unknown[] => withTenant(['analytics', 'waste-alerts'] as const),
  recentSales: (limit: number): readonly unknown[] =>
    withTenant(['analytics', 'recent-sales', limit] as const),
};

export function useDashboardKpi(): UseQueryResult<DashboardKpi> {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: analyticsApi.getDashboard,
    staleTime: 60_000,
  });
}

export function useSalesAnalytics(params?: SalesAnalyticsParams): UseQueryResult<SalesPeriod[]> {
  return useQuery({
    queryKey: analyticsKeys.sales(params),
    queryFn: () => analyticsApi.getSalesAnalytics(params),
    staleTime: 300_000,
  });
}

export function useTopProducts(): UseQueryResult<TopProduct[]> {
  return useQuery({
    queryKey: analyticsKeys.topProducts(),
    queryFn: analyticsApi.getTopProducts,
    staleTime: 300_000,
  });
}

export function useTopCustomers(): UseQueryResult<TopCustomer[]> {
  return useQuery({
    queryKey: analyticsKeys.topCustomers(),
    queryFn: analyticsApi.getTopCustomers,
    staleTime: 300_000,
  });
}

export function useInventoryValue(): UseQueryResult<InventoryValue> {
  return useQuery({
    queryKey: analyticsKeys.inventoryValue(),
    queryFn: analyticsApi.getInventoryValue,
    staleTime: 60_000,
  });
}

export function useLowStockAlerts(): UseQueryResult<LowStockAlert[]> {
  return useQuery({
    queryKey: analyticsKeys.lowStockAlerts(),
    queryFn: analyticsApi.getLowStockAlerts,
    staleTime: 30_000,
  });
}

export function useRecentSales(limit = 5): UseQueryResult<Sale[]> {
  return useQuery({
    queryKey: analyticsKeys.recentSales(limit),
    queryFn: () => analyticsApi.getRecentSales(limit),
    staleTime: 30_000,
  });
}

export function useCashFlow(): UseQueryResult<CashFlowEntry[]> {
  return useQuery({
    queryKey: analyticsKeys.cashFlow(),
    queryFn: analyticsApi.getCashFlow,
    staleTime: 300_000,
  });
}

export function useWasteAlerts(): UseQueryResult<WasteAlert[]> {
  return useQuery({
    queryKey: analyticsKeys.wasteAlerts(),
    queryFn: analyticsApi.getWasteAlerts,
    staleTime: 300_000,
  });
}
