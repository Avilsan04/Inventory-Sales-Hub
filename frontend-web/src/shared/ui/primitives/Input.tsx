import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Input.module.scss';
import { Spinner } from './Spinner';

type InputProps = React.ComponentProps<'input'> & {
  isLoading?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, isLoading, ...props },
  ref
) {
  if (isLoading === undefined) {
    return <input ref={ref} type={type} className={cn(styles.input, className)} {...props} />;
  }
  return (
    <div className={styles.inputWrapper}>
      <input ref={ref} type={type} className={cn(styles.input, className)} {...props} />
      {isLoading && (
        <span className={styles.inputLoading} aria-hidden="true">
          <Spinner size="sm" />
        </span>
      )}
    </div>
  );
});

export { Input };
