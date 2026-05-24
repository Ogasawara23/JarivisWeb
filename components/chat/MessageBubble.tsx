'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { remarkPlugins, rehypePlugins } from '@/lib/markdown';
import { Copy, Check, Volume2 } from 'lucide-react';
import type { MessageBubbleProps } from '@/types';
import { formatTimestamp, cn } from '@/lib/utils';
import { SourceCards } from './SourceCards';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const { speak } = useSpeechSynthesis();
  const isUser = message.role === 'user';

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const handleSpeak = useCallback(() => {
    speak(message.content);
  }, [message.content, speak]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-1 px-6 py-2.5 group hover:bg-[#ff2b2b]/[0.02] border-l border-transparent hover:border-l hover:border-[#ff2b2b]/30 transition-all duration-200"
    >
      {/* Header Info */}
      <div className="flex items-center gap-2 text-[10px] font-mono select-none">
        <span className={cn('font-bold tracking-wider', isUser ? 'text-slate-500' : 'text-[#ff2b2b]')}>
          {isUser ? '>> CLIENT_REQ' : '<< JARVIS_RESP'}
        </span>
        <span className="text-slate-800">|</span>
        <span className="text-slate-700">{formatTimestamp(new Date(message.timestamp))}</span>

        {message.usedSearch && (
          <>
            <span className="text-slate-800">|</span>
            <span className="text-red-950 font-semibold">WEB_QUERY: ACTIVE</span>
          </>
        )}

        {/* Hover Actions */}
        <div className="ml-auto flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            id={`copy-msg-${message.id}`}
            className="text-slate-600 hover:text-[#ff2b2b] transition-colors"
            title="Copiar logs"
          >
            {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
          </button>
          {!isUser && (
            <button
              onClick={handleSpeak}
              id={`speak-msg-${message.id}`}
              className="text-slate-600 hover:text-[#ff2b2b] transition-colors"
              title="Sintetizar voz"
            >
              <Volume2 size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn('text-sm pl-4 relative', message.isStreaming && !isUser && 'cursor')}>
        {isUser ? (
          <p className="text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-jarvis text-slate-300 leading-relaxed font-mono">
            <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Search Source Cards */}
      {!isUser && message.sources && message.sources.length > 0 && !message.isStreaming && (
        <div className="pl-4 mt-2">
          <SourceCards sources={message.sources} />
        </div>
      )}
    </motion.div>
  );
}
