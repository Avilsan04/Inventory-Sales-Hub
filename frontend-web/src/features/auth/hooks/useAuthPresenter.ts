import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { loginFormSchema, type LoginFormValues } from '../models/auth.schemas';
import type { IAuthService } from '../services/IAuthService';
import { telemetry } from '@shared/lib/observability';

export interface IAuthPresenterProps {
  readonly onSuccess: () => void;
  readonly authService: IAuthService;
}

export interface IAuthPresenter {
  readonly register: UseFormRegister<LoginFormValues>;
  readonly handleSubmit: UseFormHandleSubmit<LoginFormValues>;
  readonly errors: FieldErrors<LoginFormValues>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isValid: boolean;
  readonly onSubmit: (data: LoginFormValues) => Promise<void>;
}

export function useAuthPresenter({ onSuccess, authService }: IAuthPresenterProps): IAuthPresenter {
  const { translate } = useTranslationAdapter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = React.useCallback(
    async (data: LoginFormValues): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await authService.login({ email: data.email, password: data.password });
        onSuccess();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        telemetry.captureMessage('Authentication failure', { message });
        setError(translate('auth.invalidCredentials'));
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, translate, authService]
  );

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    error,
    isValid,
    onSubmit,
  };
}
