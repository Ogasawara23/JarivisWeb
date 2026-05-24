'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Mic, X, ChevronDown } from 'lucide-react';
import { useJarvisStore } from '@/store/jarvisStore';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

export function VoiceSettings() {
  const [open, setOpen] = useState(false);
  const { voiceSettings, setVoiceSettings, isMuted, setMuted } = useJarvisStore();
  const { voices, speak, stop, isSpeaking } = useSpeechSynthesis();

  const handleTest = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak('Sintetizador de voz ativo no sistema Jarvis.');
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        id="voice-settings-toggle"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10 transition-all duration-200 text-xs font-mono"
        aria-label="Configurações de voz"
      >
        <Settings size={12} />
        <span className="hidden sm:inline">SETTINGS</span>
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-72 bg-[#0f0f0f] border border-red-500/10 rounded-lg p-4 z-30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4 border-b border-red-500/5 pb-2">
              <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Mic size={12} className="text-[#ff2b2b]" />
                VOICE_PARAMETERS
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-600 hover:text-slate-300 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Mute toggle */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  {isMuted ? <VolumeX size={12} className="text-red-500" /> : <Volume2 size={12} className="text-[#ff2b2b]" />}
                  {isMuted ? 'MUTE: ON' : 'MUTE: OFF'}
                </label>
                <button
                  onClick={() => setMuted(!isMuted)}
                  id="voice-mute-toggle"
                  className={`w-9 h-4.5 rounded-full transition-all duration-200 relative ${isMuted ? 'bg-red-950/40' : 'bg-red-500/20'}`}
                >
                  <div
                    className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200 ${isMuted ? 'left-0.5 bg-red-800' : 'left-5 bg-[#ff2b2b]'}`}
                  />
                </button>
              </div>

              {/* Voice selector */}
              {voices.length > 0 && (
                <div>
                  <label className="text-[10px] text-slate-500 mb-1.5 block">SELECT_SPEAKER</label>
                  <select
                    id="voice-selector"
                    value={voiceSettings.voiceIndex}
                    onChange={(e) => setVoiceSettings({ voiceIndex: Number(e.target.value) })}
                    className="w-full bg-[#151515] border border-red-500/10 text-slate-300 text-[11px] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#ff2b2b]/30"
                  >
                    {voices.map((v, i) => (
                      <option key={i} value={i}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speed */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] text-slate-500">SPEED</label>
                  <span className="text-[11px] text-[#ff2b2b] font-mono">{voiceSettings.speed.toFixed(1)}x</span>
                </div>
                <input
                  id="voice-speed"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.speed}
                  onChange={(e) => setVoiceSettings({ speed: parseFloat(e.target.value) })}
                  className="w-full accent-[#ff2b2b]"
                />
              </div>

              {/* Volume */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] text-slate-500">VOLUME</label>
                  <span className="text-[11px] text-[#ff2b2b] font-mono">{Math.round(voiceSettings.volume * 100)}%</span>
                </div>
                <input
                  id="voice-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full accent-[#ff2b2b]"
                />
              </div>

              {/* Pitch */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[10px] text-slate-500">PITCH</label>
                  <span className="text-[11px] text-[#ff2b2b] font-mono">{voiceSettings.pitch.toFixed(1)}</span>
                </div>
                <input
                  id="voice-pitch"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full accent-[#ff2b2b]"
                />
              </div>

              {/* Test button */}
              <button
                onClick={handleTest}
                id="voice-test"
                className={`w-full py-2 rounded text-[11px] font-mono font-medium transition-all duration-200 border ${
                  isSpeaking
                    ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10'
                    : 'border-[#ff2b2b]/30 text-[#ff2b2b] bg-[#7a0000]/5 hover:bg-[#7a0000]/15'
                }`}
              >
                {isSpeaking ? 'STOP_SIGNAL' : 'TEST_SPEECH_STREAM'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
