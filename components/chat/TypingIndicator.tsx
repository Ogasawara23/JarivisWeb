'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex flex-col gap-1 px-6 py-2.5"
    >
      <div className="flex items-center gap-2 text-[10px] font-mono select-none">
        <span className="font-bold tracking-wider text-[#ff2b2b]">
          {"<< JARVIS_RESP"}
        </span>
        <span className="text-slate-800">|</span>
        <span className="text-slate-700">ONLINE</span>
      </div>

      <div className="flex items-center gap-3 pl-4">
        {/* Simple red terminal pulse dots */}
        <div className="flex items-center gap-1.5">
          <div className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#ff2b2b]" />
          <div className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#ff2b2b]" />
          <div className="thinking-dot w-1.5 h-1.5 rounded-full bg-[#ff2b2b]" />
        </div>
        <span className="text-xs text-slate-500 font-mono italic">Processando requisição...</span>
      </div>
    </motion.div>
  );
}
