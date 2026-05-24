'use client';

import { motion } from 'framer-motion';
import { useJarvisStore } from '@/store/jarvisStore';

interface AudioVisualizerProps {
  isActive: boolean;
  barCount?: number;
}

export function AudioVisualizer({ isActive, barCount = 12 }: AudioVisualizerProps) {
  const bars = Array.from({ length: barCount });

  return (
    <div className="flex items-center gap-[3px] h-8" aria-hidden="true">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: isActive
              ? `linear-gradient(180deg, #ff2b2b, #7a0000)`
              : 'rgba(255, 43, 43, 0.1)',
          }}
          animate={
            isActive
              ? {
                  height: [
                    4,
                    Math.random() * 22 + 8,
                    Math.random() * 14 + 4,
                    Math.random() * 22 + 8,
                    4,
                  ],
                }
              : { height: 4 }
          }
          transition={
            isActive
              ? {
                  duration: 0.4 + Math.random() * 0.3,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: 'easeInOut',
                }
              : { duration: 0.25 }
          }
        />
      ))}
    </div>
  );
}

export function InlineAudioVisualizer() {
  const { isListening, isSpeaking } = useJarvisStore();
  const isActive = isListening || isSpeaking;

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-2.5"
    >
      <AudioVisualizer isActive={isActive} barCount={6} />
      <span className="text-[9px] font-mono tracking-wider text-[#ff2b2b] uppercase">
        {isListening ? 'VOICE_REC' : 'SPEECH_SYNTH'}
      </span>
    </motion.div>
  );
}
