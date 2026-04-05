import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useSales, useSaleSummary } from '@features/sales';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function SalesPage(): React.ReactElement {
  const { data: sales, isLoading, isError } = useSales();
  const { data: summary } = useSaleSummary();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !sales) {
    return <p role="alert">Failed to load sales.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Sales</h1>
        {summary && (
          <p>Total revenue: {summary.currency} {summary.totalRevenue.toFixed(2)} — {summary.totalSales} orders</p>
        )}
      </header>
      <ul>
        {sales.map((s) => (
          <li key={s.id}>#{s.id.slice(0, 8)} — {s.status} — {s.currency} {s.total.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
