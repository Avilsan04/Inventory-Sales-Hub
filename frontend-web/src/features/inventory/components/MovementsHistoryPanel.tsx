import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useInventoryMovements } from '@features/inventory/hooks/useInventoryMovements';
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
      <SheetContent style={{ width: '520px', maxWidth: '95vw', overflowY: 'auto' }}>
        <SheetHeader>
          <SheetTitle>
            {item?.name ?? ''} — {t('inventory.movementsHistory')}
          </SheetTitle>
          <SheetDescription>{t('inventory.movementsHistoryDescription')}</SheetDescription>
        </SheetHeader>

        <div style={{ marginTop: '1.5rem' }}>
          {isPending ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} style={{ height: '2.5rem', width: '100%' }} />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <p
              style={{
                color: 'var(--color-muted-foreground)',
                textAlign: 'center',
                padding: '2rem 0',
              }}
            >
              {t('inventory.noMovements')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('inventory.movementType')}</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>{t('inventory.quantity')}</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>{t('inventory.previousQty')}</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>{t('inventory.newQty')}</TableHead>
                  <TableHead>{t('inventory.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant={typeBadgeVariant(m.type as MovementType)}>{m.type}</Badge>
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {m.previousQuantity}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {m.newQuantity}
                    </TableCell>
                    <TableCell style={{ fontSize: '0.75rem' }}>{formatDate(m.createdAt)}</TableCell>
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
