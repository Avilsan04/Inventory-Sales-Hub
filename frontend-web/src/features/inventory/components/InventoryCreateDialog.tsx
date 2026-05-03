import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInventoryItem } from '@features/inventory';
import { toCents } from '@shared/lib/formatCurrency';
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
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <div className={styles['grid2']}>
              <FormField label="Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="Product name" />
              </FormField>
              <FormField label="SKU" required error={errors.sku?.message}>
                <Input {...register('sku')} placeholder="INV-001" />
              </FormField>
            </div>
            <div className={styles['gridQtyPriceShort']}>
              <FormField label="Quantity" required error={errors.quantity?.message}>
                <Input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="1"
                />
              </FormField>
              <FormField label="Price" required error={errors.price?.message}>
                <Input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormField>
              <FormField label="Currency" error={errors.currency?.message}>
                <Input {...register('currency')} maxLength={3} />
              </FormField>
            </div>
            <div className={styles['grid2']}>
              <FormField label="Status" required error={errors.status?.message}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN_STOCK">In Stock</SelectItem>
                        <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Category" error={errors.category?.message}>
                <Input {...register('category')} placeholder="e.g. Laptops" />
              </FormField>
            </div>
            <FormField label="Reorder threshold" error={errors.reorderThreshold?.message}>
              <Input
                {...register('reorderThreshold', {
                  setValueAs: (v: string) => (v === '' ? undefined : parseInt(v, 10)),
                })}
                type="number"
                min="0"
                step="1"
                placeholder="Optional"
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
