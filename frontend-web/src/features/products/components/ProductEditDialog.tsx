import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateProduct, useCategories } from '@features/products';
import { UOM_OPTIONS } from '@shared/lib/uom';
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
import { Button, Input, Textarea } from '@shared/ui/primitives';
import type { Product } from '@entities/product';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters'),
  description: z.string().optional(),
  price: z.number().nonnegative('Must be ≥ 0'),
  currency: z.string().length(3, 'Must be 3 characters'),
  categoryId: z.string().optional(),
  uom: z.enum(['unit', 'kg', 'litre', 'box', 'pack']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductEditDialog({ product, open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useUpdateProduct(product?.id ?? '');
  const { data: categories } = useCategories();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', price: 0, uom: 'unit' as const },
  });

  React.useEffect(() => {
    if (open && product !== null) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        currency: product.currency,
        categoryId: product.categoryId,
        uom: product.uom,
      });
    }
  }, [open, product, reset]);

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (product === null) return;
    mutate(
      {
        name: data.name,
        description: data.description,
        sku: data.sku,
        purchasePrice: data.price,
        salePrice: data.price,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Product updated' });
          onClose();
        },
        onError: (err) => {
          toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('products.editProduct')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label={t('products.name')} required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label={t('inventory.sku')} required error={errors.sku?.message}>
              <Input {...register('sku')} />
            </FormField>
            <div className={styles['gridPriceShort']}>
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
            <div className={styles['gridPriceShort']}>
              <FormField label={t('products.uom')} error={errors.uom?.message}>
                <Controller
                  name="uom"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UOM_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={t('inventory.category')} error={errors.categoryId?.message}>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('products.selectCategory')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <FormField label={t('products.description')} error={errors.description?.message}>
              <Textarea {...register('description')} rows={3} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
