import * as React from 'react';
import {
  DollarSignIcon,
  ShoppingBagIcon,
  UsersIcon,
  UsersRoundIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon,
  BarChart2Icon,
  TruckIcon,
} from 'lucide-react';
import { useCompanyStats } from '@features/analytics';
import { SectionErrorBoundary } from '@app/providers';
import { KpiCard, Skeleton, Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import {
  RevenueAreaChart,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui';
import { useFormatCurrency } from '@shared/lib';
import { APP_ROUTES } from '@shared/config';
import { useRoutingAdapter, useTranslationAdapter } from '@adapters';
import { DashboardShell, DashboardHeader, DashboardQuickActions } from '@widgets/dashboard';
import type { QuickAction } from '@widgets/dashboard';
import styles from '@shared/styles/themes/pages/CompanyDashboard.module.scss';

const SKELETON_ROWS = 5;

function GrowthBadge({ growth, vsKey }: { growth: number; vsKey: string }): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const positive = growth >= 0;
  return (
    <div
      className={cn(
        styles['kpiGrowth'],
        positive ? styles['kpiGrowthPositive'] : styles['kpiGrowthNegative']
      )}
    >
      {positive ? (
        <TrendingUpIcon size={12} aria-hidden="true" />
      ) : (
        <TrendingDownIcon size={12} aria-hidden="true" />
      )}
      {Math.abs(growth).toFixed(1)}% {t(vsKey)}
    </div>
  );
}

export function CompanyDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const fmt = useFormatCurrency();
  const { navigateTo } = useRoutingAdapter();
  const {
    totalRevenue,
    revenueGrowth,
    totalOrders,
    ordersGrowth,
    totalCustomers,
    topProducts,
    topCustomers,
    currency,
    salesPeriod,
    activeEmployees,
    totalEmployees,
    isLoading,
  } = useCompanyStats();

  const quickActions: QuickAction[] = [
    {
      icon: <BarChart2Icon />,
      labelKey: 'companyDashboard.actions.analytics',
      descKey: 'companyDashboard.actions.analyticsDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.ANALYTICS);
      },
    },
    {
      icon: <UsersRoundIcon />,
      labelKey: 'companyDashboard.actions.employees',
      descKey: 'companyDashboard.actions.employeesDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.EMPLOYEES);
      },
    },
    {
      icon: <TruckIcon />,
      labelKey: 'companyDashboard.actions.suppliers',
      descKey: 'companyDashboard.actions.suppliersDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.SUPPLIERS);
      },
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader greetingKey="companyDashboard.greeting" />

      <DashboardShell.KpiGrid aria-label={t('dashboard.kpiAriaLabel')}>
        <KpiCard
          label={t('companyDashboard.kpi.revenue')}
          icon={<DollarSignIcon />}
          accent="primary"
          isLoading={isLoading}
          value={fmt(totalRevenue)}
          subtext={<GrowthBadge growth={revenueGrowth} vsKey="dashboard.vsLastMonth" />}
        />
        <KpiCard
          label={t('companyDashboard.kpi.orders')}
          icon={<ShoppingBagIcon />}
          accent="success"
          isLoading={isLoading}
          value={totalOrders}
          subtext={<GrowthBadge growth={ordersGrowth} vsKey="dashboard.vsLastMonth" />}
        />
        <KpiCard
          label={t('companyDashboard.kpi.customers')}
          icon={<UsersIcon />}
          accent="neutral"
          isLoading={isLoading}
          value={totalCustomers}
        />
        <KpiCard
          label={t('companyDashboard.kpi.employees')}
          icon={<UsersRoundIcon />}
          accent="purple"
          isLoading={isLoading}
          value={activeEmployees}
          subtext={t('companyDashboard.kpi.employeesOf', { total: totalEmployees })}
        />
      </DashboardShell.KpiGrid>

      <SectionErrorBoundary label={t('companyDashboard.revenueChart')}>
        <div className={styles['chartCard']}>
          <div className={styles['chartHeader']}>
            <h2 className={styles['chartTitle']}>{t('companyDashboard.revenueChart')}</h2>
          </div>
          <RevenueAreaChart data={salesPeriod} isLoading={isLoading} currency={currency} />
        </div>
      </SectionErrorBoundary>

      <DashboardShell.TablesGrid>
        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('companyDashboard.topProducts')}</h2>
            <Button
              variant="ghost"
              size="sm"
              className={styles['viewAllBtn']}
              onClick={() => {
                navigateTo(APP_ROUTES.ANALYTICS);
              }}
            >
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('companyDashboard.cols.product')}</TableHead>
                <TableHead>{t('companyDashboard.cols.sold')}</TableHead>
                <TableHead>{t('companyDashboard.cols.revenue')}</TableHead>
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
              ) : topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles['emptyCell']}>
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.slice(0, 5).map((p, i) => (
                  <TableRow key={p.productId}>
                    <TableCell>
                      <span
                        className={cn(
                          styles['rankBadge'],
                          i === 0
                            ? styles['rankOne']
                            : i === 1
                              ? styles['rankTwo']
                              : i === 2
                                ? styles['rankThree']
                                : undefined
                        )}
                      >
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell>{p.totalSold}</TableCell>
                    <TableCell>{fmt(p.revenue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('companyDashboard.topCustomers')}</h2>
            <Button
              variant="ghost"
              size="sm"
              className={styles['viewAllBtn']}
              onClick={() => {
                navigateTo(APP_ROUTES.CUSTOMERS);
              }}
            >
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t('companyDashboard.cols.customer')}</TableHead>
                <TableHead>{t('companyDashboard.cols.orders')}</TableHead>
                <TableHead>{t('companyDashboard.cols.spent')}</TableHead>
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
              ) : topCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className={styles['emptyCell']}>
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                topCustomers.slice(0, 5).map((c, i) => (
                  <TableRow key={c.customerId}>
                    <TableCell>
                      <span
                        className={cn(
                          styles['rankBadge'],
                          i === 0
                            ? styles['rankOne']
                            : i === 1
                              ? styles['rankTwo']
                              : i === 2
                                ? styles['rankThree']
                                : undefined
                        )}
                      >
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell>{c.totalOrders}</TableCell>
                    <TableCell>{fmt(c.totalSpent)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DashboardShell.TablesGrid>

      <DashboardQuickActions actions={quickActions} />
    </DashboardShell>
  );
}
