import * as React from 'react';
import { CreditCardIcon, BuildingIcon, BanknoteIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '@shared/ui/composed';
import { Input, Label } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { MOCK_BANK_IBAN } from '../../models/checkout.types';
import { PAYMENT_OPTIONS } from '../../lib/checkout.schemas';
import type { FormValues } from '../../lib/checkout.schemas';
import type { PaymentMethod } from '../../models/checkout.types';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactElement> = {
  credit_card: <CreditCardIcon aria-hidden="true" />,
  bank_transfer: <BuildingIcon aria-hidden="true" />,
  cash_on_delivery: <BanknoteIcon aria-hidden="true" />,
};

export function SaleCheckoutStep2(): React.ReactElement {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<FormValues>();
  const { translate: t } = useTranslationAdapter();
  const watchedMethod = watch('paymentMethod');

  return (
    <div className={styles['body']}>
      <p className={styles['sectionTitle']}>{t('sales.checkout.paymentTitle')}</p>
      <div className={styles['paymentCards']}>
        {PAYMENT_OPTIONS.map(({ method, labelKey }) => (
          <button
            key={method}
            type="button"
            className={cn(
              styles['paymentCard'],
              watchedMethod === method && styles['paymentCardActive']
            )}
            onClick={() => {
              setValue('paymentMethod', method);
            }}
          >
            <span className={styles['paymentCardIcon']}>{PAYMENT_ICONS[method]}</span>
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {watchedMethod === 'credit_card' && (
        <>
          <FormField label={t('sales.checkout.holderName')} error={errors.holderName?.message}>
            <Input
              {...register('holderName')}
              placeholder={t('sales.checkout.holderNamePlaceholder')}
            />
          </FormField>
          <FormField label={t('sales.checkout.cardNumber')} error={errors.cardNumber?.message}>
            <Input
              {...register('cardNumber')}
              placeholder={t('sales.checkout.cardNumberPlaceholder')}
              maxLength={19}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                setValue('cardNumber', formatted);
              }}
            />
          </FormField>
          <div className={styles['grid2']}>
            <FormField label={t('sales.checkout.expiry')} error={errors.expiry?.message}>
              <Input
                {...register('expiry')}
                placeholder={t('sales.checkout.expiryPlaceholder')}
                maxLength={5}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                  setValue('expiry', v);
                }}
              />
            </FormField>
            <FormField label={t('sales.checkout.cvv')} error={errors.cvv?.message}>
              <Input
                {...register('cvv')}
                placeholder={t('sales.checkout.cvvPlaceholder')}
                maxLength={4}
                type="password"
              />
            </FormField>
          </div>
        </>
      )}

      {watchedMethod === 'bank_transfer' && (
        <>
          <Label>{t('sales.checkout.ibanLabel')}</Label>
          <div className={styles['ibanBox']}>{MOCK_BANK_IBAN}</div>
        </>
      )}

      {watchedMethod === 'cash_on_delivery' && (
        <div className={styles['infoBox']}>{t('sales.checkout.cashNote')}</div>
      )}
    </div>
  );
}
