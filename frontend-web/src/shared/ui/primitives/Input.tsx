import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Input.module.scss';

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>): React.ReactElement {
  return (
    <input
      type={type}
      className={cn(styles.input, className)}
      {...props}
    />
  );
}

export { Input };
