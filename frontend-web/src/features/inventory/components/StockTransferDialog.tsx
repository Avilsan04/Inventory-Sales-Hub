import * as React from 'react';
import { useForm, Controller, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useWarehouses } from '../hooks/useWarehouses';
import { useTransferStock } from '../hooks/useTransferStock';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Input, Label } from '@shared/ui';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';
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
} from '@shared/ui';
import type { InventoryItem } from '@entities/inventory';

type FormValues = { quantity: number; fromWarehouseId: string; toWarehouseId: string };

function buildTransferDefaults(item: InventoryItem | null): FormValues {
  return { quantity: 1, fromWarehouseId: item?.warehouseId ?? '', toWarehouseId: '' };
}

interface WarehouseOption {
  id: string;
  name: string;
}

interface WarehouseSelectFieldProps {
  name: 'fromWarehouseId' | 'toWarehouseId';
  label: string;
  error: string | undefined;
  control: Control<FormValues>;
  options: WarehouseOption[];
  placeholder: string;
}

function WarehouseSelectField({
  name,
  label,
  error,
  control,
  options,
  placeholder,
}: WarehouseSelectFieldProps): React.ReactElement {
  return (
    <FormField label={label} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }): React.ReactElement => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

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
    defaultValues: buildTransferDefaults(item),
  });

  React.useEffect(() => {
    if (open) reset(buildTransferDefaults(item));
  }, [open, item, reset]);

  const onSubmit = (values: FormValues): void => {
    if (!item) return;
    transfer(
      { itemId: item.id, ...values },
      {
        onSuccess: (): void => {
          toast({ title: t('inventory.toasts.stockTransferred') });
          onOpenChange(false);
        },
        onError: (err): void => {
          toast({
            title: t('inventory.toasts.transferFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const activeWarehouses = (warehouses ?? []).filter((w) => w.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles['dialogNarrow']}>
        <DialogHeader>
          <DialogTitle>{t('inventory.transferTitle', { name: item?.name ?? '' })}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e): void => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <WarehouseSelectField
              name="fromWarehouseId"
              label={t('inventory.sourceWarehouse')}
              error={errors.fromWarehouseId?.message}
              control={control}
              options={activeWarehouses}
              placeholder={t('inventory.selectWarehouse')}
            />
            <WarehouseSelectField
              name="toWarehouseId"
              label={t('inventory.targetWarehouse')}
              error={errors.toWarehouseId?.message}
              control={control}
              options={activeWarehouses}
              placeholder={t('inventory.selectWarehouse')}
            />
            <div>
              <Label htmlFor="transfer-qty">{t('inventory.quantity')}</Label>
              <Input
                id="transfer-qty"
                type="number"
                min={1}
                max={item?.quantity}
                className={styles['fieldInput']}
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && <p className={styles['fieldError']}>{errors.quantity.message}</p>}
              {item && (
                <p className={styles['fieldHint']}>
                  {t('inventory.available', { qty: item.quantity })}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={(): void => {
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
