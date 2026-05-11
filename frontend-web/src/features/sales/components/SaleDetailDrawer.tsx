import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useUpdateSaleStatus } from '../hooks/useUpdateSaleStatus';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { toast } from '@shared/hooks/useToast';
import { Badge, Button } from '@shared/ui/primitives';
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
import type { Sale } from '@entities/sale';
import type { BadgeVariant } from '@shared/ui/primitives';

type SaleStatus = 'pending' | 'completed' | 'cancelled';

function statusVariant(status: SaleStatus): BadgeVariant {
  const map: Record<SaleStatus, BadgeVariant> = {
    pending: 'warning',
    completed: 'info',
    cancelled: 'neutral',
  };
  return map[status];
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

function orderId(id: string): string {
  return id.startsWith('ORD-') ? `#${id}` : `#${id.slice(0, 8)}`;
}

interface SaleDetailDrawerProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
}

export function SaleDetailDrawer({
  sale,
  open,
  onOpenChange,
  customerName,
}: SaleDetailDrawerProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSaleStatus(sale?.id ?? '');

  const subtotal = (sale?.items ?? []).reduce((sum, item) => sum + item.subtotal, 0);

  const handleCancel = (): void => {
    if (!sale) return;
    updateStatus(
      { status: 'cancelled' },
      {
        onSuccess: () => {
          toast({ title: t('sales.cancelledSuccess') });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({
            title: t('sales.cancelFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent style={{ width: '560px', maxWidth: '95vw', overflowY: 'auto' }}>
        {sale !== null && (
          <>
            <SheetHeader>
              <SheetTitle style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {orderId(sale.id)}
                <Badge variant={statusVariant(sale.status)} showDot>
                  {sale.status}
                </Badge>
              </SheetTitle>
              <SheetDescription>
                {t('sales.createdAt')}: {formatDate(sale.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* Customer / employee info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-muted-foreground)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {t('sales.customer')}
                  </p>
                  <p style={{ fontWeight: 500 }}>
                    {customerName ?? (sale.customerId ? `#${sale.customerId.slice(0, 8)}` : '—')}
                  </p>
                </div>
                {sale.employeeId && (
                  <div>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-muted-foreground)',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {t('sales.employee')}
                    </p>
                    <p style={{ fontWeight: 500 }}>{`#${sale.employeeId.slice(0, 8)}`}</p>
                  </div>
                )}
              </div>

              {/* Items table */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {t('sales.items')}
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory.productName')}</TableHead>
                      <TableHead style={{ textAlign: 'right' }}>{t('sales.qty')}</TableHead>
                      <TableHead style={{ textAlign: 'right' }}>{t('inventory.price')}</TableHead>
                      <TableHead style={{ textAlign: 'right' }}>{t('sales.subtotal')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell style={{ textAlign: 'right' }}>{item.quantity}</TableCell>
                        <TableCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {formatCurrency(item.unitPrice, sale.currency)}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {formatCurrency(item.subtotal, sale.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--color-muted-foreground)' }}>
                    {t('sales.subtotal')}
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(subtotal, sale.currency)}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '1.125rem',
                  }}
                >
                  <span>{t('sales.total')}</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(sale.total, sale.currency)}
                  </span>
                </div>
              </div>

              {/* Cancel action */}
              {sale.status === 'pending' && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {t('sales.cancelSale')}
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
