import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useInventoryValue } from '@features/analytics';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import styles from './DashboardWidget.module.scss';

export function InventoryValueWidget(): React.ReactElement {
  const { data, isLoading } = useInventoryValue();

  return (
    <Card>
      <CardHeader className={styles['cardHeader']}>
        <PackageIcon size={16} aria-hidden="true" />
        <CardTitle>Inventory Value</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className={styles['skeletonSm']} />
        ) : (
          <>
            <p className={styles['kpiValue']}>
              {data ? formatCurrency(data.totalValue, data.currency) : '—'}
            </p>
            <p className={styles['kpiSubtitle']}>{data?.totalItems ?? 0} SKUs tracked</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
