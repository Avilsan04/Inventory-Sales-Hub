import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import type { LoginRequest } from '../models/auth.types';
import type { IAuthService } from '../services/IAuthService';

export interface IAuthPresenterProps {
    readonly onSuccess: () => void;
    readonly authService: IAuthService;
}

export interface IAuthPresenter {
    readonly formData: LoginRequest;
    readonly isLoading: boolean;
    readonly error: string | null;
    readonly rememberMe: boolean;
    readonly isFormValid: boolean;
    readonly handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readonly handleRememberMeChange: (checked: boolean | 'indeterminate') => void;
    readonly handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
}

export function useAuthPresenter({ onSuccess, authService }: IAuthPresenterProps): IAuthPresenter {
    const { translate } = useTranslationAdapter();

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [rememberMe, setRememberMe] = React.useState<boolean>(false);
    const [formData, setFormData] = React.useState<LoginRequest>({
        email: '',
        password: '',
    });

    const isFormValid = React.useMemo((): boolean => {
        return formData.email.trim().length > 5 && formData.password.trim().length > 0;
    }, [formData]);

    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        const sanitizedValue = value.replace(/[<>]/g, '');
        setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
        setError(null);
    }, []);

    const handleRememberMeChange = React.useCallback((checked: boolean | 'indeterminate'): void => {
        setRememberMe(checked === true);
    }, []);

    const handleSubmit = React.useCallback(
        async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            if (!isFormValid) {
                setError(translate('auth.validationError'));
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // Architecture Note: authService is now strictly decoupled and injected
                await authService.login(formData, rememberMe);
                onSuccess();
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown infrastructure error';
                console.error('[Telemetry] Authentication Failure:', errorMessage);
                setError(translate('auth.invalidCredentials'));
            } finally {
                setIsLoading(false);
            }
        },
        [formData, rememberMe, onSuccess, isFormValid, translate, authService]
    );

    return {
        formData,
        isLoading,
        error,
        rememberMe,
        isFormValid,
        handleInputChange,
        handleRememberMeChange,
        handleSubmit,
    };
}