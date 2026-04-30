import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateSaleStatus } from '@features/sales';
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
import { Button } from '@shared/ui/primitives';
import type { Sale } from '@entities/sale';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleStatusDialog({ sale, open, onOpenChange }: Props): React.ReactElement {
  const { mutate, isPending } = useUpdateSaleStatus(sale?.id ?? '');
  const { handleSubmit, reset, control } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { status: 'pending' },
  });

  React.useEffect(() => {
    if (open && sale !== null) {
      reset({ status: sale.status });
    }
  }, [open, sale, reset]);

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (sale === null) return;
    mutate(data, {
      onSuccess: () => {
        toast({ title: 'Status updated' });
        onClose();
      },
      onError: (err) => {
        toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['fieldPadding']}>
            <FormField label="Status">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating…' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
