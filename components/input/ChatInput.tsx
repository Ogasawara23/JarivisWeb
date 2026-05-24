'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Globe } from 'lucide-react';
import { useJarvisStore } from '@/store/jarvisStore';
import { needsSearch } from '@/lib/utils';
import { VoiceButton } from './VoiceButton';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export function ChatInput({ value, onChange, onSend, onCancel }: ChatInputProps) {
  const { isLoading } = useJarvisStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const willSearch = value.trim().length > 3 && needsSearch(value);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }
  };

  const handleTranscript = (text: string) => {
    onChange(text);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  return (
    <div
      className="bg-[#050505] border-t border-red-500/10 p-4 relative z-10"
      id="chat-input-area"
    >
      {/* Search indicator */}
      <AnimatePresence>
        {willSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-2 px-1"
          >
            <Globe size={11} className="text-[#ff2b2b]" />
            <span className="text-[10px] font-mono text-[#ff2b2b]/80">
              WEB_SEARCH_QUERY: QUEUED_EXECUTION
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        {/* Voice button */}
        <VoiceButton onTranscript={handleTranscript} />

        {/* Textarea container */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="chat-input"
            className="input-jarvis w-full rounded-xl px-4 py-3 text-sm min-h-[48px] max-h-[140px] leading-relaxed font-mono"
            placeholder="Digite comando ou pergunte algo ao Jarvis..."
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Prompt do Jarvis"
          />

          {value.length > 200 && (
            <span className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-700">
              LEN: {value.length}
            </span>
          )}
        </div>

        {/* Send / Cancel Button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={isLoading ? onCancel : onSend}
          id={isLoading ? 'cancel-send' : 'send-message'}
          disabled={!isLoading && !value.trim()}
          className={`
            shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            ${isLoading
              ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/35'
              : 'bg-[#7a0000]/10 border border-[#ff2b2b]/30 text-[#ff2b2b] hover:border-[#ff2b2b]/60 hover:shadow-[0_0_12px_rgba(255,43,43,0.25)]'
            }
          `}
          aria-label={isLoading ? 'Cancelar' : 'Enviar'}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="stop"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Square size={13} fill="currentColor" />
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Send size={13} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="flex items-center justify-between max-w-4xl mx-auto mt-2 px-1 text-[9px] font-mono text-slate-700 select-none">
        <span>CTRL+K FOCA • ESC CANCELA • ENTER ENVIA</span>
        <span>SECURE_CONNECTION: PORT_443</span>
      </div>
    </div>
  );
}
