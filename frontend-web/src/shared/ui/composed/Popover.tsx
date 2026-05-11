import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Popover.module.scss';

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>): React.ReactElement {
  return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>): React.ReactElement {
  return <PopoverPrimitive.Trigger {...props} />;
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>): React.ReactElement {
  return <PopoverPrimitive.Anchor {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>): React.ReactElement {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(styles.popoverContent, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
