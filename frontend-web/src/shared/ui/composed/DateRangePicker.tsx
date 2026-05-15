import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { Input } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/DateRangePicker.module.scss';

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  return (
    <div className={styles.container}>
      <Input
        type="date"
        value={value.from}
        max={value.to || undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange({ ...value, from: e.target.value });
        }}
        className={styles.dateInput}
        aria-label={t('common.fromDate')}
      />
      <span className={styles.separator}>–</span>
      <Input
        type="date"
        value={value.to}
        min={value.from || undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange({ ...value, to: e.target.value });
        }}
        className={styles.dateInput}
        aria-label={t('common.toDate')}
      />
    </div>
  );
}
