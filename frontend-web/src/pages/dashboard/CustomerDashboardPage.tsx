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
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useCatalog, useCart, ProductCard } from '@features/catalog';
import { useCustomerStats } from '@features/analytics/hooks/useCustomerStats';
import { SaleDetailDrawer } from '@features/sales/components/SaleDetailDrawer';
import { Skeleton, Badge } from '@shared/ui/primitives';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '@shared/ui/composed';
import { useRoutingAdapter } from '@shared/adapters/useRoutingAdapter';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { formatOrderId } from '@shared/lib/formatters';
import { APP_ROUTES } from '@shared/config/routes';
import type { BadgeVariant } from '@shared/ui/primitives';
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

function todayLabel(locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

const FEATURED_COUNT = 4;
const SKELETON_ROWS = 4;

export function CustomerDashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { i18n } = useTranslation();
  const { data: me } = useAuthMe();
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
  const firstName = me?.username.split(' ')[0] ?? '';

  return (
    <div className={styles['page']}>
      {/* Welcome header */}
      <header className={styles['header']}>
        <div className={styles['headerMeta']}>
          <h1 className={styles['greeting']}>
            {t('customerDashboard.greeting')}, {firstName}
          </h1>
          <p className={styles['dateLabel']}>{todayLabel(i18n.language)}</p>
        </div>
      </header>

      {/* KPI strip */}
      <section className={styles['kpiGrid']} aria-label={t('dashboard.kpiAriaLabel')}>
        {/* Total orders */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentPrimary']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconPrimary']}`}>
              <ShoppingBagIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('customerDashboard.kpi.totalOrders')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : totalOrders}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentSuccess']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconSuccess']}`}>
              <CheckCircleIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('customerDashboard.kpi.completed')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : completedOrders}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentWarning']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconWarning']}`}>
              <ClockIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('customerDashboard.kpi.pending')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? <Skeleton className={styles['kpiSkeleton']} /> : pendingOrders}
            </div>
          </div>
        </div>

        {/* Total spent */}
        <div className={`${styles['kpiCard']} ${styles['kpiCardAccentSpent']}`}>
          <div className={styles['kpiTopRow']}>
            <div className={`${styles['kpiIconContainer']} ${styles['kpiIconSpent']}`}>
              <CreditCardIcon />
            </div>
          </div>
          <div>
            <p className={styles['kpiLabel']}>{t('customerDashboard.kpi.totalSpent')}</p>
            <div className={styles['kpiValue']}>
              {isLoading ? (
                <Skeleton className={styles['kpiSkeleton']} />
              ) : (
                formatCurrency(totalSpent, currency)
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent orders */}
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

      {/* Featured products */}
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
              navigateTo(APP_ROUTES.CATALOG);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <StoreIcon />
            </div>
            <p className={styles['quickActionLabel']}>
              {t('customerDashboard.actions.browseStore')}
            </p>
            <p className={styles['quickActionDesc']}>
              {t('customerDashboard.actions.browseStoreDesc')}
            </p>
          </button>

          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.MY_ORDERS);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <ListOrderedIcon />
            </div>
            <p className={styles['quickActionLabel']}>{t('nav.myOrders')}</p>
            <p className={styles['quickActionDesc']}>
              {t('customerDashboard.actions.myOrdersDesc')}
            </p>
          </button>

          <button
            type="button"
            className={styles['quickActionCard']}
            onClick={() => {
              navigateTo(APP_ROUTES.POS);
            }}
          >
            <div className={styles['quickActionIcon']}>
              <ShoppingCartIcon />
            </div>
            <p className={styles['quickActionLabel']}>
              {t('catalog.cart')}
              {cartCount > 0 && <span className={styles['cartBadge']}>{cartCount}</span>}
            </p>
            <p className={styles['quickActionDesc']}>{t('customerDashboard.actions.cartDesc')}</p>
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
    </div>
  );
}
