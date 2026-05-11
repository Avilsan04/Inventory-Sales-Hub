import * as React from 'react';
import styles from './Container.module.scss';

type SizeValue = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface ContainerProps<T extends React.ElementType = 'div'> {
  as?: T;
  size?: SizeValue;
  className?: string;
  children: React.ReactNode;
}

type PolymorphicProps<T extends React.ElementType> = ContainerProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof ContainerProps<T>>;

export function Container<T extends React.ElementType = 'div'>({
  as,
  size = 'xl',
  className,
  children,
  ...rest
}: PolymorphicProps<T>): React.ReactElement {
  const Tag = as ?? 'div';

  const cls = [styles['container'], styles[`size-${size}`], className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
