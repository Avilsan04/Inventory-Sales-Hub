import * as React from 'react';
import {
  DollarSignIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  MonitorIcon,
  ListOrderedIcon,
  PackageIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStaffStats } from '@features/analytics';
import {
  SaleDetailDrawer,
  OpenCashSessionDialog,
  CloseCashSessionDialog,
  isStaleSession,
} from '@features/sales';
import type { CashSession } from '@entities/cash-session';
import { KpiCard, Skeleton, Badge, Button } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui';
import { formatCurrency, formatOrderId, formatTimeLocale } from '@shared/lib';
import { APP_ROUTES } from '@shared/config';
import { useRoutingAdapter, useTranslationAdapter } from '@adapters';
import { DashboardShell, DashboardHeader, DashboardQuickActions } from '@widgets/dashboard';
import type { QuickAction } from '@widgets/dashboard';
import type { Sale } from '@entities/sale';
import { getSaleStatusBadgeVariant } from '@entities/sale';
import styles from '@shared/styles/themes/pages/StaffDashboard.module.scss';

interface CashSessionCardProps {
  cashSession: CashSession | null | undefined;
  sessionRevenue: number;
  currency: string;
  locale: string;
  onOpen: () => void;
  onClose: () => void;
}

function CashSessionCard({
  cashSession,
  sessionRevenue,
  currency,
  locale,
  onOpen,
  onClose,
}: CashSessionCardProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const sessionOpen = cashSession?.status === 'open';
  const stale = cashSession != null && sessionOpen && isStaleSession(cashSession.openedAt);
  const expectedBalance = cashSession != null ? cashSession.openingBalance + sessionRevenue : 0;

  return (
    <div
      className={cn(
        styles['sessionCard'],
        sessionOpen ? styles['sessionCardOpen'] : styles['sessionCardClosed']
      )}
    >
      <div className={styles['sessionStatus']}>
        <span
          className={cn(
            styles['sessionStatusDot'],
            sessionOpen ? styles['sessionStatusDotOpen'] : styles['sessionStatusDotClosed']
          )}
        />
        {sessionOpen ? t('staffDashboard.session.open') : t('staffDashboard.session.closed')}
      </div>
      <p className={styles['sessionTitle']}>{t('staffDashboard.session.title')}</p>
      {cashSession != null ? (
        <>
          <p className={styles['sessionBalance']}>{formatCurrency(expectedBalance, currency)}</p>
          <p className={styles['sessionOpenedAt']}>{t('staffDashboard.session.expectedBalance')}</p>
          <p className={styles['sessionDetail']}>
            {t('staffDashboard.session.openedWith', {
              amount: formatCurrency(cashSession.openingBalance, currency),
            })}
          </p>
          <p className={styles['sessionDetail']}>
            {t('staffDashboard.session.openedAt', {
              time: formatTimeLocale(cashSession.openedAt, locale),
            })}
          </p>
          {stale && (
            <p className={styles['sessionStaleWarning']}>
              {t('staffDashboard.session.staleWarning')}
            </p>
          )}
          <Button size="sm" variant={stale ? 'destructive' : 'outline'} onClick={onClose}>
            {stale
              ? t('staffDashboard.session.closePreviousShift')
              : t('staffDashboard.session.closeShift')}
          </Button>
        </>
      ) : (
        <>
          <p className={styles['sessionDetail']}>{t('staffDashboard.session.noSession')}</p>
          <Button size="sm" onClick={onOpen}>
            {t('staffDashboard.session.openShift')}
          </Button>
        </>
      )}
    </div>
  );
}

const SKELETON_ROWS = 5;

export function StaffDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
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

  const quickActions: QuickAction[] = [
    {
      icon: <MonitorIcon />,
      labelKey: 'staffDashboard.actions.pos',
      descKey: 'staffDashboard.actions.posDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.POS);
      },
    },
    {
      icon: <ListOrderedIcon />,
      labelKey: 'staffDashboard.actions.sales',
      descKey: 'staffDashboard.actions.salesDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.SALES);
      },
    },
    {
      icon: <PackageIcon />,
      labelKey: 'staffDashboard.actions.inventory',
      descKey: 'staffDashboard.actions.inventoryDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.INVENTORY);
      },
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader greetingKey="staffDashboard.greeting" />

      <DashboardShell.KpiGrid aria-label={t('dashboard.kpiAriaLabel')}>
        <CashSessionCard
          cashSession={cashSession}
          sessionRevenue={sessionRevenue}
          currency={currency}
          locale={i18n.language}
          onOpen={(): void => {
            setOpenDialogOpen(true);
          }}
          onClose={(): void => {
            setCloseDialogOpen(true);
          }}
        />
        <KpiCard
          label={t('staffDashboard.kpi.sessionRevenue')}
          icon={<DollarSignIcon />}
          accent="primary"
          isLoading={isLoading}
          value={formatCurrency(sessionRevenue, currency)}
          subtext={`${sessionOrderCount} ${t('staffDashboard.kpi.sessionOrders')}`}
        />
        <KpiCard
          label={t('staffDashboard.kpi.lowStock')}
          icon={<AlertCircleIcon />}
          accent="error"
          isLoading={isLoading}
          value={lowStockItems.length}
          subtext={t('common.items')}
        />
      </DashboardShell.KpiGrid>

      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>{t('staffDashboard.recentSales')}</h2>
          <Button
            variant="ghost"
            size="sm"
            className={styles['viewAllBtn']}
            onClick={(): void => {
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
                  tabIndex={0}
                  onClick={(): void => {
                    setDetailSale(s);
                  }}
                  onKeyDown={(e): void => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDetailSale(s);
                    }
                  }}
                >
                  <TableCell className={styles['orderIdCell']}>{formatOrderId(s.id)}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat(i18n.language, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
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

      {lowStockItems.length > 0 && (
        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('staffDashboard.stockAlerts')}</h2>
            <Button
              variant="ghost"
              size="sm"
              className={styles['viewAllBtn']}
              onClick={(): void => {
                navigateTo(APP_ROUTES.INVENTORY);
              }}
            >
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </Button>
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

      <DashboardQuickActions actions={quickActions} />

      <SaleDetailDrawer
        sale={detailSale}
        open={detailSale !== null}
        onOpenChange={(open): void => {
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
    </DashboardShell>
  );
}
