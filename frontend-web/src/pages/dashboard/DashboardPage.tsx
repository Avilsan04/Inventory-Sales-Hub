import * as React from 'react';
import {
  TrendingUpIcon,
  TruckIcon,
  AlertTriangleIcon,
  TrendingDownIcon,
  MinusIcon,
  ArrowRightIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  useDashboardKpi,
  useLowStockAlerts,
  useTopCustomers,
  useSalesAnalytics,
} from '@features/analytics';
import { useSales } from '@features/sales';
import { SectionErrorBoundary } from '@app/providers';
import { Skeleton, Button, Badge } from '@shared/ui/primitives';
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
import { cn } from '@shared/lib/cn';
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function orderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8).toUpperCase()}`;
}

export function DashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: alerts, isLoading: alertsLoading } = useLowStockAlerts();
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
  const kpiReady = !kpiLoading;

  // Trend badge config per KPI card
  const revGrowth = kpi?.revenueGrowth ?? 0;
  const ordGrowth = kpi?.ordersGrowth ?? 0;
  const lowStockCount = alerts?.length ?? 0;

  return (
    <div className={styles['page']}>
      {/* Page header */}
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['title']}>Dashboard Overview</h1>
          <p className={styles['subtitle']}>Real-time metrics and inventory status.</p>
        </div>
        <Button variant="outline" size="sm" disabled>
          Export Report
        </Button>
      </header>

      {/* KPI cards */}
      <section className={styles['kpiGrid']} aria-label="Key performance indicators">
        {/* Card 1: Ventas Hoy */}
        <div className={styles['kpiCard']}>
          <div className={cn(styles['kpiCardBg'], styles['kpiCardBgPrimary'])} />
          <div className={styles['kpiTopRow']}>
            <span className={cn(styles['kpiIconContainer'], styles['kpiIconPrimary'])}>
              <TrendingUpIcon aria-hidden="true" />
            </span>
            <span
              className={cn(
                styles['kpiTrendBadge'],
                revGrowth >= 0 ? styles['kpiTrendBadgePrimary'] : styles['kpiTrendBadgeError']
              )}
            >
              {revGrowth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {revGrowth >= 0 ? '+' : ''}
              {revGrowth}%
            </span>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('dashboard.stats.monthlySales')}</p>
            <div className={styles['kpiValue']}>
              {kpiReady ? (
                kpi ? (
                  formatCurrency(kpi.totalRevenue, kpi.currency)
                ) : (
                  '—'
                )
              ) : (
                <Skeleton className={styles['kpiSkeleton']} />
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Pedidos Pendientes */}
        <div className={styles['kpiCard']}>
          <div className={cn(styles['kpiCardBg'], styles['kpiCardBgNeutral'])} />
          <div className={styles['kpiTopRow']}>
            <span className={cn(styles['kpiIconContainer'], styles['kpiIconNeutral'])}>
              <TruckIcon aria-hidden="true" />
            </span>
            <span className={cn(styles['kpiTrendBadge'], styles['kpiTrendBadgeNeutral'])}>
              <MinusIcon />
              {ordGrowth >= 0 ? '+' : ''}
              {ordGrowth}%
            </span>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('dashboard.stats.activeOrders')}</p>
            <div className={styles['kpiValue']}>
              {kpiReady ? (
                (kpi?.totalOrders ?? '—')
              ) : (
                <Skeleton className={styles['kpiSkeleton']} />
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Bajos en Stock */}
        <div className={styles['kpiCard']}>
          <div className={cn(styles['kpiCardBg'], styles['kpiCardBgError'])} />
          <div className={styles['kpiTopRow']}>
            <span className={cn(styles['kpiIconContainer'], styles['kpiIconError'])}>
              <AlertTriangleIcon aria-hidden="true" />
            </span>
            <span className={cn(styles['kpiTrendBadge'], styles['kpiTrendBadgeError'])}>
              <TrendingUpIcon />+{lowStockCount}
            </span>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('dashboard.stats.lowStock')}</p>
            <div className={cn(styles['kpiValue'], styles['kpiValueError'])}>
              {alertsLoading ? (
                <Skeleton className={styles['kpiSkeleton']} />
              ) : (
                `${lowStockCount} Items`
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Charts row */}
      <div className={styles['chartsGrid']}>
        {/* Weekly sales bar chart */}
        <SectionErrorBoundary label="Weekly Sales Chart">
          <div className={styles['chartCard']}>
            <div className={styles['chartCardHeader']}>
              <h3 className={styles['chartTitle']}>Tendencias de Ventas Semanales</h3>
              <select className={styles['periodSelect']} aria-label="Período">
                <option>Esta Semana</option>
                <option>Semana Pasada</option>
              </select>
            </div>
            <WeeklySalesBarChart data={salesPeriod} isLoading={periodLoading} />
          </div>
        </SectionErrorBoundary>

        {/* Sales by status donut */}
        <SectionErrorBoundary label="Ventas por Categoría">
          <div className={styles['chartCard']}>
            <div className={styles['chartCardHeader']}>
              <h3 className={styles['chartTitle']}>Ventas por Categoría</h3>
            </div>
            <SalesDonutChart data={statusSlices} isLoading={salesLoading} />
          </div>
        </SectionErrorBoundary>
      </div>

      {/* Recent transactions table */}
      <SectionErrorBoundary label="Transacciones Recientes">
        <div className={styles['transactionsCard']}>
          <div className={styles['transactionsHeader']}>
            <h3 className={styles['transactionsTitle']}>Transacciones Recientes</h3>
            <button type="button" className={styles['viewAllBtn']}>
              View All <ArrowRightIcon aria-hidden="true" />
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className={styles['skeletonRow']} />
                    </TableCell>
                  </TableRow>
                ))
              ) : recentSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles['emptyCell']}>
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
                    <TableCell>{formatDate(s.createdAt)}</TableCell>
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
