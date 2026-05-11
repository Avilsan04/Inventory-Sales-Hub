import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { toast } from '@shared/hooks/useToast';
import { Button, Input, Label } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Settings.module.scss';

export function CompanySection(): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  const [companyName, setCompanyName] = React.useState('Inventory Sales Hub');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [currency, setCurrency] = React.useState('EUR');
  const [timezone, setTimezone] = React.useState('Europe/Madrid');

  return (
    <div className={styles.mainCard}>
      <div className={styles.cardSection}>
        <div className={styles.companyForm}>
          <div className={styles.formField}>
            <Label htmlFor="companyName">{t('settings.companyName')}</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCompanyName(e.target.value);
              }}
            />
          </div>
          <div className={styles.formField}>
            <Label htmlFor="logoUrl">{t('settings.logoUrl')}</Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setLogoUrl(e.target.value);
              }}
              placeholder="https://..."
            />
          </div>
          <div className={styles.formField}>
            <Label htmlFor="currency">{t('settings.defaultCurrency')}</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCurrency(e.target.value);
              }}
              maxLength={3}
              className={styles.inputNarrow}
            />
          </div>
          <div className={styles.formField}>
            <Label htmlFor="timezone">{t('settings.timezone')}</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTimezone(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <Button
          size="sm"
          onClick={() => {
            toast({ title: t('common.saveChanges') });
          }}
        >
          {t('common.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
