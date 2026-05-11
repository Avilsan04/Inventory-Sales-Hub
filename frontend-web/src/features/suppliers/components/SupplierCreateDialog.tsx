import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSupplier } from '@features/suppliers';
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
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.email('Invalid email').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateSupplier();
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
        toast({ title: 'Supplier added' });
        setSaved(true);
        setTimeout(() => {
          onClose();
        }, 400);
      },
      onError: (err) => {
        toast({ title: 'Failed to add', description: err.message, variant: 'destructive' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('suppliers.newSupplier')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label={t('suppliers.companyName')} required error={errors.name?.message}>
              <Input {...register('name')} placeholder={t('suppliers.companyNamePlaceholder')} />
            </FormField>
            <div className={styles['grid2']}>
              <FormField label={t('suppliers.email')} error={errors.email?.message}>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder={t('suppliers.emailPlaceholder')}
                />
              </FormField>
              <FormField label={t('suppliers.phone')} error={errors.phone?.message}>
                <Input {...register('phone')} placeholder={t('suppliers.phonePlaceholder')} />
              </FormField>
            </div>
            <div className={styles['grid2']}>
              <FormField label={t('suppliers.address')} error={errors.address?.message}>
                <Input {...register('address')} placeholder={t('suppliers.addressPlaceholder')} />
              </FormField>
              <FormField label={t('suppliers.contactPerson')} error={errors.contactPerson?.message}>
                <Input
                  {...register('contactPerson')}
                  placeholder={t('suppliers.contactPersonPlaceholder')}
                />
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
                t('suppliers.addSupplier')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
