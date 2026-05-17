import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useLogout, useDeleteAccount } from '@features/auth';
import { useSettings } from '@shared/hooks/useSettings';
import { Button } from '@shared/ui/primitives';
import { ConfirmDialog } from '@shared/ui/composed';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

export function AccountSection(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { resetSettings } = useSettings();
  const logout = useLogout();
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <div className={styles.mainCard}>
        <div className={styles.cardSection}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabels}>
              <span className={styles.toggleTitle}>{t('settings.resetPreferences')}</span>
              <span className={styles.toggleDesc}>{t('settings.resetPreferencesDesc')}</span>
            </div>
            <Button variant="outline" size="sm" onClick={resetSettings}>
              {t('settings.resetAction')}
            </Button>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabels}>
              <span className={styles.dangerTitle}>{t('settings.deleteAccount')}</span>
              <span className={styles.toggleDesc}>{t('settings.deleteAccountDesc')}</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmOpen(true);
              }}
            >
              {t('settings.deleteAccount')}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('settings.deleteAccount')}
        description={t('settings.deleteAccountDesc')}
        isPending={isPending}
        onConfirm={() => {
          deleteAccount(undefined, { onSuccess: logout });
        }}
      />
    </>
  );
}
