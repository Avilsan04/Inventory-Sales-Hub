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

const profileSchema = z.object({
  username: z.string().min(2, 'Min 2 characters'),
  email: z.email('Invalid email'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

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
              Edit Profile
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
                    {updatingProfile ? 'Saving…' : 'Save changes'}
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
              Change Password
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
                  label="Current password"
                  required
                  error={passwordForm.formState.errors.currentPassword?.message}
                >
                  <Input {...passwordForm.register('currentPassword')} type="password" />
                </FormField>
                <FormField
                  label="New password"
                  required
                  error={passwordForm.formState.errors.newPassword?.message}
                >
                  <Input {...passwordForm.register('newPassword')} type="password" />
                </FormField>
                <FormField
                  label="Confirm new password"
                  required
                  error={passwordForm.formState.errors.confirmPassword?.message}
                >
                  <Input {...passwordForm.register('confirmPassword')} type="password" />
                </FormField>
                <div className={styles['formActions']}>
                  <Button type="submit" size="sm" disabled={changingPassword}>
                    {changingPassword ? 'Changing…' : 'Change password'}
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
