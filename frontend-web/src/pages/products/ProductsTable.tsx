import * as React from 'react';
import { PackageIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { PermissionGuard } from '@features/auth';
import { useFormatCurrency } from '@shared/lib';
import { Skeleton, Button } from '@shared/ui';
import { EmptyState, TableRow, TableCell } from '@shared/ui';
import type { Product } from '@entities/product';
import styles from '@shared/styles/themes/pages/PageBase.module.scss';

const SKELETON_ROWS = 5;

interface RowActionsProps {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

function ProductRowActions({ product, onEdit, onDelete }: RowActionsProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  return (
    <div className={styles['cellActions']}>
      <PermissionGuard permission="create:product">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('inventory.editProduct')}
          onClick={(): void => {
            onEdit(product);
          }}
        >
          <PencilIcon size={14} aria-hidden="true" />
        </Button>
      </PermissionGuard>
      <PermissionGuard permission="delete:product">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t('inventory.deleteProduct')}
          onClick={(): void => {
            onDelete(product.id);
          }}
        >
          <TrashIcon size={14} aria-hidden="true" />
        </Button>
      </PermissionGuard>
    </div>
  );
}

export interface ProductTableContentProps {
  isPending: boolean;
  paginated: Product[];
  debouncedSearch: string;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTableContent({
  isPending,
  paginated,
  debouncedSearch,
  onEdit,
  onDelete,
}: ProductTableContentProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const fmt = useFormatCurrency();

  if (isPending) {
    return (
      <>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <TableRow key={i}>
            <TableCell colSpan={5}>
              <Skeleton className={styles['skeletonRow']} />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  if (paginated.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5}>
          <EmptyState
            icon={<PackageIcon size={24} />}
            title={debouncedSearch ? t('products.noResultsTitle') : t('common.noData')}
            description={debouncedSearch ? t('products.noResultsDescription') : undefined}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {paginated.map((p) => (
        <TableRow key={p.id}>
          <TableCell>{p.name}</TableCell>
          <TableCell>{p.sku}</TableCell>
          <TableCell>{fmt(p.price)}</TableCell>
          <TableCell>{p.category?.name ?? '—'}</TableCell>
          <TableCell>
            <ProductRowActions product={p} onEdit={onEdit} onDelete={onDelete} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
