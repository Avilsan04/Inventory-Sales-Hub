import * as React from 'react';
import { BoxesIcon, CheckCircle2Icon, AlertTriangleIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory } from '@features/inventory';
import { useLowStockAlerts } from '@features/analytics';
import { Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@shared/ui/composed';
import { InventoryTableWidget } from '@widgets/inventory';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function InventoryPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isLoading, isError, error } = useInventory();
  const { data: alerts } = useLowStockAlerts();

  if (isLoading) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    console.error('Inventory fetch error:', error);
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  const inStockCount = data?.filter((i) => i.status === 'IN_STOCK').length ?? 0;
  const alertCount = alerts?.length ?? 0;

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <h1 className={styles['title']}>{t('inventory.title')}</h1>
        <p className={styles['subtitle']}>{t('inventory.subtitle')}</p>
      </header>

      <section className={styles['statsRow']} aria-label="Inventory statistics">
        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('inventory.stock')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}><BoxesIcon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>{data?.length ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('inventory.status.active')}</CardTitle>
            <CardAction>
              <span className={styles['statIcon']}><CheckCircle2Icon aria-hidden="true" /></span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>{inStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={styles['statTitle']}>{t('inventory.status.lowStock')}</CardTitle>
            <CardAction>
              <span className={cn(styles['statIcon'])} style={{ color: 'var(--color-warning)' }}>
                <AlertTriangleIcon aria-hidden="true" />
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className={styles['statValue']}>{alertCount}</div>
          </CardContent>
        </Card>
      </section>

      <section className={styles['content']}>
        {!data || data.length === 0 ? (
          <div className={styles['placeholderContainer']}>
            <p className={styles['placeholder']}>{t('common.noData')}</p>
          </div>
        ) : (
          <InventoryTableWidget data={data} />
        )}
      </section>
    </div>
  );
}
