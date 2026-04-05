import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useEmployees } from '@features/employees';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function EmployeesPage(): React.ReactElement {
  const { data, isLoading, isError } = useEmployees();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <p role="alert">Failed to load employees.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Employees</h1>
        <p>{data.length} employees.</p>
      </header>
      <ul>
        {data.map((e) => (
          <li key={e.id}>{e.name} — {e.role} — {e.isActive ? 'Active' : 'Inactive'}</li>
        ))}
      </ul>
    </div>
  );
}
