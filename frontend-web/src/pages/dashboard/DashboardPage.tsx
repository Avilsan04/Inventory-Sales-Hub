import * as React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  useDashboardKpi,
  useLowStockAlerts,
  useTopCustomers,
  useSalesAnalytics,
} from '@features/analytics';
import { useSales } from '@features/sales';
import { PermissionGuard } from '@features/auth';
import { SectionErrorBoundary } from '@app/providers';
import {
  CashFlowWidget,
  InventoryValueWidget,
  TopProfitableWidget,
  WasteAlertsWidget,
} from '@widgets/dashboard';
import { Skeleton, Badge, Button } from '@shared/ui/primitives';
import {
  SalesDonutChart,
  WeeklySalesBarChart,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  type StatusSlice,
} from '@shared/ui/composed';
import { formatCurrency } from '@shared/lib/formatCurrency';
import type { BadgeVariant } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Dashboard.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function saleStatusBadge(status: string): BadgeVariant {
  const map: Partial<Record<SaleStatus, BadgeVariant>> = {
    completed: 'success',
    pending: 'neutral',
    cancelled: 'destructive',
  };
  return map[status as SaleStatus] ?? 'neutral';
}

function orderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8).toUpperCase()}`;
}

export function DashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: alerts } = useLowStockAlerts();
  const { data: sales, isLoading: salesLoading } = useSales();
  const { data: topCustomers } = useTopCustomers();
  const { data: salesPeriod, isLoading: periodLoading } = useSalesAnalytics({ period: '7d' });

  const customerMap = React.useMemo((): Map<string, string> => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => map.set(c.customerId, c.customerName));
    return map;
  }, [topCustomers]);

  const statusSlices = React.useMemo((): StatusSlice[] => {
    if (!sales) return [];
    const map = new Map<string, { count: number; revenue: number }>();
    sales.forEach((s) => {
      const curr = map.get(s.status) ?? { count: 0, revenue: 0 };
      map.set(s.status, { count: curr.count + 1, revenue: curr.revenue + s.total });
    });
    return Array.from(map.entries()).map(([status, d]) => ({
      status,
      count: d.count,
      revenue: d.revenue,
    }));
  }, [sales]);

  const recentSales = sales?.slice(0, 5) ?? [];

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['title']}>{t('dashboard.title')}</h1>
          <p className={styles['subtitle']}>{t('topbar.subtitle.dashboard')}</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          {t('dashboard.exportReport')}
        </Button>
      </header>

      {/* KPI row */}
      <section className={styles['kpiGrid']} aria-label="Key performance indicators">
        <div className={styles['kpiCard']}>
          <p className={styles['kpiLabel']}>{t('dashboard.stats.monthlySales')}</p>
          <div className={styles['kpiValue']}>
            {kpiLoading ? (
              <Skeleton className={styles['kpiSkeleton']} />
            ) : kpi ? (
              formatCurrency(kpi.totalRevenue, kpi.currency)
            ) : (
              '—'
            )}
          </div>
        </div>
        <div className={styles['kpiCard']}>
          <p className={styles['kpiLabel']}>{t('dashboard.stats.activeOrders')}</p>
          <div className={styles['kpiValue']}>
            {kpiLoading ? (
              <Skeleton className={styles['kpiSkeleton']} />
            ) : (
              (kpi?.totalOrders ?? '—')
            )}
          </div>
        </div>
        <div className={styles['kpiCard']}>
          <p className={styles['kpiLabel']}>{t('dashboard.stats.lowStock')}</p>
          <div className={styles['kpiValue']}>{alerts?.length ?? 0} items</div>
        </div>
      </section>

      {/* C-level widgets — admin/company/manager only */}
      <PermissionGuard permission="view:analytics">
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          <SectionErrorBoundary label="Cash Flow">
            <CashFlowWidget />
          </SectionErrorBoundary>
          <SectionErrorBoundary label="Inventory Value">
            <InventoryValueWidget />
          </SectionErrorBoundary>
          <SectionErrorBoundary label="Top Products">
            <TopProfitableWidget />
          </SectionErrorBoundary>
          <SectionErrorBoundary label="Waste Alerts">
            <WasteAlertsWidget />
          </SectionErrorBoundary>
        </section>
      </PermissionGuard>

      {/* Charts */}
      <div className={styles['chartsGrid']}>
        <SectionErrorBoundary label="Weekly Sales Chart">
          <div className={styles['chartCard']}>
            <div className={styles['chartCardHeader']}>
              <h3 className={styles['chartTitle']}>{t('dashboard.weeklySales')}</h3>
            </div>
            <WeeklySalesBarChart data={salesPeriod} isLoading={periodLoading} />
          </div>
        </SectionErrorBoundary>

        <SectionErrorBoundary label="Sales by Status">
          <div className={styles['chartCard']}>
            <div className={styles['chartCardHeader']}>
              <h3 className={styles['chartTitle']}>{t('dashboard.salesByStatus')}</h3>
            </div>
            <SalesDonutChart data={statusSlices} isLoading={salesLoading} />
          </div>
        </SectionErrorBoundary>
      </div>

      {/* Recent transactions */}
      <SectionErrorBoundary label="Recent Transactions">
        <div className={styles['transactionsCard']}>
          <div className={styles['transactionsHeader']}>
            <h3 className={styles['transactionsTitle']}>{t('dashboard.recentTransactions')}</h3>
            <button type="button" className={styles['viewAllBtn']}>
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>{t('sales.customer')}</TableHead>
                <TableHead>{t('sales.total')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className={styles['skeletonRow']} />
                    </TableCell>
                  </TableRow>
                ))
              ) : recentSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles['emptyCell']}>
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                recentSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className={styles['orderIdLink']}>{orderId(s.id)}</TableCell>
                    <TableCell>
                      {s.customerId
                        ? (customerMap.get(s.customerId) ?? `#${s.customerId.slice(0, 8)}`)
                        : '—'}
                    </TableCell>
                    <TableCell>{formatCurrency(s.total, s.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={saleStatusBadge(s.status)} showDot>
                        {t(`sales.status.${s.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SectionErrorBoundary>
    </div>
  );
}
