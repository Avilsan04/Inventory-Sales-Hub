import * as React from 'react';
import {
  useDashboardKpi,
  useLowStockAlerts,
  useTopCustomers,
  useSalesAnalytics,
} from './useAnalytics';
import { useSales } from '@features/sales';
import { computeStatusSlices } from '@shared/lib/saleCalculations';
import type { StatusSliceData } from '@shared/lib/saleCalculations';
import type { DashboardKpi, LowStockAlert, SalesPeriod } from '@entities/analytics';
import type { Sale } from '@entities/sale';

export interface DashboardStats {
  kpi: DashboardKpi | undefined;
  kpiLoading: boolean;
  alerts: LowStockAlert[] | undefined;
  salesPeriod: SalesPeriod[] | undefined;
  periodLoading: boolean;
  recentSales: Sale[];
  salesLoading: boolean;
  customerMap: Map<string, string>;
  statusSlices: StatusSliceData[];
}

export function useDashboardStats(): DashboardStats {
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: alerts } = useLowStockAlerts();
  const { data: sales, isLoading: salesLoading } = useSales();
  const { data: topCustomers } = useTopCustomers();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({ period: '7d' });

  const customerMap = React.useMemo((): Map<string, string> => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => map.set(c.customerId, c.customerName));
    return map;
  }, [topCustomers]);

  const statusSlices = React.useMemo(() => computeStatusSlices(sales ?? []), [sales]);

  const recentSales: Sale[] = sales?.slice(0, 5) ?? [];

  return {
    kpi,
    kpiLoading,
    alerts,
    salesPeriod,
    periodLoading,
    recentSales,
    salesLoading,
    customerMap,
    statusSlices,
  };
}
