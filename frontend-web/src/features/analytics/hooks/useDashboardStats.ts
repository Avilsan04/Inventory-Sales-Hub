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

function currentWeekRange(): { from: string; to: string } {
  const today = new Date();
  const daysToMonday = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const iso = (d: Date): string => d.toISOString().slice(0, 10);
  return { from: iso(monday), to: iso(sunday) };
}

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
  const weekRange = React.useMemo(() => currentWeekRange(), []);
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics(weekRange);

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
