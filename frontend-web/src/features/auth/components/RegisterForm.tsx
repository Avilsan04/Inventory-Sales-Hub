import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useRegisterPresenter } from '@features/auth/hooks/useRegisterPresenter';
import { useDependencies } from '@shared/hooks/useDependencies';
import { Button, Input, Spinner } from '@shared/ui/primitives';
import { FormField } from '@shared/ui/composed';
import type { RegisterRole } from '@features/auth/models/auth.types';
import styles from '@shared/styles/themes/components/RegisterForm.module.scss';

interface RegisterFormProps {
  readonly onSuccess: () => void;
  readonly role: RegisterRole;
}

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
    <form
      onSubmit={(e: React.BaseSyntheticEvent) => {
        void handleSubmit(onSubmit)(e);
      }}
      noValidate
      className={styles.form}
    >
      <div className={styles.content}>
        {error !== null && (
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {role === 'company' ? (
          <>
            <div className={styles.section}>
              <p className={styles.sectionLabel}>{translate('auth.sectionCompanyInfo')}</p>
              <FormField
                label={translate('auth.companyName')}
                error={fieldError('companyName')}
                required
              >
                <Input
                  id="companyName"
                  type="text"
                  placeholder={translate('auth.companyNamePlaceholder')}
                  autoComplete="organization"
                  disabled={isLoading}
                  {...register('companyName')}
                />
              </FormField>
              <FormField label={translate('auth.cif')} error={fieldError('cif')} required>
                <Input
                  id="cif"
                  type="text"
                  placeholder={translate('auth.cifPlaceholder')}
                  autoComplete="off"
                  disabled={isLoading}
                  {...register('cif')}
                />
              </FormField>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>{translate('auth.sectionLegalContact')}</p>
              <FormField
                label={translate('auth.legalRepresentative')}
                error={fieldError('legalRepresentative')}
                required
              >
                <Input
                  id="legalRepresentative"
                  type="text"
                  placeholder={translate('auth.legalRepresentativePlaceholder')}
                  autoComplete="name"
                  disabled={isLoading}
                  {...register('legalRepresentative')}
                />
              </FormField>
              <FormField
                label={translate('auth.legalEmail')}
                error={fieldError('legalEmail')}
                required
              >
                <Input
                  id="legalEmail"
                  type="email"
                  placeholder={translate('auth.emailPlaceholder')}
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('legalEmail')}
                />
              </FormField>
              <FormField label={translate('auth.phone')} error={fieldError('phone')}>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={translate('auth.phonePlaceholder')}
                  autoComplete="tel"
                  disabled={isLoading}
                  {...register('phone')}
                />
              </FormField>
            </div>
          </>
        ) : (
          <>
            {role === 'admin' && (
              <FormField label={translate('auth.fullName')} error={fieldError('fullName')} required>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={translate('auth.fullNamePlaceholder')}
                  autoComplete="name"
                  disabled={isLoading}
                  {...register('fullName')}
                />
              </FormField>
            )}
            <FormField label={translate('auth.username')} error={fieldError('username')} required>
              <Input
                id="username"
                type="text"
                placeholder={translate('auth.usernamePlaceholder')}
                autoComplete="username"
                disabled={isLoading}
                {...register('username')}
              />
            </FormField>
            <FormField label={translate('auth.email')} error={fieldError('email')} required>
              <Input
                id="email"
                type="email"
                placeholder={translate('auth.emailPlaceholder')}
                autoComplete="email"
                disabled={isLoading}
                {...register('email')}
              />
            </FormField>
          </>
        )}

        <FormField label={translate('auth.password')} error={fieldError('password')} required>
          <Input
            id="password"
            type="password"
            placeholder={translate('auth.passwordPlaceholder')}
            autoComplete="new-password"
            disabled={isLoading}
            {...register('password')}
          />
        </FormField>

        <FormField
          label={translate('auth.confirmPassword')}
          error={fieldError('confirmPassword')}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder={translate('auth.passwordPlaceholder')}
            autoComplete="new-password"
            disabled={isLoading}
            {...register('confirmPassword')}
          />
        </FormField>

        {role === 'admin' && (
          <>
            <div className={styles.infoCallout} role="note">
              {translate('auth.adminCodeInfo')}
            </div>
            <FormField label={translate('auth.adminCode')} error={fieldError('adminCode')} required>
              <Input
                id="adminCode"
                type="password"
                placeholder={translate('auth.adminCodePlaceholder')}
                autoComplete="off"
                disabled={isLoading}
                {...register('adminCode')}
              />
            </FormField>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <Button type="submit" disabled={!isValid || isLoading} className={styles.submitButton}>
          {isLoading ? <Spinner size="sm" /> : translate('auth.createAccount')}
        </Button>
      </div>
    </form>
  );
}
