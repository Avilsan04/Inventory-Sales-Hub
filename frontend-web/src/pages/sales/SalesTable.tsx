import * as React from 'react';
import { EyeIcon, ShoppingCartIcon } from 'lucide-react';
import { useFormatCurrency, formatOrderId, formatDate } from '@shared/lib';
import { Skeleton, Badge, Button } from '@shared/ui';
import { EmptyState, TableRow, TableCell } from '@shared/ui';
import { getSaleStatusBadgeVariant, lookupCustomerName } from '@entities/sale';
import type { Sale } from '@entities/sale';
import pageStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Sales.module.scss';

interface SalesRowProps {
  sale: Sale;
  customerMap: Map<string, string>;
  t: (k: string) => string;
  onDetail: (s: Sale) => void;
}

function SaleRow({ sale, customerMap, t, onDetail }: SalesRowProps): React.ReactElement {
  const fmt = useFormatCurrency();
  return (
    <TableRow>
      <TableCell className={styles['mono']}>{formatOrderId(sale.id)}</TableCell>
      <TableCell>{lookupCustomerName(sale.customerId, customerMap)}</TableCell>
      <TableCell className={styles['mono']}>{formatDate(sale.createdAt)}</TableCell>
      <TableCell>
        <Badge variant={getSaleStatusBadgeVariant(sale.status)} showDot>
          {t(`sales.status.${sale.status}`)}
        </Badge>
      </TableCell>
      <TableCell>{sale.items.length}</TableCell>
      <TableCell className={styles['mono']}>{fmt(sale.total)}</TableCell>
      <TableCell>
        <div className={pageStyles['cellActions']}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('sales.viewDetail')}
            onClick={(): void => {
              onDetail(sale);
            }}
          >
            <EyeIcon size={14} aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

const SKELETON_ROWS = 5;

interface SalesTableBodyProps {
  isLoading: boolean;
  paginated: Sale[];
  debouncedSearch: string;
  customerMap: Map<string, string>;
  t: (k: string) => string;
  onDetail: (s: Sale) => void;
  onCreateOpen: () => void;
}

export function SalesTableBody({
  isLoading,
  paginated,
  debouncedSearch,
  customerMap,
  t,
  onDetail,
  onCreateOpen,
}: SalesTableBodyProps): React.ReactElement {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <TableRow key={i}>
            <TableCell colSpan={7}>
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
        <TableCell colSpan={7}>
          <EmptyState
            icon={<ShoppingCartIcon size={24} />}
            title={t('sales.emptyTitle')}
            description={t('sales.emptyDescription')}
            action={
              debouncedSearch
                ? undefined
                : { label: `+ ${t('sales.newSale')}`, onClick: onCreateOpen }
            }
          />
        </TableCell>
      </TableRow>
    );
  }
  return (
    <>
      {paginated.map((s) => (
        <SaleRow key={s.id} sale={s} customerMap={customerMap} t={t} onDetail={onDetail} />
      ))}
    </>
  );
}
