import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JarvisState, Message, VoiceSettings, JarvisStatus } from '@/types';

const defaultVoiceSettings: VoiceSettings = {
  speed: 1.0,
  volume: 0.9,
  pitch: 1.0,
  voiceIndex: 0,
};

export const useJarvisStore = create<JarvisState>()(
  persist(
    (set) => ({
      // ─── State ────────────────────────────────────────────────────
      messages: [],
      isLoading: false,
      currentStreamContent: '',

      isListening: false,
      isSpeaking: false,
      isMuted: false,
      voiceSettings: defaultVoiceSettings,

      sidebarOpen: false,
      currentStatus: 'idle' as JarvisStatus,

      // ─── Actions ──────────────────────────────────────────────────
      addMessage: (message: Message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      updateLastMessage: (content: string, done = false) =>
        set((state) => {
          const msgs = [...state.messages];
          if (msgs.length === 0) return state;
          const last = { ...msgs[msgs.length - 1], content, isStreaming: !done };
          msgs[msgs.length - 1] = last;
          return { messages: msgs };
        }),

      appendToLastMessage: (chunk: string) =>
        set((state) => {
          const msgs = [...state.messages];
          if (msgs.length === 0) return state;
          const last = msgs[msgs.length - 1];
          msgs[msgs.length - 1] = {
            ...last,
            content: last.content + chunk,
            isStreaming: true,
          };
          return { messages: msgs };
        }),

      clearMessages: () => set({ messages: [] }),
      setLoading: (isLoading) => set({ isLoading }),
      setListening: (isListening) => set({ isListening }),
      setSpeaking: (isSpeaking) => set({ isSpeaking }),
      setMuted: (isMuted) => set({ isMuted }),

      setVoiceSettings: (s: Partial<VoiceSettings>) =>
        set((state) => ({
          voiceSettings: { ...state.voiceSettings, ...s },
        })),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setStatus: (currentStatus) => set({ currentStatus }),
    }),
    {
      name: 'jarvis-storage',
      // Only persist messages and voice settings
      partialize: (state) => ({
        messages: state.messages,
        voiceSettings: state.voiceSettings,
      }),
    }
  )
);
