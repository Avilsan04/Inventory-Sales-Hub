import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWarehouses } from '../hooks/useWarehouses';
import { useTransferStock } from '../hooks/useTransferStock';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Input, Label } from '@shared/ui/primitives';
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
import type { InventoryItem } from '@entities/inventory';

type FormValues = {
  quantity: number;
  fromWarehouseId: string;
  toWarehouseId: string;
};

interface StockTransferDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockTransferDialog({
  item,
  open,
  onOpenChange,
}: StockTransferDialogProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: warehouses } = useWarehouses();
  const { mutate: transfer, isPending } = useTransferStock();

  const schema = React.useMemo(
    () =>
      z
        .object({
          quantity: z.number().int().positive(t('inventory.validQtyPositive')),
          fromWarehouseId: z.string().min(1, t('inventory.validFromWarehouse')),
          toWarehouseId: z.string().min(1, t('inventory.validToWarehouse')),
        })
        .refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
          message: t('inventory.validSameWarehouse'),
          path: ['toWarehouseId'],
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
      fromWarehouseId: item?.warehouseId ?? '',
      toWarehouseId: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({ quantity: 1, fromWarehouseId: item?.warehouseId ?? '', toWarehouseId: '' });
    }
  }, [open, item, reset]);

  const onSubmit = (values: FormValues): void => {
    if (!item) return;
    transfer(
      { itemId: item.id, ...values },
      {
        onSuccess: () => {
          toast({ title: 'Stock transferred' });
          onOpenChange(false);
        },
        onError: (err) => {
          toast({ title: 'Transfer failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  const activeWarehouses = (warehouses ?? []).filter((w) => w.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: '420px' }}>
        <DialogHeader>
          <DialogTitle>{t('inventory.transferTitle', { name: item?.name ?? '' })}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <FormField
              label={t('inventory.sourceWarehouse')}
              error={errors.fromWarehouseId?.message}
            >
              <Controller
                name="fromWarehouseId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('inventory.selectWarehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeWarehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label={t('inventory.targetWarehouse')} error={errors.toWarehouseId?.message}>
              <Controller
                name="toWarehouseId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('inventory.selectWarehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeWarehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <div>
              <Label htmlFor="transfer-qty">{t('inventory.quantity')}</Label>
              <Input
                id="transfer-qty"
                type="number"
                min={1}
                max={item?.quantity ?? undefined}
                style={{ marginTop: '0.375rem' }}
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p
                  style={{
                    color: 'var(--color-destructive)',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                  }}
                >
                  {errors.quantity.message}
                </p>
              )}
              {item && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-muted-foreground)',
                    marginTop: '0.25rem',
                  }}
                >
                  {t('inventory.available', { qty: item.quantity })}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('inventory.transferring') : t('inventory.transfer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
