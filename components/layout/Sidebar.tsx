'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, Clock, X } from 'lucide-react';
import { useJarvisStore } from '@/store/jarvisStore';
import { formatTimestamp } from '@/lib/utils';

export function Sidebar() {
  const { messages, clearMessages, sidebarOpen, setSidebarOpen } = useJarvisStore();

  const userMessages = messages.filter((m) => m.role === 'user').slice(-8).reverse();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          {/* Backdrop for closing sidebar */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 pointer-events-auto"
            onClick={() => setSidebarOpen(false)}
          />

          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 glass-strong border-r border-[#ff2b2b]/10 flex flex-col z-40 overflow-hidden shadow-[5px_0_30px_rgba(0,0,0,0.8)]"
            style={{ width: 260 }}
          >
            {/* Header / New Chat */}
            <div className="p-4 border-b border-red-500/10 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  clearMessages();
                  setSidebarOpen(false);
                }}
                id="sidebar-new-chat"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded border border-[#ff2b2b]/25 text-[#ff2b2b] text-xs font-mono hover:bg-[#7a0000]/15 hover:border-[#ff2b2b]/50 transition-all duration-200"
              >
                <Plus size={13} />
                RESET_SESSION
              </button>

              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 border border-transparent rounded text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {userMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={20} className="mx-auto text-slate-800 mb-3" />
                  <p className="text-slate-700 text-xs font-mono">HISTORY_EMPTY</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-1 py-1 mb-3">
                    <Clock size={10} className="text-slate-600" />
                    <span className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">
                      CONVERSATION_LOGS
                    </span>
                  </div>
                  {userMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSidebarOpen(false)}
                      className="sidebar-item flex flex-col gap-1 p-2.5 border border-transparent group mb-1.5"
                    >
                      <p className="text-slate-400 text-xs truncate group-hover:text-slate-200 transition-colors">
                        {msg.content.slice(0, 40)}
                        {msg.content.length > 40 ? '…' : ''}
                      </p>
                      <p className="text-slate-700 text-[9px] font-mono">
                        {formatTimestamp(new Date(msg.timestamp))}
                      </p>
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-red-500/10">
              {messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  id="sidebar-clear"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-red-500/60 hover:text-red-400 hover:bg-red-500/5 text-xs font-mono transition-all duration-200 mb-2"
                >
                  <Trash2 size={12} />
                  CLEAR_ALL
                </button>
              )}
              <p className="text-[9px] font-mono text-slate-700 text-center">
                SECURE_LAYER: ENCRYPTED
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
