import * as React from 'react';
import { motion } from 'framer-motion';

export interface FadeInProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps): React.ReactElement {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' as const }}
    >
      {children}
    </motion.div>
  );
}
