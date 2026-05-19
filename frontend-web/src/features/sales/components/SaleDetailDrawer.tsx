import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useUpdateSaleStatus } from '../hooks/useUpdateSaleStatus';
import styles from './SaleDetailDrawer.module.scss';
import { useFormatCurrency } from '@shared/lib/formatCurrency';
import { toast } from '@shared/hooks/useToast';
import { PrinterIcon } from 'lucide-react';
import { Badge, Button } from '@shared/ui/primitives';
import { SaleReceiptDialog } from './SaleReceiptDialog';
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
import { getSaleStatusBadgeVariant } from '@entities/sale';
import { formatDatetime, formatOrderId } from '@shared/lib';

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
  const fmt = useFormatCurrency();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSaleStatus(sale?.id ?? '');

  const [receiptOpen, setReceiptOpen] = React.useState(false);
  const subtotal = (sale?.items ?? []).reduce((sum, item) => sum + item.subtotal, 0);

  const handleCancel = (): void => {
    if (!sale) return;
    updateStatus(
      { status: 'cancelled' },
      {
        onSuccess: () => {
          toast({ title: t('sales.toasts.cancelledSuccess') });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({
            title: t('sales.toasts.cancelFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={styles['sheetPanel']}>
        {sale !== null && (
          <>
            <SheetHeader>
              <SheetTitle className={styles['titleRow']}>
                {formatOrderId(sale.id)}
                <Badge variant={getSaleStatusBadgeVariant(sale.status)} showDot>
                  {sale.status}
                </Badge>
              </SheetTitle>
              <SheetDescription>
                {t('sales.createdAt')}: {formatDatetime(sale.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <div className={styles['body']}>
              {/* Customer / employee info */}
              <div className={styles['infoGrid']}>
                <div>
                  <p className={styles['fieldLabel']}>{t('sales.customer')}</p>
                  <p className={styles['fieldValue']}>
                    {customerName ?? (sale.customerId ? `#${sale.customerId.slice(0, 8)}` : '—')}
                  </p>
                </div>
                {sale.employeeId && (
                  <div>
                    <p className={styles['fieldLabel']}>{t('sales.employee')}</p>
                    <p className={styles['fieldValue']}>{`#${sale.employeeId.slice(0, 8)}`}</p>
                  </div>
                )}
              </div>

              {/* Items table */}
              <div>
                <h3 className={styles['sectionTitle']}>{t('sales.items')}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory.productName')}</TableHead>
                      <TableHead className={styles['cellRight']}>{t('sales.qty')}</TableHead>
                      <TableHead className={styles['cellMono']}>{t('inventory.price')}</TableHead>
                      <TableHead className={styles['cellMono']}>{t('sales.subtotal')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className={styles['cellRight']}>{item.quantity}</TableCell>
                        <TableCell className={styles['cellMono']}>{fmt(item.unitPrice)}</TableCell>
                        <TableCell className={styles['cellMono']}>{fmt(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className={styles['totalsSection']}>
                <div className={styles['totalRow']}>
                  <span className={styles['mutedText']}>{t('sales.subtotal')}</span>
                  <span className={styles['monoText']}>{fmt(subtotal)}</span>
                </div>
                <div className={styles['totalRowFinal']}>
                  <span>{t('sales.total')}</span>
                  <span className={styles['monoText']}>{fmt(sale.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className={styles['actionsRow']}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceiptOpen(true);
                  }}
                >
                  <PrinterIcon size={14} />
                  {t('sales.downloadReceipt')}
                </Button>
                {sale.status === 'pending' && (
                  <Button variant="destructive" onClick={handleCancel} disabled={isUpdating}>
                    {t('sales.cancelSale')}
                  </Button>
                )}
              </div>
            </div>
            <SaleReceiptDialog sale={sale} open={receiptOpen} onOpenChange={setReceiptOpen} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
