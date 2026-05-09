import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSettings } from '@shared/hooks/useSettings';
import { Switch } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

const NOTIF_OPTIONS: Array<{
  key: keyof Pick<
    ReturnType<typeof useSettings>['settings'],
    'notificationsInfo' | 'notificationsWarning' | 'notificationsError' | 'notificationsSuccess'
  >;
  labelKey: string;
  descKey: string;
  color: string;
}> = [
  {
    key: 'notificationsInfo',
    labelKey: 'settings.infoNotifications',
    descKey: 'settings.infoNotificationsDesc',
    color: '#3b82f6',
  },
  {
    key: 'notificationsWarning',
    labelKey: 'settings.warningNotifications',
    descKey: 'settings.warningNotificationsDesc',
    color: '#f59e0b',
  },
  {
    key: 'notificationsError',
    labelKey: 'settings.errorNotifications',
    descKey: 'settings.errorNotificationsDesc',
    color: '#ef4444',
  },
  {
    key: 'notificationsSuccess',
    labelKey: 'settings.successNotifications',
    descKey: 'settings.successNotificationsDesc',
    color: '#22c55e',
  },
];

export function NotificationsSection(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { settings, updateSettings } = useSettings();

  return (
    <div className={styles.mainCard}>
      <div className={styles.cardSection}>
        {NOTIF_OPTIONS.map((item) => (
          <div key={item.key} className={styles.toggleRow}>
            <div className={styles.toggleLeft}>
              <span className={styles.notifDot} style={{ backgroundColor: item.color }} />
              <div className={styles.toggleLabels}>
                <span className={styles.toggleTitle}>{t(item.labelKey)}</span>
                <span className={styles.toggleDesc}>{t(item.descKey)}</span>
              </div>
            </div>
            <Switch
              checked={settings[item.key]}
              onCheckedChange={(checked: boolean) => {
                updateSettings({ [item.key]: checked });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
