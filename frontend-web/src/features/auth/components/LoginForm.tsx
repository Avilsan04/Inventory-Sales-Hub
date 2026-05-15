import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthPresenter } from '../hooks/useAuthPresenter';
import { useDependencies } from '@shared/hooks/useDependencies';
import { Button, Input, Label, Spinner, BrandMark } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@shared/ui/composed';
import styles from '@shared/styles/themes/components/LoginForm.module.scss';

interface LoginFormProps {
  readonly onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { authService } = useDependencies();

  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, errors, isLoading, error, isValid, onSubmit } = useAuthPresenter({
    onSuccess,
    authService,
  });

  return (
    <div className={styles['wrapper']}>
      <div className={styles['brand']}>
        <BrandMark size={40} />
        <span className={styles['brandName']}>{translate('common.appName')}</span>
      </div>

      <Card className={styles['card']}>
        <form
          onSubmit={(e: React.BaseSyntheticEvent) => {
            void handleSubmit(onSubmit)(e);
          }}
          noValidate
          className={styles['form']}
        >
          <CardHeader>
            <CardTitle>{translate('auth.login')}</CardTitle>
            <CardDescription>{translate('auth.loginSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent className={styles['content']}>
            {error !== null && (
              <div className={styles['error']} role="alert" aria-live="assertive">
                {error}
              </div>
            )}

            <div className={styles['field']}>
              <Label htmlFor="email">{translate('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={translate('auth.emailPlaceholder')}
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={errors.email !== undefined}
                {...register('email')}
              />
              {errors.email && (
                <span className={styles['fieldError']} role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className={styles['field']}>
              <Label htmlFor="password">{translate('auth.password')}</Label>
              <div className={styles['passwordWrapper']}>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={translate('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={errors.password !== undefined}
                  className={styles['passwordInput']}
                  {...register('password')}
                />
                <Button
                  variant="ghost"
                  className={styles['eyeBtn']}
                  onClick={() => {
                    setShowPassword((v) => !v);
                  }}
                  aria-label={
                    showPassword ? translate('auth.hidePassword') : translate('auth.showPassword')
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon size={16} aria-hidden="true" />
                  ) : (
                    <EyeIcon size={16} aria-hidden="true" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <span className={styles['fieldError']} role="alert">
                  {errors.password.message}
                </span>
              )}
              <div className={styles['forgotRow']}>
                <a href="/forgot-password" className={styles['forgotPassword']}>
                  {translate('auth.forgotPassword')}
                </a>
              </div>
            </div>
          </CardContent>

          <CardFooter className={styles['footer']}>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className={styles['submitButton']}
            >
              {isLoading ? <Spinner size="sm" /> : translate('auth.login')}
            </Button>
            <p className={styles['signupLink']}>
              {translate('auth.newToIsh')}{' '}
              <a href="/register" className={styles['signupAnchor']}>
                {translate('auth.createAccount')}
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
