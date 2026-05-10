import * as React from 'react';
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowRightIcon,
  StoreIcon,
  ListOrderedIcon,
  ShoppingCartIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCustomerStats } from '@features/analytics';
import { useCatalog, useCart, ProductCard } from '@features/catalog';
import { SaleDetailDrawer } from '@features/sales';
import { KpiCard, Skeleton, Badge, EmptyState } from '@shared/ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@shared/ui';
import { formatCurrency, formatOrderId } from '@shared/lib';
import { APP_ROUTES } from '@shared/config';
import { useRoutingAdapter, useTranslationAdapter } from '@adapters';
import { DashboardShell, DashboardHeader, DashboardQuickActions } from '@widgets/dashboard';
import type { QuickAction } from '@widgets/dashboard';
import type { BadgeVariant } from '@shared/ui';
import type { Sale } from '@entities/sale';
import styles from '@shared/styles/themes/pages/CustomerDashboard.module.scss';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function statusVariant(status: string): BadgeVariant {
  const map: Partial<Record<SaleStatus, BadgeVariant>> = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'neutral',
  };
  return map[status as SaleStatus] ?? 'neutral';
}

function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

const FEATURED_COUNT = 4;
const SKELETON_ROWS = 4;

export function CustomerDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
  const { navigateTo } = useRoutingAdapter();
  const { data: products } = useCatalog();
  const { items: cartItems } = useCart();
  const {
    totalOrders,
    completedOrders,
    pendingOrders,
    totalSpent,
    currency,
    recentOrders,
    isLoading,
  } = useCustomerStats();

  const [detailSale, setDetailSale] = React.useState<Sale | null>(null);

  const featuredProducts = products?.slice(0, FEATURED_COUNT) ?? [];
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  const quickActions: QuickAction[] = [
    {
      icon: <StoreIcon />,
      labelKey: 'customerDashboard.actions.browseStore',
      descKey: 'customerDashboard.actions.browseStoreDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.CATALOG);
      },
    },
    {
      icon: <ListOrderedIcon />,
      labelKey: 'nav.myOrders',
      descKey: 'customerDashboard.actions.myOrdersDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.MY_ORDERS);
      },
    },
    {
      icon: <ShoppingCartIcon />,
      labelKey: 'catalog.cart',
      descKey: 'customerDashboard.actions.cartDesc',
      onClick: (): void => {
        navigateTo(APP_ROUTES.POS);
      },
      badge: cartCount > 0 ? <span className={styles['cartBadge']}>{cartCount}</span> : undefined,
    },
  ];

  return (
    <DashboardShell>
      <DashboardHeader greetingKey="customerDashboard.greeting" />

      <DashboardShell.KpiGrid aria-label={t('dashboard.kpiAriaLabel')}>
        <KpiCard
          label={t('customerDashboard.kpi.totalOrders')}
          icon={<ShoppingBagIcon />}
          accent="primary"
          isLoading={isLoading}
          value={totalOrders}
        />
        <KpiCard
          label={t('customerDashboard.kpi.completed')}
          icon={<CheckCircleIcon />}
          accent="success"
          isLoading={isLoading}
          value={completedOrders}
        />
        <KpiCard
          label={t('customerDashboard.kpi.pending')}
          icon={<ClockIcon />}
          accent="warning"
          isLoading={isLoading}
          value={pendingOrders}
        />
        <KpiCard
          label={t('customerDashboard.kpi.totalSpent')}
          icon={<CreditCardIcon />}
          accent="spent"
          isLoading={isLoading}
          value={formatCurrency(totalSpent, currency)}
        />
      </DashboardShell.KpiGrid>

      <div className={styles['sectionCard']}>
        <div className={styles['sectionHeader']}>
          <h2 className={styles['sectionTitle']}>{t('customerDashboard.recentOrders')}</h2>
          <button
            type="button"
            className={styles['viewAllBtn']}
            onClick={() => {
              navigateTo(APP_ROUTES.MY_ORDERS);
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
              <TableHead>{t('sales.items')}</TableHead>
              <TableHead>{t('sales.total')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className={styles['skeletonRow']} />
                  </TableCell>
                </TableRow>
              ))
            ) : recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    icon={<ShoppingBagIcon size={24} />}
                    title={t('myOrders.emptyTitle')}
                    description={t('myOrders.emptyDescription')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((s) => (
                <TableRow
                  key={s.id}
                  className={styles['clickableRow']}
                  onClick={() => {
                    setDetailSale(s);
                  }}
                >
                  <TableCell className={styles['orderIdCell']}>{formatOrderId(s.id)}</TableCell>
                  <TableCell>{formatDate(s.createdAt, i18n.language)}</TableCell>
                  <TableCell>{s.items.length}</TableCell>
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

      {featuredProducts.length > 0 && (
        <div className={styles['sectionCard']}>
          <div className={styles['sectionHeader']}>
            <h2 className={styles['sectionTitle']}>{t('customerDashboard.featuredProducts')}</h2>
            <button
              type="button"
              className={styles['viewAllBtn']}
              onClick={() => {
                navigateTo(APP_ROUTES.CATALOG);
              }}
            >
              {t('common.viewAll')} <ArrowRightIcon aria-hidden="true" />
            </button>
          </div>
          <div className={styles['productsGrid']}>
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <DashboardQuickActions actions={quickActions} />

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
