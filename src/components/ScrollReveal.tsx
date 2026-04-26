'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// ── Reusable scroll-reveal wrapper ───────────────────────────────────────────

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  className?: string;
  once?: boolean;
  duration?: number;
}

const variants: Record<string, Variants> = {
  up:    { hidden: { opacity: 0, y: 32 },    visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -32 },   visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -32 },   visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 32 },    visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1 } },
  fade:  { hidden: { opacity: 0 },           visible: { opacity: 1 } },
};

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
  once = true,
  duration = 0.5,
}: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={variants[direction]}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger container — children animate in one by one ───────────────────────
interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'left' | 'scale' | 'fade';
}

export function StaggerReveal({ children, className, staggerDelay = 0.08, direction = 'up' }: StaggerProps) {
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Single stagger item (use inside StaggerReveal) ───────────────────────────
export function StaggerItem({ children, className, direction = 'up' }: { children: ReactNode; className?: string; direction?: string }) {
  return (
    <motion.div variants={variants[direction] ?? variants.up} className={className}>
      {children}
    </motion.div>
  );
}
