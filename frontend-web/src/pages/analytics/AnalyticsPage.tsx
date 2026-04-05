import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useDashboardKpi, useLowStockAlerts } from '@features/analytics';
import styles from '@shared/styles/themes/pages/Analytics.module.scss';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';

export function AnalyticsPage(): React.ReactElement {
  const { data: kpi, isLoading, isError } = useDashboardKpi();
  const { data: alerts } = useLowStockAlerts();

  if (isLoading) {
    return (
      <div className={baseStyles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !kpi) {
    return <p role="alert">Failed to load analytics.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Analytics</h1>
      </header>
      <section className={styles.kpiGrid}>
        <div><strong>Revenue</strong><br />{kpi.currency} {kpi.totalRevenue.toLocaleString()}</div>
        <div><strong>Orders</strong><br />{kpi.totalOrders}</div>
        <div><strong>Customers</strong><br />{kpi.totalCustomers}</div>
        <div><strong>Products</strong><br />{kpi.totalProducts}</div>
      </section>
      {alerts && alerts.length > 0 && (
        <section>
          <h2>Low Stock Alerts</h2>
          <ul>
            {alerts.map((a) => (
              <li key={a.itemId}>{a.name} ({a.sku}) — {a.currentQuantity} left (threshold: {a.threshold})</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
