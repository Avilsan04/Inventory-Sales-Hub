import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useInventory } from '@features/inventory';
import { InventoryTableWidget } from '@widgets/inventory';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function InventoryPage(): React.ReactElement {
  const { data, isLoading, isError } = useInventory();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <p role="alert">Failed to load inventory data.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Inventory</h1>
        <p>Manage your stock items.</p>
      </header>
      <InventoryTableWidget data={data} />
    </div>
  );
}
