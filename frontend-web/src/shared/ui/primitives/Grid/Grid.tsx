import * as React from 'react';
import styles from './Grid.module.scss';

type ColsValue = 1 | 2 | 3 | 4 | 6 | 12;
type SpacingKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8';

interface GridProps<T extends React.ElementType = 'div'> {
  as?: T;
  cols?: ColsValue;
  gap?: SpacingKey;
  className?: string;
  children: React.ReactNode;
}

type PolymorphicProps<T extends React.ElementType> = GridProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof GridProps<T>>;

export function Grid<T extends React.ElementType = 'div'>({
  as,
  cols = 1,
  gap = '4',
  className,
  children,
  ...rest
}: PolymorphicProps<T>): React.ReactElement {
  const Tag = as ?? 'div';

  const cls = [styles['grid'], styles[`cols-${cols}`], styles[`gap-${gap}`], className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
