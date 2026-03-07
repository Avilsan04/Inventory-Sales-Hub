import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Badge.module.scss';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      asChild = false,
      ...props
    },
    ref
  ): React.ReactElement => {
    const Comp = (asChild ? Slot : 'span') as unknown as React.ElementType;

    const getVariantClass = (v: BadgeVariant): string => {
      const map: Record<BadgeVariant, string> = {
        default: styles['variantDefault'] ?? '',
        secondary: styles['variantSecondary'] ?? '',
        destructive: styles['variantDestructive'] ?? '',
        outline: styles['variantOutline'] ?? '',
        success: styles['variantSuccess'] ?? '',
      };
      return map[v];
    };

    return (
      <Comp
        ref={ref}
        className={cn(styles['badge'], getVariantClass(variant), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant };