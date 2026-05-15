import * as React from 'react';
import { useTranslationAdapter } from '@adapters/useTranslationAdapter';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Spinner.module.scss';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends React.ComponentProps<'div'> {
  size?: SpinnerSize;
}

function Spinner({ className, size = 'md', ...props }: SpinnerProps): React.ReactElement {
  const { translate: t } = useTranslationAdapter();
  return (
    <div
      role="status"
      aria-label={t('common.loading')}
      data-size={size}
      className={cn(styles.spinner, className)}
      {...props}
    >
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

export { Spinner };
export type { SpinnerProps, SpinnerSize };
