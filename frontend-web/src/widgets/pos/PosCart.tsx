import * as React from 'react';
import { ShoppingCartIcon, CreditCardIcon, BuildingIcon, BanknoteIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCart } from '@features/sales';
import type { CartItem } from '@features/sales';
import { calculateSaleTotals } from '@features/sales/lib/saleCalculations';
import { formatCurrency } from '@shared/lib/formatCurrency';
import { cn } from '@shared/lib/cn';
import type { Customer } from '@entities/customer';
import type { PaymentMethod } from '@features/sales/models/checkout.types';
import styles from '@shared/styles/themes/pages/Pos.module.scss';

const PAYMENT_OPTIONS: Array<{ id: PaymentMethod; labelKey: string; icon: React.ReactElement }> = [
  { id: 'credit_card', labelKey: 'sales.checkout.creditCard', icon: <CreditCardIcon /> },
  { id: 'bank_transfer', labelKey: 'sales.checkout.bankTransfer', icon: <BuildingIcon /> },
  { id: 'cash_on_delivery', labelKey: 'sales.checkout.cashOnDelivery', icon: <BanknoteIcon /> },
];

export interface PosCheckoutPayload {
  customerId: string | null;
  currency: string;
  paymentMethod: PaymentMethod;
  discountPercent: number;
  taxPercent: number;
  items: CartItem[];
}

interface Props {
  customers: Customer[] | undefined;
  isCreating: boolean;
  onCheckout: (payload: PosCheckoutPayload) => void;
}

export function PosCart({ customers, isCreating, onCheckout }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const {
    items: cart,
    customerId,
    paymentMethod,
    changeQty,
    setCustomer,
    setPaymentMethod,
  } = useCart();
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [taxPercent, setTaxPercent] = React.useState(0);

  const saleTotals = React.useMemo(
    () => calculateSaleTotals({ items: cart, discountPercent, taxPercent }),
    [cart, discountPercent, taxPercent]
  );
  const currency = cart[0]?.currency ?? 'EUR';

  const handleCheckout = (): void => {
    if (cart.length === 0) return;
    onCheckout({ customerId, currency, paymentMethod, discountPercent, taxPercent, items: cart });
  };

  return (
    <aside className={styles['cart']}>
      <div className={styles['cartHeader']}>
        <p className={styles['cartTitle']}>{t('catalog.cart')}</p>
        <p className={styles['cartCount']}>
          {cart.reduce((a, i) => a + i.quantity, 0)} {t('sales.items').toLowerCase()}
        </p>
      </div>

      {cart.length === 0 ? (
        <div className={styles['cartEmpty']}>
          <ShoppingCartIcon aria-hidden="true" />
          <p>{t('catalog.emptyCart')}</p>
        </div>
      ) : (
        <div className={styles['cartItems']}>
          {cart.map((item) => (
            <div key={item.productId} className={styles['cartItem']}>
              <div className={styles['cartItemInfo']}>
                <p className={styles['cartItemName']}>{item.productName}</p>
                <p className={styles['cartItemPrice']}>
                  {formatCurrency(item.unitPrice, item.currency, 'es-ES')} / ud.
                </p>
              </div>
              <div className={styles['qtyControls']}>
                <button
                  type="button"
                  className={styles['qtyBtn']}
                  onClick={() => {
                    changeQty(item.productId, -1);
                  }}
                  aria-label={t('pos.decreaseQty')}
                >
                  −
                </button>
                <span className={styles['qtyValue']}>{item.quantity}</span>
                <button
                  type="button"
                  className={styles['qtyBtn']}
                  onClick={() => {
                    changeQty(item.productId, 1);
                  }}
                  aria-label={t('pos.increaseQty')}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles['cartFooter']}>
        <div className={styles['totals']}>
          <div className={styles['totalRow']}>
            <span>{t('pos.subtotal')}</span>
            <span>{formatCurrency(saleTotals.subtotal, currency, 'es-ES')}</span>
          </div>
          <div className={styles['totalRow']}>
            <label htmlFor="pos-discount" className={styles['totalRowInner']}>
              {t('pos.discount')}
            </label>
            <span className={styles['totalRowInner']}>
              <input
                id="pos-discount"
                type="number"
                min={0}
                max={100}
                step={1}
                value={discountPercent}
                onChange={(e) => {
                  setDiscountPercent(Number(e.target.value));
                }}
                className={styles['percentInput']}
                aria-label="Discount %"
              />
              <span className={styles['percentSymbol']}>%</span>
              <span>−{formatCurrency(saleTotals.discountAmount, currency, 'es-ES')}</span>
            </span>
          </div>
          <div className={styles['totalRow']}>
            <label htmlFor="pos-tax" className={styles['totalRowInner']}>
              {t('pos.tax')}
            </label>
            <span className={styles['totalRowInner']}>
              <input
                id="pos-tax"
                type="number"
                min={0}
                max={100}
                step={1}
                value={taxPercent}
                onChange={(e) => {
                  setTaxPercent(Number(e.target.value));
                }}
                className={styles['percentInput']}
                aria-label="Tax %"
              />
              <span className={styles['percentSymbol']}>%</span>
              <span>+{formatCurrency(saleTotals.taxAmount, currency, 'es-ES')}</span>
            </span>
          </div>
          <div className={styles['totalRowFinal']}>
            <span>{t('pos.total')}</span>
            <span>{formatCurrency(saleTotals.total, currency, 'es-ES')}</span>
          </div>
        </div>

        <select
          className={styles['customerSelect']}
          value={customerId ?? ''}
          onChange={(e) => {
            setCustomer(e.target.value !== '' ? e.target.value : null);
          }}
          aria-label={t('sales.checkout.customerOptional')}
        >
          <option value="">{t('sales.checkout.customerOptional')}</option>
          {customers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div>
          <p className={styles['payLabel']}>{t('sales.checkout.paymentTitle')}</p>
          <div className={styles['payButtons']}>
            {PAYMENT_OPTIONS.map(({ id, labelKey, icon }) => (
              <button
                key={id}
                type="button"
                className={cn(styles['payBtn'], paymentMethod === id && styles['payBtnActive'])}
                onClick={() => {
                  setPaymentMethod(id);
                }}
                aria-pressed={paymentMethod === id}
              >
                {icon}
                <span>{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={styles['ctaBtn']}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isCreating}
        >
          {isCreating ? t('sales.checkout.creating') : t('sales.checkout.placeOrder')}
        </button>
      </div>
    </aside>
  );
}
