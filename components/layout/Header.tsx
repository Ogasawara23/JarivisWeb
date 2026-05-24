'use client';

import { motion } from 'framer-motion';
import { Menu, X, Terminal } from 'lucide-react';
import { useJarvisStore } from '@/store/jarvisStore';
import { StatusIndicator } from './StatusIndicator';

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useJarvisStore();

  return (
    <header className="bg-transparent border-b border-red-500/10 z-20 relative">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Floating Toggle + Logo */}
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg border border-white/5 text-slate-500 hover:text-[#ff2b2b] hover:border-[#ff2b2b]/30 transition-all duration-200"
            aria-label="Toggle sidebar"
            id="header-sidebar-toggle"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </motion.button>

          <div className="flex items-center gap-2.5">
            {/* Minimal Logo icon */}
            <div className="relative w-7 h-7 flex items-center justify-center rounded border border-[#ff2b2b]/20 bg-[#7a0000]/10">
              <Terminal size={14} className="text-[#ff2b2b]" />
            </div>

            <div>
              <h1
                className="text-base font-bold neon-text tracking-[0.25em] uppercase"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                JARVIS
              </h1>
              <p className="text-[9px] text-slate-700 tracking-wider -mt-0.5">
                OPERATIONAL OS SYSTEM v2.0
              </p>
            </div>
          </div>
        </div>

        {/* Right: Status */}
        <div className="flex items-center gap-4">
          <StatusIndicator />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700">
            <span className="font-mono text-[10px]">OS_CORE: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Bottom subtle neon accent line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255, 43, 43, 0.25), transparent)' }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </header>
  );
}
