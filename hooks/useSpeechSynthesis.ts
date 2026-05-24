'use client';

import { useState, useEffect, useCallback } from 'react';
import { useJarvisStore } from '@/store/jarvisStore';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const { voiceSettings, isMuted, setSpeaking, setStatus } = useJarvisStore();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setIsSupported(true);

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeaking(false);
    setStatus('idle');
  }, [setSpeaking, setStatus]);

  // Full-text speak (used for manual "read aloud" button on messages)
  const speak = useCallback(
    (text: string) => {
      if (!isSupported || isMuted) return;
      window.speechSynthesis.cancel();

      // Import stripMarkdown inline to avoid circular deps
      const clean = text
        .replace(/```[\s\S]*?```/g, 'bloco de código')
        .replace(/`[^`]+`/g, '')
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^[-*+]\s/gm, '')
        .replace(/^\d+\.\s/gm, '')
        .replace(/>\s/g, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .trim();

      if (!clean) return;

      // Split into sentences to avoid browser TTS cutoff
      const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
      let idx = 0;

      const speakNext = () => {
        if (idx >= sentences.length) {
          setIsSpeaking(false);
          setSpeaking(false);
          setStatus('idle');
          return;
        }
        const utterance = new SpeechSynthesisUtterance(sentences[idx]);
        utterance.rate = voiceSettings.speed;
        utterance.volume = voiceSettings.volume;
        utterance.pitch = voiceSettings.pitch;

        const allVoices = window.speechSynthesis.getVoices();
        if (allVoices[voiceSettings.voiceIndex]) {
          utterance.voice = allVoices[voiceSettings.voiceIndex];
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpeaking(true);
          setStatus('speaking');
        };
        utterance.onend = () => { idx++; speakNext(); };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeaking(false);
          setStatus('idle');
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNext();
    },
    [isSupported, isMuted, voiceSettings, setSpeaking, setStatus]
  );

  return { speak, stop, isSpeaking, voices, isSupported };
}
