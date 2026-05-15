import * as React from 'react';
import { TrophyIcon } from 'lucide-react';
import { useTopProducts } from '@features/analytics';
import { useFormatCurrency } from '@shared/lib/formatCurrency';
import { Skeleton } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/composed';
import styles from './DashboardWidget.module.scss';

export function TopProfitableWidget(): React.ReactElement {
  const { data, isLoading } = useTopProducts();
  const fmt = useFormatCurrency();
  const top5 = data?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className={styles['cardHeader']}>
        <TrophyIcon size={16} aria-hidden="true" />
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={styles['skeletonStack']}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={styles['skeletonRow']} />
            ))}
          </div>
        ) : top5.length === 0 ? (
          <p className={styles['emptyText']}>No data</p>
        ) : (
          <ol className={styles['rankList']}>
            {top5.map((p, i) => (
              <li key={p.productId} className={styles['rankItem']}>
                <span className={styles['rankItemLeft']}>
                  <span className={styles['rankNum']}>{i + 1}.</span>
                  <span>{p.productName}</span>
                </span>
                <span className={styles['rankValue']}>{fmt(p.revenue)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
