/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Checkbox.module.scss';

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>): React.ReactElement {
  return (
    <CheckboxPrimitive.Root
      className={cn(styles.checkbox, className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={styles.checkboxIndicator}>
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
