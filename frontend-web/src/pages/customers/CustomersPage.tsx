import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useCustomers } from '@features/customers';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function CustomersPage(): React.ReactElement {
  const { data, isLoading, isError } = useCustomers();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <p role="alert">Failed to load customers.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Customers</h1>
        <p>{data.length} registered customers.</p>
      </header>
      <ul>
        {data.map((c) => (
          <li key={c.id}>{c.name} — {c.email}</li>
        ))}
      </ul>
    </div>
  );
}
