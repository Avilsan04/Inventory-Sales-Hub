import * as React from 'react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Skeleton.module.scss';

function Skeleton({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.skeleton, className)} {...props} />;
}

export { Skeleton };
