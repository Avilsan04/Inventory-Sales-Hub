import * as React from 'react';
import { TrendingUpIcon, ShoppingCartIcon, UsersIcon, PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCurrencyAdapter } from '@adapters/useCurrencyAdapter';
import { useFormatAmount } from '@shared/lib';
import {
  useDashboardKpi,
  useTopProducts,
  useTopCustomers,
  useLowStockAlerts,
  useSalesAnalytics,
} from '@features/analytics';
import { PermissionGuard } from '@features/auth';
import { useSaleSummary } from '@features/sales';
import { exportToCsv } from '@shared/lib/exportCsv';
import { toast } from '@shared/hooks';
import { Spinner, Skeleton, Button } from '@shared/ui';
import { cn } from '@shared/lib';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  RevenueAreaChart,
  SalesDonutChart,
  TopProductsBarChart,
  DateRangePicker,
  type DateRange,
  type StatusSlice,
} from '@shared/ui';
import type { SalesAnalyticsParams, DashboardKpi } from '@entities/analytics';
import {
  AnalyticsTopProductsTable,
  AnalyticsTopCustomersTable,
  AnalyticsLowStockTable,
} from '@widgets/analytics';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';

const DATE_RANGES = [
  { id: '7d', labelKey: 'analytics.range7d' },
  { id: '30d', labelKey: 'analytics.rangeMonthly' },
  { id: '90d', labelKey: 'analytics.range90d' },
  { id: 'custom', labelKey: 'analytics.rangeCustom' },
] as const;

type DateRangeId = (typeof DATE_RANGES)[number]['id'];

const CHART_SUBTITLE_KEY: Record<DateRangeId, string> = {
  '7d': 'analytics.revenueSubtitle7d',
  '30d': 'analytics.revenueSubtitle30d',
  '90d': 'analytics.revenueSubtitle90d',
  custom: 'analytics.revenueSubtitleCustom',
};

type KpiIconKey = 'revenue' | 'orders' | 'customers' | 'products';

const KPI_ICON_MAP: Record<KpiIconKey, React.ReactElement> = {
  revenue: <TrendingUpIcon aria-hidden="true" />,
  orders: <ShoppingCartIcon aria-hidden="true" />,
  customers: <UsersIcon aria-hidden="true" />,
  products: <PackageIcon aria-hidden="true" />,
};

interface KpiCardDef {
  key: string;
  titleKey: string;
  value: string | number;
  iconKey: KpiIconKey;
  trend?: string;
}

function buildKpiCards(
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

function buildSalesParams(dateRange: DateRangeId, customRange: DateRange): SalesAnalyticsParams {
  if (dateRange === 'custom') return { from: customRange.from, to: customRange.to };
  const today = new Date();
  const days = PERIOD_DAYS[dateRange];
  const from = new Date(today.getTime() - days * 86400_000).toISOString().slice(0, 10);
  return { from, to: today.toISOString().slice(0, 10) };
}

export function AnalyticsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { currency } = useCurrencyAdapter();
  const formatRevenue = useFormatAmount();
  const [dateRange, setDateRange] = React.useState<DateRangeId>('7d');
  const [customRange, setCustomRange] = React.useState<DateRange>({
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });

  const salesParams = React.useMemo(
    () => buildSalesParams(dateRange, customRange),
    [dateRange, customRange]
  );

  const { data: kpi, isLoading: kpiLoading, isError: kpiError, refetch } = useDashboardKpi();
  const { data: topProds, isLoading: prodsLoading, isError: prodsError } = useTopProducts();
  const { data: topCusts, isLoading: custsLoading, isError: custsError } = useTopCustomers();
  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useLowStockAlerts();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics(salesParams);
  const { isLoading: summaryLoading } = useSaleSummary();

  const anyLoading = [kpiLoading, prodsLoading, custsLoading, alertsLoading].some(Boolean);
  const anyError = [kpiError, prodsError, custsError, alertsError].some(Boolean);

  if (anyLoading && !kpi) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (anyError && !kpi) {
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            void refetch();
          }}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const kpiCards = buildKpiCards(kpi, formatRevenue);
  const donutData: StatusSlice[] = [];

  const handleExportProducts = (): void => {
    const rows = (topProds ?? []).map((p) => ({
      product: p.productName,
      sku: p.sku,
      sold: p.totalSold,
      revenue: p.revenue,
    }));
    if (rows.length === 0) {
      toast({ title: t('analytics.toasts.exportEmptyProducts'), variant: 'destructive' });
      return;
    }
    exportToCsv(rows, 'top-products');
  };

  const handleExportCustomers = (): void => {
    const rows = (topCusts ?? []).map((c) => ({
      customer: c.customerName,
      orders: c.totalOrders,
      spent: c.totalSpent,
    }));
    if (rows.length === 0) {
      toast({ title: t('analytics.toasts.exportEmptyCustomers'), variant: 'destructive' });
      return;
    }
    exportToCsv(rows, 'top-customers');
  };

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['title']}>{t('analytics.title')}</h1>
          <p className={styles['subtitle']}>{t('analytics.subtitle')}</p>
        </div>
        <div className={styles['headerActions']}>
          <PermissionGuard permission="export:csv">
            <Button variant="outline" size="sm" onClick={handleExportProducts}>
              {t('analytics.exportProducts')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCustomers}>
              {t('analytics.exportCustomers')}
            </Button>
          </PermissionGuard>
        </div>
      </header>

      <div className={styles['dateRangeRow']}>
        <div
          className={styles['dateRangePills']}
          role="group"
          aria-label={t('analytics.dateRangeGroup')}
        >
          {DATE_RANGES.map(({ id, labelKey }) => (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              onClick={(): void => {
                setDateRange(id);
              }}
              className={cn(
                styles['dateRangePill'],
                dateRange === id && styles['dateRangePillActive']
              )}
              aria-pressed={dateRange === id}
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>
        {dateRange === 'custom' && (
          <DateRangePicker value={customRange} onChange={setCustomRange} />
        )}
      </div>

      <section className={styles['kpiGrid']} aria-label={t('analytics.kpiAriaLabel')}>
        {kpiCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardTitle className={styles['kpiTitle']}>{t(card.titleKey)}</CardTitle>
              <CardAction>
                <span className={styles['kpiIcon']}>{KPI_ICON_MAP[card.iconKey]}</span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['kpiValue']}>
                {!kpiLoading ? card.value : <Skeleton className={styles['kpiSkeleton']} />}
              </div>
              {!kpiLoading && card.trend !== undefined && (
                <p className={styles['kpiTrend']}>
                  {card.trend} {t('analytics.vsLastMonth')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div className={styles['chartSection']}>
            <CardTitle>{t('analytics.revenueOverTime')}</CardTitle>
            <p className={styles['chartSubtitle']}>{t(CHART_SUBTITLE_KEY[dateRange])}</p>
          </div>
          <CardAction>
            <div className={styles['chartLegend']}>
              <span className={styles['chartLegendItem']}>
                <span className={cn(styles['chartLegendDot'], styles['chartLegendDot1'])} />
                {t('analytics.revenue')}
              </span>
              <span className={styles['chartLegendItem']}>
                <span className={cn(styles['chartLegendDot'], styles['chartLegendDot2'])} />
                {t('analytics.orders')}
              </span>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart data={salesPeriod} isLoading={periodLoading} currency={currency} />
        </CardContent>
      </Card>

      <div className={styles['sectionsGrid']}>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.salesByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesDonutChart data={donutData} isLoading={summaryLoading} currency={currency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.topProductsRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsBarChart data={topProds} isLoading={prodsLoading} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <div className={styles['sectionsGrid']}>
        <AnalyticsTopProductsTable data={topProds} isLoading={prodsLoading} currency={currency} />
        <AnalyticsTopCustomersTable data={topCusts} isLoading={custsLoading} currency={currency} />
      </div>
      <AnalyticsLowStockTable data={alerts} isLoading={alertsLoading} />
    </div>
  );
}
