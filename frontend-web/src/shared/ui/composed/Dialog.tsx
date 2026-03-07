/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-redundant-type-constituents */
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Dialog.module.scss';

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>): React.ReactElement {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>): React.ReactElement {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>): React.ReactElement {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>): React.ReactElement {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>): React.ReactElement {
  return (
    <DialogPrimitive.Overlay
      className={cn(styles.dialogOverlay, className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}): React.ReactElement {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(styles.dialogContent, className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className={styles.dialogClose}>
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.dialogHeader, className)} {...props} />;
}

function DialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>): React.ReactElement {
  return <div className={cn(styles.dialogFooter, className)} {...props} />;
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>): React.ReactElement {
  return (
    <DialogPrimitive.Title
      className={cn(styles.dialogTitle, className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<
  typeof DialogPrimitive.Description
>): React.ReactElement {
  return (
    <DialogPrimitive.Description
      className={cn(styles.dialogDescription, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
