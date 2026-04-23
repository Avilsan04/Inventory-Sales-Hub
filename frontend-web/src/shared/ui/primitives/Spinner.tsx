import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Spinner.module.scss';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends React.ComponentProps<'div'> {
  size?: SpinnerSize;
}

function Spinner({
  className,
  size = 'md',
  ...props
}: SpinnerProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-label="Loading"
      data-size={size}
      className={cn(styles.spinner, className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export { Spinner };
export type { SpinnerProps, SpinnerSize };
