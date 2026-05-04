import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInventoryItem } from '@features/inventory';
import { toCents } from '@shared/lib/formatCurrency';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  FormField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@shared/ui/composed';
import { Button, Input } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  sku: z.string().min(3, 'Min 3 characters').max(50),
  name: z.string().min(1, 'Required'),
  quantity: z.number().int('Must be integer').nonnegative('Must be ≥ 0'),
  price: z.number().nonnegative('Must be ≥ 0'),
  currency: z.string().length(3, 'Must be 3 characters'),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
  category: z.string().optional(),
  reorderThreshold: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateInventoryItem();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', quantity: 0, price: 0, status: 'IN_STOCK' },
  });

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(
      { ...data, price: toCents(data.price) },
      {
        onSuccess: () => {
          toast({ title: 'Item added to inventory' });
          onClose();
        },
        onError: (err) => {
          toast({ title: 'Failed to add item', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.addItem')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <div className={styles['grid2']}>
              <FormField label={t('inventory.name')} required error={errors.name?.message}>
                <Input {...register('name')} placeholder={t('products.namePlaceholder')} />
              </FormField>
              <FormField label={t('inventory.sku')} required error={errors.sku?.message}>
                <Input {...register('sku')} placeholder={t('inventory.skuPlaceholder')} />
              </FormField>
            </div>
            <div className={styles['gridQtyPriceShort']}>
              <FormField label={t('inventory.quantity')} required error={errors.quantity?.message}>
                <Input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="1"
                />
              </FormField>
              <FormField label={t('inventory.price')} required error={errors.price?.message}>
                <Input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormField>
              <FormField label={t('products.currency')} error={errors.currency?.message}>
                <Input {...register('currency')} maxLength={3} />
              </FormField>
            </div>
            <div className={styles['grid2']}>
              <FormField label={t('common.status')} required error={errors.status?.message}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN_STOCK">{t('inventory.statusInStock')}</SelectItem>
                        <SelectItem value="LOW_STOCK">{t('inventory.statusLowStock')}</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">
                          {t('inventory.statusOutOfStock')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={t('inventory.category')} error={errors.category?.message}>
                <Input {...register('category')} placeholder={t('inventory.categoryPlaceholder')} />
              </FormField>
            </div>
            <FormField
              label={t('inventory.reorderThreshold')}
              error={errors.reorderThreshold?.message}
            >
              <Input
                {...register('reorderThreshold', {
                  setValueAs: (v: string) => (v === '' ? undefined : parseInt(v, 10)),
                })}
                type="number"
                min="0"
                step="1"
                placeholder={t('products.optional')}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.adding') : t('inventory.addItem')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
