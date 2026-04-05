import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useSuppliers } from '@features/suppliers';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function SuppliersPage(): React.ReactElement {
  const { data, isLoading, isError } = useSuppliers();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <p role="alert">Failed to load suppliers.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Suppliers</h1>
        <p>{data.length} suppliers.</p>
      </header>
      <ul>
        {data.map((s) => (
          <li key={s.id}>{s.name} — {s.email ?? '—'} — {s.contactPerson ?? '—'}</li>
        ))}
      </ul>
    </div>
  );
}
