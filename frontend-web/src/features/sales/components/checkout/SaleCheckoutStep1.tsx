import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField } from '@shared/ui/composed';
import { Input, Textarea } from '@shared/ui/primitives';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import type { FormValues } from '../../lib/checkout.schemas';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

export function SaleCheckoutStep1(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormValues>();
  const { translate: t } = useTranslationAdapter();

  return (
    <div className={styles['body']}>
      <p className={styles['sectionTitle']}>{t('sales.checkout.shippingTitle')}</p>
      <FormField label={t('sales.checkout.address')} error={errors.address?.message}>
        <Input {...register('address')} placeholder={t('sales.checkout.addressPlaceholder')} />
      </FormField>
      <div className={styles['grid2']}>
        <FormField label={t('sales.checkout.contactName')} error={errors.contactName?.message}>
          <Input
            {...register('contactName')}
            placeholder={t('sales.checkout.contactNamePlaceholder')}
          />
        </FormField>
        <FormField label={t('sales.checkout.contactPhone')} error={errors.contactPhone?.message}>
          <Input
            {...register('contactPhone')}
            placeholder={t('sales.checkout.contactPhonePlaceholder')}
          />
        </FormField>
      </div>
      <FormField label={t('sales.checkout.notes')}>
        <Textarea {...register('notes')} placeholder={t('sales.checkout.notesPlaceholder')} />
      </FormField>
    </div>
  );
}
