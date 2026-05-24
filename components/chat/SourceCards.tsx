'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Globe } from 'lucide-react';
import type { SourceCardsProps } from '@/types';
import { truncate } from '@/lib/utils';

export function SourceCards({ sources }: SourceCardsProps) {
  if (!sources.length) return null;

  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Globe size={10} className="text-slate-600" />
        <span className="text-[9px] text-slate-600 uppercase tracking-widest font-mono">
          SOURCES_CONSULTED
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.slice(0, 4).map((source, i) => (
          <motion.a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="group flex items-start gap-2 max-w-[200px] border border-red-500/5 hover:border-red-500/25 bg-red-950/[0.03] hover:bg-red-950/[0.08] rounded-md px-2 py-1.5 transition-all duration-200"
            title={source.title}
          >
            <div className="shrink-0 mt-0.5 w-3.5 h-3.5 rounded bg-slate-900 flex items-center justify-center overflow-hidden">
              <Globe size={8} className="text-slate-600 group-hover:text-[#ff2b2b] transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 font-mono truncate group-hover:text-slate-200 transition-colors leading-tight">
                {truncate(source.title, 30)}
              </p>
              <p className="text-[9px] text-slate-600 font-mono truncate mt-0.5">
                {new URL(source.url).hostname.replace('www.', '')}
              </p>
            </div>
            <ExternalLink size={8} className="shrink-0 mt-0.5 text-slate-700 group-hover:text-[#ff2b2b] transition-colors" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
