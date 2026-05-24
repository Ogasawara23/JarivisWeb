'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GlassCardProps } from '@/types';

export function GlassCard({ children, className, hover = false, neonBorder = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass rounded-xl',
        hover && 'glass-hover transition-all duration-200 cursor-pointer',
        neonBorder && 'neon-border',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
