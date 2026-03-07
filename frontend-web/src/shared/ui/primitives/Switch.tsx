/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Switch.module.scss';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>): React.ReactElement {
  return (
    <SwitchPrimitive.Root
      className={cn(styles.switch, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={styles.switchThumb} />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
