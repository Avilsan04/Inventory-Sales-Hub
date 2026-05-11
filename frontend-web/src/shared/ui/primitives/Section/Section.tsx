import * as React from 'react';
import styles from './Section.module.scss';

type SpacingKey = '0' | '4' | '6' | '8' | '10' | '12' | '16';

interface SectionProps<T extends React.ElementType = 'section'> {
  as?: T;
  py?: SpacingKey;
  className?: string;
  children: React.ReactNode;
}

type PolymorphicProps<T extends React.ElementType> = SectionProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof SectionProps<T>>;

export function Section<T extends React.ElementType = 'section'>({
  as,
  py = '8',
  className,
  children,
  ...rest
}: PolymorphicProps<T>): React.ReactElement {
  const Tag = as ?? 'section';

  const cls = [styles['section'], styles[`py-${py}`], className ?? ''].filter(Boolean).join(' ');

  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
