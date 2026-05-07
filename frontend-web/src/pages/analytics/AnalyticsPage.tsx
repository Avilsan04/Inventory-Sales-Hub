import * as React from 'react';
import { TrendingUpIcon, ShoppingCartIcon, UsersIcon, PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
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
import { Spinner, Skeleton, Button } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
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
} from '@shared/ui/composed';
import type { SalesAnalyticsParams } from '@entities/analytics';
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
type KpiIconKey = 'revenue' | 'orders' | 'customers' | 'products';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function renderKpiIcon(key: KpiIconKey): React.ReactElement {
  switch (key) {
    case 'revenue':
      return <TrendingUpIcon aria-hidden="true" />;
    case 'orders':
      return <ShoppingCartIcon aria-hidden="true" />;
    case 'customers':
      return <UsersIcon aria-hidden="true" />;
    case 'products':
      return <PackageIcon aria-hidden="true" />;
  }
}

export function AnalyticsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const [dateRange, setDateRange] = React.useState<DateRangeId>('7d');
  const [customRange, setCustomRange] = React.useState<DateRange>({
    from: todayStr(),
    to: todayStr(),
  });

  const salesParams = React.useMemo((): SalesAnalyticsParams => {
    if (dateRange === 'custom') return { from: customRange.from, to: customRange.to };
    return { period: dateRange as SalesAnalyticsParams['period'] };
  }, [dateRange, customRange]);

  const { data: kpi, isLoading: kpiLoading, isError: kpiError } = useDashboardKpi();
  const { data: topProds, isLoading: prodsLoading, isError: prodsError } = useTopProducts();
  const { data: topCusts, isLoading: custsLoading, isError: custsError } = useTopCustomers();
  const { data: alerts, isLoading: alertsLoading, isError: alertsError } = useLowStockAlerts();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics(salesParams);
  const { data: saleSummary, isLoading: summaryLoading } = useSaleSummary();

  const anyLoading = kpiLoading || prodsLoading || custsLoading || alertsLoading;
  const anyError = kpiError || prodsError || custsError || alertsError;
  const currency = kpi?.currency ?? '';

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
      </div>
    );
  }

  const kpiCards: Array<{
    key: string;
    titleKey: string;
    value: string | number;
    iconKey: KpiIconKey;
    trend?: string;
  }> = [
    {
      key: 'revenue',
      titleKey: 'analytics.totalRevenue',
      value: kpi ? `${kpi.currency} ${kpi.totalRevenue.toLocaleString()}` : '0',
      iconKey: 'revenue',
      trend: kpi ? `${kpi.revenueGrowth >= 0 ? '+' : ''}${String(kpi.revenueGrowth)}%` : undefined,
    },
    {
      key: 'orders',
      titleKey: 'analytics.totalOrders',
      value: kpi?.totalOrders ?? 0,
      iconKey: 'orders',
      trend: kpi ? `${kpi.ordersGrowth >= 0 ? '+' : ''}${String(kpi.ordersGrowth)}%` : undefined,
    },
    {
      key: 'customers',
      titleKey: 'analytics.totalCustomers',
      value: kpi?.totalCustomers ?? 0,
      iconKey: 'customers',
    },
    {
      key: 'products',
      titleKey: 'analytics.totalProducts',
      value: kpi?.totalProducts ?? 0,
      iconKey: 'products',
    },
  ];

  const donutData: StatusSlice[] =
    saleSummary?.byStatus?.map((b) => ({ status: b.status, count: b.count, revenue: b.revenue })) ??
    [];

  const handleExportProducts = (): void => {
    exportToCsv(
      (topProds ?? []).map((p) => ({
        product: p.productName,
        sku: p.sku,
        sold: p.totalSold,
        revenue: p.revenue,
      })),
      'top-products'
    );
  };

  const handleExportCustomers = (): void => {
    exportToCsv(
      (topCusts ?? []).map((c) => ({
        customer: c.customerName,
        orders: c.totalOrders,
        spent: c.totalSpent,
      })),
      'top-customers'
    );
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
        <div className={styles['dateRangePills']} role="group" aria-label="Período">
          {DATE_RANGES.map(({ id, labelKey }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setDateRange(id);
              }}
              className={cn(
                styles['dateRangePill'],
                dateRange === id && styles['dateRangePillActive']
              )}
              aria-pressed={dateRange === id}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        {dateRange === 'custom' && (
          <DateRangePicker value={customRange} onChange={setCustomRange} />
        )}
      </div>

      <section className={styles['kpiGrid']} aria-label="Key performance indicators">
        {kpiCards.map((card) => (
          <Card key={card.key}>
            <CardHeader>
              <CardTitle className={styles['kpiTitle']}>{t(card.titleKey)}</CardTitle>
              <CardAction>
                <span className={styles['kpiIcon']}>{renderKpiIcon(card.iconKey)}</span>
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
            <p className={styles['chartSubtitle']}>{t('analytics.revenueOverTimeSubtitle')}</p>
          </div>
          <CardAction>
            <div className={styles['chartLegend']}>
              <span className={styles['chartLegendItem']}>
                <span
                  className={styles['chartLegendDot']}
                  style={{ background: 'var(--color-chart-1)' }}
                />
                {t('analytics.revenue')}
              </span>
              <span className={styles['chartLegendItem']}>
                <span
                  className={styles['chartLegendDot']}
                  style={{ background: 'var(--color-chart-2)' }}
                />
                {t('analytics.orders')}
              </span>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart data={salesPeriod} isLoading={periodLoading} />
        </CardContent>
      </Card>

      <div className={styles['sectionsGrid']}>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.salesByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesDonutChart data={donutData} isLoading={summaryLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.topProductsRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsBarChart data={topProds} isLoading={prodsLoading} />
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
