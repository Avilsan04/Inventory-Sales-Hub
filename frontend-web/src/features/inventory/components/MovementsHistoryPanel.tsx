import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventoryMovements } from '../hooks/useInventoryMovements';
import styles from './MovementsHistoryPanel.module.scss';
import { Skeleton, Badge } from '@shared/ui/primitives';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@shared/ui/composed';
import type { InventoryItem } from '@entities/inventory';
import { formatDatetime } from '@shared/lib/formatters';

type MovementType = 'in' | 'out' | 'adjustment';

function typeBadgeVariant(type: MovementType): 'success' | 'destructive' | 'warning' {
  switch (type) {
    case 'in':
      return 'success';
    case 'out':
      return 'destructive';
    case 'adjustment':
      return 'warning';
  }
}

interface MovementsHistoryPanelProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovementsHistoryPanel({
  item,
  open,
  onOpenChange,
}: MovementsHistoryPanelProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: allMovements, isPending } = useInventoryMovements();

  const movements = React.useMemo(
    () => (allMovements ?? []).filter((m) => m.inventoryItemId === item?.id),
    [allMovements, item?.id]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles['sheetPanel']}>
        <SheetHeader>
          <SheetTitle>
            {item?.name ?? ''} — {t('inventory.movementsHistory')}
          </SheetTitle>
          <SheetDescription>{t('inventory.movementsHistoryDescription')}</SheetDescription>
        </SheetHeader>

        <div className={styles['body']}>
          {isPending ? (
            <div className={styles['skeletonList']}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className={styles['skeletonRow']} />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <p className={styles['emptyMsg']}>{t('inventory.noMovements')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('inventory.movementType')}</TableHead>
                  <TableHead className={styles['cellNumeric']}>{t('inventory.quantity')}</TableHead>
                  <TableHead className={styles['cellNumeric']}>
                    {t('inventory.previousQty')}
                  </TableHead>
                  <TableHead className={styles['cellNumeric']}>{t('inventory.newQty')}</TableHead>
                  <TableHead>{t('inventory.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant={typeBadgeVariant(m.type)}>{m.type}</Badge>
                    </TableCell>
                    <TableCell className={styles['cellNumeric']}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </TableCell>
                    <TableCell className={styles['cellNumeric']}>{m.previousQuantity}</TableCell>
                    <TableCell className={styles['cellNumeric']}>{m.newQuantity}</TableCell>
                    <TableCell className={styles['cellDate']}>
                      {formatDatetime(m.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
