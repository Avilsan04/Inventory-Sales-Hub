import * as React from 'react';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@shared/ui';
import { formatCurrency } from '@shared/lib';
import { useTranslationAdapter } from '@adapters';
import { useCart } from '../hooks/useCart';
import type { CartItem as CartItemType } from '../hooks/useCart';
import styles from './CartItem.module.scss';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps): React.ReactElement {
  const { updateQuantity, removeItem } = useCart();
  const { translate: t } = useTranslationAdapter();

  return (
    <div className={styles['item']}>
      <div className={styles['info']}>
        <div className={styles['name']}>{item.name}</div>
        <div className={styles['unitPrice']}>{formatCurrency(item.price, item.currency)}</div>
      </div>

      <div className={styles['qtyControls']}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            updateQuantity(item.productId, item.quantity - 1);
          }}
          disabled={item.quantity <= 1}
          aria-label={t('pos.decreaseQty')}
        >
          <MinusIcon size={12} />
        </Button>
        <span className={styles['qtyValue']}>{item.quantity}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            updateQuantity(item.productId, item.quantity + 1);
          }}
          disabled={item.quantity >= item.maxStock}
          aria-label={t('pos.increaseQty')}
        >
          <PlusIcon size={12} />
        </Button>
      </div>

      <div className={styles['lineTotal']}>
        {formatCurrency(item.price * item.quantity, item.currency)}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          removeItem(item.productId);
        }}
        aria-label={t('catalog.removeItem')}
      >
        <TrashIcon size={12} />
      </Button>
    </div>
  );
}
