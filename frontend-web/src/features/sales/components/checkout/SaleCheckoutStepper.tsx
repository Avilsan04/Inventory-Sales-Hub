import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import { STEPS } from '../../lib/checkout.schemas';
import styles from '@shared/styles/themes/components/DialogForm.module.scss';

interface Props {
  current: number;
  translate: (k: string) => string;
}

export function SaleCheckoutStepper({ current, translate }: Props): React.ReactElement {
  return (
    <div className={styles['stepper']}>
      {STEPS.map((labelKey, i) => (
        <React.Fragment key={labelKey}>
          {i > 0 && (
            <div
              className={cn(styles['stepConnector'], i <= current && styles['stepConnectorDone'])}
            />
          )}
          <div className={styles['stepItem']}>
            <div
              className={cn(
                styles['stepDot'],
                i === current && styles['stepDotActive'],
                i < current && styles['stepDotDone']
              )}
            >
              {i < current ? <CheckIcon size={10} /> : i + 1}
            </div>
            <span
              className={cn(
                styles['stepLabel'],
                i === current && styles['stepLabelActive'],
                i < current && styles['stepLabelDone']
              )}
            >
              {translate(labelKey)}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
