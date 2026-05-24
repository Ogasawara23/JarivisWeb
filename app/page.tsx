'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { ApiKeyBanner } from '@/components/ui/ApiKeyBanner';
import { NeuralNetwork } from '@/components/ui/NeuralNetwork';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/input/ChatInput';
import { VoiceSettings } from '@/components/voice/VoiceSettings';
import { InlineAudioVisualizer } from '@/components/voice/AudioVisualizer';
import { useChat } from '@/hooks/useChat';

export default function JarvisApp() {
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, cancelStream, stopSpeech } = useChat();

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');
    await sendMessage(text);
  }, [inputValue, sendMessage]);

  const handleSuggestion = useCallback(
    async (text: string) => {
      setInputValue('');
      await sendMessage(text);
    },
    [sendMessage]
  );

  const handleCancel = useCallback(() => {
    cancelStream();
  }, [cancelStream]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === 'k') ||
        (e.key === '/' && document.activeElement?.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        document.getElementById('chat-input')?.focus();
      }
      if (e.key === 'Escape') {
        cancelStream();
        stopSpeech();
      }
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        document.getElementById('voice-mute-toggle')?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cancelStream, stopSpeech]);

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#050505] text-[#f5e6e6]">
      {/* Animated background & neural network mesh */}
      <AnimatedBackground />
      <NeuralNetwork />

      {/* App layout */}
      <div className="relative z-10 flex flex-col h-full bg-transparent">
        {/* Header */}
        <Header />

        {/* API Key error banner */}
        <ApiKeyBanner />

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Floating Sidebar */}
          <AnimatePresence initial={false}>
            <Sidebar />
          </AnimatePresence>

          {/* Chat column */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 z-10">
            {/* Chat messages */}
            <ChatArea onSuggestion={handleSuggestion} />

            {/* Bottom panel */}
            <div className="shrink-0">
              {/* Visualizer + settings */}
              <div className="flex items-center justify-between px-6 py-2 border-t border-red-500/10 bg-[#050505]/40 backdrop-blur-md">
                <InlineAudioVisualizer />
                <div className="ml-auto">
                  <VoiceSettings />
                </div>
              </div>

              {/* Chat input */}
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
