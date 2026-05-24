'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJarvisStore } from '@/store/jarvisStore';
import type { JarvisStatus } from '@/types';

const statusConfig: Record<JarvisStatus, { label: string; color: string; pulse: boolean }> = {
  idle:      { label: 'Standby',      color: '#8a6666', pulse: false },
  listening: { label: 'Ouvindo...',   color: '#ff2b2b', pulse: true  },
  thinking:  { label: 'Processando',  color: '#ef4444', pulse: true  },
  speaking:  { label: 'Transmitindo', color: '#ff5555', pulse: true  },
  searching: { label: 'Pesquisando',  color: '#b22222', pulse: true  },
  error:     { label: 'Alerta',       color: '#ff0000', pulse: false },
};

export function StatusIndicator() {
  const { currentStatus } = useJarvisStore();
  const config = statusConfig[currentStatus];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStatus}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="flex items-center gap-2"
      >
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          {config.pulse && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: config.color }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.color }}
          />
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase" style={{ color: config.color }}>
          {config.label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
