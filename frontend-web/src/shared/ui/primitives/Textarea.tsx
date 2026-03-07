import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Textarea.module.scss';

function Textarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>): React.ReactElement {
  return (
    <textarea className={cn(styles.textarea, className)} {...props} />
  );
}

export { Textarea };
