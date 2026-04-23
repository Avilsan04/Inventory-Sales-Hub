import { useTranslation } from 'react-i18next';

export interface ITranslationAdapter {
    readonly translate: (key: string, options?: Record<string, unknown>) => string;
}

export function useTranslationAdapter(): ITranslationAdapter {
    const { t } = useTranslation();

    return {
        translate: (key: string, options?: Record<string, unknown>): string => {
            // Enforce strict string return type to prevent UI crashes on missing keys
            const translation = t(key, options);
            if (typeof translation !== 'string') {
                console.warn(`[I18n Warning] Missing or invalid translation for key: ${key}`);
                return key;
            }
            return translation;
        }
    };
}