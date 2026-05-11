import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon, CheckCircle2Icon } from 'lucide-react';
import { useForgotPassword } from '@features/auth';
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

const forgotSchema = z.object({ email: z.email() });
type ForgotForm = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage(): React.ReactElement {
  const { navigateTo } = useRoutingAdapter();
  const { translate: t } = useTranslationAdapter();
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = (data: ForgotForm): void => {
    mutate(data);
  };

  return (
    <div className={styles['page']}>
      <button
        type="button"
        className={styles['backBtn']}
        onClick={() => {
          navigateTo(APP_ROUTES.LOGIN);
        }}
        aria-label={t('auth.backToLogin')}
      >
        <ArrowLeftIcon size={16} aria-hidden="true" />
        {t('auth.backToLogin')}
      </button>
      <div className={styles['container']}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <BrandMark size={40} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.forgotPassword')}</CardTitle>
            <CardDescription>{t('auth.forgotPasswordDescription')}</CardDescription>
          </CardHeader>
          {isSuccess ? (
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 0',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2Icon size={48} style={{ color: 'var(--color-success)' }} />
                <p>{t('auth.forgotPasswordSuccess')}</p>
              </div>
            </CardContent>
          ) : (
            <form
              onSubmit={(e) => {
                void handleSubmit(onSubmit)(e);
              }}
            >
              <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    aria-invalid={errors.email !== undefined}
                  />
                  {errors.email && (
                    <p
                      role="alert"
                      style={{
                        color: 'var(--color-destructive)',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending} style={{ width: '100%' }}>
                  {isPending ? <Spinner size="sm" /> : t('auth.sendResetLink')}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
