import * as React from 'react';
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
import { useSalesFlatList } from '@entities/sale';
import { computeStatusSlices } from '@shared/lib/saleCalculations';
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
import {
  AnalyticsTopProductsTable,
  AnalyticsTopCustomersTable,
  AnalyticsLowStockTable,
} from '@widgets/analytics';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';
import {
  DATE_RANGES,
  CHART_SUBTITLE_KEY,
  KPI_ICON_MAP,
  buildKpiCards,
  buildSalesParams,
  type DateRangeId,
} from './analyticsPageConfig';

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
  const { data: salesFlat, isLoading: salesFlatLoading } = useSalesFlatList();

  const donutData: StatusSlice[] = React.useMemo(
    () => computeStatusSlices(salesFlat ?? []),
    [salesFlat]
  );

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
            <SalesDonutChart
              data={donutData}
              isLoading={summaryLoading || salesFlatLoading}
              currency={currency}
            />
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
