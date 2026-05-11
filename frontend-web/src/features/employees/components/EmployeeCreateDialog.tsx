import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmployee } from '@features/employees';
import { toast } from '@shared/hooks/useToast';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
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
import { Button, Input, Switch, Label } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.email('Invalid email'),
  role: z.enum(['admin', 'manager', 'staff']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateEmployee();
  const [saved, setSaved] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { role: 'staff', isActive: true },
  });

  const onClose = (): void => {
    reset();
    setSaved(false);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(data, {
      onSuccess: () => {
        toast({ title: 'Employee added' });
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
          <DialogTitle>{t('employees.newEmployee')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <div className={styles['grid2']}>
              <FormField label={t('employees.name')} required error={errors.name?.message}>
                <Input {...register('name')} placeholder={t('auth.fullNamePlaceholder')} />
              </FormField>
              <FormField label={t('employees.email')} required error={errors.email?.message}>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder={t('employees.emailPlaceholder')}
                />
              </FormField>
            </div>
            <FormField label={t('employees.role')} required error={errors.role?.message}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t('employees.roles.admin')}</SelectItem>
                      <SelectItem value="manager">{t('employees.roles.manager')}</SelectItem>
                      <SelectItem value="staff">{t('employees.roles.staff')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className={styles['activeRow']}>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="create-active"
                  />
                  <Label htmlFor="create-active">{t('employees.active')}</Label>
                </div>
              )}
            />
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
                t('employees.addEmployee')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
