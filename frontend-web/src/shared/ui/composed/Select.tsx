/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Select.module.scss';

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>): React.ReactElement {
  return <SelectPrimitive.Root {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>): React.ReactElement {
  return <SelectPrimitive.Group {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>): React.ReactElement {
  return <SelectPrimitive.Value {...props} />;
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: 'sm' | 'default';
}): React.ReactElement {
  return (
    <SelectPrimitive.Trigger
      data-size={size}
      className={cn(styles.selectTrigger, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>): React.ReactElement {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(styles.selectContent, className)}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>): React.ReactElement {
  return (
    <SelectPrimitive.Label
      className={cn(styles.selectLabel, className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>): React.ReactElement {
  return (
    <SelectPrimitive.Item
      className={cn(styles.selectItem, className)}
      {...props}
    >
      <span className={styles.selectItemIndicator}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>): React.ReactElement {
  return (
    <SelectPrimitive.Separator
      className={cn(styles.selectSeparator, className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<
  typeof SelectPrimitive.ScrollUpButton
>): React.ReactElement {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(styles.selectScrollButton, className)}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<
  typeof SelectPrimitive.ScrollDownButton
>): React.ReactElement {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(styles.selectScrollButton, className)}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
