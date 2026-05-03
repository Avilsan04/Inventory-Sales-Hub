import * as React from 'react';
import { PrinterIcon } from 'lucide-react';
import { formatCurrency } from '@shared/lib/formatCurrency';
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
  const subtotal = (sale?.items ?? []).reduce((s, i) => s + i.subtotal, 0);

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles['dialogContent']}>
        <DialogHeader className={styles['noPrint']}>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        {sale !== null && (
          <div className={styles['receipt']} id="pos-receipt">
            <div className={styles['receiptHeader']}>
              <p className={styles['companyName']}>Inventory Sales Hub</p>
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
                  <th className={styles['colName']}>Item</th>
                  <th className={styles['colQty']}>Qty</th>
                  <th className={styles['colPrice']}>Price</th>
                  <th className={styles['colSubtotal']}>Subtotal</th>
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
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, sale.currency)}</span>
              </div>
              <div className={styles['totalRowFinal']}>
                <span>Total</span>
                <span>{formatCurrency(sale.total, sale.currency)}</span>
              </div>
            </div>

            <div className={styles['divider']} />

            <p className={styles['thanks']}>Thank you for your purchase!</p>
          </div>
        )}

        <DialogFooter className={styles['noPrint']}>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Close
          </Button>
          <Button onClick={handlePrint}>
            <PrinterIcon size={14} style={{ marginRight: '0.375rem' }} />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
