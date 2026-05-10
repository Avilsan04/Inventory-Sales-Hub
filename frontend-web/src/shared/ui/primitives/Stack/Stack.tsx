import * as React from 'react';
import styles from './Stack.module.scss';

type SpacingKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
type AlignValue = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type JustifyValue = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface StackProps<T extends React.ElementType = 'div'> {
  as?: T;
  gap?: SpacingKey;
  align?: AlignValue;
  justify?: JustifyValue;
  direction?: 'row' | 'column';
  wrap?: boolean;
  className?: string;
  children: React.ReactNode;
}

type PolymorphicProps<T extends React.ElementType> = StackProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof StackProps<T>>;

export function Stack<T extends React.ElementType = 'div'>({
  as,
  gap = '4',
  align,
  justify,
  direction = 'column',
  wrap = false,
  className,
  children,
  ...rest
}: PolymorphicProps<T>): React.ReactElement {
  const Tag = as ?? 'div';

  const cls = [
    styles['stack'],
    styles[`dir-${direction}`],
    styles[`gap-${gap}`],
    align != null ? styles[`align-${align}`] : '',
    justify != null ? styles[`justify-${justify}`] : '',
    wrap ? styles['wrap'] : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
