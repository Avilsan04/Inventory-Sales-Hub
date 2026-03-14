// @features/auth/components/LoginForm.tsx
import * as React from 'react';
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
    <Card className={styles.card}>
      <form onSubmit={handleFormSubmit} noValidate>
        <CardHeader>
          <CardTitle>{translate('auth.welcomeBack')}</CardTitle>
          <CardDescription>{translate('auth.enterCredentials')}</CardDescription>
        </CardHeader>

        <CardContent className={styles.content}>
          {error !== null && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.field}>
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

          <div className={styles.field}>
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

          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <Checkbox
                checked={rememberMe}
                onCheckedChange={handleRememberMeChange}
                disabled={isLoading}
              />
              <span>{translate('auth.rememberMe')}</span>
            </label>
            <button type="button" className={styles.forgotPassword}>
              {translate('auth.forgotPassword')}
            </button>
          </div>
        </CardContent>

        <CardFooter className={styles.footer}>
          <Button type="submit" disabled={!isFormValid || isLoading} className={styles.submitButton}>
            {isLoading ? <Spinner size="sm" /> : translate('auth.login')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}