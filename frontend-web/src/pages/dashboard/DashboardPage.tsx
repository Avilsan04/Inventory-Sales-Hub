import * as React from 'react';
import {
  PackageIcon,
  TrendingUpIcon,
  ShoppingCartIcon,
  AlertTriangleIcon,
} from 'lucide-react';

import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useDashboardKpi, useLowStockAlerts } from '@features/analytics';
import { useInventory } from '@features/inventory';
import { Spinner, Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@shared/ui/composed';
import { InventoryTableWidget } from '@widgets/inventory';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Dashboard.module.scss';

type KpiIconKey = 'products' | 'sales' | 'orders' | 'lowStock';

interface KpiCardData {
  titleKey: string;
  value: string | number;
  iconKey: KpiIconKey;
  trend?: string;
  variant: 'default' | 'warning';
}

function renderKpiIcon(iconKey: KpiIconKey): React.ReactElement {
  switch (iconKey) {
    case 'products': return <PackageIcon       aria-hidden="true" />;
    case 'sales':    return <TrendingUpIcon    aria-hidden="true" />;
    case 'orders':   return <ShoppingCartIcon  aria-hidden="true" />;
    case 'lowStock': return <AlertTriangleIcon aria-hidden="true" />;
  }
}

export function DashboardPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: inventory, isLoading: inventoryLoading, isError, error } = useInventory();
  const { data: kpi, isLoading: kpiLoading } = useDashboardKpi();
  const { data: alerts, isLoading: alertsLoading } = useLowStockAlerts();

  const kpiLoaded = !kpiLoading && !alertsLoading;

  const kpiCards: KpiCardData[] = [
    {
      titleKey: 'dashboard.stats.totalProducts',
      value: kpi?.totalProducts ?? 0,
      iconKey: 'products',
      variant: 'default',
    },
    {
      titleKey: 'dashboard.stats.monthlySales',
      value: kpi ? `${kpi.currency} ${kpi.totalRevenue.toLocaleString()}` : '0',
      iconKey: 'sales',
      trend: kpi
        ? `${kpi.revenueGrowth >= 0 ? '+' : ''}${String(kpi.revenueGrowth)}%`
        : undefined,
      variant: 'default',
    },
    {
      titleKey: 'dashboard.stats.activeOrders',
      value: kpi?.totalOrders ?? 0,
      iconKey: 'orders',
      trend: kpi
        ? `${kpi.ordersGrowth >= 0 ? '+' : ''}${String(kpi.ordersGrowth)}%`
        : undefined,
      variant: 'default',
    },
    {
      titleKey: 'dashboard.stats.lowStock',
      value: alerts?.length ?? 0,
      iconKey: 'lowStock',
      variant: 'warning',
    },
  ];

  const renderContent = (): React.ReactNode => {
    if (inventoryLoading) {
      return (
        <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
          <Spinner size="lg" />
        </div>
      );
    }

    if (isError) {
      console.error('Zod Validation or Network Error:', error);
      return (
        <div className={styles['errorContainer']} role="alert" aria-live="assertive">
          <p>{t('common.errorLoadingData')}</p>
        </div>
      );
    }

    if (!inventory || inventory.length === 0) {
      return (
        <div className={styles['placeholderContainer']}>
          <p className={styles['placeholder']}>{t('common.noData')}</p>
        </div>
      );
    }

    return <InventoryTableWidget data={inventory} />;
  };

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('dashboard.title')}</h1>
        <p className={styles['subtitle']}>{t('dashboard.welcome')}</p>
      </header>

      <section className={styles['kpiGrid']} aria-label="Key performance indicators">
        {kpiCards.map((card) => (
          <Card key={card.titleKey} className={styles['kpiCard']}>
            <CardHeader>
              <CardTitle className={styles['kpiTitle']}>{t(card.titleKey)}</CardTitle>
              <CardAction>
                <span
                  className={cn(
                    styles['kpiIcon'],
                    card.variant === 'warning' && styles['kpiIconWarning'],
                  )}
                >
                  {renderKpiIcon(card.iconKey)}
                </span>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className={styles['kpiValue']}>
                {kpiLoaded
                  ? card.value
                  : <Skeleton className={styles['kpiSkeleton']} />
                }
              </div>
              {kpiLoaded && card.trend !== undefined && (
                <p className={styles['kpiTrend']}>
                  {card.trend} {t('dashboard.vsLastMonth')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className={styles['content']}>
        {renderContent()}
      </section>
    </div>
  );
}
