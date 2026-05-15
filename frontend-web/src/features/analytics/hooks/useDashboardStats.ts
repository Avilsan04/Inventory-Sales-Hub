import * as React from 'react';
import {
  useDashboardKpi,
  useLowStockAlerts,
  useTopCustomers,
  useSalesAnalytics,
  useRecentSales,
} from './useAnalytics';
import { useSalesFlat } from '@features/sales';
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
  const { data: recentSales = [], isLoading: salesLoading } = useRecentSales(5);
  const { data: sales } = useSalesFlat();
  const { data: topCustomers } = useTopCustomers();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({ period: '7d' });

  const customerMap = React.useMemo((): Map<string, string> => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => map.set(c.customerId, c.customerName));
    return map;
  }, [topCustomers]);

  const statusSlices = React.useMemo(() => computeStatusSlices(sales ?? []), [sales]);

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
