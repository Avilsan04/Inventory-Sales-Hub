import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { toast } from '@shared/hooks/useToast';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@shared/ui/composed';
import { SaleReceiptDialog } from '@features/sales/components/SaleReceiptDialog';
import { useCreateSale } from '@features/sales/hooks/useCreateSale';
import type { Sale } from '@entities/sale';
import { CartItem } from './CartItem';
import { useCart } from '../hooks/useCart';

export function CartDrawer(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { items, clearCart } = useCart();
  const { mutateAsync, isPending } = useCreateSale();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = React.useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? 'EUR';
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async (): Promise<void> => {
    try {
      const sale = await mutateAsync({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        currency,
        discountPercent: 0,
        taxPercent: 0,
      });
      clearCart();
      setSheetOpen(false);
      setReceipt(sale);
      setReceiptOpen(true);
    } catch {
      toast({ title: t('common.errorLoadingData') });
    }
  };

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" style={{ position: 'relative' }}>
            <ShoppingCartIcon size={16} />
            {itemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--color-primary)',
                  color: 'var(--color-primary-fg)',
                  borderRadius: '9999px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0 0.3rem',
                  lineHeight: '1.4',
                  minWidth: '1.1rem',
                  textAlign: 'center',
                }}
              >
                {itemCount}
              </span>
            )}
            {t('catalog.cart')}
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              {t('catalog.cart')} ({itemCount})
            </SheetTitle>
          </SheetHeader>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
            {items.length === 0 ? (
              <div
                style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}
              >
                {t('catalog.emptyCart')}
              </div>
            ) : (
              items.map((item) => <CartItem key={item.productId} item={item} />)
            )}
          </div>

          {items.length > 0 && (
            <SheetFooter style={{ flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>{t('catalog.total')}</span>
                <span>{formatCurrency(total, currency)}</span>
              </div>
              <Button
                style={{ width: '100%' }}
                disabled={isPending}
                onClick={() => {
                  void handleCheckout();
                }}
              >
                {isPending ? t('common.loading') : t('catalog.checkout')}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearCart} style={{ width: '100%' }}>
                {t('catalog.clearCart')}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <SaleReceiptDialog sale={receipt} open={receiptOpen} onOpenChange={setReceiptOpen} />
    </>
  );
}
