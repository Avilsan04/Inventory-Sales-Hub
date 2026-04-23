import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/components/Button.module.scss';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      type = 'button',
      ...props
    },
    ref
  ): React.ReactElement => {
    const Comp = (asChild ? Slot : 'button') as unknown as React.ElementType;

    const getVariantClass = (v: ButtonVariant): string => {
      const map: Record<ButtonVariant, string> = {
        default: styles['variantDefault'] ?? '',
        destructive: styles['variantDestructive'] ?? '',
        outline: styles['variantOutline'] ?? '',
        secondary: styles['variantSecondary'] ?? '',
        ghost: styles['variantGhost'] ?? '',
        link: styles['variantLink'] ?? '',
      };
      return map[v];
    };

    const getSizeClass = (s: ButtonSize): string => {
      const map: Record<ButtonSize, string> = {
        default: styles['sizeDefault'] ?? '',
        sm: styles['sizeSm'] ?? '',
        lg: styles['sizeLg'] ?? '',
        icon: styles['sizeIcon'] ?? '',
        'icon-sm': styles['sizeIconSm'] ?? '',
        'icon-lg': styles['sizeIconLg'] ?? '',
      };
      return map[s];
    };

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(styles['button'], getVariantClass(variant), getSizeClass(size), className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };