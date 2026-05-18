import * as React from 'react';
import {
  useDashboardKpi,
  useSalesAnalytics,
  useTopProducts,
  useTopCustomers,
} from './useAnalytics';
import { useEmployees } from '@features/employees';
import type { SalesPeriod, TopProduct, TopCustomer, DashboardKpi } from '@entities/analytics';
import type { Employee } from '@entities/employee';

const KPI_DEFAULTS: DashboardKpi = {
  totalRevenue: 0,
  revenueGrowth: 0,
  totalOrders: 0,
  ordersGrowth: 0,
  totalCustomers: 0,
  totalProducts: 0,
  currency: 'EUR',
  revenueToday: 0,
  revenueThisMonth: 0,
  revenueThisYear: 0,
  salesToday: 0,
  salesThisMonth: 0,
  salesThisYear: 0,
  lowStockCount: 0,
  totalInventoryValue: 0,
};

export interface CompanyStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  currency: string;
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  salesPeriod: SalesPeriod[];
  activeEmployees: number;
  totalEmployees: number;
  isLoading: boolean;
}

function mapStats(
  kpi: DashboardKpi | undefined,
  salesPeriod: SalesPeriod[] | undefined,
  topProducts: TopProduct[] | undefined,
  topCustomers: TopCustomer[] | undefined,
  employees: Employee[] | undefined,
  isLoading: boolean
): CompanyStats {
  const kpiData = kpi ?? KPI_DEFAULTS;
  const all = employees ?? [];
  return {
    totalRevenue: kpiData.totalRevenue,
    revenueGrowth: kpiData.revenueGrowth,
    totalOrders: kpiData.totalOrders,
    ordersGrowth: kpiData.ordersGrowth,
    totalCustomers: kpiData.totalCustomers,
    currency: kpiData.currency,
    topProducts: topProducts ?? [],
    topCustomers: topCustomers ?? [],
    salesPeriod: salesPeriod ?? [],
    activeEmployees: all.filter((e) => e.isActive).length,
    totalEmployees: all.length,
    isLoading,
  };
}

function last12MonthsRange(): { from: string; to: string } {
  const today = new Date();
  const start = new Date(today);
  start.setMonth(today.getMonth() - 12);
  start.setDate(1);
  const iso = (d: Date): string => d.toISOString().slice(0, 10);
  return { from: iso(start), to: iso(today) };
}

export function useCompanyStats(): CompanyStats {
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const yearRange = React.useMemo(() => last12MonthsRange(), []);
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics(yearRange);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts();
  const { data: topCustomers, isLoading: customersLoading } = useTopCustomers();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const isLoading =
    kpiLoading || periodLoading || productsLoading || customersLoading || employeesLoading;

  return React.useMemo(
    () => mapStats(kpi, salesPeriod, topProducts, topCustomers, employees, isLoading),
    [kpi, salesPeriod, topProducts, topCustomers, employees, isLoading]
  );
}
