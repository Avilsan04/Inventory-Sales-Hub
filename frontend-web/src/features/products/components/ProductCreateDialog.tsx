import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useCategories, useProducts } from '@features/products';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { UOM_OPTIONS } from '@shared/lib/uom';
import { toast } from '@shared/hooks/useToast';
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
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters'),
  description: z.string().optional(),
  price: z.number().nonnegative('Must be ≥ 0'),
  currency: z.string().length(3, 'Must be 3 characters'),
  categoryId: z.string().optional(),
  uom: z.enum(['unit', 'kg', 'litre', 'box', 'pack']),
  parentId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateProduct();
  const { data: categories } = useCategories();
  const { data: products } = useProducts();
  const [isVariant, setIsVariant] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', price: 0, uom: 'unit' },
  });

  const onClose = (): void => {
    reset();
    setIsVariant(false);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
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
          toast({ title: t('products.toasts.created') });
          onClose();
        },
        onError: (err) => {
          toast({
            title: t('products.toasts.createFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const parentProducts = (products ?? []).filter((p) => !p.parentId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('products.newProduct')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <label className={styles['checkboxLabel']}>
              <input
                type="checkbox"
                checked={isVariant}
                onChange={(e) => {
                  setIsVariant(e.target.checked);
                  if (!e.target.checked) setValue('parentId', '');
                }}
              />
              {t('products.isVariant')}
            </label>

            {isVariant && (
              <FormField label={t('products.parentProduct')} error={errors.parentId?.message}>
                <Controller
                  name="parentId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('products.selectParentProduct')} />
                      </SelectTrigger>
                      <SelectContent>
                        {parentProducts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            )}

            <FormField label={t('products.name')} required error={errors.name?.message}>
              <Input {...register('name')} placeholder={t('products.namePlaceholder')} />
            </FormField>
            <FormField label={t('inventory.sku')} required error={errors.sku?.message}>
              <Input {...register('sku')} placeholder={t('products.skuPlaceholder')} />
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
              <Textarea
                {...register('description')}
                placeholder={t('products.optional')}
                rows={3}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('products.creating') : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
