import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import type { RegisterRequest, RegisterRole } from '../models/auth.types';
import type { IAuthService } from '../services/IAuthService';
import { AUTH_VALIDATION_RULES } from '../models/auth.constants';

export interface RegisterFormData {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  // admin
  readonly fullName: string;
  readonly adminCode: string;
  // company
  readonly companyName: string;
  readonly cif: string;
  readonly legalRepresentative: string;
  readonly legalEmail: string;
  readonly phone: string;
}

export interface IRegisterPresenterProps {
  readonly onSuccess: () => void;
  readonly authService: IAuthService;
  readonly role: RegisterRole;
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
  role,
}: IRegisterPresenterProps): IRegisterPresenter {
  const { translate } = useTranslationAdapter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    adminCode: '',
    companyName: '',
    cif: '',
    legalRepresentative: '',
    legalEmail: '',
    phone: '',
  });

  const isFormValid = React.useMemo((): boolean => {
    const passwordsOk =
      formData.password.length >= AUTH_VALIDATION_RULES.MIN_PASSWORD_LENGTH &&
      formData.password === formData.confirmPassword;

    if (role === 'company') {
      return (
        passwordsOk &&
        formData.companyName.trim().length > 0 &&
        formData.cif.trim().length > 0 &&
        formData.legalRepresentative.trim().length > 0 &&
        formData.legalEmail.trim().length > 0 &&
        formData.phone.trim().length > 0
      );
    }

    const base =
      formData.username.trim().length >= AUTH_VALIDATION_RULES.MIN_USERNAME_LENGTH &&
      formData.email.trim().length > 0 &&
      passwordsOk;

    if (role === 'admin') {
      return base && formData.fullName.trim().length > 0 && formData.adminCode.trim().length > 0;
    }
    return base;
  }, [formData, role]);

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;
      const isSecret = name === 'password' || name === 'confirmPassword' || name === 'adminCode';
      const sanitizedValue = isSecret ? value : value.replace(/[<>]/g, '');
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

      let registerData: RegisterRequest;

      if (role === 'company') {
        registerData = {
          username: formData.companyName.trim(),
          email: formData.legalEmail.trim(),
          password: formData.password,
          role,
          companyName: formData.companyName.trim(),
          cif: formData.cif.trim(),
          legalRepresentative: formData.legalRepresentative.trim(),
          phone: formData.phone.trim(),
        };
      } else {
        registerData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role,
          ...(role === 'admin' && {
            fullName: formData.fullName.trim(),
            adminCode: formData.adminCode.trim(),
          }),
        };
      }

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
    [formData, onSuccess, isFormValid, translate, authService, role]
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
