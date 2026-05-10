import * as React from 'react';
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
        aria-label="From date"
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
        aria-label="To date"
      />
    </div>
  );
}
