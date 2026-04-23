import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type RevealTag = 'div' | 'section' | 'article' | 'span' | 'li' | 'p';
type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';

export interface RevealProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly direction?: Direction;
  readonly as?: RevealTag;
  readonly lift?: boolean;
  readonly className?: string;
}

type MotionDivProps = HTMLMotionProps<'div'>;

// Safe cast: all motion HTML elements share the same animation prop API.
// The HTML-specific attribute differences (href, htmlFor, etc.) are irrelevant here
// since Reveal only passes animation props and className.
const MOTION_COMPONENTS: Record<RevealTag, React.ComponentType<MotionDivProps>> = {
  div:     motion.div     as unknown as React.ComponentType<MotionDivProps>,
  section: motion.section as unknown as React.ComponentType<MotionDivProps>,
  article: motion.article as unknown as React.ComponentType<MotionDivProps>,
  span:    motion.span    as unknown as React.ComponentType<MotionDivProps>,
  li:      motion.li      as unknown as React.ComponentType<MotionDivProps>,
  p:       motion.p       as unknown as React.ComponentType<MotionDivProps>,
};

type MotionTarget = { opacity: number; y?: number; x?: number; scale?: number };

const HIDDEN: Record<Direction, MotionTarget> = {
  up:    { opacity: 0, y: 24 },
  down:  { opacity: 0, y: -24 },
  left:  { opacity: 0, x: -24 },
  right: { opacity: 0, x: 24 },
  scale: { opacity: 0, scale: 0.92 },
  fade:  { opacity: 0 },
};

const VISIBLE: Record<Direction, MotionTarget> = {
  up:    { opacity: 1, y: 0 },
  down:  { opacity: 1, y: 0 },
  left:  { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  fade:  { opacity: 1 },
};

export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  as = 'div',
  lift = false,
  className,
}: RevealProps): React.ReactElement {
  const Component = MOTION_COMPONENTS[as];
  const variants = {
    hidden: HIDDEN[direction],
    visible: { ...VISIBLE[direction], transition: { duration: 0.5, delay, ease: 'easeOut' as const } },
  };

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      whileHover={lift ? { y: -4, transition: { duration: 0.15, ease: 'easeOut' as const } } : undefined}
    >
      {children}
    </Component>
  );
}
