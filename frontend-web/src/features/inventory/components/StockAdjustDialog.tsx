import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdjustStock } from '@features/inventory';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { toast } from '@shared/hooks/useToast';
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
  quantity: z.number().int('Must be integer'),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockAdjustDialog({ item, open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useAdjustStock(item?.id ?? '');
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
    if (open) reset({ quantity: 0, note: '' });
  }, [open, reset]);

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (item === null) return;
    mutate(data, {
      onSuccess: () => {
        toast({ title: t('inventory.toasts.stockAdjusted') });
        onClose();
      },
      onError: (err) => {
        toast({
          title: t('inventory.toasts.adjustFailed'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.adjustStock', { name: item?.name ?? '' })}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <p className={styles['infoText']}>
              {t('inventory.currentStock', { qty: item?.quantity ?? 0 })}
            </p>
            <FormField
              label={t('inventory.adjustmentQty')}
              required
              error={errors.quantity?.message}
            >
              <Input
                {...register('quantity', { valueAsNumber: true })}
                type="number"
                step="1"
                placeholder={t('inventory.adjustmentQtyPlaceholder')}
              />
            </FormField>
            <FormField label={t('inventory.note')} error={errors.note?.message}>
              <Input {...register('note')} placeholder={t('inventory.notePlaceholder')} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('inventory.applying') : t('common.apply')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
