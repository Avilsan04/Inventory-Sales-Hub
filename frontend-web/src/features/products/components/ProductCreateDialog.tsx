import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateProduct, useCategories } from '@features/products';
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
import { Button, Input, Textarea } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  sku: z.string().min(3, 'Min 3 characters').max(50, 'Max 50 characters'),
  description: z.string().optional(),
  price: z.number().nonnegative('Must be ≥ 0'),
  currency: z.string().length(3, 'Must be 3 characters'),
  categoryId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { mutate, isPending } = useCreateProduct();
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
    defaultValues: { currency: 'USD', price: 0 },
  });

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(
      { ...data, price: toCents(data.price), categoryId: data.categoryId ?? undefined },
      {
        onSuccess: () => {
          toast({ title: 'Product created' });
          onClose();
        },
        onError: (err) => {
          toast({ title: 'Failed to create', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Product</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} placeholder="Product name" />
            </FormField>
            <FormField label="SKU" required error={errors.sku?.message}>
              <Input {...register('sku')} placeholder="PRD-001" />
            </FormField>
            <div className={styles['gridPriceShort']}>
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
            <FormField label="Category" error={errors.categoryId?.message}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
            <FormField label="Description" error={errors.description?.message}>
              <Textarea {...register('description')} placeholder="Optional" rows={3} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
