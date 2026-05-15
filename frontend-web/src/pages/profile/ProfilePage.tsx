import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserIcon, ShieldIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe, useUpdateProfile, useChangePassword } from '@features/auth';
import { toast } from '@shared/hooks/useToast';
import { Spinner, Button, Input, Badge } from '@shared/ui';
import { Card, CardHeader, CardTitle, CardContent, FormField } from '@shared/ui';
import { cn } from '@shared/lib/cn';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Profile.module.scss';

type RoleKey = 'admin' | 'manager' | 'staff';

const ROLE_BADGE_MAP: Record<RoleKey, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  staff: 'outline',
};

function ProfileInfoForm(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: user } = useAuthMe();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const schema = React.useMemo(
    () =>
      z.object({
        username: z.string().min(2, t('profile.validationMinName')),
        email: z.email(t('profile.validationInvalidEmail')),
      }),
    [t]
  );

  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { username: user?.username ?? '', email: user?.email ?? '' },
  });

  React.useEffect(() => {
    if (user !== undefined) form.reset({ username: user.username, email: user.email });
  }, [user, form]);

  const onSubmit = (data: Values): void => {
    updateProfile(data, {
      onSuccess: (): void => {
        toast({ title: t('profile.toasts.updated') });
      },
      onError: (err): void => {
        toast({
          title: t('common.toasts.updateFailed'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e: React.SyntheticEvent): void => {
            void form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['formBody']}>
            <FormField
              label={t('auth.username')}
              required
              error={form.formState.errors.username?.message}
            >
              <Input {...form.register('username')} />
            </FormField>
            <FormField
              label={t('auth.email')}
              required
              error={form.formState.errors.email?.message}
            >
              <Input {...form.register('email')} type="email" />
            </FormField>
            <div className={styles['formActions']}>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? t('profile.savingChanges') : t('common.saveChanges')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileSecurityForm(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { mutate: changePassword, isPending } = useChangePassword();

  const schema = React.useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t('profile.validationRequired')),
          newPassword: z.string().min(8, t('profile.validationMinPassword')),
          confirmPassword: z.string().min(1, t('profile.validationRequired')),
        })
        .refine((d) => d.newPassword === d.confirmPassword, {
          message: t('profile.validationPasswordMatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  type Values = z.infer<typeof schema>;

  const form = useForm<Values>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (data: Values): void => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: (): void => {
          toast({ title: t('profile.toasts.passwordChanged') });
          form.reset();
        },
        onError: (err): void => {
          toast({
            title: t('profile.toasts.changeFailed'),
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e: React.SyntheticEvent): void => {
            void form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className={styles['formBody']}>
            <FormField
              label={t('profile.currentPassword')}
              required
              error={form.formState.errors.currentPassword?.message}
            >
              <Input {...form.register('currentPassword')} type="password" />
            </FormField>
            <FormField
              label={t('profile.newPassword')}
              required
              error={form.formState.errors.newPassword?.message}
            >
              <Input {...form.register('newPassword')} type="password" />
            </FormField>
            <FormField
              label={t('profile.confirmNewPassword')}
              required
              error={form.formState.errors.confirmPassword?.message}
            >
              <Input {...form.register('confirmPassword')} type="password" />
            </FormField>
            <div className={styles['formActions']}>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? t('profile.changingPassword') : t('profile.changePassword')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProfilePage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: user, isLoading, isError, refetch } = useAuthMe();
  const [formTab, setFormTab] = React.useState<'info' | 'security'>('info');

  if (isLoading) {
    return (
      <div className={baseStyles['placeholderContainer']} aria-busy="true">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className={baseStyles['errorContainer']} role="alert">
        <p>{t('common.errorLoadingData')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={(): void => {
            void refetch();
          }}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const roleLabels: Record<RoleKey, string> = {
    admin: t('employees.roles.admin'),
    manager: t('employees.roles.manager'),
    staff: t('employees.roles.staff'),
  };

  return (
    <div className={baseStyles['page']}>
      <header className={baseStyles['header']}>
        <h1 className={baseStyles['title']}>{t('nav.profile')}</h1>
      </header>
      <div className={styles['profileLayout']}>
        <div className={styles['identityCol']}>
          <Card>
            <CardHeader>
              <CardTitle className={styles['cardTitleInner']}>
                <UserIcon size={18} aria-hidden="true" />
                {user.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles['identityMeta']}>
                <span>{user.email}</span>
                <Badge variant={ROLE_BADGE_MAP[user.role as RoleKey]}>
                  {roleLabels[user.role as RoleKey]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className={styles['formsCol']}>
          <div className={styles['formTabs']} role="tablist">
            <Button
              variant="ghost"
              role="tab"
              aria-selected={formTab === 'info'}
              onClick={(): void => {
                setFormTab('info');
              }}
              className={cn(styles['formTab'], formTab === 'info' && styles['formTabActive'])}
            >
              <UserIcon size={14} aria-hidden="true" />
              {t('profile.editProfile')}
            </Button>
            <Button
              variant="ghost"
              role="tab"
              aria-selected={formTab === 'security'}
              onClick={(): void => {
                setFormTab('security');
              }}
              className={cn(styles['formTab'], formTab === 'security' && styles['formTabActive'])}
            >
              <ShieldIcon size={14} aria-hidden="true" />
              {t('profile.changePassword')}
            </Button>
          </div>
          {formTab === 'info' ? <ProfileInfoForm /> : <ProfileSecurityForm />}
        </div>
      </div>
    </div>
  );
}
