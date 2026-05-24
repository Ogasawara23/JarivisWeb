'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { VoiceButtonProps } from '@/types';

export function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
    }
  }, [transcript, isListening, onTranscript]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 text-slate-800 cursor-not-allowed"
        title="Reconhecimento de voz não suportado neste navegador"
      >
        <MicOff size={16} />
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleToggle}
        id="voice-button"
        className={`
          relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
          ${isListening
            ? 'bg-[#7a0000]/25 border-2 border-[#ff2b2b]/80 text-[#ff2b2b] shadow-[0_0_20px_rgba(255,43,43,0.35)]'
            : 'bg-transparent border border-white/10 text-slate-500 hover:border-[#ff2b2b]/40 hover:text-[#ff2b2b] hover:bg-[#7a0000]/10'
          }
        `}
        aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
        aria-pressed={isListening}
      >
        {/* Pulse rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-xl border border-[#ff2b2b]/60"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.6 + i * 0.3, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="on"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic size={16} className="text-[#ff2b2b]" />
            </motion.div>
          ) : (
            <motion.div
              key="off"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Interim transcript tooltip */}
      <AnimatePresence>
        {isListening && (interimTranscript || transcript) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-56 border border-[#ff2b2b]/15 bg-[#0f0f0f] rounded-lg p-2.5 text-center z-20 pointer-events-none shadow-2xl"
          >
            <p className="text-[10px] font-mono text-slate-500 mb-1 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff2b2b] animate-pulse inline-block" />
              VOICE_STREAMING: RUNNING
            </p>
            <p className="text-xs font-mono text-slate-200 italic truncate">
              "{interimTranscript || transcript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 border border-red-500/25 bg-red-950/20 rounded-lg p-2 text-center z-20"
          >
            <p className="text-[10px] font-mono text-red-400">ERR_VOICE: {error.toUpperCase()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
