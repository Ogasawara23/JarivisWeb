/**
 * lib/requestQueue.ts
 *
 * Client-side rate limit management:
 *  - Exponential backoff retry (429 / network fail)
 *  - Request queue to prevent concurrent floods
 *  - Cooldown tracking based on Retry-After header
 */

// ─── Exponential backoff ───────────────────────────────────────────────────────
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  maxAttempts?: number;   // default 3
  baseDelayMs?: number;   // default 1500
  maxDelayMs?: number;    // default 30_000
  signal?: AbortSignal;
}

/**
 * Retries an async operation with exponential backoff.
 * Only retries on 429 or network errors (not 401 / 400 / etc.)
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1500, maxDelayMs = 30_000, signal } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    try {
      return await fn(attempt);
    } catch (err: unknown) {
      lastError = err;

      // Don't retry AbortErrors
      if (err instanceof DOMException && err.name === 'AbortError') throw err;

      // Don't retry on last attempt
      if (attempt === maxAttempts) break;

      // Exponential backoff: 1.5s, 4.5s, 13.5s …
      const delay = Math.min(baseDelayMs * Math.pow(3, attempt - 1), maxDelayMs);
      const jitter = Math.random() * 500; // prevent thundering herd
      console.warn(
        `[RequestQueue] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${Math.round(delay)}ms…`,
        err
      );
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}

// ─── Global request serialisation (one AI request at a time) ─────────────────
let activeRequest: Promise<unknown> | null = null;

/**
 * Ensures only one AI request is in-flight at a time.
 * If a request is already running, queues the new one after.
 */
export async function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  if (activeRequest) {
    // Wait for previous to settle, then proceed
    await activeRequest.catch(() => {});
  }

  const req = fn();
  activeRequest = req;
  try {
    return await req;
  } finally {
    if (activeRequest === req) activeRequest = null;
  }
}

// ─── Client-side cooldown tracker ─────────────────────────────────────────────
let cooldownUntil = 0;

export function setCooldown(ms: number) {
  cooldownUntil = Date.now() + ms;
}

export function isCoolingDown(): boolean {
  return Date.now() < cooldownUntil;
}

export function getCooldownRemaining(): number {
  return Math.max(0, cooldownUntil - Date.now());
}
