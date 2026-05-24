/**
 * services/openaiService.ts
 *
 * Client-side SSE streaming with:
 *  - Response cache (avoids duplicate calls)
 *  - Exponential backoff on 429
 *  - Cooldown tracking
 *  - Elegant error translation
 */

import type { ChatApiMessage } from '@/types';
import { withRetry, setCooldown, isCoolingDown, getCooldownRemaining } from '@/lib/requestQueue';
import { getCached, setCached } from '@/lib/responseCache';

// ─── Streaming chat ────────────────────────────────────────────────────────────
export async function streamChat(
  messages: ChatApiMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal
): Promise<void> {
  // 1. Client-side cooldown guard
  if (isCoolingDown()) {
    const secs = Math.ceil(getCooldownRemaining() / 1000);
    onError(
      `Sistemas sobrecarregados — aguardando ${secs}s antes da próxima requisição.`
    );
    return;
  }

  // 2. Cache hit — replay as chunks for UX consistency
  const cached = getCached(messages);
  if (cached) {
    console.debug('[openaiService] Cache hit');
    // Simulate streaming from cache in small chunks
    const words = cached.split(' ');
    for (const word of words) {
      if (signal?.aborted) return;
      onChunk(word + ' ');
      await new Promise((r) => setTimeout(r, 12));
    }
    onDone();
    return;
  }

  // 3. Actual API call with retry
  try {
    await withRetry(
      async (attempt) => {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        if (attempt > 1) {
          console.log(`[openaiService] Retry attempt ${attempt}`);
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
          signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          let errorMsg: string;
          try {
            errorMsg = JSON.parse(errText).error || errText;
          } catch {
            errorMsg = errText;
          }

          // Dispatch banner on auth failure
          if (res.status === 401) {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('jarvis-api-error', 'true');
              window.dispatchEvent(new Event('jarvis-api-error'));
            }
            onError(errorMsg);
            return; // don't retry auth errors
          }

          // Set client-side cooldown on 429
          if (res.status === 429) {
            setCooldown(15_000); // 15s client cooldown
          }

          // Throw so withRetry can retry on 429/5xx
          if (res.status === 429 || res.status >= 500) {
            throw new Error(errorMsg);
          }

          onError(errorMsg);
          return;
        }

        if (!res.body) {
          throw new Error('No response body');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          if (signal?.aborted) {
            reader.cancel();
            return;
          }

          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              // Cache the full response
              if (fullContent.length > 20) {
                setCached(messages, fullContent);
              }
              onDone();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (chunk) {
                onChunk(chunk);
                fullContent += chunk;
              }
            } catch {
              // skip malformed SSE line
            }
          }
        }

        onDone();
      },
      {
        maxAttempts: 3,
        baseDelayMs: 2000,
        maxDelayMs: 20_000,
        signal,
      }
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    onError(msg);
  }
}
