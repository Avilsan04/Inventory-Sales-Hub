import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label, Checkbox, Spinner } from '@shared/ui/primitives';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@shared/ui/composed';
import { authService } from '../services/authService';
import type { LoginRequest } from '../models/auth.types';
import styles from '@shared/styles/themes/components/LoginForm.module.scss';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps): React.ReactElement {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = React.useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login(formData, rememberMe);
      onSuccess();
    } catch {
      setError(t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.trim().length > 0 && formData.password.trim().length > 0;

  return (
    <Card className={styles.card}>
      <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
        <CardHeader>
          <CardTitle>{t('auth.welcomeBack')}</CardTitle>
          <CardDescription>{t('auth.enterCredentials')}</CardDescription>
        </CardHeader>

        <CardContent className={styles.content}>
          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.field}>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
              disabled={isLoading}
              aria-invalid={!!error}
            />
          </div>

          <div className={styles.field}>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
              disabled={isLoading}
              aria-invalid={!!error}
            />
          </div>

          <div className={styles.options}>
            <label className={styles.rememberMe}>
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(checked: boolean | 'indeterminate') => { setRememberMe(checked === true); }}
                disabled={isLoading}
              />
              <span>{t('auth.rememberMe')}</span>
            </label>
            <button type="button" className={styles.forgotPassword}>
              {t('auth.forgotPassword')}
            </button>
          </div>
        </CardContent>

        <CardFooter className={styles.footer}>
          <Button type="submit" disabled={!isFormValid || isLoading} className={styles.submitButton}>
            {isLoading ? <Spinner size="sm" /> : t('auth.login')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}