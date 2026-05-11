import * as React from 'react';
import { Label, Spinner } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/FormField.module.scss';

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  isLoading,
  children,
}: FormFieldProps): React.ReactElement {
  return (
    <div className={styles['field']}>
      <div className={styles['labelRow']}>
        <Label>
          {label}
          {required === true && <span className={styles['required']}> *</span>}
        </Label>
        {isLoading === true && <Spinner size="sm" />}
      </div>
      {children}
      {error !== undefined && (
        <p className={styles['error']} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
