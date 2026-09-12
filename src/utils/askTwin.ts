import { getApiBaseUrl } from './apiConfig';

export interface AskTwinHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskTwinSourceRef {
  title: string;
}

export interface AssistantAction {
  type: 'open_window' | 'switch_theme' | 'open_link';
  window?: string;
  theme?: string;
  url?: string;
}

export interface AskTwinOptions {
  message: string;
  history: AskTwinHistoryMessage[];
  context?: {
    openWindows?: string[];
    activeWindow?: string;
    visitCount?: number;
  };
  onDelta?: (fullText: string) => void;
  onSources?: (items: AskTwinSourceRef[]) => void;
  onFollowups?: (items: string[]) => void;
  onAction?: (action: AssistantAction) => void;
  signal?: AbortSignal;
}

/**
 * Parses an SSE byte stream, tolerating frames split across read() chunks.
 * Handles typed frames (sources/actions/followups/errors) alongside plain
 * `{ delta }` text frames. Returns the accumulated answer text.
 */
async function consumeSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: {
    onDelta?: (fullText: string) => void;
    onSources?: (items: AskTwinSourceRef[]) => void;
    onFollowups?: (items: string[]) => void;
    onAction?: (action: AssistantAction) => void;
  }
): Promise<string> {
  const { onDelta, onSources, onFollowups, onAction } = handlers;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let streamed = '';
  let sseBuffer = '';
  let pendingData = '';
  let streamError: string | null = null;

  // Batch onDelta calls — Groq emits tokens faster than React should re-render.
  const FLUSH_MS = 60;
  let lastFlush = 0;
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  const flushNow = () => {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    lastFlush = Date.now();
    onDelta?.(streamed);
  };

  const handleData = (payload: string) => {
    if (payload === '[DONE]') return;
    try {
      const json = JSON.parse(payload);

      // Typed control frames (new protocol). Legacy clients ignore these
      // because they only look for `delta`.
      if (json.type === 'action' && json.action && onAction) {
        onAction(json.action);
        return;
      }
      if (json.type === 'sources' && Array.isArray(json.items)) {
        onSources?.(json.items.filter((i: unknown) => i && typeof (i as any).title === 'string'));
        return;
      }
      if (json.type === 'followups' && Array.isArray(json.items)) {
        onFollowups?.(json.items.filter((i: unknown): i is string => typeof i === 'string'));
        return;
      }
      if (typeof json.error === 'string') {
        streamError = json.error;
        return;
      }

      const delta = json.delta;
      if (typeof delta === 'string' && delta) {
        streamed += delta;
        if (Date.now() - lastFlush >= FLUSH_MS) {
          flushNow();
        } else if (!flushTimer) {
          flushTimer = setTimeout(flushNow, FLUSH_MS);
        }
      }
    } catch {
      // ignore malformed / partial frame
    }
  };

  const processChunk = (text: string, flush = false) => {
    sseBuffer += text;
    let idx;
    while ((idx = sseBuffer.indexOf('\n')) !== -1) {
      let line = sseBuffer.slice(0, idx);
      sseBuffer = sseBuffer.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith('data:')) {
        pendingData += line.slice(5).trim();
      } else if (line === '' && pendingData) {
        handleData(pendingData);
        pendingData = '';
      }
    }
    if (flush && pendingData) {
      handleData(pendingData);
      pendingData = '';
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    processChunk(decoder.decode(value, { stream: true }));
  }
  processChunk(decoder.decode(), true);

  // Guarantee the final text is delivered even if a flush was pending.
  if (onDelta && streamed) flushNow();

  // Surface backend errors sent as SSE frames instead of dropping them.
  if (streamError && !streamed) throw new Error(streamError);

  return streamed;
}

/**
 * Calls /api/ask-twin and transparently handles both the SSE streaming
 * contract (Vercel/Express backends) and the legacy JSON `{ reply }`
 * contract. Returns the full reply text. Throws on HTTP errors so callers
 * can fall back to local canned responses.
 */
export async function askTwin({
  message,
  history,
  onDelta,
  onSources,
  onFollowups,
  onAction,
  signal,
}: AskTwinOptions): Promise<string> {
  // A single transparent retry covers transient upstream rate-limit failures
  // (free-tier Groq TPM windows recharge over ~60s, so a healthy request
  // behind a sticky 503 usually succeeds on the second try) and empty
  // streams (upstream hiccups, reasoning-token burnout before the server
  // guard existed). Retried only when NOTHING was delivered — no text, no
  // events, no non-transient error frame — never after an abort, and never
  // after an OS action has already been dispatched (retrying would repeat
  // real side effects).
  const TRANSIENT_ERROR = 'AI service unavailable. Please try again shortly.';
  let actionDispatched = false;
  const guardedCallbacks = {
    onDelta,
    onSources,
    onFollowups,
    onAction: (action: AssistantAction) => {
      actionDispatched = true;
      onAction?.(action);
    },
  };

  for (let attempt = 0; ; attempt++) {
    try {
      const reply = await askTwinOnce({ message, history, ...guardedCallbacks, signal });
      if (reply) return reply;
      throw new Error('Empty response stream.');
    } catch (err) {
      const isAbort = (err as Error).name === 'AbortError' || signal?.aborted;
      const isEmpty = (err as Error).message === 'Empty response stream.';
      const isTransient = (err as Error).message === TRANSIENT_ERROR;
      if (!(isEmpty || isTransient) || isAbort || actionDispatched || attempt >= 1) throw err;
      console.warn(`[askTwin] ${isEmpty ? 'empty stream' : 'transient upstream error'}, retrying once…`);
    }
  }
}

async function askTwinOnce({
  message,
  history,
  context,
  onDelta,
  onSources,
  onFollowups,
  onAction,
  signal,
}: AskTwinOptions): Promise<string> {
  const res = await fetch(`${getApiBaseUrl()}/api/ask-twin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
    signal,
  });

  if (!res.ok) {
    let errMsg = 'Neural link unstable.';
    try {
      const d = await res.json();
      errMsg = d.error || errMsg;
    } catch {
      // non-JSON error body; keep default message
    }
    throw new Error(errMsg);
  }

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('text/event-stream') && res.body) {
    return consumeSseStream(res.body, { onDelta, onSources, onFollowups, onAction });
  }

  // Legacy buffered contract (Supabase edge variant).
  const data = await res.json();
  if (data.reply) return data.reply as string;
  throw new Error(data.error || 'General twin system fault.');
}
