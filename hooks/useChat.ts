'use client';

import { useCallback, useRef } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';
import { streamChat } from '@/services/openaiService';
import { searchWeb, formatSearchContext } from '@/services/searchService';
import { needsSearch, generateId } from '@/lib/utils';
import {
  detectUserCommand,
  extractAiCommand,
  stripAiCommand,
  executeCommand,
} from '@/lib/commandParser';
import type { Message, SearchSource } from '@/types';

// ─── Sentence extractor for streaming TTS ─────────────────────────────────────
function extractCompleteSentences(buffer: string): { sentences: string[]; remainder: string } {
  const sentenceEnd = /([.!?](?:\s|$))/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceEnd.exec(buffer)) !== null) {
    const end = match.index + match[0].length;
    const sentence = buffer.slice(lastIndex, end).trim();
    if (sentence.length > 8) sentences.push(sentence);
    lastIndex = end;
  }

  return { sentences, remainder: buffer.slice(lastIndex) };
}

// ─── Elegant error messages (never show raw errors to user) ───────────────────
function humaniseError(raw: string): string {
  const r = raw.toLowerCase();

  if (r.includes('429') || r.includes('rate limit') || r.includes('congestionad') || r.includes('sobrecarregad')) {
    return 'Os sistemas centrais estão temporariamente congestionados. Tentando novamente em instantes.';
  }
  if (r.includes('401') || r.includes('credencial') || r.includes('inválida') || r.includes('api key')) {
    return 'Credenciais de acesso inválidas. Verifique a configuração do sistema.';
  }
  if (r.includes('402') || r.includes('crédito') || r.includes('billing')) {
    return 'Capacidade computacional esgotada. Acesse platform.openai.com/billing.';
  }
  if (r.includes('timeout') || r.includes('timed out') || r.includes('network')) {
    return 'Timeout de conexão. Verifique sua rede e tente novamente.';
  }
  if (r.includes('500') || r.includes('502') || r.includes('503') || r.includes('indisponível')) {
    return 'Servidores temporariamente indisponíveis. Reconectando automaticamente.';
  }

  // Generic fallback
  return 'Falha na comunicação com os sistemas centrais. Tente novamente.';
}

export function useChat() {
  const {
    messages,
    addMessage,
    appendToLastMessage,
    updateLastMessage,
    setLoading,
    setStatus,
  } = useJarvisStore();

  const abortRef = useRef<AbortController | null>(null);
  const speechBufferRef = useRef<string>('');
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef<boolean>(false);

  // ── Streaming TTS: speak sentence by sentence ────────────────────────────────
  const speakQueue = useCallback(() => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return;

    const { isMuted, voiceSettings } = useJarvisStore.getState();
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

    isSpeakingRef.current = true;
    useJarvisStore.getState().setSpeaking(true);
    useJarvisStore.getState().setStatus('speaking');

    const speakNext = () => {
      const sentence = speechQueueRef.current.shift();
      if (!sentence) {
        isSpeakingRef.current = false;
        useJarvisStore.getState().setSpeaking(false);
        if (useJarvisStore.getState().currentStatus === 'speaking') {
          useJarvisStore.getState().setStatus('idle');
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = voiceSettings.speed;
      utterance.volume = voiceSettings.volume;
      utterance.pitch = voiceSettings.pitch;

      const voices = window.speechSynthesis.getVoices();
      if (voices[voiceSettings.voiceIndex]) {
        utterance.voice = voices[voiceSettings.voiceIndex];
      }

      utterance.onend = speakNext;
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        useJarvisStore.getState().setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, []);

  const enqueueSentence = useCallback(
    (text: string) => {
      speechQueueRef.current.push(text);
      speakQueue();
    },
    [speakQueue]
  );

  const stopSpeech = useCallback(() => {
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    useJarvisStore.getState().setSpeaking(false);
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      stopSpeech();
      speechBufferRef.current = '';

      // ── Offline command detection (zero API cost) ────────────────────────────
      const userCommand = detectUserCommand(userText);
      if (userCommand) {
        const userMsg: Message = {
          id: generateId(),
          role: 'user',
          content: userText.trim(),
          timestamp: new Date(),
        };
        addMessage(userMsg);

        // Fire-and-forget — don't block UI
        executeCommand(userCommand.action, userCommand.target);

        // Elegant confirmation
        const speechText = userCommand.speech ?? `Abrindo ${userCommand.displayName}.`;
        const ackMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: `**${userCommand.displayName}** — iniciando acesso.`,
          timestamp: new Date(),
          isStreaming: false,
        };
        addMessage(ackMsg);
        enqueueSentence(speechText);
        return;
      }

      // ── AI conversation ──────────────────────────────────────────────────────
      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: userText.trim(),
        timestamp: new Date(),
      };
      addMessage(userMsg);
      setLoading(true);

      // Optional web search context
      const shouldSearch = needsSearch(userText);
      let searchSources: SearchSource[] = [];
      let searchContext = '';

      if (shouldSearch) {
        setStatus('searching');
        try {
          const searchResponse = await searchWeb(userText);
          if (searchResponse.results.length > 0) {
            searchSources = searchResponse.results.map((r) => ({
              title: r.title,
              url: r.url,
              description: r.description,
            }));
            searchContext = formatSearchContext(searchResponse);
          }
        } catch {
          // Search is optional — continue without it
        }
      }

      setStatus('thinking');

      // Build message history (cap at 15 for token efficiency)
      const historyMessages = messages
        .slice(-15)
        .map((m) => ({ role: m.role, content: m.content }));

      const lastUserContent = searchContext
        ? `${userText}\n\n${searchContext}`
        : userText;

      const apiMessages = [
        ...historyMessages,
        { role: 'user' as const, content: lastUserContent },
      ];

      // Placeholder streaming message
      const assistantMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        sources: searchSources.length > 0 ? searchSources : undefined,
        usedSearch: shouldSearch && searchSources.length > 0,
      };
      addMessage(assistantMsg);

      let firstChunk = true;

      await streamChat(
        apiMessages,
        (chunk) => {
          if (firstChunk) {
            setStatus('speaking');
            firstChunk = false;
          }

          speechBufferRef.current += chunk;
          const { sentences, remainder } = extractCompleteSentences(speechBufferRef.current);
          speechBufferRef.current = remainder;
          sentences.forEach((s) => enqueueSentence(s));

          appendToLastMessage(chunk);
        },
        () => {
          // Flush remaining speech buffer
          if (speechBufferRef.current.trim().length > 0) {
            enqueueSentence(speechBufferRef.current.trim());
            speechBufferRef.current = '';
          }

          const finalContent =
            useJarvisStore.getState().messages[
              useJarvisStore.getState().messages.length - 1
            ].content;

          // Handle AI CMD protocol
          const aiCommand = extractAiCommand(finalContent);
          if (aiCommand) {
            executeCommand(aiCommand.action, aiCommand.target);
            updateLastMessage(stripAiCommand(finalContent), true);
          } else {
            updateLastMessage(finalContent, true);
          }

          setLoading(false);
          if (useJarvisStore.getState().currentStatus === 'thinking') {
            setStatus('idle');
          }
        },
        (err) => {
          stopSpeech();
          const friendly = humaniseError(err);
          updateLastMessage(`_${friendly}_`, true);
          setLoading(false);
          setStatus('error');

          // Auto-recover to idle after 4s
          setTimeout(() => {
            if (useJarvisStore.getState().currentStatus === 'error') {
              useJarvisStore.getState().setStatus('idle');
            }
          }, 4000);
        },
        abortRef.current.signal
      );
    },
    [
      messages,
      addMessage,
      appendToLastMessage,
      updateLastMessage,
      setLoading,
      setStatus,
      enqueueSentence,
      stopSpeech,
    ]
  );

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    stopSpeech();
    setLoading(false);
    setStatus('idle');
  }, [setLoading, setStatus, stopSpeech]);

  return { sendMessage, cancelStream, stopSpeech };
}
