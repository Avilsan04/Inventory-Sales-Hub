import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateInventoryItem } from '@features/inventory';
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
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  quantity: z.number().int('Must be integer').nonnegative('Must be ≥ 0'),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
  reorderThreshold: z.number().int().nonnegative().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryEditDialog({ item, open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useUpdateInventoryItem(item?.id ?? '');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { quantity: 0, status: 'IN_STOCK' },
  });

  React.useEffect(() => {
    if (open && item !== null) {
      reset({
        quantity: item.quantity,
        status: item.status,
        reorderThreshold: item.reorderThreshold,
      });
    }
  }, [open, item, reset]);

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (item === null) return;
    // Send explicit DTO fields — avoid leaking item id/lastUpdated into request body
    mutate(
      {
        sku: item.sku,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency,
        category: item.category,
        quantity: data.quantity,
        status: data.status,
        reorderThreshold: data.reorderThreshold,
      },
      {
        onSuccess: () => {
          toast({ title: 'Item updated' });
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
          <DialogTitle>{t('inventory.editItem', { name: item?.name ?? '' })}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label={t('inventory.quantity')} required error={errors.quantity?.message}>
              <Input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                min="0"
                step="1"
              />
            </FormField>
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
              {isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
