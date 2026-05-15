import * as React from 'react';
import { TrendingUpIcon } from 'lucide-react';
import { useCashFlow } from '@features/analytics';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import { cn } from '@shared/lib/cn';
import styles from './DashboardWidget.module.scss';

export function CashFlowWidget(): React.ReactElement {
  const { data, isLoading } = useCashFlow();

  const totalNet = (data ?? []).reduce((sum, e) => sum + e.net, 0);
  const totalInflow = (data ?? []).reduce((sum, e) => sum + e.inflow, 0);
  const totalOutflow = (data ?? []).reduce((sum, e) => sum + e.outflow, 0);

  return (
    <Card>
      <CardHeader className={styles['cardHeader']}>
        <TrendingUpIcon size={16} aria-hidden="true" />
        <CardTitle>Cash Flow (7d)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={styles['skeletonStack']}>
            <Skeleton className={styles['skeletonLg']} />
            <Skeleton className={styles['skeletonMd']} />
          </div>
        ) : (
          <>
            <p
              className={cn(
                styles['kpiValue'],
                totalNet >= 0 ? styles['kpiValueSuccess'] : styles['kpiValueDestructive']
              )}
            >
              {totalNet >= 0 ? '+' : ''}
              {formatCurrency(totalNet, 'EUR')}
            </p>
            <div className={styles['kpiMeta']}>
              <span>
                In:{' '}
                <strong className={styles['textSuccess']}>
                  {formatCurrency(totalInflow, 'EUR')}
                </strong>
              </span>
              <span>
                Out:{' '}
                <strong className={styles['textDestructive']}>
                  {formatCurrency(totalOutflow, 'EUR')}
                </strong>
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
