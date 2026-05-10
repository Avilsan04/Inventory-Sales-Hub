import * as React from 'react';
import {
  ArrowRightIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  AlertCircleIcon,
  UsersRoundIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useDashboardStats } from '@features/analytics';
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
  EmptyState,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@shared/ui/composed';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { APP_ROUTES } from '@shared/config/routes';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { formatOrderId } from '@shared/lib/formatters';
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

export function DashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { navigateTo } = useRoutingAdapter();
  const {
    kpi,
    kpiLoading,
    alerts,
    salesPeriod,
    periodLoading,
    recentSales,
    salesLoading,
    customerMap,
    statusSlices,
  } = useDashboardStats();

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['title']}>{t('dashboard.title')}</h1>
          <p className={styles['subtitle']}>{t('topbar.subtitle.dashboard')}</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" size="sm" disabled>
                  {t('dashboard.exportReport')}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t('common.comingSoon')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>

      {/* KPI row */}
      <section className={styles['kpiGrid']} aria-label={t('dashboard.kpiAriaLabel')}>
        {/* Monthly revenue + growth */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentPrimary']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconPrimary']}`}>
              <DollarSignIcon />
            </div>
          </div>
          <div>
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
            {kpiLoading ? (
              <Skeleton className={styles['kpiGrowthSkeleton']} />
            ) : kpi ? (
              <p
                className={
                  kpi.revenueGrowth >= 0 ? styles['kpiGrowthPositive'] : styles['kpiGrowthNegative']
                }
              >
                {kpi.revenueGrowth >= 0 ? (
                  <TrendingUpIcon size={12} aria-hidden="true" />
                ) : (
                  <TrendingDownIcon size={12} aria-hidden="true" />
                )}{' '}
                {Math.abs(kpi.revenueGrowth).toFixed(1)}% {t('dashboard.stats.vsLastMonth')}
              </p>
            ) : null}
          </div>
        </div>

        {/* Active orders + growth */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentNeutral']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconNeutral']}`}>
              <ShoppingCartIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('dashboard.stats.activeOrders')}</p>
            <div className={styles['kpiValue']}>
              {kpiLoading ? (
                <Skeleton className={styles['kpiSkeleton']} />
              ) : (
                (kpi?.totalOrders ?? '—')
              )}
            </div>
            {!kpiLoading && kpi && (
              <p
                className={
                  kpi.ordersGrowth >= 0 ? styles['kpiGrowthPositive'] : styles['kpiGrowthNegative']
                }
              >
                {kpi.ordersGrowth >= 0 ? (
                  <TrendingUpIcon size={12} aria-hidden="true" />
                ) : (
                  <TrendingDownIcon size={12} aria-hidden="true" />
                )}{' '}
                {Math.abs(kpi.ordersGrowth).toFixed(1)}% {t('dashboard.stats.vsLastMonth')}
              </p>
            )}
          </div>
        </div>

        {/* Total customers */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentSuccess']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconNeutral']}`}>
              <UsersRoundIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('dashboard.stats.totalCustomers')}</p>
            <div className={styles['kpiValue']}>
              {kpiLoading ? (
                <Skeleton className={styles['kpiSkeleton']} />
              ) : (
                (kpi?.totalCustomers ?? '—')
              )}
            </div>
          </div>
        </div>

        {/* Low stock alerts */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentError']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconError']}`}>
              <AlertCircleIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('dashboard.stats.lowStock')}</p>
            <div
              className={`${styles['kpiValue']}${alerts?.length ? ` ${styles['kpiValueError']}` : ''}`}
            >
              {alerts?.length ?? 0} {t('common.items')}
            </div>
          </div>
        </div>
      </section>

      {/* C-level widgets — admin/company/manager only */}
      <PermissionGuard permission="view:analytics">
        <section className={styles['widgetGrid']}>
          <SectionErrorBoundary label={t('dashboard.section.cashFlow')}>
            <CashFlowWidget />
          </SectionErrorBoundary>
          <SectionErrorBoundary label={t('dashboard.section.inventoryValue')}>
            <InventoryValueWidget />
          </SectionErrorBoundary>
          <SectionErrorBoundary label={t('dashboard.section.topProducts')}>
            <TopProfitableWidget />
          </SectionErrorBoundary>
          <SectionErrorBoundary label={t('dashboard.section.wasteAlerts')}>
            <WasteAlertsWidget />
          </SectionErrorBoundary>
        </section>
      </PermissionGuard>

      {/* Charts */}
      <div className={styles['chartsGrid']}>
        <SectionErrorBoundary label={t('dashboard.section.weeklySalesChart')}>
          <div className={styles['chartCard']}>
            <div className={styles['chartCardHeader']}>
              <h3 className={styles['chartTitle']}>{t('dashboard.weeklySales')}</h3>
            </div>
            <WeeklySalesBarChart data={salesPeriod} isLoading={periodLoading} />
          </div>
        </SectionErrorBoundary>

        <SectionErrorBoundary label={t('dashboard.section.salesByStatusChart')}>
          <div className={styles['chartCard']}>
            <div className={styles['chartCardHeader']}>
              <h3 className={styles['chartTitle']}>{t('dashboard.salesByStatus')}</h3>
            </div>
            <SalesDonutChart data={statusSlices} isLoading={salesLoading} />
          </div>
        </SectionErrorBoundary>
      </div>

      {/* Recent transactions */}
      <SectionErrorBoundary label={t('dashboard.section.recentTransactionsSection')}>
        <div className={styles['transactionsCard']}>
          <div className={styles['transactionsHeader']}>
            <h3 className={styles['transactionsTitle']}>{t('dashboard.recentTransactions')}</h3>
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
                <TableHead>{t('dashboard.cols.order')}</TableHead>
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
                  <TableCell colSpan={4}>
                    <EmptyState icon={<ShoppingCartIcon size={24} />} title={t('common.noData')} />
                  </TableCell>
                </TableRow>
              ) : (
                recentSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className={styles['orderIdLink']}>{formatOrderId(s.id)}</TableCell>
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
