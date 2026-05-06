import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import { formatCurrency } from '@shared/lib/formatCurrency';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@shared/ui/composed';
import { CartItem } from './CartItem';
import { useCart } from '../hooks/useCart';

export function CartDrawer(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { items, clearCart } = useCart();

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currency = items[0]?.currency ?? 'EUR';
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Sheet>
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
            <Button style={{ width: '100%' }}>{t('catalog.checkout')}</Button>
            <Button variant="ghost" size="sm" onClick={clearCart} style={{ width: '100%' }}>
              {t('catalog.clearCart')}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
