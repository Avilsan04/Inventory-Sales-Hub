import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import baseStyles from '@shared/styles/themes/pages/PageBase.module.scss';

export function SettingsPage(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <div className={baseStyles['page']}>
      <header className={baseStyles['header']}>
        <h1 className={baseStyles['title']}>{t('nav.settings')}</h1>
        <p className={baseStyles['subtitle']}>{t('common.noData')}</p>
      </header>
      <div className={baseStyles['placeholderContainer']}>
        <p className={baseStyles['placeholder']}>{t('common.noData')}</p>
      </div>
    </div>
  );
}
