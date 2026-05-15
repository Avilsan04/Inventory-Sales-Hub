import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useFormatCurrency, toCents } from '@shared/lib/formatCurrency';
import type { Customer } from '@entities/customer';
import type { Product } from '@entities/product';
import type { SaleTotals } from '../../lib/saleCalculations';
import { PAYMENT_OPTIONS } from '../../lib/checkout.schemas';
import type { FormValues } from '../../lib/checkout.schemas';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

interface Props {
  customers: Customer[];
  products: Product[];
  saleTotals: SaleTotals;
}

export function SaleCheckoutStep3({ customers, products, saleTotals }: Props): React.ReactElement {
  const { watch } = useFormContext<FormValues>();
  const { translate: t } = useTranslationAdapter();
  const formatCurrency = useFormatCurrency();
  const formValues = watch();

  const selectedCustomerName = customers.find((c) => c.id === formValues.customerId)?.name;
  const paymentLabel = PAYMENT_OPTIONS.find((o) => o.method === formValues.paymentMethod);
  const maskedCard = formValues.cardNumber
    ? t('sales.checkout.maskedCard', { last4: formValues.cardNumber.replace(/\s/g, '').slice(-4) })
    : '';

  return (
    <div className={styles['body']}>
      <p className={styles['sectionTitle']}>{t('sales.checkout.confirmTitle')}</p>

      {formValues.items
        .filter((it) => it.productId)
        .map((it) => {
          const pName = products.find((p) => p.id === it.productId)?.name ?? it.productId;
          return (
            <div key={it.productId} className={styles['summaryRow']}>
              <span className={styles['summaryLabel']}>
                {pName} × {it.quantity}
              </span>
              <span className={styles['summaryValue']}>
                {formatCurrency(toCents(it.quantity * it.unitPrice), formValues.currency)}
              </span>
            </div>
          );
        })}

      {saleTotals.discountAmount > 0 && (
        <div className={styles['summaryRow']}>
          <span className={styles['summaryLabel']}>
            {t('sales.discountWithPct', { pct: formValues.discountPercent })}
          </span>
          <span className={styles['summaryValue']}>
            −{formatCurrency(saleTotals.discountAmount, formValues.currency)}
          </span>
        </div>
      )}
      {saleTotals.taxAmount > 0 && (
        <div className={styles['summaryRow']}>
          <span className={styles['summaryLabel']}>
            {t('sales.taxWithPct', { pct: formValues.taxPercent })}
          </span>
          <span className={styles['summaryValue']}>
            +{formatCurrency(saleTotals.taxAmount, formValues.currency)}
          </span>
        </div>
      )}
      <div className={styles['summaryRow']}>
        <span className={styles['summaryLabel']}>{t('sales.checkout.runningTotal')}</span>
        <strong className={styles['summaryValue']}>
          {formatCurrency(saleTotals.total, formValues.currency)}
        </strong>
      </div>

      <div className={styles['summaryRow']}>
        <span className={styles['summaryLabel']}>{t('sales.checkout.shippingTo')}</span>
        <span className={styles['summaryValue']}>
          {selectedCustomerName ? `${selectedCustomerName} — ` : ''}
          {formValues.address}
        </span>
      </div>

      <div className={styles['summaryRow']}>
        <span className={styles['summaryLabel']}>{t('sales.checkout.payWith')}</span>
        <span className={styles['summaryValue']}>
          {paymentLabel ? t(paymentLabel.labelKey) : ''}
          {formValues.paymentMethod === 'credit_card' && formValues.cardNumber
            ? ` — ${maskedCard}`
            : ''}
        </span>
      </div>

      <p className={styles['infoText']}>{t('sales.checkout.estimatedDelivery')}</p>
    </div>
  );
}
