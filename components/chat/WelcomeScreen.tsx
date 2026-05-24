'use client';

import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center select-none pointer-events-none p-6">
      {/* Invisible spacer to push content below the central neural network */}
      <div className="h-44 sm:h-52" />

      {/* Futuristic status label */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex flex-col items-center gap-1.5"
      >
        <span className="text-xs font-mono tracking-[0.4em] uppercase text-red-500/70 neon-text">
          SYSTEM_ONLINE
        </span>
        <span className="text-[10px] font-mono tracking-widest text-slate-700">
          AGUARDANDO INPUT DE COMANDO POR VOZ OU TEXTO
        </span>
      </motion.div>

      {/* Extremely clean suggestion prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-8 flex flex-wrap gap-4 items-center justify-center max-w-lg pointer-events-auto"
      >
        {[
          { text: 'Abrir Spotify', action: 'Abrir Spotify' },
          { text: 'Toque Linkin Park', action: 'Toque Linkin Park' },
          { text: 'Abrir VSCode', action: 'Abrir VSCode' },
        ].map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.action)}
            className="px-3 py-1.5 rounded border border-red-500/5 hover:border-red-500/25 bg-red-950/[0.02] hover:bg-red-950/[0.08] text-[10px] font-mono text-slate-500 hover:text-[#ff2b2b] transition-all duration-200"
          >
            {s.text}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
