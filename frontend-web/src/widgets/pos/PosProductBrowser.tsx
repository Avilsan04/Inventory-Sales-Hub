import * as React from 'react';
import { PlusIcon, PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { usePosKeyboard } from '@features/sales';
import { Input, Badge, Spinner, Button } from '@shared/ui';
import { cn, useFormatCurrency } from '@shared/lib';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/pages/Pos.module.scss';

function stockBadgeVariant(status: InventoryItem['status']): 'success' | 'warning' | 'destructive' {
  if (status === 'IN_STOCK') return 'success';
  if (status === 'LOW_STOCK') return 'warning';
  return 'destructive';
}

function stockBadgeLabel(status: InventoryItem['status'], t: (k: string) => string): string {
  if (status === 'IN_STOCK') return t('inventory.status_IN_STOCK');
  if (status === 'LOW_STOCK') return t('inventory.status_LOW_STOCK');
  return t('inventory.status_OUT_OF_STOCK');
}

interface Props {
  inventory: InventoryItem[] | undefined;
  isPending: boolean;
  isError?: boolean;
  onAdd: (item: InventoryItem) => void;
}

export function PosProductBrowser({
  inventory,
  isPending,
  isError,
  onAdd,
}: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const fmt = useFormatCurrency();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  const handleClearSearch = React.useCallback((): void => {
    setSearch('');
  }, []);

  usePosKeyboard({ searchRef, onClearSearch: handleClearSearch });

  const categories = React.useMemo((): string[] => {
    if (!inventory) return [];
    return [...new Set(inventory.map((i) => i.category).filter((c): c is string => Boolean(c)))];
  }, [inventory]);

  const filteredProducts = React.useMemo((): InventoryItem[] => {
    if (!inventory) return [];
    return inventory.filter((item) => {
      if (item.status === 'OUT_OF_STOCK') return false;
      if (activeCategory && item.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [inventory, activeCategory, search]);

  if (isPending) {
    return (
      <div className={styles['placeholderContainer']}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles['emptyProducts']} role="alert">
        {t('common.errorLoadingData')}
      </div>
    );
  }

  return (
    <div className={styles['products']}>
      <div className={styles['searchBar']}>
        <Input
          ref={searchRef}
          type="search"
          placeholder={`${t('common.search').split(',')[0]}… (F2)`}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
          }}
          aria-label={t('common.search')}
        />
      </div>

      {categories.length > 0 && (
        <div className={styles['categoryPills']} role="group" aria-label={t('inventory.category')}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(styles['pill'], activeCategory === null && styles['pillActive'])}
            onClick={(): void => {
              setActiveCategory(null);
            }}
          >
            {t('inventory.allProducts')}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant="ghost"
              size="sm"
              className={cn(styles['pill'], activeCategory === cat && styles['pillActive'])}
              onClick={(): void => {
                setActiveCategory(cat);
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className={styles['emptyProducts']}>{t('common.noData')}</div>
      ) : (
        <div className={styles['productGrid']}>
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className={styles['productCard']}
              role="button"
              tabIndex={0}
              data-pos-product
              aria-label={`${t('inventory.addProduct')}: ${item.name}`}
              onClick={() => {
                onAdd(item);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onAdd(item);
              }}
            >
              <div className={styles['productIconWrap']}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className={styles['productImg']} />
                ) : (
                  <PackageIcon size={32} aria-hidden="true" />
                )}
              </div>
              <p className={styles['productName']}>{item.name}</p>
              <p className={styles['productSku']}>{item.sku}</p>
              <div className={styles['productFooter']}>
                <p className={styles['productPrice']}>{fmt(item.price)}</p>
                <Badge variant={stockBadgeVariant(item.status)} showDot={false}>
                  {stockBadgeLabel(item.status, t)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                className={styles['addBtn']}
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(item);
                }}
                aria-label={`${t('inventory.addProduct')}: ${item.name}`}
              >
                <PlusIcon aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
