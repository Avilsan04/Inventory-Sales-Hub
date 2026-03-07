/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Sheet.module.scss';

function Sheet({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>): React.ReactElement {
  return <DialogPrimitive.Root {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>): React.ReactElement {
  return <DialogPrimitive.Trigger {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>): React.ReactElement {
  return <DialogPrimitive.Close {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>): React.ReactElement {
  return <DialogPrimitive.Portal {...props} />;
}

const sideMap: Record<string, string | undefined> = {
  top: styles.sheetTop,
  bottom: styles.sheetBottom,
  left: styles.sheetLeft,
  right: styles.sheetRight,
};

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  side?: 'top' | 'bottom' | 'left' | 'right';
}): React.ReactElement {
  return (
    <SheetPortal>
      <DialogPrimitive.Overlay className={styles.sheetOverlay} />
      <DialogPrimitive.Content
        className={cn(styles.sheetContent, sideMap[side], className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={styles.sheetClose}>
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.sheetHeader, className)} {...props} />;
}

function SheetFooter({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.sheetFooter, className)} {...props} />;
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>): React.ReactElement {
  return (
    <DialogPrimitive.Title
      className={cn(styles.sheetTitle, className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<
  typeof DialogPrimitive.Description
>): React.ReactElement {
  return (
    <DialogPrimitive.Description
      className={cn(styles.sheetDescription, className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetPortal,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
