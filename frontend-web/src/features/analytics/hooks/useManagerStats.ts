import * as React from 'react';
import { useSalesAnalytics, useLowStockAlerts } from './useAnalytics';
import { useSales } from '@features/sales';
import { useEmployees } from '@features/employees';
import { computeStatusSlices } from '@shared/lib/saleCalculations';
import type { StatusSliceData } from '@shared/lib/saleCalculations';
import type { SalesPeriod, LowStockAlert } from '@entities/analytics';
import type { Sale } from '@entities/sale';
import type { Employee } from '@entities/employee';

export interface ManagerStats {
  weeklyRevenue: number;
  weeklyOrders: number;
  pendingOrders: number;
  completedOrders: number;
  currency: string;
  salesPeriod: SalesPeriod[];
  statusSlices: StatusSliceData[];
  lowStockItems: LowStockAlert[];
  recentSales: Sale[];
  activeEmployees: number;
  totalEmployees: number;
  isLoading: boolean;
}

function computeManagerStats(
  salesPeriod: SalesPeriod[] | undefined,
  allSales: Sale[] | undefined,
  lowStockItems: LowStockAlert[] | undefined,
  employees: Employee[] | undefined,
  isLoading: boolean
): ManagerStats {
  const sales = allSales ?? [];
  const period = salesPeriod ?? [];
  const all = employees ?? [];

  return {
    weeklyRevenue: period.reduce((sum, p) => sum + p.revenue, 0),
    weeklyOrders: period.reduce((sum, p) => sum + p.orders, 0),
    pendingOrders: sales.filter((s) => s.status === 'pending').length,
    completedOrders: sales.filter((s) => s.status === 'completed').length,
    currency: sales[0]?.currency ?? 'USD',
    salesPeriod: period,
    statusSlices: computeStatusSlices(sales),
    lowStockItems: lowStockItems ?? [],
    recentSales: [...sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    activeEmployees: all.filter((e) => e.isActive).length,
    totalEmployees: all.length,
    isLoading,
  };
}

export function useManagerStats(): ManagerStats {
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({ period: '7d' });
  const { data: allSales, isLoading: salesLoading } = useSales();
  const { data: lowStockItems, isLoading: alertsLoading } = useLowStockAlerts();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const isLoading = periodLoading || salesLoading || alertsLoading || employeesLoading;

  return React.useMemo(
    () => computeManagerStats(salesPeriod, allSales, lowStockItems, employees, isLoading),
    [salesPeriod, allSales, lowStockItems, employees, isLoading]
  );
}
