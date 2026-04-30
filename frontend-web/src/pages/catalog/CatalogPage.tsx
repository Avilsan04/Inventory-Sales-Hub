import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCatalog } from '@features/catalog';
import { CartDrawer } from '@features/catalog';
import { useDebounce } from '@shared/hooks';
import { Spinner, Input } from '@shared/ui/primitives';
import { EmptyState } from '@shared/ui/composed';
import { ProductCard } from '@features/catalog/components/ProductCard';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

export function CatalogPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: products, isPending, isError } = useCatalog();
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search);

  const filtered = React.useMemo(() => {
    if (!debouncedSearch) return products ?? [];
    const q = debouncedSearch.toLowerCase();
    return (products ?? []).filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, debouncedSearch]);

  if (isPending) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['errorContainer']} role="alert">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div>
          <span className={styles['eyebrow']}>STORE</span>
          <h1 className={styles['title']}>{t('catalog.title')}</h1>
          <p className={styles['subtitle']}>{t('catalog.subtitle')}</p>
        </div>
        <CartDrawer />
      </header>

      <div style={{ marginBottom: '1.5rem', maxWidth: '24rem' }}>
        <Input
          type="search"
          placeholder={`${t('common.filter')} SKU, ${t('inventory.name').toLowerCase()}…`}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
          }}
          aria-label={t('common.filter')}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={24} />}
          title={t('catalog.emptyTitle')}
          description={t('catalog.emptyDescription')}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
