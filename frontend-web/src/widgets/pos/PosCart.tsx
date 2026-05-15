import * as React from 'react';
import {
  ShoppingCartIcon,
  CreditCardIcon,
  LandmarkIcon,
  BanknoteIcon,
  WalletCardsIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useCart } from '@features/sales';
import type { CartItem } from '@features/sales';
import { calculateSaleTotals } from '@features/sales';
import { useFormatCurrency } from '@shared/lib/formatCurrency';
import { cn } from '@shared/lib/cn';
import type { Customer } from '@entities/customer';
import type { PaymentMethod } from '@features/sales';
import { MOCK_BANK_IBAN } from '@features/sales';
import { Label, Button } from '@shared/ui/primitives';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@shared/ui/composed';
import { CreditCardForm } from './CreditCardForm';
import styles from '@shared/styles/themes/pages/Pos.module.scss';

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  labelKey: string;
  icon: React.ReactElement;
}> = [
  { id: 'credit_card', labelKey: 'sales.checkout.creditCard', icon: <CreditCardIcon /> },
  { id: 'bank_transfer', labelKey: 'sales.checkout.bankTransfer', icon: <LandmarkIcon /> },
  { id: 'cash_on_delivery', labelKey: 'sales.checkout.cashOnDelivery', icon: <BanknoteIcon /> },
];

export interface PosCheckoutPayload {
  customerId: string | null;
  currency: string;
  paymentMethod: PaymentMethod;
  discountPercent: number;
  taxPercent: number;
  items: CartItem[];
  paymentDetails?: {
    holderName?: string;
    cardNumber?: string;
    expiry?: string;
    cvv?: string;
  };
}

interface Props {
  customers: Customer[] | undefined;
  isCreating: boolean;
  onCheckout: (payload: PosCheckoutPayload) => void;
}

export function PosCart({ customers, isCreating, onCheckout }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const fmt = useFormatCurrency();
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

  const [cardHolder, setCardHolder] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');

  const saleTotals = React.useMemo(
    () => calculateSaleTotals({ items: cart, discountPercent, taxPercent }),
    [cart, discountPercent, taxPercent]
  );
  const currency = cart[0]?.currency ?? 'EUR';

  const maskedCardSuffix = cardNumber.replace(/\s/g, '').slice(-4) || '••••';

  const handleCheckout = (): void => {
    if (cart.length === 0) return;
    onCheckout({
      customerId,
      currency,
      paymentMethod,
      discountPercent,
      taxPercent,
      items: cart,
      paymentDetails:
        paymentMethod === 'credit_card'
          ? { holderName: cardHolder, cardNumber, expiry, cvv }
          : undefined,
    });
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
                  {fmt(item.unitPrice)} {t('pos.perUnit')}
                </p>
              </div>
              <div className={styles['qtyControls']}>
                <Button
                  variant="ghost"
                  className={styles['qtyBtn']}
                  onClick={() => {
                    changeQty(item.productId, -1);
                  }}
                  aria-label={t('pos.decreaseQty')}
                >
                  −
                </Button>
                <span className={styles['qtyValue']}>{item.quantity}</span>
                <Button
                  variant="ghost"
                  className={styles['qtyBtn']}
                  onClick={() => {
                    changeQty(item.productId, 1);
                  }}
                  aria-label={t('pos.increaseQty')}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles['cartFooter']}>
        <div className={styles['totals']}>
          <div className={styles['totalRow']}>
            <span>{t('pos.subtotal')}</span>
            <span>{fmt(saleTotals.subtotal)}</span>
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
                aria-label={t('pos.discountAriaLabel')}
              />
              <span className={styles['percentSymbol']}>%</span>
              <span>−{fmt(saleTotals.discountAmount)}</span>
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
                aria-label={t('pos.taxAriaLabel')}
              />
              <span className={styles['percentSymbol']}>%</span>
              <span>+{fmt(saleTotals.taxAmount)}</span>
            </span>
          </div>
          <div className={styles['totalRowFinal']}>
            <span>{t('pos.total')}</span>
            <span>{fmt(saleTotals.total)}</span>
          </div>
        </div>

        <Select
          value={customerId ?? '__none__'}
          onValueChange={(val): void => {
            setCustomer(val === '__none__' ? null : val);
          }}
        >
          <SelectTrigger
            className={styles['customerSelect']}
            aria-label={t('sales.checkout.customerOptional')}
          >
            <SelectValue placeholder={t('sales.checkout.customerOptional')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t('sales.checkout.customerOptional')}</SelectItem>
            {customers?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          {/* Section header with divider — Stitch pattern */}
          <div className={styles['paySectionHeader']}>
            <span className={styles['paySectionLabel']}>{t('sales.checkout.paymentTitle')}</span>
            <hr className={styles['paySectionDivider']} />
          </div>

          {/* 2×2 horizontal payment method cards */}
          <div
            className={styles['payGrid']}
            role="radiogroup"
            aria-label={t('sales.checkout.paymentTitle')}
          >
            {PAYMENT_OPTIONS.map(({ id, labelKey, icon }) => (
              <Button
                key={id}
                variant="ghost"
                role="radio"
                aria-checked={paymentMethod === id}
                className={cn(styles['payCard'], paymentMethod === id && styles['payCardActive'])}
                onClick={() => {
                  setPaymentMethod(id);
                }}
              >
                <span className={styles['payCardIcon']}>{icon}</span>
                <span className={styles['payCardLabel']}>{t(labelKey)}</span>
              </Button>
            ))}
            <div
              className={cn(styles['payCard'], styles['payCardDisabled'])}
              aria-disabled="true"
              role="button"
            >
              <span className={styles['payCardIcon']}>
                <WalletCardsIcon aria-hidden="true" />
              </span>
              <span className={styles['payCardLabel']}>{t('sales.checkout.platformPayments')}</span>
              <span className={styles['payCardBadge']}>{t('sales.checkout.comingSoon')}</span>
            </div>
          </div>

          {/* Credit card form with mini card preview */}
          {paymentMethod === 'credit_card' && (
            <CreditCardForm
              cardHolder={cardHolder}
              cardNumber={cardNumber}
              expiry={expiry}
              cvv={cvv}
              maskedCardSuffix={maskedCardSuffix}
              onCardHolderChange={setCardHolder}
              onCardNumberChange={setCardNumber}
              onExpiryChange={setExpiry}
              onCvvChange={setCvv}
            />
          )}

          {/* Bank transfer IBAN box */}
          {paymentMethod === 'bank_transfer' && (
            <div className={styles['paymentForm']}>
              <div className={styles['paymentField']}>
                <Label>{t('sales.checkout.ibanLabel')}</Label>
                <div className={styles['ibanBox']}>{MOCK_BANK_IBAN}</div>
              </div>
            </div>
          )}

          {/* Cash on delivery info */}
          {paymentMethod === 'cash_on_delivery' && (
            <div className={styles['infoBox']}>{t('sales.checkout.cashNote')}</div>
          )}
        </div>

        <Button
          className={styles['ctaBtn']}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isCreating}
        >
          {isCreating ? t('sales.checkout.creating') : t('sales.checkout.placeOrder')}
        </Button>
      </div>
    </aside>
  );
}
