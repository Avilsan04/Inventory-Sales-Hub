import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useInventoryValue } from '@features/analytics';
import { useFormatCurrency } from '@shared/lib/formatCurrency';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import styles from './DashboardWidget.module.scss';

export function InventoryValueWidget(): React.ReactElement {
  const { data, isLoading } = useInventoryValue();
  const fmt = useFormatCurrency();
  const { translate: t } = useTranslationAdapter();

  return (
    <Card>
      <CardHeader className={styles['cardHeader']}>
        <PackageIcon size={16} aria-hidden="true" />
        <CardTitle>{t('dashboard.section.inventoryValue')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className={styles['skeletonSm']} />
        ) : (
          <>
            <p className={styles['kpiValue']}>{data ? fmt(data.totalValue) : '—'}</p>
            <p className={styles['kpiSubtitle']}>
              {t('dashboard.labels.skusTracked', { count: data?.totalItems ?? 0 })}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
