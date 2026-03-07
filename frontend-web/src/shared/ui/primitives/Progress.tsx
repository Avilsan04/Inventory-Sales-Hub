/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Progress.module.scss';

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>): React.ReactElement {
  return (
    <ProgressPrimitive.Root
      className={cn(styles.progress, className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={styles.progressIndicator}
        style={{ transform: `translateX(-${String(100 - (value ?? 0))}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };