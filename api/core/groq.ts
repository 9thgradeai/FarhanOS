import { getEnv } from './env.js';
import { ApiError, fetchWithTimeout } from './security.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const MODEL_DEFAULT = 'openai/gpt-oss-120b';
export const MODEL_FAST = 'openai/gpt-oss-20b';

export interface GroqToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: GroqToolCall[];
}

export interface GroqToolSchema {
  type: 'function';
  function: { name: string; description: string; parameters: Record<string, unknown> };
}

/** One streaming turn: text deltas as they arrive, then any tool calls. */
export type GroqStreamEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_calls'; toolCalls: GroqToolCall[] };

export interface GroqStreamOpts {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  tools?: GroqToolSchema[];
  model?: string;
  /** 'required' forces the model to emit at least one tool call this turn. */
  toolChoice?: 'auto' | 'required';
  /**
   * Model to retry with when `model` is permanently blocked (daily quota,
   * model outage). Free-tier daily token budgets are per model, so a leaner
   * sibling model keeps the assistant available when the flagship is capped.
   */
  fallbackModel?: string;
  /**
   * gpt-oss reasoning budget. 'low' is essential for short chat answers:
   * reasoning tokens count against max_tokens, so a medium/high effort can
   * burn the entire completion budget before any visible content is emitted.
   */
  reasoningEffort?: 'low' | 'medium' | 'high';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const AI_SERVICE_UNAVAILABLE = 'AI service unavailable. Please try again shortly.';

const BACKOFFS_MS = [2000, 5000, 9000];

/**
 * Opens the streaming completion, transparently retrying transient Groq
 * failures. Free-tier TPM windows (8k/min) can take 10-60s to recharge, so
 * 429s are retried with Retry-After-aware backoff; a brief 5xx/network retry
 * absorbs occasional overload. Never duplicates emitted tokens because the
 * stream is only returned once the response is OK.
 */
async function openGroqStreamWithRetry(
  messages: GroqMessage[],
  body: Record<string, unknown>,
  timeoutMs: number,
  attempts = 4
): Promise<Response> {
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        GROQ_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${requireGroqKey()}`,
          },
          body: JSON.stringify(body),
        },
        timeoutMs
      );
    } catch (err) {
      // Timeout/abort before first byte — retry once, then surface the error.
      if (attempt >= attempts - 1 || attempt > 0) {
        console.error('[groq] upstream failure:', err instanceof Error ? err.message : err);
        throw new ApiError(503, AI_SERVICE_UNAVAILABLE);
      }
      await sleep(BACKOFFS_MS[attempt] ?? 2000);
      continue;
    }
    if (res.ok) return res;
    lastRes = res;
    const retryAfter = Number(res.headers.get('retry-after'));
    // Minutes-long Retry-After signals a daily/hourly quota block — retrying
    // is pointless within function limits, so surface it immediately. Short
    // Retry-After (under 90s) is the 8k TPM window, which is worth waiting
    // through since it recharges within a minute.
    const retryAfterMs = Number.isFinite(retryAfter) && retryAfter >= 0 ? retryAfter * 1000 : NaN;
    if (Number.isFinite(retryAfterMs) && retryAfterMs > 90_000) {
      console.error('[groq] quota block (long Retry-After), giving up:', res.status, retryAfterMs);
      break;
    }
    if (res.status === 429 && attempt < attempts - 1) {
      const waitMs = Number.isFinite(retryAfterMs)
        ? Math.min(retryAfterMs + 250, 45_000)
        : (BACKOFFS_MS[attempt] ?? 5000);
      await sleep(waitMs);
      continue;
    }
    if (res.status >= 500 && attempt < attempts - 1) {
      await sleep(1500);
      continue;
    }
    break;
  }
  return lastRes!;
}

function requireGroqKey(): string {
  const key = getEnv('GROQ_API_KEY');
  if (!key) {
    throw new ApiError(503, 'AI service is not configured.');
  }
  return key;
}

/**
 * Streaming chat completion. Yields text deltas as they arrive and, when the
 * model requests tools, a final `tool_calls` event for the turn.
 */
export async function* streamGroqChatEvents(
  messages: GroqMessage[],
  opts: GroqStreamOpts = {}
): AsyncGenerator<GroqStreamEvent> {
  const body: Record<string, unknown> = {
    model: opts.model || MODEL_DEFAULT,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 1500,
    stream: true,
  };
  if (opts.reasoningEffort) body.reasoning_effort = opts.reasoningEffort;
  if (opts.tools && opts.tools.length > 0) {
    body.tools = opts.tools;
    body.tool_choice = opts.toolChoice === 'required' ? 'required' : 'auto';
  }

  let res = await openGroqStreamWithRetry(messages, body, opts.timeoutMs ?? 60_000);

  // Fall back to a sibling model when the primary is blocked (daily quota /
  // model-wide outage). Tries only once; the fallback gets its own retries.
  if (!res.ok && opts.fallbackModel) {
    console.warn('[groq] falling back to model:', opts.fallbackModel);
    body.model = opts.fallbackModel;
    res = await openGroqStreamWithRetry(messages, body, opts.timeoutMs ?? 60_000, 3);
  }

  if (!res.ok || !res.body) {
    const errData = await res.json().catch(() => ({}) as any);
    console.error('[groq] stream error:', res.status, errData?.error?.message || errData);
    throw new ApiError(503, AI_SERVICE_UNAVAILABLE);
  }

  // Robust SSE frame parser tolerating chunks split mid-line.
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let emittedText = false;
  let finishReason: string | null = null;
  // OpenAI-style tool_calls arrive fragmented by index; merge before emitting.
  const toolAcc = new Map<number, { id: string; name: string; args: string }>();

  const emitFrame = (payload: string): string | null => {
    if (payload === '[DONE]') return null;
    try {
      const json = JSON.parse(payload);
      const choice = json.choices?.[0];
      const delta = choice?.delta;
      if (!delta) {
        if (typeof choice?.finish_reason === 'string') finishReason = choice.finish_reason;
        return null;
      }
      if (typeof choice.finish_reason === 'string' && choice.finish_reason) {
        finishReason = choice.finish_reason;
      }

      const fragments = delta.tool_calls;
      if (Array.isArray(fragments)) {
        for (const frag of fragments) {
          const idx = Number.isInteger(frag?.index) ? frag.index : 0;
          const slot = toolAcc.get(idx) ?? { id: '', name: '', args: '' };
          if (typeof frag?.id === 'string' && frag.id) slot.id = frag.id;
          if (typeof frag?.function?.name === 'string') slot.name += frag.function.name;
          if (typeof frag?.function?.arguments === 'string') slot.args += frag.function.arguments;
          toolAcc.set(idx, slot);
        }
      }

      const content = delta.content;
      if (typeof content === 'string' && content) {
        emittedText = true;
        return content;
      }
      return null;
    } catch {
      return null; // ignore malformed frames
    }
  };

  const drainTools = (): GroqToolCall[] =>
    [...toolAcc.entries()]
      .sort(([a], [b]) => a - b)
      .filter(([, s]) => s.name)
      .map(([idx, s]) => ({
        id: s.id || `call_${idx}`,
        type: 'function' as const,
        function: { name: s.name, arguments: s.args || '{}' },
      }));

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const delta = emitFrame(trimmed.slice(5).trim());
      if (delta) yield { type: 'text', delta };
    }
  }

  // Flush any trailing frame not terminated by a newline.
  buffer += decoder.decode();
  const trailing = buffer.trim();
  if (trailing.startsWith('data:')) {
    const delta = emitFrame(trailing.slice(5).trim());
    if (delta) yield { type: 'text', delta };
  }

  const toolCalls = drainTools();
  if (toolCalls.length > 0) yield { type: 'tool_calls', toolCalls };

  // Guard against silent empty completions: reasoning models can spend the
  // whole max_tokens budget on chain-of-thought and emit no visible content.
  // Surface an explicit error instead of ending the SSE stream silently
  // (which clients would report as a vague "empty response").
  if (!emittedText && toolCalls.length === 0) {
    const detail =
      finishReason === 'length'
        ? 'The model ran out of response budget before answering.'
        : finishReason === 'content_filter'
          ? 'The model declined to answer this prompt.'
          : 'The model returned no content.';
    console.error('[groq] empty completion:', detail, 'finish_reason:', finishReason);
    throw new ApiError(503, 'The assistant could not generate a response. Please rephrase or retry.');
  }
}

/** Back-compat wrapper: plain string deltas only (no tool handling). */
export async function* streamGroqChat(
  messages: GroqMessage[],
  opts: Omit<GroqStreamOpts, 'tools'> = {}
): AsyncGenerator<string> {
  for await (const ev of streamGroqChatEvents(messages, opts)) {
    if (ev.type === 'text') yield ev.delta;
  }
}

/** Non-streaming chat completion returning the full message content. */
export async function groqChat(
  messages: GroqMessage[],
  opts: {
    temperature?: number;
    maxTokens?: number;
    json?: boolean;
    timeoutMs?: number;
    model?: string;
    reasoningEffort?: 'low' | 'medium' | 'high';
  } = {}
): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model || MODEL_DEFAULT,
    messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 400,
  };
  if (opts.json) body.response_format = { type: 'json_object' };
  if (opts.reasoningEffort) body.reasoning_effort = opts.reasoningEffort;

  const res = await openGroqChatWithRetry(
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requireGroqKey()}`,
      },
      body: JSON.stringify(body),
    },
    opts.timeoutMs ?? 30_000
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}) as any);
    console.error('[groq] chat error:', res.status, errData?.error?.message || errData);
    throw new ApiError(503, AI_SERVICE_UNAVAILABLE);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/** Lightweight 429-aware retry for non-streaming chat calls. */
async function openGroqChatWithRetry(
  init: RequestInit,
  timeoutMs: number,
  attempts = 3
): Promise<Response> {
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt < attempts; attempt++) {
    let res: Response;
    try {
      res = await fetchWithTimeout(GROQ_URL, init, timeoutMs);
    } catch (err) {
      if (attempt >= attempts - 1) {
        console.error('[groq] chat upstream failure:', err instanceof Error ? err.message : err);
        throw new ApiError(503, AI_SERVICE_UNAVAILABLE);
      }
      await sleep(2000);
      continue;
    }
    if (res.ok) return res;
    lastRes = res;
    const retryAfter = Number(res.headers.get('retry-after'));
    if (res.status === 429 && attempt < attempts - 1) {
      const waitMs = Number.isFinite(retryAfter) && retryAfter >= 0
        ? Math.min(retryAfter * 1000 + 250, 10_000)
        : 3000;
      await sleep(waitMs);
      continue;
    }
    if (res.status >= 500 && attempt < attempts - 1) {
      await sleep(1500);
      continue;
    }
    break;
  }
  return lastRes!;
}
