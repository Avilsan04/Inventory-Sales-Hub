import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import {
  registerCustomerSchema,
  registerAdminSchema,
  registerCompanySchema,
  type RegisterCustomerValues,
  type RegisterAdminValues,
  type RegisterCompanyValues,
} from '../models/auth.schemas';
import type { RegisterRequest, RegisterRole } from '../models/auth.types';
import type { IAuthService } from '../services/IAuthService';
import { logger } from '@shared/lib/logger';

// Union of all register form value shapes
type RegisterFormValues = RegisterCustomerValues | RegisterAdminValues | RegisterCompanyValues;

export interface IRegisterPresenterProps {
  readonly onSuccess: () => void;
  readonly authService: IAuthService;
  readonly role: RegisterRole;
}

export interface IRegisterPresenter {
  readonly register: UseFormRegister<RegisterFormValues>;
  readonly handleSubmit: UseFormHandleSubmit<RegisterFormValues>;
  readonly errors: FieldErrors<RegisterFormValues>;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly isValid: boolean;
  readonly onSubmit: (data: RegisterFormValues) => Promise<void>;
}

function schemaForRole(
  role: RegisterRole
): typeof registerCustomerSchema | typeof registerAdminSchema | typeof registerCompanySchema {
  if (role === 'admin') return registerAdminSchema;
  if (role === 'company') return registerCompanySchema;
  return registerCustomerSchema;
}

function buildRegisterRequest(data: RegisterFormValues, role: RegisterRole): RegisterRequest {
  if (role === 'company') {
    const d = data as RegisterCompanyValues;
    return {
      username: d.companyName,
      email: d.legalEmail,
      password: d.password,
      role,
      companyName: d.companyName,
      cif: d.cif,
      legalRepresentative: d.legalRepresentative,
      phone: d.phone,
    };
  }
  if (role === 'admin') {
    const d = data as RegisterAdminValues;
    return {
      username: d.username,
      email: d.email,
      password: d.password,
      role,
      fullName: d.fullName,
      adminCode: d.adminCode,
    };
  }
  const d = data as RegisterCustomerValues;
  return { username: d.username, email: d.email, password: d.password, role };
}

export function useRegisterPresenter({
  onSuccess,
  authService,
  role,
}: IRegisterPresenterProps): IRegisterPresenter {
  const { translate } = useTranslationAdapter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const schema = React.useMemo(() => schemaForRole(role), [role]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(schema),
  });

  const onSubmit = React.useCallback(
    async (data: RegisterFormValues): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await authService.register(buildRegisterRequest(data, role));
        onSuccess();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.error('[Telemetry] Registration Failure:', message);
        setError(translate('auth.registerError'));
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, translate, authService, role]
  );

  return { register, handleSubmit, errors, isLoading, error, isValid, onSubmit };
}
