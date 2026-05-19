import * as React from 'react';
import { TrendingUpIcon, ShoppingCartIcon, UsersIcon, PackageIcon } from 'lucide-react';
import type { DateRange } from '@shared/ui';
import type { SalesAnalyticsParams, DashboardKpi } from '@entities/analytics';

export const DATE_RANGES = [
  { id: '7d', labelKey: 'analytics.range7d' },
  { id: '30d', labelKey: 'analytics.rangeMonthly' },
  { id: '90d', labelKey: 'analytics.range90d' },
  { id: 'custom', labelKey: 'analytics.rangeCustom' },
] as const;

export type DateRangeId = (typeof DATE_RANGES)[number]['id'];

export const CHART_SUBTITLE_KEY: Record<DateRangeId, string> = {
  '7d': 'analytics.revenueSubtitle7d',
  '30d': 'analytics.revenueSubtitle30d',
  '90d': 'analytics.revenueSubtitle90d',
  custom: 'analytics.revenueSubtitleCustom',
};

type KpiIconKey = 'revenue' | 'orders' | 'customers' | 'products';

export const KPI_ICON_MAP: Record<KpiIconKey, React.ReactElement> = {
  revenue: <TrendingUpIcon aria-hidden="true" />,
  orders: <ShoppingCartIcon aria-hidden="true" />,
  customers: <UsersIcon aria-hidden="true" />,
  products: <PackageIcon aria-hidden="true" />,
};

export interface KpiCardDef {
  key: string;
  titleKey: string;
  value: string | number;
  iconKey: KpiIconKey;
  trend?: string;
}

export function buildKpiCards(
  kpi: DashboardKpi | undefined,
  formatRevenue: (amount: number) => string
): KpiCardDef[] {
  const growthStr = (v: number): string => `${v >= 0 ? '+' : ''}${String(v)}%`;
  return [
    {
      key: 'revenue',
      titleKey: 'analytics.totalRevenue',
      iconKey: 'revenue',
      value: kpi ? formatRevenue(kpi.totalRevenue) : '0',
      trend: kpi ? growthStr(kpi.revenueGrowth) : undefined,
    },
    {
      key: 'orders',
      titleKey: 'analytics.totalOrders',
      iconKey: 'orders',
      value: kpi?.totalOrders ?? 0,
      trend: kpi ? growthStr(kpi.ordersGrowth) : undefined,
    },
    {
      key: 'customers',
      titleKey: 'analytics.totalCustomers',
      iconKey: 'customers',
      value: kpi?.totalCustomers ?? 0,
    },
    {
      key: 'products',
      titleKey: 'analytics.totalProducts',
      iconKey: 'products',
      value: kpi?.totalProducts ?? 0,
    },
  ];
}

const PERIOD_DAYS: Record<Exclude<DateRangeId, 'custom'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export function buildSalesParams(
  dateRange: DateRangeId,
  customRange: DateRange
): SalesAnalyticsParams {
  if (dateRange === 'custom') return { from: customRange.from, to: customRange.to };
  const today = new Date();
  const days = PERIOD_DAYS[dateRange];
  const from = new Date(today.getTime() - days * 86400_000).toISOString().slice(0, 10);
  return { from, to: today.toISOString().slice(0, 10) };
}
