import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Badge } from '@shared/ui/primitives';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { useCart } from '../hooks/useCart';
import type { Product } from '@entities/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { addItem, items } = useCart();

  const inCart = items.find((i) => i.productId === product.id);

  const handleAdd = (): void => {
    addItem({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      currency: product.currency,
      maxStock: 99,
    });
  };

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        background: 'var(--color-bg-card)',
      }}
    >
      {product.imageUrl !== undefined ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ) : (
        <div
          style={{
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-surface-low)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <PackageIcon size={32} aria-hidden="true" />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{product.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{product.sku}</div>
        </div>
        <Badge variant="success" showDot>
          {t('catalog.inStock')}
        </Badge>
      </div>

      {product.description !== undefined && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineClamp: 2,
          }}
        >
          {product.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>
          {formatCurrency(product.price, product.currency)}
        </span>
        <Button
          size="sm"
          variant={inCart !== undefined ? 'secondary' : 'default'}
          onClick={handleAdd}
        >
          {inCart !== undefined
            ? `${t('catalog.addMore')} (${String(inCart.quantity)})`
            : t('catalog.addToCart')}
        </Button>
      </div>
    </article>
  );
}
