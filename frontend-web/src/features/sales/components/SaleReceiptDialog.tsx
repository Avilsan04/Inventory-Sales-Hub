import * as React from 'react';
import { PrinterIcon } from 'lucide-react';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@shared/ui/composed';
import type { Sale } from '@entities/sale';
import styles from './SaleReceiptDialog.module.scss';

interface SaleReceiptDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function orderId(id: string): string {
  return id.startsWith('ORD-') ? id : id.slice(0, 8).toUpperCase();
}

export function SaleReceiptDialog({
  sale,
  open,
  onOpenChange,
}: SaleReceiptDialogProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const subtotal = (sale?.items ?? []).reduce((s, i) => s + i.subtotal, 0);

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles['dialogContent']}>
        <DialogHeader className={styles['noPrint']}>
          <DialogTitle>{t('sales.receipt')}</DialogTitle>
        </DialogHeader>

        {sale !== null && (
          <div className={styles['receipt']} id="pos-receipt">
            <div className={styles['receiptHeader']}>
              <p className={styles['companyName']}>{t('common.appName')}</p>
              <p className={styles['ticketId']}>#{orderId(sale.id)}</p>
              <p className={styles['date']}>
                {new Date(sale.createdAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className={styles['divider']} />

            <table className={styles['itemsTable']}>
              <thead>
                <tr>
                  <th className={styles['colName']}>{t('sales.receiptItem')}</th>
                  <th className={styles['colQty']}>{t('sales.checkout.qty')}</th>
                  <th className={styles['colPrice']}>{t('sales.checkout.price')}</th>
                  <th className={styles['colSubtotal']}>{t('pos.subtotal')}</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className={styles['colName']}>{item.productName}</td>
                    <td className={styles['colQty']}>{item.quantity}</td>
                    <td className={styles['colPrice']}>
                      {formatCurrency(item.unitPrice, sale.currency)}
                    </td>
                    <td className={styles['colSubtotal']}>
                      {formatCurrency(item.subtotal, sale.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles['divider']} />

            <div className={styles['totals']}>
              <div className={styles['totalRow']}>
                <span>{t('pos.subtotal')}</span>
                <span>{formatCurrency(subtotal, sale.currency)}</span>
              </div>
              <div className={styles['totalRowFinal']}>
                <span>{t('pos.total')}</span>
                <span>{formatCurrency(sale.total, sale.currency)}</span>
              </div>
            </div>

            <div className={styles['divider']} />

            <p className={styles['thanks']}>{t('sales.thankYou')}</p>
          </div>
        )}

        <DialogFooter className={styles['noPrint']}>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            {t('common.close')}
          </Button>
          <Button onClick={handlePrint}>
            <PrinterIcon size={14} className={styles['printerIcon']} />
            {t('sales.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
