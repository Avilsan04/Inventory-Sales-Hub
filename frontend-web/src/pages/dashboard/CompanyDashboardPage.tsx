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
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useCompanyStats } from '@features/analytics/hooks/useCompanyStats';
import { SectionErrorBoundary } from '@app/providers';
import { Skeleton } from '@shared/ui/primitives';
import {
  RevenueAreaChart,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { APP_ROUTES } from '@shared/config/routes';
import styles from '@shared/styles/themes/pages/CompanyDashboard.module.scss';

function todayLabel(): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

const SKELETON_ROWS = 5;

export function CompanyDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: me } = useAuthMe();
  const { navigateTo } = useRoutingAdapter();
  const {
    totalRevenue,
    revenueGrowth,
    totalOrders,
    ordersGrowth,
    totalCustomers,
    currency,
    topProducts,
    topCustomers,
    salesPeriod,
    activeEmployees,
    totalEmployees,
    isLoading,
  } = useCompanyStats();

  const firstName = me?.username.split(' ')[0] ?? '';

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['greeting']}>
            {t('companyDashboard.greeting')}, {firstName}
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
            <p className={styles['kpiLabel']}>{t('companyDashboard.kpi.revenue')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? (
                <Skeleton className={styles['kpiSkeleton']} />
              ) : (
                formatCurrency(totalRevenue, currency)
              )}
            </div>
            {!isLoading && (
              <div
                className={`${styles['kpiGrowth']} ${
                  revenueGrowth >= 0 ? styles['kpiGrowthPositive'] : styles['kpiGrowthNegative']
                }`}
              >
                {revenueGrowth >= 0 ? <TrendingUpIcon size={12} /> : <TrendingDownIcon size={12} />}
                {Math.abs(revenueGrowth).toFixed(1)}% {t('dashboard.vsLastMonth')}
              </div>
            )}
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
            <p className={styles['kpiLabel']}>{t('companyDashboard.kpi.orders')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : totalOrders}
            </div>
            {!isLoading && (
              <div
                className={`${styles['kpiGrowth']} ${
                  ordersGrowth >= 0 ? styles['kpiGrowthPositive'] : styles['kpiGrowthNegative']
                }`}
              >
                {ordersGrowth >= 0 ? <TrendingUpIcon size={12} /> : <TrendingDownIcon size={12} />}
                {Math.abs(ordersGrowth).toFixed(1)}% {t('dashboard.vsLastMonth')}
              </div>
            )}
          </div>
        </div>

        <div className={styles['kpiCard']}>
          <div
            className={`${styles['kpiCardBg']} ${styles['kpiCardBgNeutral']}`}
            aria-hidden="true"
          />
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconNeutral']}`}>
              <UsersIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('companyDashboard.kpi.customers')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : totalCustomers}
            </div>
          </div>
        </div>

        <div className={styles['kpiCard']}>
          <div
            className={`${styles['kpiCardBg']} ${styles['kpiCardBgPurple']}`}
            aria-hidden="true"
          />
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconPurple']}`}>
              <UsersRoundIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('companyDashboard.kpi.employees')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : activeEmployees}
            </div>
            {!isLoading && (
              <p className={styles['kpiSubtext']}>
                {t('companyDashboard.kpi.employeesOf', { total: totalEmployees })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Revenue chart */}
      <SectionErrorBoundary label={t('companyDashboard.revenueChart')}>
        <div className={styles['chartCard']}>
          <div className={styles['chartHeader']}>
            <h2 className={styles['chartTitle']}>{t('companyDashboard.revenueChart')}</h2>
          </div>
          <RevenueAreaChart data={salesPeriod} isLoading={isLoading} />
        </div>
      </SectionErrorBoundary>

      {/* Top products + top customers */}
      <div className={styles['tablesGrid']}>
        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('companyDashboard.topProducts')}</h2>
            <button
              type="button"
              className={styles['viewAllBtn']}
              onClick={() => {
                navigateTo(APP_ROUTES.ANALYTICS);
              }}
            >
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </button>
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
                        className={`${styles['rankBadge']} ${
                          i === 0
                            ? styles['rankOne']
                            : i === 1
                              ? styles['rankTwo']
                              : i === 2
                                ? styles['rankThree']
                                : ''
                        }`}
                      >
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell>{p.totalSold}</TableCell>
                    <TableCell>{formatCurrency(p.revenue, currency)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('companyDashboard.topCustomers')}</h2>
            <button
              type="button"
              className={styles['viewAllBtn']}
              onClick={() => {
                navigateTo(APP_ROUTES.CUSTOMERS);
              }}
            >
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </button>
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
                        className={`${styles['rankBadge']} ${
                          i === 0
                            ? styles['rankOne']
                            : i === 1
                              ? styles['rankTwo']
                              : i === 2
                                ? styles['rankThree']
                                : ''
                        }`}
                      >
                        {i + 1}
                      </span>
                    </TableCell>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell>{c.totalOrders}</TableCell>
                    <TableCell>{formatCurrency(c.totalSpent, currency)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>{t('dashboard.quickActions.title')}</h2>
        </div>
        <div className={styles['quickActions']}>
          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.ANALYTICS);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <BarChart2Icon />
            </div>
            <p className={styles['quickActionLabel']}>{t('companyDashboard.actions.analytics')}</p>
            <p className={styles['quickActionDesc']}>
              {t('companyDashboard.actions.analyticsDesc')}
            </p>
          </button>

          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.EMPLOYEES);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <UsersRoundIcon />
            </div>
            <p className={styles['quickActionLabel']}>{t('companyDashboard.actions.employees')}</p>
            <p className={styles['quickActionDesc']}>
              {t('companyDashboard.actions.employeesDesc')}
            </p>
          </button>

          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.SUPPLIERS);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <TruckIcon />
            </div>
            <p className={styles['quickActionLabel']}>{t('companyDashboard.actions.suppliers')}</p>
            <p className={styles['quickActionDesc']}>
              {t('companyDashboard.actions.suppliersDesc')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
