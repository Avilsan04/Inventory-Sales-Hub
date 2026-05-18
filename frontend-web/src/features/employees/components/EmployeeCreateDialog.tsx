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
import { Button, Input } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const buildSchema = (t: (k: string) => string) =>
  z.object({
    username: z.string().min(1, t('validation.required')),
    email: z.email(t('validation.invalidEmail')),
    password: z.string().min(6, t('validation.minPassword')),
    role: z.enum(['admin', 'manager', 'staff']),
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeCreateDialog({ open, onOpenChange }: Props): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending } = useCreateEmployee();
  const [saved, setSaved] = React.useState(false);
  const schema = React.useMemo(() => buildSchema(t), [t]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { role: 'staff' },
  });

  const onClose = (): void => {
    reset();
    setSaved(false);
    onOpenChange(false);
  };

  const onSubmit = (data: FormValues): void => {
    mutate(data, {
      onSuccess: () => {
        toast({ title: t('employees.toasts.created') });
        setSaved(true);
        onClose();
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
          <DialogTitle>{t('employees.newEmployee')}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.SyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['body']}>
            <div className={styles['grid2']}>
              <FormField label={t('employees.username')} required error={errors.username?.message}>
                <Input {...register('username')} placeholder={t('auth.usernamePlaceholder')} />
              </FormField>
              <FormField label={t('employees.email')} required error={errors.email?.message}>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder={t('employees.emailPlaceholder')}
                />
              </FormField>
            </div>
            <FormField label={t('auth.password')} required error={errors.password?.message}>
              <Input {...register('password')} type="password" />
            </FormField>
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
