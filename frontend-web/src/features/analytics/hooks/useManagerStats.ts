import * as React from 'react';
import { useSalesAnalytics, useLowStockAlerts } from './useAnalytics';
import { useSales } from '@features/sales';
import { useEmployees } from '@features/employees';
import { computeStatusSlices } from '@shared/lib/saleCalculations';
import type { StatusSliceData } from '@shared/lib/saleCalculations';
import type { SalesPeriod, LowStockAlert } from '@entities/analytics';
import type { Sale } from '@entities/sale';

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

export function useManagerStats(): ManagerStats {
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({ period: '7d' });
  const { data: allSales, isLoading: salesLoading } = useSales();
  const { data: lowStockItems, isLoading: alertsLoading } = useLowStockAlerts();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  return React.useMemo((): ManagerStats => {
    const sales = allSales ?? [];
    const weeklyRevenue = (salesPeriod ?? []).reduce((sum, p) => sum + p.revenue, 0);
    const weeklyOrders = (salesPeriod ?? []).reduce((sum, p) => sum + p.orders, 0);
    const pendingOrders = sales.filter((s) => s.status === 'pending').length;
    const completedOrders = sales.filter((s) => s.status === 'completed').length;
    const currency = sales[0]?.currency ?? 'USD';
    const statusSlices = computeStatusSlices(sales);
    const recentSales = [...sales]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    const activeEmployees = (employees ?? []).filter((e) => e.isActive).length;

    return {
      weeklyRevenue,
      weeklyOrders,
      pendingOrders,
      completedOrders,
      currency,
      salesPeriod: salesPeriod ?? [],
      statusSlices,
      lowStockItems: lowStockItems ?? [],
      recentSales,
      activeEmployees,
      totalEmployees: (employees ?? []).length,
      isLoading: periodLoading || salesLoading || alertsLoading || employeesLoading,
    };
  }, [
    salesPeriod,
    allSales,
    lowStockItems,
    employees,
    periodLoading,
    salesLoading,
    alertsLoading,
    employeesLoading,
  ]);
}
