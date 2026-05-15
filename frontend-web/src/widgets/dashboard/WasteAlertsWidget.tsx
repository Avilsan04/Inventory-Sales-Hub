import * as React from 'react';
import { TrashIcon } from 'lucide-react';
import { useWasteAlerts } from '@features/analytics';
import { useFormatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import styles from './DashboardWidget.module.scss';

export function WasteAlertsWidget(): React.ReactElement {
  const { data, isLoading } = useWasteAlerts();
  const fmt = useFormatCurrency();

  const totalLoss = (data ?? []).reduce((sum, a) => sum + a.estimatedLoss, 0);

  return (
    <Card>
      <CardHeader className={styles['cardHeader']}>
        <TrashIcon size={16} aria-hidden="true" />
        <CardTitle>Waste Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={styles['skeletonStack']}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className={styles['skeletonRow']} />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <p className={styles['emptyText']}>No waste reported</p>
        ) : (
          <>
            <p className={styles['wasteLossSummary']}>
              Estimated loss:{' '}
              <strong className={styles['textDestructive']}>{fmt(totalLoss)}</strong>
            </p>
            <ul className={styles['wasteList']}>
              {(data ?? []).map((a) => (
                <li key={a.productId} className={styles['wasteItem']}>
                  <span>{a.productName}</span>
                  <span className={styles['wasteUnits']}>{a.expiredUnits} units</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
