import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Badge.module.scss';

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showDot?: boolean;
  asChild?: boolean;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default:     'variantDefault',
  secondary:   'variantSecondary',
  destructive: 'variantDestructive',
  outline:     'variantOutline',
  success:     'variantSuccess',
  warning:     'variantWarning',
  info:        'variantInfo',
  neutral:     'variantNeutral',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', showDot = false, asChild = false, children, ...props }, ref): React.ReactElement => {
    const Comp = (asChild ? Slot : 'span') as unknown as React.ElementType;
    const variantClass = styles[VARIANT_CLASS[variant]] ?? '';

    return (
      <Comp
        ref={ref}
        className={cn(styles['badge'], variantClass, className)}
        {...props}
      >
        {showDot && <span className={cn(styles['dot'], styles[`dot-${variant}`])} aria-hidden="true" />}
        {children}
      </Comp>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant };
