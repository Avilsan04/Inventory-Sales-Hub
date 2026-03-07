/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-redundant-type-constituents */
import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/DropdownMenu.module.scss';

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>): React.ReactElement {
  return <DropdownMenuPrimitive.Root {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
>): React.ReactElement {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.Group
>): React.ReactElement {
  return <DropdownMenuPrimitive.Group {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.Portal
>): React.ReactElement {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
>): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(styles.dropdownContent, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Item
      data-inset={inset}
      className={cn(
        styles.dropdownItem,
        variant === 'destructive' && styles.dropdownItemDestructive,
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.CheckboxItem
>): React.ReactElement {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(styles.dropdownCheckboxItem, className)}
      checked={checked}
      {...props}
    >
      <span className={styles.dropdownItemIndicator}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
>): React.ReactElement {
  return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>): React.ReactElement {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(styles.dropdownRadioItem, className)}
      {...props}
    >
      <span className={styles.dropdownItemIndicator}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Label
      data-inset={inset}
      className={cn(styles.dropdownLabel, className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.Separator
>): React.ReactElement {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn(styles.dropdownSeparator, className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return <span className={cn(styles.dropdownShortcut, className)} {...props} />;
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>): React.ReactElement {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}): React.ReactElement {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-inset={inset}
      className={cn(styles.dropdownSubTrigger, className)}
      {...props}
    >
      {children}
      <ChevronRightIcon />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<
  typeof DropdownMenuPrimitive.SubContent
>): React.ReactElement {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(styles.dropdownSubContent, className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
