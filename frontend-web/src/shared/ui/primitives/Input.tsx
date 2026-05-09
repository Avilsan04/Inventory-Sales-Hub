import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Input.module.scss';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(function Input(
  { className, type, ...props },
  ref
) {
  return <input ref={ref} type={type} className={cn(styles.input, className)} {...props} />;
});

export { Input };
