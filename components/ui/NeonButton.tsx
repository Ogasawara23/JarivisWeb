'use client';

import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function NeonButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  ...props
}: NeonButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-[0.97] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[#7a0000]/10 border border-[#ff2b2b]/30 text-[#ff2b2b] hover:bg-[#7a0000]/25 hover:border-[#ff2b2b]/60 hover:shadow-[0_0_15px_rgba(255,43,43,0.25)] focus:border-[#ff2b2b]/80',
    ghost:
      'bg-transparent border border-white/5 text-slate-400 hover:border-white/15 hover:text-slate-200 focus:border-white/30',
    danger:
      'bg-red-500/10 border border-red-500/30 text-red-400 hover:border-red-400/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
