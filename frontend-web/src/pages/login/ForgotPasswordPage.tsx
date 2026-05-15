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
            <CardTitle>{t('auth.forgotPassword')}</CardTitle>
            <CardDescription>{t('auth.forgotPasswordDescription')}</CardDescription>
          </CardHeader>
          {isSuccess ? (
            <CardContent>
              <div className={styles['successContent']}>
                <CheckCircle2Icon size={48} className={styles['successIcon']} />
                <p>{t('auth.forgotPasswordSuccess')}</p>
              </div>
            </CardContent>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                void handleSubmit(onSubmit)(e);
              }}
            >
              <CardContent>
                <div className={styles['formBody']}>
                  <div className={styles['field']}>
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      aria-invalid={errors.email !== undefined}
                    />
                    {errors.email && (
                      <p role="alert" className={styles['fieldError']}>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isPending} className={styles['submitBtn']}>
                  {isPending ? <Spinner size="sm" /> : t('auth.sendResetLink')}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
