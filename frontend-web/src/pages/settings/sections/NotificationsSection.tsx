import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useSettings } from '@shared/hooks/useSettings';
import { Switch } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

const NOTIF_OPTIONS: Array<{
  key: keyof Pick<
    ReturnType<typeof useSettings>['settings'],
    'notificationsInfo' | 'notificationsWarning' | 'notificationsError' | 'notificationsSuccess'
  >;
  labelKey: string;
  descKey: string;
  dotClass: string;
}> = [
  {
    key: 'notificationsInfo',
    labelKey: 'settings.infoNotifications',
    descKey: 'settings.infoNotificationsDesc',
    dotClass: styles.notifDotInfo ?? '',
  },
  {
    key: 'notificationsWarning',
    labelKey: 'settings.warningNotifications',
    descKey: 'settings.warningNotificationsDesc',
    dotClass: styles.notifDotWarning ?? '',
  },
  {
    key: 'notificationsError',
    labelKey: 'settings.errorNotifications',
    descKey: 'settings.errorNotificationsDesc',
    dotClass: styles.notifDotError ?? '',
  },
  {
    key: 'notificationsSuccess',
    labelKey: 'settings.successNotifications',
    descKey: 'settings.successNotificationsDesc',
    dotClass: styles.notifDotSuccess ?? '',
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
              <span className={cn(styles.notifDot, item.dotClass)} />
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
