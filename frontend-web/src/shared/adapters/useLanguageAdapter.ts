import * as React from 'react';
import i18n from '@core/i18n';

export type Language = 'en' | 'es';

export interface ILanguageAdapter {
  readonly language: Language;
  readonly toggleLanguage: () => void;
}

const STORAGE_KEY = 'language';

export function useLanguageAdapter(): ILanguageAdapter {
  const [language, setLanguage] = React.useState<Language>(
    i18n.language === 'es' ? 'es' : 'en'
  );

  const toggleLanguage = React.useCallback((): void => {
    const next: Language = language === 'en' ? 'es' : 'en';
    void i18n.changeLanguage(next);
    localStorage.setItem(STORAGE_KEY, next);
    setLanguage(next);
  }, [language]);

  return { language, toggleLanguage };
}
