import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import { useImpersonation } from '../hooks/useImpersonation';
import styles from './ImpersonationBanner.module.scss';

export function ImpersonationBanner(): React.ReactElement | null {
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const { translate: t } = useTranslationAdapter();

  if (!isImpersonating) return null;

  return (
    <div role="alert" className={styles['banner']}>
      <span>{t('admin.impersonationActive')}</span>
      <Button variant="outline" size="sm" onClick={stopImpersonation}>
        {t('admin.exitImpersonation')}
      </Button>
    </div>
  );
}
