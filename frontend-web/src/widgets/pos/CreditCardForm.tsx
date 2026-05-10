import * as React from 'react';
import { CreditCardIcon } from 'lucide-react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { cn } from '@shared/lib/cn';
import { Input, Label } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Pos.module.scss';

interface CreditCardFormProps {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  maskedCardSuffix: string;
  onCardHolderChange: (v: string) => void;
  onCardNumberChange: (v: string) => void;
  onExpiryChange: (v: string) => void;
  onCvvChange: (v: string) => void;
}

export function CreditCardForm({
  cardHolder,
  cardNumber,
  expiry,
  cvv,
  maskedCardSuffix,
  onCardHolderChange,
  onCardNumberChange,
  onExpiryChange,
  onCvvChange,
}: CreditCardFormProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();

  return (
    <div className={styles['paymentForm']}>
      <div className={styles['miniCard']}>
        <span className={styles['miniCardBrand']}>VISA</span>
        <span className={styles['miniCardNumber']}>•••• {maskedCardSuffix}</span>
      </div>
      <div className={styles['paymentField']}>
        <Label htmlFor="pos-holder">{t('sales.checkout.holderName')}</Label>
        <Input
          id="pos-holder"
          value={cardHolder}
          onChange={(e) => {
            onCardHolderChange(e.target.value);
          }}
          placeholder={t('sales.checkout.holderNamePlaceholder')}
          className={styles['paymentInput']}
        />
      </div>
      <div className={styles['paymentField']}>
        <Label htmlFor="pos-card">{t('sales.checkout.cardNumber')}</Label>
        <div className={styles['paymentInputWrapper']}>
          <CreditCardIcon className={styles['paymentInputIcon']} aria-hidden="true" />
          <Input
            id="pos-card"
            value={cardNumber}
            maxLength={19}
            placeholder={t('sales.checkout.cardNumberPlaceholder')}
            className={cn(styles['paymentInput'], styles['paymentInputWithIcon'])}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
              onCardNumberChange(raw.replace(/(.{4})/g, '$1 ').trim());
            }}
          />
        </div>
      </div>
      <div className={styles['paymentGrid2']}>
        <div className={styles['paymentField']}>
          <Label htmlFor="pos-expiry">{t('sales.checkout.expiry')}</Label>
          <Input
            id="pos-expiry"
            value={expiry}
            maxLength={5}
            placeholder={t('sales.checkout.expiryPlaceholder')}
            className={styles['paymentInput']}
            onChange={(e) => {
              let v = e.target.value.replace(/\D/g, '').slice(0, 4);
              if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
              onExpiryChange(v);
            }}
          />
        </div>
        <div className={styles['paymentField']}>
          <Label htmlFor="pos-cvv">{t('sales.checkout.cvv')}</Label>
          <Input
            id="pos-cvv"
            value={cvv}
            maxLength={4}
            type="password"
            placeholder={t('sales.checkout.cvvPlaceholder')}
            className={styles['paymentInput']}
            onChange={(e) => {
              onCvvChange(e.target.value.replace(/\D/g, '').slice(0, 4));
            }}
          />
        </div>
      </div>
    </div>
  );
}
