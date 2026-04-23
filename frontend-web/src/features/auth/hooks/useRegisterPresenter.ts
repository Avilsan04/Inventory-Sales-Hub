// @features/auth/hooks/useRegisterPresenter.ts
import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import type { RegisterRequest } from '../models/auth.types';
import type { IAuthService } from '../services/IAuthService';
import { AUTH_VALIDATION_RULES } from '../models/auth.constants';

// Architectural Correction: Strict Immutability
export interface RegisterFormData {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}

export interface IRegisterPresenterProps {
  readonly onSuccess: () => void;
  readonly authService: IAuthService;
}

export interface IRegisterPresenter {
  readonly formData: RegisterFormData;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isFormValid: boolean;
  readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
}

export function useRegisterPresenter({
  onSuccess,
  authService,
}: IRegisterPresenterProps): IRegisterPresenter {
  const { translate } = useTranslationAdapter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isFormValid = React.useMemo((): boolean => {
    return (
      formData.username.trim().length >= AUTH_VALIDATION_RULES.MIN_USERNAME_LENGTH &&
      formData.email.trim().length > 0 &&
      formData.password.length >= AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH &&
      formData.password === formData.confirmPassword
    );
  }, [formData]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;

      // Architectural Correction: Never sanitize passwords. 
      // Only sanitize non-credential inputs.
      const isPasswordField = name === 'password' || name === 'confirmPassword';
      const sanitizedValue = isPasswordField ? value : value.replace(/[<>]/g, '');

      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      setError(null);
    },
    []
  );

  const handleSubmit = React.useCallback(
    async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();

      if (!isFormValid) {
        if (formData.password !== formData.confirmPassword) {
          setError(translate('auth.passwordMismatch'));
        } else {
          setError(translate('auth.validationError'));
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const registerData: RegisterRequest = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      try {
        await authService.register(registerData);
        onSuccess();
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown infrastructure error';
        console.error('[Telemetry] Registration Failure:', errorMessage);
        setError(translate('auth.registerError'));
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSuccess, isFormValid, translate, authService]
  );

  return {
    formData,
    isLoading,
    error,
    isFormValid,
    handleInputChange,
    handleSubmit,
  };
}