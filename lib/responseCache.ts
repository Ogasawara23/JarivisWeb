/**
 * lib/responseCache.ts
 *
 * Lightweight in-memory + sessionStorage cache for AI responses.
 * Avoids duplicate API calls for the same message within a session.
 */

interface CacheEntry {
  response: string;
  ts: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 30;
const CACHE_KEY_PREFIX = 'jarvis_cache_';

// In-memory map for fast lookup
const memCache = new Map<string, CacheEntry>();

/** Normalise a prompt to a cache key */
function makeKey(messages: { role: string; content: string }[]): string {
  // Use last 3 messages only to form the key (enough for context)
  const relevant = messages.slice(-3);
  return JSON.stringify(relevant);
}

function storageKey(key: string): string {
  // hash the key to keep storage keys short
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return CACHE_KEY_PREFIX + Math.abs(h).toString(36);
}

export function getCached(
  messages: { role: string; content: string }[]
): string | null {
  const key = makeKey(messages);
  const skey = storageKey(key);

  // 1. Memory cache
  const mem = memCache.get(key);
  if (mem && Date.now() - mem.ts < TTL_MS) return mem.response;

  // 2. sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(skey);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.ts < TTL_MS) {
          memCache.set(key, entry); // warm memory cache
          return entry.response;
        }
        sessionStorage.removeItem(skey);
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export function setCached(
  messages: { role: string; content: string }[],
  response: string
): void {
  const key = makeKey(messages);
  const skey = storageKey(key);
  const entry: CacheEntry = { response, ts: Date.now() };

  // Evict oldest entry when at capacity
  if (memCache.size >= MAX_ENTRIES) {
    const oldest = [...memCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) memCache.delete(oldest[0]);
  }

  memCache.set(key, entry);

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(skey, JSON.stringify(entry));
    } catch {
      // sessionStorage may be full — ignore
    }
  }
}

export function clearCache(): void {
  memCache.clear();
  if (typeof window !== 'undefined') {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(CACHE_KEY_PREFIX)) sessionStorage.removeItem(key);
    }
  }
}
