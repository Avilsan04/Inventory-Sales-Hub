import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import { useImpersonation } from '../hooks/useImpersonation';

export function ImpersonationBanner(): React.ReactElement | null {
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const { translate: t } = useTranslationAdapter();

  if (!isImpersonating) return null;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        background: 'var(--color-warning)',
        color: 'var(--color-warning-fg)',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span>{t('admin.impersonationActive')}</span>
      <Button variant="outline" size="sm" onClick={stopImpersonation}>
        {t('admin.exitImpersonation')}
      </Button>
    </div>
  );
}
