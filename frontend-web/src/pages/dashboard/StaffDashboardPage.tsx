import * as React from 'react';
import {
  DollarSignIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  MonitorIcon,
  ListOrderedIcon,
  PackageIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useStaffStats } from '@features/analytics/hooks/useStaffStats';
import { SaleDetailDrawer } from '@features/sales/components/SaleDetailDrawer';
import { OpenCashSessionDialog } from '@features/sales/components/OpenCashSessionDialog';
import { CloseCashSessionDialog } from '@features/sales/components/CloseCashSessionDialog';
import { isStaleSession } from '@features/sales/lib/sessionUtils';
import { Skeleton, Badge, Button } from '@shared/ui/primitives';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui/composed';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { formatOrderId } from '@shared/lib/formatters';
import { APP_ROUTES } from '@shared/config/routes';
import type { BadgeVariant } from '@shared/ui/primitives';
import type { Sale } from '@entities/sale';
import styles from '@shared/styles/themes/pages/StaffDashboard.module.scss';

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

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso)
  );
}

const SKELETON_ROWS = 5;

export function StaffDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: me } = useAuthMe();
  const { navigateTo } = useRoutingAdapter();
  const {
    cashSession,
    sessionRevenue,
    sessionOrderCount,
    lowStockItems,
    recentSales,
    currency,
    isLoading,
  } = useStaffStats();

  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);
  const [openDialogOpen, setOpenDialogOpen] = React.useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = React.useState(false);

  const firstName = me?.username.split(' ')[0] ?? '';
  const sessionOpen = cashSession?.status === 'open';
  const stale = cashSession != null && sessionOpen && isStaleSession(cashSession.openedAt);
  const expectedBalance = cashSession != null ? cashSession.openingBalance + sessionRevenue : 0;

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['greeting']}>
            {t('staffDashboard.greeting')}, {firstName}
          </h1>
          <p className={styles['dateLabel']}>{todayLabel()}</p>
        </div>
      </header>

      {/* Operational strip: session card + 2 stat cards */}
      <section className={styles['operationalGrid']} aria-label={t('dashboard.kpiAriaLabel')}>
        {/* Session card */}
        <div
          className={`${styles['sessionCard']} ${
            sessionOpen ? styles['sessionCardOpen'] : styles['sessionCardClosed']
          }`}
        >
          <div className={styles['sessionStatus']}>
            <span
              className={`${styles['sessionStatusDot']} ${
                sessionOpen ? styles['sessionStatusDotOpen'] : styles['sessionStatusDotClosed']
              }`}
            />
            {sessionOpen ? t('staffDashboard.session.open') : t('staffDashboard.session.closed')}
          </div>
          <p className={styles['sessionTitle']}>{t('staffDashboard.session.title')}</p>

          {cashSession != null ? (
            <>
              <p className={styles['sessionBalance']}>
                {formatCurrency(expectedBalance, currency)}
              </p>
              <p className={styles['sessionOpenedAt']}>
                {t('staffDashboard.session.expectedBalance')}
              </p>
              <p className={styles['sessionDetail']}>
                {t('staffDashboard.session.openedWith', {
                  amount: formatCurrency(cashSession.openingBalance, currency),
                })}
              </p>
              <p className={styles['sessionDetail']}>
                {t('staffDashboard.session.openedAt', { time: formatTime(cashSession.openedAt) })}
              </p>
              {stale && (
                <p className={styles['sessionStaleWarning']}>
                  <TriangleAlertIcon size={14} aria-hidden="true" />
                  {t('staffDashboard.session.staleWarning')}
                </p>
              )}
              <Button
                size="sm"
                variant={stale ? 'destructive' : 'outline'}
                onClick={() => {
                  setCloseDialogOpen(true);
                }}
              >
                {stale
                  ? t('staffDashboard.session.closePreviousShift')
                  : t('staffDashboard.session.closeShift')}
              </Button>
            </>
          ) : (
            <>
              <p className={styles['sessionDetail']}>{t('staffDashboard.session.noSession')}</p>
              <Button
                size="sm"
                onClick={() => {
                  setOpenDialogOpen(true);
                }}
              >
                {t('staffDashboard.session.openShift')}
              </Button>
            </>
          )}
        </div>

        {/* Session revenue stat */}
        <div className={styles['statCard']}>
          <div
            className={`${styles['statCardBg']} ${styles['statCardBgPrimary']}`}
            aria-hidden="true"
          />
          <div className={styles['statTopRow']}>
            <div className={`${styles['statIconContainer']} ${styles['statIconPrimary']}`}>
              <DollarSignIcon />
            </div>
          </div>
          <div>
            <p className={styles['statLabel']}>{t('staffDashboard.kpi.sessionRevenue')}</p>
            <div className={styles['statValue']}>
              {isLoading ? (
                <Skeleton className={styles['statSkeleton']} />
              ) : (
                formatCurrency(sessionRevenue, currency)
              )}
            </div>
            {!isLoading && (
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}
              >
                {sessionOrderCount} {t('staffDashboard.kpi.sessionOrders')}
              </p>
            )}
          </div>
        </div>

        {/* Low stock count stat */}
        <div className={styles['statCard']}>
          <div
            className={`${styles['statCardBg']} ${styles['statCardBgError']}`}
            aria-hidden="true"
          />
          <div className={styles['statTopRow']}>
            <div className={`${styles['statIconContainer']} ${styles['statIconError']}`}>
              <AlertCircleIcon />
            </div>
          </div>
          <div>
            <p className={styles['statLabel']}>{t('staffDashboard.kpi.lowStock')}</p>
            <div className={styles['statValue']}>
              {isLoading ? <Skeleton className={styles['statSkeleton']} /> : lowStockItems.length}
            </div>
            {!isLoading && (
              <p
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  margin: 0,
                }}
              >
                {t('common.items')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Recent sales */}
      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>{t('staffDashboard.recentSales')}</h2>
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
                      hour: '2-digit',
                      minute: '2-digit',
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

      {/* Critical stock */}
      {lowStockItems.length > 0 && (
        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('staffDashboard.stockAlerts')}</h2>
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
          {lowStockItems.map((item) => (
            <div key={item.id} className={styles['stockRow']}>
              <div>
                <p className={styles['stockName']}>{item.name}</p>
                <p className={styles['stockSku']}>{item.sku}</p>
              </div>
              <span className={styles['stockQty']}>
                {item.quantity} {t('common.items')}
              </span>
            </div>
          ))}
        </div>
      )}

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
              navigateTo(APP_ROUTES.POS);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <MonitorIcon />
            </div>
            <p className={styles['quickActionLabel']}>{t('staffDashboard.actions.pos')}</p>
            <p className={styles['quickActionDesc']}>{t('staffDashboard.actions.posDesc')}</p>
          </button>

          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.SALES);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <ListOrderedIcon />
            </div>
            <p className={styles['quickActionLabel']}>{t('staffDashboard.actions.sales')}</p>
            <p className={styles['quickActionDesc']}>{t('staffDashboard.actions.salesDesc')}</p>
          </button>

          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.INVENTORY);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <PackageIcon />
            </div>
            <p className={styles['quickActionLabel']}>{t('staffDashboard.actions.inventory')}</p>
            <p className={styles['quickActionDesc']}>{t('staffDashboard.actions.inventoryDesc')}</p>
          </button>
        </div>
      </div>

      <SaleDetailDrawer
        sale={detailSale}
        open={detailSale !== null}
        onOpenChange={(open) => {
          if (!open) setDetailSale(null);
        }}
      />

      <OpenCashSessionDialog open={openDialogOpen} onOpenChange={setOpenDialogOpen} />

      {cashSession != null && (
        <CloseCashSessionDialog
          session={cashSession}
          open={closeDialogOpen}
          onOpenChange={setCloseDialogOpen}
        />
      )}
    </div>
  );
}
