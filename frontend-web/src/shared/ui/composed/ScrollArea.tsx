/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/ScrollArea.module.scss';

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>): React.ReactElement {
  return (
    <ScrollAreaPrimitive.Root
      className={cn(styles.scrollArea, className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className={styles.scrollAreaViewport}>
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>): React.ReactElement {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation={orientation}
      className={cn(styles.scrollbar, className)}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={styles.scrollbarThumb}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
