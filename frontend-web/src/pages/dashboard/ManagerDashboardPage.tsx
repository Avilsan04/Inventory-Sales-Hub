import * as React from 'react';
import {
  DollarSignIcon,
  ShoppingBagIcon,
  ClockIcon,
  UsersRoundIcon,
  ArrowRightIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useManagerStats } from '@features/analytics/hooks/useManagerStats';
import { SaleDetailDrawer } from '@features/sales/components/SaleDetailDrawer';
import { SectionErrorBoundary } from '@app/providers';
import { Skeleton, Badge } from '@shared/ui/primitives';
import {
  WeeklySalesBarChart,
  SalesDonutChart,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { formatOrderId } from '@shared/lib/formatters';
import { APP_ROUTES } from '@shared/config/routes';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Sale } from '@entities/sale';
import styles from '@shared/styles/themes/pages/ManagerDashboard.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function statusVariant(status: string): BadgeVariant {
  const map: Partial<Record<SaleStatus, BadgeVariant>> = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'neutral',
  };
  return map[status as SaleStatus] ?? 'neutral';
}

function todayLabel(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

const SKELETON_ROWS = 5;

export function ManagerDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: me } = useAuthMe();
  const { navigateTo } = useRoutingAdapter();
  const {
    weeklyRevenue,
    weeklyOrders,
    pendingOrders,
    currency,
    salesPeriod,
    statusSlices,
    lowStockItems,
    recentSales,
    activeEmployees,
    totalEmployees,
    isLoading,
  } = useManagerStats();

  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);
  const firstName = me?.username.split(' ')[0] ?? '';

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['greeting']}>
            {t('managerDashboard.greeting')}, {firstName}
          </h1>
          <p className={styles['dateLabel']}>{todayLabel()}</p>
        </div>
      </header>

      {/* KPI strip */}
      <section className={styles['kpiGrid']} aria-label={t('dashboard.kpiAriaLabel')}>
        <div className={styles['kpiCard']}>
          <div
            className={`${styles['kpiCardBg']} ${styles['kpiCardBgPrimary']}`}
            aria-hidden="true"
          />
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconPrimary']}`}>
              <DollarSignIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('managerDashboard.kpi.weeklyRevenue')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? (
                <Skeleton className={styles['kpiSkeleton']} />
              ) : (
                formatCurrency(weeklyRevenue, currency)
              )}
            </div>
          </div>
        </div>

        <div className={styles['kpiCard']}>
          <div
            className={`${styles['kpiCardBg']} ${styles['kpiCardBgSuccess']}`}
            aria-hidden="true"
          />
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconSuccess']}`}>
              <ShoppingBagIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('managerDashboard.kpi.weeklyOrders')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : weeklyOrders}
            </div>
          </div>
        </div>

        <div className={styles['kpiCard']}>
          <div
            className={`${styles['kpiCardBg']} ${styles['kpiCardBgWarning']}`}
            aria-hidden="true"
          />
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconWarning']}`}>
              <ClockIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('managerDashboard.kpi.pendingOrders')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : pendingOrders}
            </div>
          </div>
        </div>

        <div className={styles['kpiCard']}>
          <div
            className={`${styles['kpiCardBg']} ${styles['kpiCardBgNeutral']}`}
            aria-hidden="true"
          />
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconNeutral']}`}>
              <UsersRoundIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('managerDashboard.kpi.team')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : activeEmployees}
            </div>
            {!isLoading && (
              <p className={styles['kpiSubtext']}>
                {t('managerDashboard.kpi.teamOf', { total: totalEmployees })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Charts */}
      <div className={styles['chartsGrid']}>
        <SectionErrorBoundary label={t('managerDashboard.salesTrend')}>
          <div className={styles['chartCard']}>
            <h3 className={styles['chartTitle']}>{t('managerDashboard.salesTrend')}</h3>
            <WeeklySalesBarChart data={salesPeriod} isLoading={isLoading} />
          </div>
        </SectionErrorBoundary>

        <SectionErrorBoundary label={t('managerDashboard.salesByStatus')}>
          <div className={styles['chartCard']}>
            <h3 className={styles['chartTitle']}>{t('managerDashboard.salesByStatus')}</h3>
            <SalesDonutChart data={statusSlices} isLoading={isLoading} />
          </div>
        </SectionErrorBoundary>
      </div>

      {/* Low stock alerts */}
      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>
            <AlertCircleIcon
              size={16}
              style={{ display: 'inline', marginRight: 6, color: 'var(--color-error)' }}
            />
            {t('managerDashboard.stockAlerts')}
          </h2>
          <button
            type="button"
            className={styles['viewAllBtn']}
            onClick={() => {
              navigateTo(APP_ROUTES.INVENTORY);
            }}
          >
            {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
          </button>
        </div>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles['alertRow']}>
              <Skeleton className={styles['skeletonRow']} />
            </div>
          ))
        ) : lowStockItems.length === 0 ? (
          <div className={styles['emptyCell']}>{t('common.noData')}</div>
        ) : (
          lowStockItems.map((item) => (
            <div key={item.itemId} className={styles['alertRow']}>
              <div>
                <p className={styles['alertName']}>{item.name}</p>
                <p className={styles['alertSku']}>{item.sku}</p>
              </div>
              <span className={styles['alertQty']}>
                {item.currentQuantity} {t('common.items')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Recent sales */}
      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>{t('managerDashboard.recentSales')}</h2>
          <button
            type="button"
            className={styles['viewAllBtn']}
            onClick={() => {
              navigateTo(APP_ROUTES.SALES);
            }}
          >
            {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('sales.orderId')}</TableHead>
              <TableHead>{t('sales.date')}</TableHead>
              <TableHead>{t('sales.total')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
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
                <TableRow
                  key={s.id}
                  className={styles['clickableRow']}
                  onClick={() => {
                    setDetailSale(s);
                  }}
                >
                  <TableCell className={styles['orderIdCell']}>{formatOrderId(s.id)}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat(undefined, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(s.createdAt))}
                  </TableCell>
                  <TableCell>{formatCurrency(s.total, s.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(s.status)} showDot>
                      {t(`sales.status.${s.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SaleDetailDrawer
        sale={detailSale}
        open={detailSale !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSale(null);
        }}
      />
    </div>
  );
}
