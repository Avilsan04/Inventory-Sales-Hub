import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateCustomer } from '@features/customers';
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
import type { Customer } from '@entities/customer';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerEditDialog({ customer, open, onOpenChange }: Props): React.ReactElement {
  const { mutate, isPending } = useUpdateCustomer(customer?.id ?? '');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (open && customer !== null) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    }
  }, [open, customer, reset]);

  const onClose = (): void => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (customer === null) return;
    mutate(data, {
      onSuccess: () => {
        toast({ title: 'Customer updated' });
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
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label="Name" required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <Input {...register('email')} type="email" />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="Address" error={errors.address?.message}>
              <Input {...register('address')} />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
