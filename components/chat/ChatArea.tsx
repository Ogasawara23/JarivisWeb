'use client';

import { AnimatePresence } from 'framer-motion';
import { useJarvisStore } from '@/store/jarvisStore';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatAreaProps {
  onSuggestion: (text: string) => void;
}

export function ChatArea({ onSuggestion }: ChatAreaProps) {
  const { messages, isLoading } = useJarvisStore();
  const { bottomRef } = useAutoScroll(messages);

  const showWelcome = messages.length === 0 && !isLoading;

  const lastMsg = messages[messages.length - 1];
  const showTyping = isLoading && (!lastMsg || lastMsg.role === 'user');

  return (
    <div className="flex-1 overflow-y-auto z-10 relative scrollbar-thin px-4 sm:px-6" id="chat-area">
      <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full">
        {showWelcome ? (
          <WelcomeScreen onSuggestion={onSuggestion} />
        ) : (
          <div className="py-6 space-y-4 flex-1">
            {/* Added spacer to let NeuralNetwork breath on scroll */}
            <div className="h-28 sm:h-36 pointer-events-none" />
            
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {showTyping && <TypingIndicator />}
            </AnimatePresence>
          </div>
        )}
        <div ref={bottomRef} className="h-6 shrink-0" />
      </div>
    </div>
  );
}
