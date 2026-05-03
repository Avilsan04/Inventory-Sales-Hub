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
  customer: {
    titleKey: 'auth.registerTitleCustomer',
    subtitleKey: 'auth.registerSubtitleCustomer',
  },
  admin: { titleKey: 'auth.registerTitleAdmin', subtitleKey: 'auth.registerSubtitleAdmin' },
  company: { titleKey: 'auth.registerTitleCompany', subtitleKey: 'auth.registerSubtitleCompany' },
};

export function RegisterForm({ onSuccess, role }: RegisterFormProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const { authService } = useDependencies();

  const { register, handleSubmit, errors, isLoading, error, isValid, onSubmit } =
    useRegisterPresenter({ onSuccess, authService, role });

  const fieldError = (name: string): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const e = (errors as any)[name] as { message?: string } | undefined;
    return e?.message;
  };

  return (
    <Card className={styles.card}>
      <form
        onSubmit={(e: React.BaseSyntheticEvent) => {
          void handleSubmit(onSubmit)(e);
        }}
        noValidate
        className={styles.form}
      >
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
                  type="text"
                  placeholder={translate('auth.companyNamePlaceholder')}
                  autoComplete="organization"
                  disabled={isLoading}
                  {...register('companyName')}
                />
                {fieldError('companyName') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('companyName')}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <Label htmlFor="cif">{translate('auth.cif')}</Label>
                <Input
                  id="cif"
                  type="text"
                  placeholder={translate('auth.cifPlaceholder')}
                  autoComplete="off"
                  disabled={isLoading}
                  {...register('cif')}
                />
                {fieldError('cif') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('cif')}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <Label htmlFor="legalRepresentative">{translate('auth.legalRepresentative')}</Label>
                <Input
                  id="legalRepresentative"
                  type="text"
                  placeholder={translate('auth.legalRepresentativePlaceholder')}
                  autoComplete="name"
                  disabled={isLoading}
                  {...register('legalRepresentative')}
                />
                {fieldError('legalRepresentative') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('legalRepresentative')}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <Label htmlFor="legalEmail">{translate('auth.legalEmail')}</Label>
                <Input
                  id="legalEmail"
                  type="email"
                  placeholder={translate('auth.emailPlaceholder')}
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('legalEmail')}
                />
                {fieldError('legalEmail') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('legalEmail')}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <Label htmlFor="phone">{translate('auth.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={translate('auth.phonePlaceholder')}
                  autoComplete="tel"
                  disabled={isLoading}
                  {...register('phone')}
                />
                {fieldError('phone') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('phone')}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {role === 'admin' && (
                <div className={styles.field}>
                  <Label htmlFor="fullName">{translate('auth.fullName')}</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={translate('auth.fullNamePlaceholder')}
                    autoComplete="name"
                    disabled={isLoading}
                    {...register('fullName')}
                  />
                  {fieldError('fullName') && (
                    <span className={styles.fieldError} role="alert">
                      {fieldError('fullName')}
                    </span>
                  )}
                </div>
              )}
              <div className={styles.field}>
                <Label htmlFor="username">{translate('auth.username')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={translate('auth.usernamePlaceholder')}
                  autoComplete="username"
                  disabled={isLoading}
                  {...register('username')}
                />
                {fieldError('username') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('username')}
                  </span>
                )}
              </div>
              <div className={styles.field}>
                <Label htmlFor="email">{translate('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={translate('auth.emailPlaceholder')}
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                />
                {fieldError('email') && (
                  <span className={styles.fieldError} role="alert">
                    {fieldError('email')}
                  </span>
                )}
              </div>
            </>
          )}

          <div className={styles.field}>
            <Label htmlFor="password">{translate('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={translate('auth.passwordPlaceholder')}
              autoComplete="new-password"
              disabled={isLoading}
              {...register('password')}
            />
            {fieldError('password') && (
              <span className={styles.fieldError} role="alert">
                {fieldError('password')}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <Label htmlFor="confirmPassword">{translate('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={translate('auth.passwordPlaceholder')}
              autoComplete="new-password"
              disabled={isLoading}
              {...register('confirmPassword')}
            />
            {fieldError('confirmPassword') && (
              <span className={styles.fieldError} role="alert">
                {fieldError('confirmPassword')}
              </span>
            )}
          </div>

          {role === 'admin' && (
            <div className={styles.field}>
              <Label htmlFor="adminCode">{translate('auth.adminCode')}</Label>
              <Input
                id="adminCode"
                type="password"
                placeholder={translate('auth.adminCodePlaceholder')}
                autoComplete="off"
                disabled={isLoading}
                {...register('adminCode')}
              />
              {fieldError('adminCode') && (
                <span className={styles.fieldError} role="alert">
                  {fieldError('adminCode')}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className={styles.footer}>
          <Button type="submit" disabled={!isValid || isLoading} className={styles.submitButton}>
            {isLoading ? <Spinner size="sm" /> : translate('auth.createAccount')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
