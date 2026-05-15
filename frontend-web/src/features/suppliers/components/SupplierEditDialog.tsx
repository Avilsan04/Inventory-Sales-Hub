import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateSupplier } from '@features/suppliers';
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
import type { Supplier } from '@entities/supplier';
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
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierEditDialog({ supplier, open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useUpdateSupplier(supplier?.id ?? '');
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
    if (open && supplier !== null) {
      reset({
        name: supplier.name,
        email: supplier.email ?? undefined,
        phone: supplier.phone ?? undefined,
        address: supplier.address ?? undefined,
        contactPerson: supplier.contactPerson ?? undefined,
      });
    }
  }, [open, supplier, reset]);

  const onClose = (): void => {
    reset();
    setSaved(false);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    if (supplier === null) return;
    mutate(data, {
      onSuccess: () => {
        toast({ title: t('suppliers.toasts.updated') });
        setSaved(true);
        setTimeout(() => {
          onClose();
        }, 400);
      },
      onError: (err) => {
        toast({
          title: t('common.toasts.updateFailed'),
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
          <DialogTitle>{t('suppliers.editSupplier')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <FormField label={t('suppliers.companyName')} required error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <div className={styles['grid2']}>
              <FormField label={t('suppliers.email')} error={errors.email?.message}>
                <Input {...register('email')} type="email" />
              </FormField>
              <FormField label={t('suppliers.phone')} error={errors.phone?.message}>
                <Input {...register('phone')} />
              </FormField>
            </div>
            <div className={styles['grid2']}>
              <FormField label={t('suppliers.address')} error={errors.address?.message}>
                <Input {...register('address')} />
              </FormField>
              <FormField label={t('suppliers.contactPerson')} error={errors.contactPerson?.message}>
                <Input {...register('contactPerson')} />
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
