import * as React from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthPresenter } from '@features/auth/hooks/useAuthPresenter';
import { useDependencies } from '@shared/hooks/useDependencies';
import { Button, Input, Label, Spinner, BrandMark } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@shared/ui/composed';
import styles from '@shared/styles/themes/components/LoginForm.module.scss';

interface LoginFormProps {
  readonly onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { authService } = useDependencies();

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    formData,
    isLoading,
    error,
    isFormValid,
    handleInputChange,
    handleSubmit,
  } = useAuthPresenter({ onSuccess, authService });

  const handleFormSubmit = React.useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>): void => {
      void handleSubmit(e);
    },
    [handleSubmit],
  );

  return (
    <div className={styles['wrapper']}>
      <div className={styles['brand']}>
        <BrandMark size={40} />
        <span className={styles['brandName']}>{translate('common.appName')}</span>
      </div>

      <Card className={styles['card']}>
        <form onSubmit={handleFormSubmit} noValidate className={styles['form']}>
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
                name="email"
                type="email"
                placeholder={translate('auth.emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles['field']}>
              <Label htmlFor="password">{translate('auth.password')}</Label>
              <div className={styles['passwordWrapper']}>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={translate('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className={styles['passwordInput']}
                />
                <button
                  type="button"
                  className={styles['eyeBtn']}
                  onClick={() => { setShowPassword((v) => !v); }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOffIcon size={16} aria-hidden="true" />
                    : <EyeIcon size={16} aria-hidden="true" />}
                </button>
              </div>
              <div className={styles['forgotRow']}>
                <button type="button" className={styles['forgotPassword']}>
                  {translate('auth.forgotPassword')}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className={styles['footer']}>
            <Button type="submit" disabled={!isFormValid || isLoading} className={styles['submitButton']}>
              {isLoading ? <Spinner size="sm" /> : translate('auth.login')}
            </Button>
            <p className={styles['signupLink']}>
              {translate('auth.newToIsh')}{' '}
              <a href="/register" className={styles['signupAnchor']}>{translate('auth.createAccount')}</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
