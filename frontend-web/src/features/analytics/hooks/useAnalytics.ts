import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import type {
  DashboardKpi,
  SalesPeriod,
  TopProduct,
  TopCustomer,
  InventoryValue,
  LowStockAlert,
  SalesAnalyticsParams,
} from '@entities/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  sales: (params?: SalesAnalyticsParams) => [...analyticsKeys.all, 'sales', params] as const,
  topProducts: () => [...analyticsKeys.all, 'top-products'] as const,
  topCustomers: () => [...analyticsKeys.all, 'top-customers'] as const,
  inventoryValue: () => [...analyticsKeys.all, 'inventory-value'] as const,
  lowStockAlerts: () => [...analyticsKeys.all, 'low-stock-alerts'] as const,
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
