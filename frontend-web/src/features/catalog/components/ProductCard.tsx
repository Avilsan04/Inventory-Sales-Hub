import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters';
import { Button, Badge } from '@shared/ui';
import { formatCurrency } from '@shared/lib';
import { useCart } from '../hooks/useCart';
import type { Product } from '@entities/product';
import styles from './ProductCard.module.scss';

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
    <article className={styles['card']}>
      {product.imageUrl !== undefined ? (
        <img src={product.imageUrl} alt={product.name} className={styles['image']} />
      ) : (
        <div className={styles['imagePlaceholder']} aria-hidden="true">
          <PackageIcon size={32} />
        </div>
      )}

      <div className={styles['header']}>
        <div className={styles['meta']}>
          <div className={styles['name']}>{product.name}</div>
          <div className={styles['sku']}>{product.sku}</div>
        </div>
        <Badge variant="success" showDot>
          {t('catalog.inStock')}
        </Badge>
      </div>

      {product.description !== undefined && (
        <p className={styles['description']}>{product.description}</p>
      )}

      <div className={styles['footer']}>
        <span className={styles['price']}>{formatCurrency(product.price, product.currency)}</span>
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
