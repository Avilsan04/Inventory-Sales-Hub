import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateCustomer } from '@features/customers';
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
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateCustomer();
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

  const onClose = (): void => {
    reset();
    setSaved(false);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(data, {
      onSuccess: () => {
        toast({ title: t('customers.toasts.created') });
        setSaved(true);
        setTimeout(() => {
          onClose();
        }, 400);
      },
      onError: (err) => {
        toast({
          title: t('common.toasts.createFailed'),
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
          <DialogTitle>{t('customers.newCustomer')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label={t('customers.name')} required error={errors.name?.message}>
              <Input {...register('name')} placeholder={t('customers.fullNamePlaceholder')} />
            </FormField>
            <FormField label={t('customers.email')} required error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
                placeholder={t('customers.emailPlaceholder')}
              />
            </FormField>
            <div className={styles['grid2']}>
              <FormField label={t('customers.phone')} error={errors.phone?.message}>
                <Input {...register('phone')} placeholder={t('customers.phonePlaceholder')} />
              </FormField>
              <FormField label={t('customers.address')} error={errors.address?.message}>
                <Input {...register('address')} placeholder={t('customers.addressPlaceholder')} />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || saved}>
              {saved ? (
                <CheckIcon size={14} />
              ) : isPending ? (
                t('common.adding')
              ) : (
                t('customers.addCustomer')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
