import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Progress.module.scss';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  className?: string;
  value?: number;
}

function Progress({ className, value, ...props }: ProgressProps): React.ReactElement {
  return (
    <ProgressPrimitive.Root
      className={cn(styles['progress'], className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={styles['progressIndicator']}
        style={{ transform: `translateX(-${String(100 - (value ?? 0))}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };