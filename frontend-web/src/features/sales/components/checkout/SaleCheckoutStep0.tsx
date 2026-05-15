import * as React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { PlusIcon, TrashIcon } from 'lucide-react';
import {
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@shared/ui/composed';
import { Button, Input } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useFormatCurrency, fromCents } from '@shared/lib/formatCurrency';
import type { Customer } from '@entities/customer';
import type { Product } from '@entities/product';
import type { SaleTotals } from '../../lib/saleCalculations';
import type { FormValues } from '../../lib/checkout.schemas';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

interface Props {
  customers: Customer[];
  products: Product[];
  saleTotals: SaleTotals;
}

export function SaleCheckoutStep0({ customers, products, saleTotals }: Props): React.ReactElement {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext<FormValues>();
  const { translate: t } = useTranslationAdapter();
  const fmt = useFormatCurrency();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const renderItemErrors = (): React.ReactNode => {
    const ie = errors.items;
    if (!ie) return null;
    if (!Array.isArray(ie) && 'message' in ie && typeof ie.message === 'string') {
      return <p className={styles['errorBanner']}>{ie.message}</p>;
    }
    return null;
  };

  return (
    <div className={styles['bodyScroll']}>
      <div className={styles['gridPriceShort']}>
        <FormField label={t('sales.checkout.customerOptional')}>
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sales.checkout.walkIn')} />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
        <FormField label={t('sales.checkout.currency')} error={errors.currency?.message}>
          <Input {...register('currency')} maxLength={3} />
        </FormField>
      </div>

      <div>
        <p className={styles['sectionTitle']}>{t('sales.checkout.stepItems')}</p>
        {renderItemErrors()}
        {fields.map((field, index) => {
          const itemErrors = errors.items;
          const rowErr = Array.isArray(itemErrors)
            ? (itemErrors[index] as FieldErrors<FormValues['items'][number]> | undefined)
            : undefined;
          return (
            <div key={field.id} className={styles['saleItemRow']}>
              <FormField
                label={index === 0 ? t('sales.checkout.product') : ''}
                error={rowErr?.productId?.message}
              >
                <Controller
                  name={`items.${index}.productId`}
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value}
                      onValueChange={(v: string) => {
                        f.onChange(v);
                        const prod = products.find((p) => p.id === v);
                        if (prod !== undefined) {
                          setValue(`items.${index}.unitPrice`, fromCents(prod.price));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('sales.checkout.selectProduct')} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField
                label={index === 0 ? t('sales.checkout.qty') : ''}
                error={rowErr?.quantity?.message}
              >
                <Input
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  type="number"
                  min="1"
                  step="1"
                />
              </FormField>
              <FormField
                label={index === 0 ? t('sales.checkout.price') : ''}
                error={rowErr?.unitPrice?.message}
              >
                <Input
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="0.01"
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  remove(index);
                }}
                disabled={fields.length === 1}
                className={index === 0 ? styles['deleteBtnFirst'] : styles['deleteBtn']}
              >
                <TrashIcon size={14} />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            append({ productId: '', quantity: 1, unitPrice: 0 });
          }}
        >
          <PlusIcon size={14} /> {t('sales.checkout.addItem')}
        </Button>
      </div>

      <div className={cn(styles['grid2'], styles['gridOffset'])}>
        <FormField label={t('sales.discountLabel')}>
          <Input
            {...register('discountPercent', { valueAsNumber: true })}
            type="number"
            min="0"
            max="100"
            step="1"
          />
        </FormField>
        <FormField label={t('sales.taxLabel')}>
          <Input
            {...register('taxPercent', { valueAsNumber: true })}
            type="number"
            min="0"
            max="100"
            step="1"
          />
        </FormField>
      </div>

      <div className={styles['runningTotal']}>
        <span>{t('sales.checkout.runningTotal')}</span>
        <strong>{fmt(saleTotals.total)}</strong>
      </div>
    </div>
  );
}
