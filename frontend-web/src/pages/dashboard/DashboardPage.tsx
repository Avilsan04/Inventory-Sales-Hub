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
import { KpiCard, Skeleton, Badge, Button } from '@shared/ui';
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
} from '@shared/ui';
import { useRoutingAdapter } from '@adapters';
import { APP_ROUTES } from '@shared/config';
import { formatCurrency, formatOrderId } from '@shared/lib';
import type { BadgeVariant } from '@shared/ui';
import styles from '@shared/styles/themes/pages/Dashboard.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

const SALE_STATUS_BADGE: Partial<Record<SaleStatus, BadgeVariant>> = {
  completed: 'success',
  pending: 'neutral',
  cancelled: 'destructive',
};

function saleStatusBadge(status: string): BadgeVariant {
  return SALE_STATUS_BADGE[status as SaleStatus] ?? 'neutral';
}

function GrowthLabel({ growth, label }: { growth: number; label: string }): React.ReactElement {
  const positive = growth >= 0;
  return (
    <p className={positive ? styles['kpiGrowthPositive'] : styles['kpiGrowthNegative']}>
      {positive ? (
        <TrendingUpIcon size={12} aria-hidden="true" />
      ) : (
        <TrendingDownIcon size={12} aria-hidden="true" />
      )}{' '}
      {Math.abs(growth).toFixed(1)}% {label}
    </p>
  );
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

      <section className={styles['kpiGrid']} aria-label={t('dashboard.kpiAriaLabel')}>
        <KpiCard
          label={t('dashboard.stats.monthlySales')}
          icon={<DollarSignIcon />}
          accent="primary"
          isLoading={kpiLoading}
          value={kpi ? formatCurrency(kpi.totalRevenue, kpi.currency) : '—'}
          subtext={
            kpi ? (
              <GrowthLabel growth={kpi.revenueGrowth} label={t('dashboard.stats.vsLastMonth')} />
            ) : undefined
          }
        />
        <KpiCard
          label={t('dashboard.stats.activeOrders')}
          icon={<ShoppingCartIcon />}
          accent="neutral"
          isLoading={kpiLoading}
          value={kpi?.totalOrders ?? '—'}
          subtext={
            kpi ? (
              <GrowthLabel growth={kpi.ordersGrowth} label={t('dashboard.stats.vsLastMonth')} />
            ) : undefined
          }
        />
        <KpiCard
          label={t('dashboard.stats.totalCustomers')}
          icon={<UsersRoundIcon />}
          accent="success"
          isLoading={kpiLoading}
          value={kpi?.totalCustomers ?? '—'}
        />
        <KpiCard
          label={t('dashboard.stats.lowStock')}
          icon={<AlertCircleIcon />}
          accent="error"
          isLoading={kpiLoading}
          value={`${String(alerts?.length ?? 0)} ${t('common.items')}`}
        />
      </section>

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

      <SectionErrorBoundary label={t('dashboard.section.recentTransactionsSection')}>
        <div className={styles['transactionsCard']}>
          <div className={styles['transactionsHeader']}>
            <h3 className={styles['transactionsTitle']}>{t('dashboard.recentTransactions')}</h3>
            <button
              type="button"
              className={styles['viewAllBtn']}
              onClick={(): void => {
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
