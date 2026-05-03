import * as React from 'react';
import { EllipsisIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { cn } from '@shared/lib/cn';
import { formatCurrency } from '@shared/lib/formatCurrency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@shared/ui/composed';
import { Badge } from '@shared/ui/primitives';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/widgets/InventoryTable.module.scss';

interface InventoryTableWidgetProps {
  data: InventoryItem[];
  onEdit?: (item: InventoryItem) => void;
  onAdjustStock?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (item: InventoryItem) => void;
}

function statusBadgeVariant(
  status: InventoryItem['status']
): 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'IN_STOCK':
      return 'success';
    case 'LOW_STOCK':
      return 'warning';
    case 'OUT_OF_STOCK':
      return 'destructive';
  }
}

function stockExtraClass(status: InventoryItem['status']): string | undefined {
  switch (status) {
    case 'LOW_STOCK':
      return styles['stockLow'];
    case 'OUT_OF_STOCK':
      return styles['stockOut'];
    default:
      return undefined;
  }
}

export function InventoryTableWidget({
  data,
  onEdit,
  onAdjustStock,
  onDelete,
  onViewHistory,
}: InventoryTableWidgetProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const hasActions =
    onEdit !== undefined ||
    onAdjustStock !== undefined ||
    onDelete !== undefined ||
    onViewHistory !== undefined;

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
            {hasActions && <TableHead className={styles['dotsHead']} />}
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
              {hasActions && (
                <TableCell className={styles['dotsCell']}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className={styles['dotsBtn']} aria-label="Actions">
                        <EllipsisIcon size={16} aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit !== undefined && (
                        <DropdownMenuItem
                          onClick={() => {
                            onEdit(item);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onAdjustStock !== undefined && (
                        <DropdownMenuItem
                          onClick={() => {
                            onAdjustStock(item);
                          }}
                        >
                          Adjust stock
                        </DropdownMenuItem>
                      )}
                      {onViewHistory !== undefined && (
                        <DropdownMenuItem
                          onClick={() => {
                            onViewHistory(item);
                          }}
                        >
                          View history
                        </DropdownMenuItem>
                      )}
                      {onDelete !== undefined && (
                        <DropdownMenuItem
                          onClick={() => {
                            onDelete(item.id);
                          }}
                          style={{ color: 'var(--color-destructive)' }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
