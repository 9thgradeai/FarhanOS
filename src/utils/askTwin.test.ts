import { describe, it, expect, afterEach, vi } from 'vitest';
import { askTwin } from './askTwin';

function sseBody(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      // Fragment bytes mid-frame to exercise the cross-chunk SSE buffer.
      const payload = lines.join('');
      const mid = Math.floor(payload.length / 2);
      controller.enqueue(encoder.encode(payload.slice(0, mid)));
      controller.enqueue(encoder.encode(payload.slice(mid)));
      controller.close();
    },
  });
}

const streamHeaders = { 'content-type': 'text/event-stream' };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('askTwin', () => {
  it('parses a fragmented SSE stream and returns the full reply', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(sseBody([
        'data: {"delta":"Hel"}\n\n',
        'data: {"delta":"lo"}\n\n',
        'data: {"delta":" world"}\n\n',
        'data: [DONE]\n\n',
      ]), { status: 200, headers: streamHeaders }))
    );

    const reply = await askTwin({ message: 'hi', history: [] });
    expect(reply).toBe('Hello world');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ask-twin'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('invokes onDelta with accumulated text and guarantees a final flush', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(sseBody([
        'data: {"delta":"a"}\n\n',
        'data: {"delta":"b"}\n\n',
        'data: {"delta":"c"}\n\n',
        'data: [DONE]\n\n',
      ]), { status: 200, headers: streamHeaders }))
    );

    const seen: string[] = [];
    const reply = await askTwin({
      message: 'hi',
      history: [],
      onDelta: (t) => seen.push(t),
    });

    expect(reply).toBe('abc');
    expect(seen.at(-1)).toBe('abc');
    // Monotonic accumulation — each callback sees at least everything before it.
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i].startsWith(seen[i - 1])).toBe(true);
    }
  });

  it('handles frames split across read chunks', async () => {
    const encoder = new TextEncoder();
    // One JSON frame deliberately cut in half between two SSE lines.
    const raw = 'data: {"del' + 'ta":"ok"}\n\ndata: [DONE]\n\n';
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(encoder.encode(raw.slice(0, 14)));
        c.enqueue(encoder.encode(raw.slice(14)));
        c.close();
      },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(body, { status: 200, headers: streamHeaders }))
    );

    expect(await askTwin({ message: 'x', history: [] })).toBe('ok');
  });

  it('throws with the server error message on HTTP failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Too many requests.' }), { status: 429 }))
    );
    await expect(askTwin({ message: 'x', history: [] })).rejects.toThrow('Too many requests.');
  });

  it('falls back to a generic message on non-JSON error bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>gateway timeout</html>', { status: 504 }))
    );
    await expect(askTwin({ message: 'x', history: [] })).rejects.toThrow('Neural link unstable.');
  });

  it('supports the legacy buffered JSON contract (Supabase variant)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ reply: 'buffered answer' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
    expect(await askTwin({ message: 'x', history: [] })).toBe('buffered answer');
  });

  it('rejects with the server error frame when the stream carries one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(sseBody([
        'data: {"type":"sources","items":[{"title":"Bio"}]}\n\n',
        'data: {"error":"The assistant could not generate a response. Please rephrase or retry."}\n\n',
        'data: [DONE]\n\n',
      ]), { status: 200, headers: streamHeaders }))
    );
    await expect(askTwin({ message: 'x', history: [] })).rejects.toThrow(
      'The assistant could not generate a response. Please rephrase or retry.'
    );
  });

  it('retries transparently once when a stream ends empty', async () => {
    const emptyStream = () =>
      new Response(sseBody(['data: [DONE]\n\n']), { status: 200, headers: streamHeaders });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => emptyStream())
      .mockImplementationOnce(async () =>
        new Response(sseBody(['data: {"delta":"recovered"}\n\n', 'data: [DONE]\n\n']), {
          status: 200,
          headers: streamHeaders,
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    expect(await askTwin({ message: 'x', history: [] })).toBe('recovered');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries transparently once on a transient upstream 503 frame', async () => {
    const transient = () =>
      new Response(sseBody([
        'data: {"type":"sources","items":[{"title":"Bio"}]}\n\n',
        'data: {"error":"AI service unavailable. Please try again shortly."}\n\n',
        'data: [DONE]\n\n',
      ]), { status: 200, headers: streamHeaders });
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => transient())
      .mockImplementationOnce(async () =>
        new Response(sseBody(['data: {"delta":"recovered"}\n\n', 'data: [DONE]\n\n']), {
          status: 200,
          headers: streamHeaders,
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    expect(await askTwin({ message: 'x', history: [] })).toBe('recovered');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry after an OS action was dispatched (side effects)', async () => {
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls++;
        return new Response(sseBody([
          'data: {"type":"action","action":{"type":"open_window","window":"projects"}}\n\n',
          'data: [DONE]\n\n',
        ]), { status: 200, headers: streamHeaders });
      })
    );

    const actions: unknown[] = [];
    await expect(
      askTwin({ message: 'x', history: [], onAction: (a) => actions.push(a) })
    ).rejects.toThrow('Empty response stream.');
    expect(actions).toHaveLength(1);
    expect(calls).toBe(1);
  });
});
