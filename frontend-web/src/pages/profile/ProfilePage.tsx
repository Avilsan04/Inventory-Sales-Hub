import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserIcon, KeyIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthMe } from '@features/auth';
import { useUpdateProfile } from '@features/auth/hooks/useUpdateProfile';
import { useChangePassword } from '@features/auth/hooks/useChangePassword';
import { toast } from '@shared/hooks/useToast';
import { Spinner, Button, Input, Badge } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardContent, FormField } from '@shared/ui/composed';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';
import styles from '@shared/styles/themes/pages/Profile.module.scss';

type RoleKey = 'admin' | 'manager' | 'staff';

function roleBadgeVariant(role: RoleKey): 'default' | 'secondary' | 'outline' {
  const map: Record<RoleKey, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    manager: 'secondary',
    staff: 'outline',
  };
  return map[role];
}

export function ProfilePage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { data: user, isLoading, isError } = useAuthMe();
  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword();

  const profileSchema = React.useMemo(
    () =>
      z.object({
        username: z.string().min(2, t('profile.validationMinName')),
        email: z.email(t('profile.validationInvalidEmail')),
      }),
    [t]
  );

  const passwordSchema = React.useMemo(
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

  type ProfileValues = z.infer<typeof profileSchema>;
  type PasswordValues = z.infer<typeof passwordSchema>;

  const profileForm = useForm<ProfileValues>({
    mode: 'onTouched',
    resolver: zodResolver(profileSchema),
    defaultValues: { username: '', email: '' },
  });

  const passwordForm = useForm<PasswordValues>({
    mode: 'onTouched',
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  React.useEffect(() => {
    if (user !== undefined) {
      profileForm.reset({ username: user.username, email: user.email });
    }
  }, [user, profileForm]);

  const onSubmitProfile = (data: ProfileValues): void => {
    updateProfile(data, {
      onSuccess: () => {
        toast({ title: 'Profile updated' });
      },
      onError: (err) => {
        toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  const onSubmitPassword = (data: PasswordValues): void => {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast({ title: 'Password changed' });
          passwordForm.reset();
        },
        onError: (err) => {
          toast({ title: 'Change failed', description: err.message, variant: 'destructive' });
        },
      }
    );
  };

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

      <div className={styles['sections']}>
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
              <Badge variant={roleBadgeVariant(user.role as RoleKey)}>
                {roleLabels[user.role as RoleKey]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={styles['cardTitleInner']}>
              <UserIcon size={18} aria-hidden="true" />
              {t('profile.editProfile')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e: React.SyntheticEvent) => {
                void profileForm.handleSubmit(onSubmitProfile)(e);
              }}
            >
              <div className={styles['formBody']}>
                <FormField
                  label={t('auth.username')}
                  required
                  error={profileForm.formState.errors.username?.message}
                >
                  <Input {...profileForm.register('username')} />
                </FormField>
                <FormField
                  label={t('auth.email')}
                  required
                  error={profileForm.formState.errors.email?.message}
                >
                  <Input {...profileForm.register('email')} type="email" />
                </FormField>
                <div className={styles['formActions']}>
                  <Button type="submit" size="sm" disabled={updatingProfile}>
                    {updatingProfile ? t('profile.savingChanges') : t('common.saveChanges')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={styles['cardTitleInner']}>
              <KeyIcon size={18} aria-hidden="true" />
              {t('profile.changePassword')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e: React.SyntheticEvent) => {
                void passwordForm.handleSubmit(onSubmitPassword)(e);
              }}
            >
              <div className={styles['formBody']}>
                <FormField
                  label={t('profile.currentPassword')}
                  required
                  error={passwordForm.formState.errors.currentPassword?.message}
                >
                  <Input {...passwordForm.register('currentPassword')} type="password" />
                </FormField>
                <FormField
                  label={t('profile.newPassword')}
                  required
                  error={passwordForm.formState.errors.newPassword?.message}
                >
                  <Input {...passwordForm.register('newPassword')} type="password" />
                </FormField>
                <FormField
                  label={t('profile.confirmNewPassword')}
                  required
                  error={passwordForm.formState.errors.confirmPassword?.message}
                >
                  <Input {...passwordForm.register('confirmPassword')} type="password" />
                </FormField>
                <div className={styles['formActions']}>
                  <Button type="submit" size="sm" disabled={changingPassword}>
                    {changingPassword ? t('profile.changingPassword') : t('profile.changePassword')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
