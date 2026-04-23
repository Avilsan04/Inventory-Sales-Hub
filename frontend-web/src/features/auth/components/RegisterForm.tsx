import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useRegisterPresenter } from '@features/auth/hooks/useRegisterPresenter';
import { useDependencies } from '@shared/hooks/useDependencies';
import { Button, Input, Label, Spinner } from '@shared/ui/primitives';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@shared/ui/composed';
import styles from '@shared/styles/themes/components/RegisterForm.module.scss';

interface RegisterFormProps {
  readonly onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { authService } = useDependencies();

  const { formData, isLoading, error, isFormValid, handleInputChange, handleSubmit } =
    useRegisterPresenter({ onSuccess, authService });

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
          <CardTitle>{translate('auth.createAccount')}</CardTitle>
          <CardDescription>{translate('auth.registerSubtitle')}</CardDescription>
        </CardHeader>

        <CardContent className={styles.content}>
          {error !== null && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.field}>
            <Label htmlFor="username">{translate('auth.username')}</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder={translate('auth.usernamePlaceholder')}
              value={formData.username}
              onChange={handleInputChange}
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </div>

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
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="confirmPassword">{translate('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={translate('auth.passwordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>

        <CardFooter className={styles.footer}>
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={styles.submitButton}
          >
            {isLoading ? <Spinner size="sm" /> : translate('auth.createAccount')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
