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
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };