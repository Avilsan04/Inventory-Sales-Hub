import * as React from 'react';
import { ContrastIcon, ZapOffIcon, InfoIcon, ExternalLinkIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { useTheme } from '@shared/hooks/useTheme';
import {
  useSettings,
  type AccentColor,
  type DisplayScale,
  type Density,
} from '@shared/hooks/useSettings';
import { toast } from '@shared/hooks/useToast';
import { Switch, Button, SegmentedControl, type SegmentedOption } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

const ACCENT_SWATCHES: Array<{ value: AccentColor; color: string }> = [
  { value: 'blue', color: '#2563eb' },
  { value: 'green', color: '#10b981' },
  { value: 'purple', color: '#8b5cf6' },
  { value: 'slate', color: '#64748b' },
  { value: 'rose', color: '#f43f5e' },
];

export function AppearanceSection(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();

  const themeOptions: SegmentedOption<'light' | 'dark' | 'system'>[] = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'system', label: t('settings.themeSystem') },
  ];

  const scaleOptions: SegmentedOption<DisplayScale>[] = [
    { value: 'sm', label: t('settings.scaleSm') },
    { value: 'md', label: t('settings.scaleMd') },
    { value: 'lg', label: t('settings.scaleLg') },
  ];

  const densityOptions: SegmentedOption<Density>[] = [
    { value: 'comfortable', label: t('settings.densityComfortable') },
    { value: 'compact', label: t('settings.densityCompact') },
  ];

  function handleResetDefaults(): void {
    resetSettings();
    setTheme('system');
    toast({ title: t('settings.resetAction') });
  }

  return (
    <>
      <div className={styles.mainCard}>
        <div className={styles.cardSection}>
          <div className={styles.fieldHeader}>
            <span className={styles.fieldTitle}>{t('settings.themeMode')}</span>
            <span className={styles.fieldDesc}>{t('settings.themeModeDesc')}</span>
          </div>
          <SegmentedControl options={themeOptions} value={theme} onChange={setTheme} />
        </div>

        <div className={styles.cardSection}>
          <div className={styles.fieldHeader}>
            <span className={styles.fieldTitle}>{t('settings.accentColor')}</span>
            <span className={styles.fieldDesc}>{t('settings.accentColorDesc')}</span>
          </div>
          <div className={styles.swatches}>
            {ACCENT_SWATCHES.map(({ value, color }) => (
              <Button
                key={value}
                variant="ghost"
                aria-label={t('settings.selectThemeAria', { label: value })}
                aria-pressed={settings.accentColor === value}
                className={cn(styles.swatch, settings.accentColor === value && styles.swatchActive)}
                style={{ backgroundColor: color }}
                onClick={() => {
                  updateSettings({ accentColor: value });
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.cardSection}>
          <div className={styles.fieldHeader}>
            <span className={styles.fieldTitle}>{t('settings.displayScale')}</span>
            <span className={styles.fieldDesc}>{t('settings.displayScaleDesc')}</span>
          </div>
          <SegmentedControl
            options={scaleOptions}
            value={settings.displayScale}
            onChange={(val) => {
              updateSettings({ displayScale: val });
            }}
          />
        </div>

        <div className={styles.cardSection}>
          <div className={styles.fieldHeader}>
            <span className={styles.fieldTitle}>{t('settings.density')}</span>
            <span className={styles.fieldDesc}>{t('settings.densityDesc')}</span>
          </div>
          <SegmentedControl
            options={densityOptions}
            value={settings.density}
            onChange={(val) => {
              updateSettings({ density: val });
            }}
          />
        </div>

        <div className={styles.cardFooter}>
          <Button variant="outline" size="sm" onClick={handleResetDefaults}>
            {t('settings.resetDefaults')}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast({ title: t('settings.savePreferences') });
            }}
          >
            {t('settings.savePreferences')}
          </Button>
        </div>
      </div>

      <div className={styles.accessGrid}>
        <div className={styles.accessCard}>
          <div className={styles.accessIconWrap}>
            <ContrastIcon size={20} aria-hidden="true" />
          </div>
          <div className={styles.accessInfo}>
            <span className={styles.accessTitle}>{t('settings.contrast')}</span>
            <span className={styles.accessDesc}>{t('settings.contrastDesc')}</span>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked: boolean) => {
              updateSettings({ highContrast: checked });
            }}
          />
        </div>

        <div className={styles.accessCard}>
          <div className={styles.accessIconWrap}>
            <ZapOffIcon size={20} aria-hidden="true" />
          </div>
          <div className={styles.accessInfo}>
            <span className={styles.accessTitle}>{t('settings.motion')}</span>
            <span className={styles.accessDesc}>{t('settings.motionDesc')}</span>
          </div>
          <Switch
            checked={settings.reduceMotion}
            onCheckedChange={(checked: boolean) => {
              updateSettings({ reduceMotion: checked });
            }}
          />
        </div>
      </div>

      <div className={styles.infoBox}>
        <p className={styles.infoBoxText}>
          <InfoIcon size={16} aria-hidden="true" />
          {t('settings.enterpriseTheme')}
        </p>
        <a href="#" className={styles.infoBoxLink}>
          {t('settings.contactAdmin')}
          <ExternalLinkIcon size={14} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
