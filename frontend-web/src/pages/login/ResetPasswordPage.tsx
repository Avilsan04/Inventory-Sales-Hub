import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from 'lucide-react';
import { useResetPassword } from '@features/auth';
import { APP_ROUTES } from '@shared/config/routes';
import { useRoutingAdapter } from '@adapters/useRoutingAdapter';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button, Input, Label, Spinner, BrandMark } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/Login.module.scss';

function useTokenFromUrl(): string {
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return new URLSearchParams(search).get('token') ?? '';
}

export function ResetPasswordPage(): React.ReactElement {
  const { navigateTo } = useRoutingAdapter();
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending, isSuccess, error } = useResetPassword();
  const token = useTokenFromUrl();

  const resetSchema = React.useMemo(
    () =>
      z
        .object({
          newPassword: z.string().min(8, t('profile.validationMinPassword')),
          confirmPassword: z.string().min(8, t('profile.validationRequired')),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t('profile.validationPasswordMatch'),
          path: ['confirmPassword'],
        }),
    [t]
  );

  type ResetForm = z.infer<typeof resetSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = (data: ResetForm): void => {
    mutate({ token, newPassword: data.newPassword });
  };

  if (isSuccess) {
    return (
      <main className={styles['page']}>
        <div className={styles['container']}>
          <Card>
            <CardHeader>
              <CardTitle>{t('auth.passwordReset')}</CardTitle>
              <CardDescription>{t('auth.passwordResetSuccess')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                className={styles['submitBtn']}
                onClick={() => {
                  navigateTo(APP_ROUTES.LOGIN, true);
                }}
              >
                {t('auth.backToLogin')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className={styles['page']}>
      <Button
        variant="ghost"
        className={styles['backBtn']}
        onClick={() => {
          navigateTo(APP_ROUTES.LOGIN);
        }}
      >
        <ArrowLeftIcon size={16} aria-hidden="true" />
        {t('auth.backToLogin')}
      </Button>
      <div className={styles['container']}>
        <div className={styles['brandWrapper']}>
          <BrandMark size={40} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.resetPassword')}</CardTitle>
            <CardDescription>{t('auth.resetPasswordDescription')}</CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
          >
            <CardContent>
              <div className={styles['formBody']}>
                {!token && (
                  <p role="alert" className={styles['formError']}>
                    {t('auth.invalidResetToken')}
                  </p>
                )}
                {error && (
                  <p role="alert" className={styles['formError']}>
                    {error.message}
                  </p>
                )}
                <div className={styles['field']}>
                  <Label htmlFor="newPassword">{t('auth.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('newPassword')}
                    aria-invalid={errors.newPassword !== undefined}
                  />
                  {errors.newPassword && (
                    <p role="alert" className={styles['fieldError']}>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className={styles['field']}>
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    aria-invalid={errors.confirmPassword !== undefined}
                  />
                  {errors.confirmPassword && (
                    <p role="alert" className={styles['fieldError']}>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending || !token} className={styles['submitBtn']}>
                {isPending ? <Spinner size="sm" /> : t('auth.resetPasswordBtn')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
