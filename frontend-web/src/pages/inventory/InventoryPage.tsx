import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventory } from '@features/inventory';
import { Spinner, Button } from '@shared/ui/primitives';
import { Card } from '@shared/ui/composed';
import { InventoryTableWidget } from '@widgets/inventory';
import { cn } from '@shared/lib/cn';
import { Input } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Inventory.module.scss';
import type { InventoryItem } from '@entities/inventory';

type StockTab = 'all' | 'low' | 'out';

export function InventoryPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data, isLoading, isError, error } = useInventory();

  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState<StockTab>('all');

  const tabs: { id: StockTab; labelKey: string; count: number }[] = React.useMemo(() => {
    const all = data ?? [];
    return [
      { id: 'all', labelKey: 'inventory.allProducts',  count: all.length },
      { id: 'low', labelKey: 'inventory.lowStockTab',  count: all.filter((i) => i.status === 'LOW_STOCK').length },
      { id: 'out', labelKey: 'inventory.outOfStockTab', count: all.filter((i) => i.status === 'OUT_OF_STOCK').length },
    ];
  }, [data]);

  const filtered: InventoryItem[] = React.useMemo(() => {
    return (data ?? []).filter((item) => {
      if (tab === 'low' && item.status !== 'LOW_STOCK') return false;
      if (tab === 'out' && item.status !== 'OUT_OF_STOCK') return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, tab, search]);

  if (isLoading) {
    return (
      <div className={styles['placeholderContainer']} aria-busy="true" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    console.error('Inventory fetch error:', error);
    return (
      <div className={styles['errorContainer']} role="alert" aria-live="assertive">
        <p>{t('common.errorLoadingData')}</p>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <header className={styles['header']}>
        <div className={styles['headerText']}>
          <span className={styles['eyebrow']}>CATALOG</span>
          <h1 className={styles['title']}>{t('inventory.title')}</h1>
          <p className={styles['subtitle']}>{t('inventory.subtitle')}</p>
        </div>
        <div className={styles['headerActions']}>
          <Button variant="outline" size="sm">{t('inventory.exportCsv')}</Button>
          <Button size="sm">{`+ ${t('inventory.addProduct')}`}</Button>
        </div>
      </header>

      <Card className={styles['tableCard']}>
        <div className={styles['controls']}>
          <div className={styles['searchBox']}>
            <Input
              type="search"
              placeholder={`${t('common.filter')} SKU, ${t('inventory.name').toLowerCase()}…`}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); }}
              aria-label={t('common.filter')}
            />
          </div>
          <div className={styles['tabs']} role="tablist">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                role="tab"
                aria-selected={tab === tb.id}
                onClick={() => { setTab(tb.id); }}
                className={cn(styles['tab'], tab === tb.id && styles['tabActive'])}
              >
                {t(tb.labelKey)}
                <span className={styles['tabCount']}>{tb.count}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">{t('common.filter')}</Button>
        </div>

        {filtered.length === 0 ? (
          <div className={styles['placeholderContainer']}>
            <p>{t('common.noData')}</p>
          </div>
        ) : (
          <InventoryTableWidget data={filtered} />
        )}

        <div className={styles['tableFooter']}>
          <span>
            {filtered.length} / {data?.length ?? 0} {t('inventory.products').toLowerCase()}
          </span>
          <div className={styles['pagination']}>
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
