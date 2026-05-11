import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/SegmentedControl.module.scss';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
}

interface Props<T extends string = string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: Props<T>): React.ReactElement {
  return (
    <div className={cn(styles.root, className)} role="group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={cn(styles.item, value === opt.value && styles.active)}
          onClick={() => {
            onChange(opt.value);
          }}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
