import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateCustomer } from '@features/customers';
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
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useUpdateCustomer(customer?.id ?? '');
  const [saved, setSaved] = React.useState(false);
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
    setSaved(false);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (customer === null) return;
    mutate(data, {
      onSuccess: () => {
        toast({ title: 'Customer updated' });
        setSaved(true);
        setTimeout(() => {
          onClose();
        }, 400);
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
          <DialogTitle>{t('customers.editCustomer')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label={t('customers.name')} required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label={t('customers.email')} required error={errors.email?.message}>
              <Input {...register('email')} type="email" />
            </FormField>
            <div className={styles['grid2']}>
              <FormField label={t('customers.phone')} error={errors.phone?.message}>
                <Input {...register('phone')} />
              </FormField>
              <FormField label={t('customers.address')} error={errors.address?.message}>
                <Input {...register('address')} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || saved}>
              {saved ? <CheckIcon size={14} /> : isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
