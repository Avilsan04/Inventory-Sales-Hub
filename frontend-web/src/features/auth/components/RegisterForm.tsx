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
import type { RegisterRole } from '@features/auth/models/auth.types';
import styles from '@shared/styles/themes/components/RegisterForm.module.scss';

interface RegisterFormProps {
  readonly onSuccess: () => void;
  readonly role: RegisterRole;
}

const ROLE_COPY: Record<RegisterRole, { titleKey: string; subtitleKey: string }> = {
  customer: { titleKey: 'auth.registerTitleCustomer', subtitleKey: 'auth.registerSubtitleCustomer' },
  admin:    { titleKey: 'auth.registerTitleAdmin',    subtitleKey: 'auth.registerSubtitleAdmin' },
  company:  { titleKey: 'auth.registerTitleCompany',  subtitleKey: 'auth.registerSubtitleCompany' },
};

export function RegisterForm({ onSuccess, role }: RegisterFormProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { authService } = useDependencies();

  const { formData, isLoading, error, isFormValid, handleInputChange, handleSubmit } =
    useRegisterPresenter({ onSuccess, authService, role });

  const handleFormSubmit = React.useCallback(
    (e: React.SyntheticEvent<HTMLFormElement>): void => {
      void handleSubmit(e);
    },
    [handleSubmit]
  );

  return (
    <Card className={styles.card}>
      <form onSubmit={handleFormSubmit} noValidate className={styles.form}>
        <CardHeader>
          <CardTitle>{translate(ROLE_COPY[role].titleKey)}</CardTitle>
          <CardDescription>{translate(ROLE_COPY[role].subtitleKey)}</CardDescription>
        </CardHeader>

        <CardContent className={styles.content}>
          {error !== null && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {role === 'company' ? (
            <>
              <div className={styles.field}>
                <Label htmlFor="companyName">{translate('auth.companyName')}</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder={translate('auth.companyNamePlaceholder')}
                  value={formData.companyName}
                  onChange={handleInputChange}
                  autoComplete="organization"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="cif">{translate('auth.cif')}</Label>
                <Input
                  id="cif"
                  name="cif"
                  type="text"
                  placeholder={translate('auth.cifPlaceholder')}
                  value={formData.cif}
                  onChange={handleInputChange}
                  autoComplete="off"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="legalRepresentative">{translate('auth.legalRepresentative')}</Label>
                <Input
                  id="legalRepresentative"
                  name="legalRepresentative"
                  type="text"
                  placeholder={translate('auth.legalRepresentativePlaceholder')}
                  value={formData.legalRepresentative}
                  onChange={handleInputChange}
                  autoComplete="name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="legalEmail">{translate('auth.legalEmail')}</Label>
                <Input
                  id="legalEmail"
                  name="legalEmail"
                  type="email"
                  placeholder={translate('auth.emailPlaceholder')}
                  value={formData.legalEmail}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.field}>
                <Label htmlFor="phone">{translate('auth.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={translate('auth.phonePlaceholder')}
                  value={formData.phone}
                  onChange={handleInputChange}
                  autoComplete="tel"
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <>
              {role === 'admin' && (
                <div className={styles.field}>
                  <Label htmlFor="fullName">{translate('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={translate('auth.fullNamePlaceholder')}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    autoComplete="name"
                    required
                    disabled={isLoading}
                  />
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
            </>
          )}

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

          {role === 'admin' && (
            <div className={styles.field}>
              <Label htmlFor="adminCode">{translate('auth.adminCode')}</Label>
              <Input
                id="adminCode"
                name="adminCode"
                type="password"
                placeholder={translate('auth.adminCodePlaceholder')}
                value={formData.adminCode}
                onChange={handleInputChange}
                autoComplete="off"
                required
                disabled={isLoading}
              />
            </div>
          )}
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
