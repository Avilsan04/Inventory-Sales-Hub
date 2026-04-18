import * as React from 'react';
import {
  TrendingUpIcon,
  ShoppingCartIcon,
  AlertTriangleIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useDashboardKpi, useLowStockAlerts, useTopCustomers } from '@features/analytics';
import { useSales } from '@features/sales';
import { useAuthMe } from '@features/auth';
import { Skeleton, Button, Badge } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import { cn } from '@shared/lib/cn';
import type { BadgeVariant } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Dashboard.module.scss';

type KpiIconKey = 'sales' | 'orders' | 'lowStock' | 'customers';

interface KpiCardData {
  titleKey: string;
  value: string | number;
  iconKey: KpiIconKey;
  trend?: string;
  trendUp?: boolean;
  variant: 'default' | 'warning';
}

function renderKpiIcon(iconKey: KpiIconKey): React.ReactElement {
  switch (iconKey) {
    case 'sales':     return <TrendingUpIcon    aria-hidden="true" />;
    case 'orders':    return <ShoppingCartIcon  aria-hidden="true" />;
    case 'lowStock':  return <AlertTriangleIcon aria-hidden="true" />;
    case 'customers': return <UsersIcon         aria-hidden="true" />;
  }
}

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function saleStatusVariant(status: string): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending:   'warning',
    completed: 'info',
    cancelled: 'neutral',
  };
  return map[status as SaleStatus];
}

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export function DashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: alerts, isLoading: alertsLoading } = useLowStockAlerts();
  const { data: sales, isLoading: salesLoading } = useSales();
  const { data: topCustomers } = useTopCustomers();
  const { data: me } = useAuthMe();

  const firstName = me ? me.username.split(' ')[0] ?? me.username : '';

  const kpiLoaded = !kpiLoading && !alertsLoading;

  const customerMap = React.useMemo(() => {
    const map = new Map<string, string>();
    topCustomers?.forEach((c) => map.set(c.customerId, c.customerName));
    return map;
  }, [topCustomers]);

  const kpiCards: KpiCardData[] = [
    {
      titleKey: 'dashboard.stats.monthlySales',
      value: kpi ? `${kpi.currency} ${kpi.totalRevenue.toLocaleString()}` : '0',
      iconKey: 'sales',
      trend: kpi ? `${kpi.revenueGrowth >= 0 ? '+' : ''}${String(kpi.revenueGrowth)}%` : undefined,
      trendUp: (kpi?.revenueGrowth ?? 0) >= 0,
      variant: 'default',
    },
    {
      titleKey: 'dashboard.stats.activeOrders',
      value: kpi?.totalOrders ?? 0,
      iconKey: 'orders',
      trend: kpi ? `${kpi.ordersGrowth >= 0 ? '+' : ''}${String(kpi.ordersGrowth)}%` : undefined,
      trendUp: (kpi?.ordersGrowth ?? 0) >= 0,
      variant: 'default',
    },
    {
      titleKey: 'dashboard.stats.lowStock',
      value: alerts?.length ?? 0,
      iconKey: 'lowStock',
      variant: 'warning',
    },
    {
      titleKey: 'dashboard.stats.newCustomers',
      value: kpi?.totalCustomers ?? 0,
      iconKey: 'customers',
      variant: 'default',
    },
  ];

  const recentSales = sales?.slice(0, 5) ?? [];

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div>
          <span className={styles['eyebrow']}>OVERVIEW</span>
          <h1 className={styles['title']}>
            {t('dashboard.welcome')}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className={styles['subtitle']}>{t('dashboard.headerSubtitle')}</p>
        </div>
        <div className={styles['headerActions']}>
          <Button variant="outline" size="sm">{t('common.export')}</Button>
          <Button size="sm">{`+ ${t('sales.newSale')}`}</Button>
        </div>
      </header>

      <section className={styles['kpiGrid']} aria-label="Key performance indicators">
        {kpiCards.map((card) => (
          <Card key={card.titleKey} className={styles['kpiCard']}>
            <CardHeader>
              <CardTitle className={styles['kpiTitle']}>{t(card.titleKey)}</CardTitle>
              <CardAction>
                <span className={cn(styles['kpiIcon'], card.variant === 'warning' && styles['kpiIconWarning'])}>
                  {renderKpiIcon(card.iconKey)}
                </span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['kpiValue']}>
                {kpiLoaded ? card.value : <Skeleton className={styles['kpiSkeleton']} />}
              </div>
              {kpiLoaded && card.trend !== undefined && (
                <p className={card.trendUp ? styles['trendUp'] : styles['trendDown']}>
                  {card.trendUp
                    ? <ArrowUpIcon size={12} aria-hidden="true" />
                    : <ArrowDownIcon size={12} aria-hidden="true" />
                  }
                  {card.trend} {t('dashboard.vsLastMonth')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className={styles['contentGrid']}>
        {/* Recent Orders */}
        <Card className={styles['panel']}>
          <div className={styles['panelHeader']}>
            <div>
              <p className={styles['panelTitle']}>{t('dashboard.recentOrders.title')}</p>
              <p className={styles['panelSubtitle']}>{t('dashboard.recentOrders.subtitle')}</p>
            </div>
            <Button variant="ghost" size="sm">{t('dashboard.recentOrders.viewAll')}</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.cols.order')}</TableHead>
                <TableHead>{t('sales.customer')}</TableHead>
                <TableHead>{t('dashboard.cols.items')}</TableHead>
                <TableHead>{t('dashboard.cols.total')}</TableHead>
                <TableHead>{t('dashboard.cols.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton style={{ height: '1.25rem', width: '100%' }} />
                      </TableCell>
                    </TableRow>
                  ))
                : recentSales.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  )
                  : recentSales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className={styles['mono']}>{shortId(s.id)}</TableCell>
                        <TableCell>
                          {s.customerId
                            ? (customerMap.get(s.customerId) ?? shortId(s.customerId))
                            : '—'}
                        </TableCell>
                        <TableCell>{s.items.length}</TableCell>
                        <TableCell className={styles['mono']}>
                          {s.currency} {s.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={saleStatusVariant(s.status)} showDot>
                            {t(`sales.status.${s.status}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
              }
            </TableBody>
          </Table>
        </Card>

        {/* Low Stock Panel */}
        <Card className={styles['panel']}>
          <div className={styles['panelHeader']}>
            <div>
              <p className={styles['panelTitle']}>{t('dashboard.lowStock.title')}</p>
              <p className={styles['panelSubtitle']}>{t('dashboard.lowStock.subtitle')}</p>
            </div>
          </div>

          <div className={styles['lowStockList']}>
            {alertsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className={styles['lowStockItem']}>
                    <Skeleton style={{ height: '2.5rem', flex: 1 }} />
                  </div>
                ))
              : !alerts || alerts.length === 0
                ? (
                  <div className={styles['lowStockItem']}>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      {t('common.noData')}
                    </p>
                  </div>
                )
                : alerts.map((a) => (
                    <div key={a.itemId} className={styles['lowStockItem']}>
                      <div className={styles['lowStockMeta']}>
                        <div className={styles['lowStockName']}>{a.name}</div>
                        <div className={styles['lowStockSku']}>{a.sku}</div>
                      </div>
                      <div className={styles['lowStockCount']}>
                        <div className={styles['lowStockQty']}>{a.currentQuantity}</div>
                        <div className={styles['lowStockThreshold']}>/ {a.threshold}</div>
                      </div>
                    </div>
                  ))
            }
          </div>

          <div className={styles['panelFooter']}>
            <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              {t('dashboard.lowStock.reorderAll')}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
