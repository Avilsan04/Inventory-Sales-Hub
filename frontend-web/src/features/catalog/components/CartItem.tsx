import * as React from 'react';
import { MinusIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@shared/ui/primitives';
import { useCart } from '../hooks/useCart';
import type { CartItem as CartItemType } from '../hooks/useCart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps): React.ReactElement {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 500,
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currency }).format(
            item.price
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            updateQuantity(item.productId, item.quantity - 1);
          }}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <MinusIcon size={12} />
        </Button>
        <span style={{ minWidth: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            updateQuantity(item.productId, item.quantity + 1);
          }}
          disabled={item.quantity >= item.maxStock}
          aria-label="Increase quantity"
        >
          <PlusIcon size={12} />
        </Button>
      </div>

      <div style={{ fontWeight: 600, fontSize: '0.875rem', minWidth: '4rem', textAlign: 'right' }}>
        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currency }).format(
          item.price * item.quantity
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          removeItem(item.productId);
        }}
        aria-label="Remove item"
      >
        <TrashIcon size={12} />
      </Button>
    </div>
  );
}
