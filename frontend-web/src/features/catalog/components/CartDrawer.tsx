import * as React from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters';
import { useRoutingAdapter } from '@adapters';
import { Button } from '@shared/ui';
import { useFormatCurrency } from '@shared/lib';
import { APP_ROUTES } from '@shared/config';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@shared/ui';
import { CartItem } from './CartItem';
import { useCart } from '../hooks/useCart';
import styles from './CartDrawer.module.scss';

export function CartDrawer(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const fmt = useFormatCurrency();
  const { navigateTo } = useRoutingAdapter();
  const { items, clearCart } = useCart();

  const [sheetOpen, setSheetOpen] = React.useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleGoToCheckout = (): void => {
    setSheetOpen(false);
    navigateTo(APP_ROUTES.POS);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={styles['trigger']}>
          <ShoppingCartIcon size={16} />
          {itemCount > 0 && (
            <span
              className={styles['badge']}
              aria-label={`${String(itemCount)} ${t('catalog.cart')}`}
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

        <div className={styles['body']}>
          {items.length === 0 ? (
            <div className={styles['emptyState']}>{t('catalog.emptyCart')}</div>
          ) : (
            items.map((item) => <CartItem key={item.productId} item={item} />)
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className={styles['footer']}>
            <div className={styles['total']}>
              <span>{t('catalog.total')}</span>
              <span>{fmt(total)}</span>
            </div>
            <Button className={styles['fullWidth']} onClick={handleGoToCheckout}>
              {t('catalog.checkout')}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearCart} className={styles['fullWidth']}>
              {t('catalog.clearCart')}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
