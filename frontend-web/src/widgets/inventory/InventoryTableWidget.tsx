import * as React from 'react';
import { EllipsisIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { cn } from '@shared/lib/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/composed/Table';
import { Badge } from '@shared/ui/primitives';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/widgets/InventoryTable.module.scss';

interface InventoryTableWidgetProps {
  data: InventoryItem[];
}

function statusBadgeVariant(status: InventoryItem['status']): 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'IN_STOCK':     return 'success';
    case 'LOW_STOCK':    return 'warning';
    case 'OUT_OF_STOCK': return 'destructive';
  }
}

function stockExtraClass(status: InventoryItem['status']): string | undefined {
  switch (status) {
    case 'LOW_STOCK':    return styles['stockLow'];
    case 'OUT_OF_STOCK': return styles['stockOut'];
    default:             return undefined;
  }
}

const formatCurrency = (amount: number, currency: string): string =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);

export function InventoryTableWidget({ data }: InventoryTableWidgetProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <div className={styles['tableWrapper']}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('inventory.sku')}</TableHead>
            <TableHead>{t('inventory.name')}</TableHead>
            <TableHead>{t('inventory.category')}</TableHead>
            <TableHead className={styles['numCell']}>{t('inventory.stock')}</TableHead>
            <TableHead className={styles['numCell']}>{t('inventory.reorderAt')}</TableHead>
            <TableHead className={styles['priceCell']}>{t('inventory.price')}</TableHead>
            <TableHead>{t('inventory.status')}</TableHead>
            <TableHead className={styles['dotsHead']} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className={styles['skuCell']}>{item.sku}</TableCell>
              <TableCell className={styles['nameCell']}>{item.name}</TableCell>
              <TableCell className={styles['categoryCell']}>{item.category ?? '—'}</TableCell>
              <TableCell className={cn(styles['numCell'], stockExtraClass(item.status))}>
                {item.quantity}
              </TableCell>
              <TableCell className={cn(styles['numCell'], styles['reorderCell'])}>
                {item.reorderThreshold !== undefined ? item.reorderThreshold : '—'}
              </TableCell>
              <TableCell className={styles['priceCell']}>
                {formatCurrency(item.price, item.currency)}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(item.status)} showDot>
                  {t(`inventory.status_${item.status}`)}
                </Badge>
              </TableCell>
              <TableCell className={styles['dotsCell']}>
                <button type="button" className={styles['dotsBtn']} aria-label="Actions">
                  <EllipsisIcon size={16} aria-hidden="true" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
