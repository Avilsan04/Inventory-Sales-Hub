import * as React from 'react';
import { Spinner } from '@shared/ui/primitives';
import { useProducts } from '@features/products';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function ProductsPage(): React.ReactElement {
  const { data, isLoading, isError } = useProducts();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return <p role="alert">Failed to load products.</p>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Products</h1>
        <p>{data.length} products in catalog.</p>
      </header>
      <ul>
        {data.map((p) => (
          <li key={p.id}>{p.name} — {p.currency} {p.price.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
}
