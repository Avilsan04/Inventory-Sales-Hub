/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Label.module.scss';

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>): React.ReactElement {
  return (
    <LabelPrimitive.Root
      className={cn(styles.label, className)}
      {...props}
    />
  );
}

export { Label };
