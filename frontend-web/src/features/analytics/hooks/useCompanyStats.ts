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
  currency: 'USD',
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

export function useCompanyStats(): CompanyStats {
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({
    period: '12m',
    groupBy: 'month',
  });
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
