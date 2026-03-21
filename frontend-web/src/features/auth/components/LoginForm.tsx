// @features/auth/components/LoginForm.tsx
import * as React from 'react';
import { GithubIcon, PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useAuthPresenter } from '@features/auth/hooks/useAuthPresenter';
import { useDependencies } from '@shared/hooks/useDependencies';
import { Button, Input, Label, Checkbox, Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@shared/ui/composed';
import styles from '@shared/styles/themes/components/LoginForm.module.scss';

interface LoginFormProps {
  readonly onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { authService } = useDependencies();

  const {
    formData,
    isLoading,
    error,
    rememberMe,
    isFormValid,
    handleInputChange,
    handleRememberMeChange,
    handleSubmit
  } = useAuthPresenter({
    onSuccess,
    authService
  });

  const handleFormSubmit = React.useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>): void => {
      void handleSubmit(e);
    },
    [handleSubmit]
  );

  return (
    <Card className={styles['card']}>
      <div className={styles['cardLogo']}>
        <PackageIcon aria-hidden="true" className={styles['cardLogoIcon']} />
        <span className={styles['cardLogoName']}>{translate('common.appName')}</span>
      </div>

      <form onSubmit={handleFormSubmit} noValidate>
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
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={translate('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles['options']}>
            <label className={styles['rememberMe']}>
              <Checkbox
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                disabled={isLoading}
              />
              <span>{translate('auth.rememberMe')}</span>
            </label>
            <button type="button" className={styles['forgotPassword']}>
              {translate('auth.forgotPassword')}
            </button>
          </div>
        </CardContent>

        <CardFooter className={styles['footer']}>
          <Button type="submit" disabled={!isFormValid || isLoading} className={styles['submitButton']}>
            {isLoading ? <Spinner size="sm" /> : translate('auth.login')}
          </Button>
        </CardFooter>
      </form>

      <div className={styles['socialSection']}>
        <div className={styles['socialDivider']}>
          <span className={styles['socialDividerLine']} aria-hidden="true" />
          <span className={styles['socialDividerText']}>{translate('auth.orContinueWith')}</span>
          <span className={styles['socialDividerLine']} aria-hidden="true" />
        </div>
        <div className={styles['socialButtons']}>
          <button type="button" className={styles['googleButton']} aria-label={translate('auth.continueWithGoogle')}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {translate('auth.continueWithGoogle')}
          </button>
          <button type="button" className={styles['githubButton']} aria-label={translate('auth.continueWithGithub')}>
            <GithubIcon aria-hidden="true" />
            {translate('auth.continueWithGithub')}
          </button>
        </div>
      </div>
    </Card>
  );
}
