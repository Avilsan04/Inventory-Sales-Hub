import * as React from 'react';
import {
  DollarSignIcon,
  ShoppingBagIcon,
  ClockIcon,
  UsersRoundIcon,
  ArrowRightIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useManagerStats } from '@features/analytics';
import { SaleDetailDrawer } from '@features/sales';
import { SectionErrorBoundary } from '@app/providers';
import { KpiCard, Skeleton, Badge, Button } from '@shared/ui';
import {
  WeeklySalesBarChart,
  SalesDonutChart,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui';
import { formatCurrency, formatOrderId } from '@shared/lib';
import { APP_ROUTES } from '@shared/config';
import { useRoutingAdapter, useTranslationAdapter } from '@adapters';
import { DashboardShell, DashboardHeader } from '@widgets/dashboard';
import type { Sale } from '@entities/sale';
import { getSaleStatusBadgeVariant } from '@entities/sale';
import styles from '@shared/styles/themes/pages/ManagerDashboard.module.scss';

const SKELETON_ROWS = 5;

export function ManagerDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
  const { navigateTo } = useRoutingAdapter();
  const {
    weeklyRevenue,
    weeklyOrders,
    pendingOrders,
    completedOrders,
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

  return (
    <DashboardShell>
      <DashboardHeader greetingKey="managerDashboard.greeting" />

      <DashboardShell.KpiGrid aria-label={t('dashboard.kpiAriaLabel')}>
        <KpiCard
          label={t('managerDashboard.kpi.weeklyRevenue')}
          icon={<DollarSignIcon />}
          accent="primary"
          isLoading={isLoading}
          value={formatCurrency(weeklyRevenue, currency)}
        />
        <KpiCard
          label={t('managerDashboard.kpi.weeklyOrders')}
          icon={<ShoppingBagIcon />}
          accent="success"
          isLoading={isLoading}
          value={weeklyOrders}
        />
        <KpiCard
          label={t('managerDashboard.kpi.pendingOrders')}
          icon={<ClockIcon />}
          accent="warning"
          isLoading={isLoading}
          value={pendingOrders}
          subtext={t('managerDashboard.kpi.completedOrders', { count: completedOrders })}
        />
        <KpiCard
          label={t('managerDashboard.kpi.team')}
          icon={<UsersRoundIcon />}
          accent="neutral"
          isLoading={isLoading}
          value={activeEmployees}
          subtext={t('managerDashboard.kpi.teamOf', { total: totalEmployees })}
        />
      </DashboardShell.KpiGrid>

      <DashboardShell.ChartsGrid>
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
      </DashboardShell.ChartsGrid>

      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>
            <AlertCircleIcon size={16} aria-hidden="true" className={styles['alertIcon']} />
            {t('managerDashboard.stockAlerts')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className={styles['viewAllBtn']}
            onClick={() => {
              navigateTo(APP_ROUTES.INVENTORY);
            }}
          >
            {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
          </Button>
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

      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>{t('managerDashboard.recentSales')}</h2>
          <Button
            variant="ghost"
            size="sm"
            className={styles['viewAllBtn']}
            onClick={() => {
              navigateTo(APP_ROUTES.SALES);
            }}
          >
            {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
          </Button>
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
                    {new Intl.DateTimeFormat(i18n.language, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(s.createdAt))}
                  </TableCell>
                  <TableCell>{formatCurrency(s.total, s.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={getSaleStatusBadgeVariant(s.status)} showDot>
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
    </DashboardShell>
  );
}
