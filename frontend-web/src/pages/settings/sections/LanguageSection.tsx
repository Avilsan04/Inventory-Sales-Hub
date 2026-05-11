import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useLanguageAdapter } from '@shared/adapters/useLanguageAdapter';
import { SegmentedControl, type SegmentedOption } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

export function LanguageSection(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { language, toggleLanguage } = useLanguageAdapter();

  const langOptions: SegmentedOption<'en' | 'es'>[] = [
    { value: 'en', label: t('settings.langEnglish') },
    { value: 'es', label: t('settings.langSpanish') },
  ];

  function handleLangChange(val: 'en' | 'es'): void {
    if (val !== language) toggleLanguage();
  }

  return (
    <div className={styles.mainCard}>
      <div className={styles.cardSection}>
        <div className={styles.fieldHeader}>
          <span className={styles.fieldTitle}>{t('settings.languageSectionTitle')}</span>
          <span className={styles.fieldDesc}>{t('settings.languageSectionDesc')}</span>
        </div>
        <SegmentedControl options={langOptions} value={language} onChange={handleLangChange} />
      </div>
    </div>
  );
}
