import * as React from 'react';
import {
  useDashboardKpi,
  useSalesAnalytics,
  useTopProducts,
  useTopCustomers,
} from './useAnalytics';
import { useEmployees } from '@features/employees';
import type { SalesPeriod, TopProduct, TopCustomer } from '@entities/analytics';

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

export function useCompanyStats(): CompanyStats {
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({
    period: '12m',
    groupBy: 'month',
  });
  const { data: topProducts, isLoading: productsLoading } = useTopProducts();
  const { data: topCustomers, isLoading: customersLoading } = useTopCustomers();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  return React.useMemo((): CompanyStats => {
    const activeEmployees = (employees ?? []).filter((e) => e.isActive).length;

    return {
      totalRevenue: kpi?.totalRevenue ?? 0,
      revenueGrowth: kpi?.revenueGrowth ?? 0,
      totalOrders: kpi?.totalOrders ?? 0,
      ordersGrowth: kpi?.ordersGrowth ?? 0,
      totalCustomers: kpi?.totalCustomers ?? 0,
      currency: kpi?.currency ?? 'USD',
      topProducts: topProducts ?? [],
      topCustomers: topCustomers ?? [],
      salesPeriod: salesPeriod ?? [],
      activeEmployees,
      totalEmployees: (employees ?? []).length,
      isLoading:
        kpiLoading || periodLoading || productsLoading || customersLoading || employeesLoading,
    };
  }, [
    kpi,
    salesPeriod,
    topProducts,
    topCustomers,
    employees,
    kpiLoading,
    periodLoading,
    productsLoading,
    customersLoading,
    employeesLoading,
  ]);
}
