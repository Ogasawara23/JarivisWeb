'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X, ExternalLink, Copy, Check } from 'lucide-react';

export function ApiKeyBanner() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasError = sessionStorage.getItem('jarvis-api-error');
    if (hasError) setVisible(true);

    const handler = () => setVisible(true);
    window.addEventListener('jarvis-api-error', handler);
    return () => window.removeEventListener('jarvis-api-error', handler);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText('OPENAI_API_KEY=sk-...');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative mx-6 mt-4 rounded-lg border border-red-500/25 bg-red-950/15 backdrop-blur-md p-4"
        >
          <button
            onClick={() => setVisible(false)}
            className="absolute top-3 right-3 text-red-500/70 hover:text-red-400"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            <AlertOctagon size={18} className="text-[#ff2b2b] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 font-mono text-xs">
              <p className="text-sm font-bold text-[#ff2b2b] mb-1">
                ERR_AUTHENTICATION: OPENAI_API_KEY
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Chave da API OpenAI inválida, expirada ou não configurada no <code className="bg-red-500/10 px-1 rounded text-red-400">.env.local</code>.
              </p>

              <div className="flex items-center gap-2 bg-[#050505] rounded border border-red-500/10 px-3 py-2 text-[#ff2b2b]">
                <span className="flex-1 text-[11px]">OPENAI_API_KEY=sk-SUA_CHAVE_AQUI</span>
                <button onClick={handleCopy} className="shrink-0 text-slate-500 hover:text-[#ff2b2b] transition-colors">
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mt-3 items-center text-[10px]">
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#ff2b2b] hover:underline"
                >
                  <ExternalLink size={10} />
                  platform.openai.com
                </a>
                <span className="text-red-950">·</span>
                <span className="text-slate-500">
                  Após salvar, reinicie o servidor: <code className="text-red-400">npm run dev</code>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
