/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Avatar.module.scss';

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>): React.ReactElement {
  return (
    <AvatarPrimitive.Root
      className={cn(styles.avatar, className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>): React.ReactElement {
  return (
    <AvatarPrimitive.Image
      className={cn(styles.avatarImage, className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>): React.ReactElement {
  return (
    <AvatarPrimitive.Fallback
      className={cn(styles.avatarFallback, className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
