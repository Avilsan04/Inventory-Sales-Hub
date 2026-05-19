import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { inventoryKeys } from '../hooks/useInventory';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  FormField,
} from '@shared/ui/composed';
import { Button, Input } from '@shared/ui/primitives';
import type { InventoryItem } from '@entities/inventory';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  quantity: z.number().int('Must be integer').nonnegative('Must be ≥ 0'),
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
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { quantity: 0 },
  });

  React.useEffect(() => {
    if (open && item !== null) {
      reset({
        quantity: item.quantity,
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
    setIsSaving(true);

    const calls: Promise<unknown>[] = [];

    if (data.quantity !== item.quantity) {
      calls.push(inventoryApi.adjustStock(item.id, { quantity: data.quantity - item.quantity }));
    }

    if (data.reorderThreshold !== item.reorderThreshold) {
      calls.push(inventoryApi.updateItem(item.id, { minStock: data.reorderThreshold }));
    }

    if (calls.length === 0) {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(item.id) });
      toast({ title: t('inventory.toasts.updated') });
      setIsSaving(false);
      onClose();
      return;
    }

    Promise.all(calls)
      .then(() => {
        toast({ title: t('inventory.toasts.updated') });
        onClose();
      })
      .catch((err: unknown) => {
        toast({
          title: t('common.toasts.updateFailed'),
          description: err instanceof Error ? err.message : String(err),
          variant: 'destructive',
        });
      })
      .finally(() => {
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(item.id) });
        setIsSaving(false);
      });
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
