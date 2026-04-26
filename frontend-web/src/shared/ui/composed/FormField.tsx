import * as React from 'react';
import { Label } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/components/FormField.module.scss';

export interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps): React.ReactElement {
    return (
        <div className={styles['field']}>
            <Label>
                {label}
                {required === true && <span className={styles['required']}> *</span>}
            </Label>
            {children}
            {error !== undefined && <p className={styles['error']} role="alert">{error}</p>}
        </div>
    );
}
