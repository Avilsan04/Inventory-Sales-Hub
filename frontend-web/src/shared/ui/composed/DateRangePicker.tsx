import * as React from 'react';
import { Input } from '@shared/ui/primitives';

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
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Input
        type="date"
        value={value.from}
        max={value.to || undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange({ ...value, from: e.target.value });
        }}
        style={{ width: '9rem' }}
        aria-label="From date"
      />
      <span style={{ color: 'var(--color-muted-foreground)', fontSize: '0.875rem' }}>–</span>
      <Input
        type="date"
        value={value.to}
        min={value.from || undefined}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange({ ...value, to: e.target.value });
        }}
        style={{ width: '9rem' }}
        aria-label="To date"
      />
    </div>
  );
}
