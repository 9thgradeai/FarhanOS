import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ApiError,
  validateAskTwinInput,
  streamAskTwin,
  summarizeBrief,
  processContact,
  pickModel,
  type AskTwinEvent,
} from './handlers.ts';

function sseResponse(frames: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const f of frames) controller.enqueue(encoder.encode(f));
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

const okGroqStream = [
  'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n',
  'data: [DONE]\n\n',
];

/** Groq SSE frames requesting one tool call with fragmented arguments. */
function toolCallFrames(name: string, argsJson: string): string[] {
  return [
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_1","type":"function","function":{"name":"' + name + '","arguments":""}}]}}]}\n\n',
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":' + JSON.stringify(argsJson) + '}}]}}]}\n\n',
    'data: [DONE]\n\n',
  ];
}

/** Collect only the streamed text from an ask-twin event stream. */
async function collectText(gen: AsyncGenerator<AskTwinEvent>): Promise<string> {
  let out = '';
  for await (const ev of gen) {
    if (ev.type === 'delta') out += ev.delta;
  }
  return out;
}

async function collectEvents(gen: AsyncGenerator<AskTwinEvent>): Promise<AskTwinEvent[]> {
  const events: AskTwinEvent[] = [];
  for await (const ev of gen) events.push(ev);
  return events;
}

describe('validateAskTwinInput', () => {
  it('returns a clamped non-empty message', () => {
    expect(validateAskTwinInput('  hello  ', [])).toBe('  hello  ');
    const long = 'x'.repeat(5000);
    expect(validateAskTwinInput(long, undefined)).toHaveLength(4000);
  });

  it('rejects blank messages with 400', () => {
    expect(() => validateAskTwinInput('   ', [])).toThrow(ApiError);
    try {
      validateAskTwinInput('', []);
      expect.unreachable();
    } catch (err) {
      expect((err as ApiError).status).toBe(400);
    }
  });

  it('rejects oversized history with 400', () => {
    const history = Array.from({ length: 41 }, (_, i) => ({ role: 'user', content: `m${i}` }));
    try {
      validateAskTwinInput('hi', history);
      expect.unreachable();
    } catch (err) {
      expect((err as ApiError).status).toBe(400);
    }
  });

  it('accepts history at the limit (40 entries)', () => {
    const history = Array.from({ length: 40 }, (_, i) => ({ role: 'user', content: `m${i}` }));
    expect(() => validateAskTwinInput('hi', history)).not.toThrow();
  });
});

describe('pickModel', () => {
  it('routes micro intents to the fast model', () => {
    expect(pickModel('what is your email?')).not.toBe('openai/gpt-oss-120b');
    expect(pickModel('linkedin?')).not.toBe('openai/gpt-oss-120b');
    expect(pickModel('hi')).not.toBe('openai/gpt-oss-120b');
  });

  it('keeps tool-worthy and technical questions on the flagship model', () => {
    expect(pickModel('Explain the architecture of the depression detection pipeline')).toBe(
      'openai/gpt-oss-120b'
    );
    expect(pickModel(`compare ${'x'.repeat(200)}`)).toBe('openai/gpt-oss-120b');
    // Mentions github but asks for live data → needs tools.
    expect(pickModel('How many stars does your top GitHub repo have right now?')).toBe(
      'openai/gpt-oss-120b'
    );
    expect(pickModel('open the projects window')).toBe('openai/gpt-oss-120b');
  });
});

describe('streamAskTwin', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GROQ_API_KEY;
  });

  it('streams deltas and wraps the user message in delimiters', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);

    const out = await collectText(streamAskTwin('what is your email?', [
      { role: 'assistant', content: 'earlier answer' },
    ]));
    expect(out).toBe('Hi');

    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    // System prompt leads, history follows, user message last.
    expect(payload.messages[0].role).toBe('system');
    expect(payload.messages[1]).toMatchObject({ role: 'assistant', content: 'earlier answer' });
    expect(payload.messages.at(-1)).toMatchObject({ role: 'user' });
  });

  it('emits RAG sources before the first token', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse(okGroqStream)));
    const rag = {
      searchKnowledge: vi.fn().mockReturnValue([
        { title: 'Bio', content: 'Farhan studied CS.' },
        { title: 'Skills', content: 'TypeScript, React.' },
      ]),
    };

    const events = await collectEvents(streamAskTwin('background?', [], rag));
    expect(events[0]).toEqual({
      type: 'sources',
      items: [{ title: 'Bio' }, { title: 'Skills' }],
    });
  });

  it('adds session context (activeSection, visit) and the mode block to the prompt', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);

    await collectText(
      streamAskTwin('What should I know before working with Farhan?', [], undefined, {
        activeSection: 'about',
        activeWindow: 'projects',
        openWindows: ['projects', 'research'],
        mode: 'recruiter',
        visitCount: 4,
      })
    );

    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    const system = payload.messages[0].content as string;
    expect(system).toContain('MODE: RECRUITER DIALOGUE');
    expect(system).toContain('about');
    expect(system).toContain('Farhan AI');
    expect(system).toContain('visit #4');
    expect(system).toContain('OS windows open: projects, research');
  });

  it('keeps session context and mode when RAG rebuilds the prompt', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);
    const rag = {
      searchKnowledge: vi.fn().mockReturnValue([{ title: 'Research', content: 'Paper data.' }]),
    };

    await collectText(
      streamAskTwin('Summarize depression detection research', [], rag, {
        activeSection: 'research',
        mode: 'research',
        visitCount: 2,
      })
    );

    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    const system = payload.messages[0].content as string;
    expect(system).toContain('RETRIEVED KNOWLEDGE');
    expect(system).toContain('MODE: RESEARCH DIALOGUE');
    expect(system).toContain('"research" section');
  });

  it('infers the mode server-side when the client sends none', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);

    await collectText(streamAskTwin('Can you explain the perplexity paper?', []));

    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    expect(payload.messages[0].content as string).toContain('MODE: RESEARCH DIALOGUE');
  });

  it('dispatches validated client actions and feeds tool results back', async () => {
    // Turn 1: model requests open_os_window; turn 2: final narration;
    // turn 3 (followups): non-stream JSON call.
    const fetchMock = vi.fn(async (_url: string) => {
      void _url;
      const callIdx = fetchMock.mock.calls.length;
      if (callIdx === 1) return sseResponse(toolCallFrames('open_os_window', '{"window":"projects"}'));
      if (callIdx === 2) return sseResponse(okGroqStream);
      // Followups call (non-streaming, JSON mode).
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"items":["Show research papers?","What stack?","Contact?"]}' } }],
        }),
        { status: 200 }
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const events = await collectEvents(streamAskTwin('show me the projects', []));
    expect(events).toContainEqual({
      type: 'action',
      action: { type: 'open_window', window: 'projects' },
    });

    // The narration turn must receive a tool result message.
    const secondPayload = JSON.parse(String((fetchMock.mock.calls[1] as any)[1].body));
    const toolMsg = secondPayload.messages.find((m: any) => m.role === 'tool');
    expect(toolMsg.content).toContain('dispatched');

    // Generated follow-ups arrive as a trailing event.
    expect(events.at(-1)).toEqual({
      type: 'followups',
      items: ['Show research papers?', 'What stack?', 'Contact?'],
    });
  });

  it('rejects invalid client actions without dispatching them', async () => {
    const frames = toolCallFrames('open_os_window', '{"window":"<script>steal()</script>"}');
    // Turn 1: malicious tool call; turn 2: model narrates recovery;
    // turn 3: followups JSON call.
    const fetchMock = vi.fn(async (_url: string) => {
      void _url;
      const groqCalls = fetchMock.mock.calls.length;
      if (groqCalls === 1) return sseResponse(frames);
      if (groqCalls === 2) {
        return sseResponse([
          'data: {"choices":[{"delta":{"content":"Cannot do that."}}]}\n\n',
          'data: [DONE]\n\n',
        ]);
      }
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const events = await collectEvents(streamAskTwin('hack', []));
    expect(events.filter((e) => e.type === 'action')).toHaveLength(0);

    // The model is told the action was rejected so it can recover gracefully.
    const narratePayload = JSON.parse(String((fetchMock.mock.calls[1] as any)[1].body));
    const toolMsg = narratePayload.messages.find((m: any) => m.role === 'tool');
    expect(toolMsg.content).toContain('error');
  });

  it('executes server-side live tools and returns data to the model', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes('groq.com')) {
        const idx = fetchMock.mock.calls.filter(([u]) => String(u).includes('groq.com')).length;
        if (idx === 1) return sseResponse(toolCallFrames('get_live_github_repos', '{}'));
        if (idx === 2) return sseResponse([
          'data: {"choices":[{"delta":{"content":"Top repo: TypeRush"}}]}\n\n',
          'data: [DONE]\n\n',
        ]);
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      }
      // github API
      return new Response(JSON.stringify([{
        id: 1,
        name: 'TypeRush',
        full_name: 'farhankabir133/TypeRush',
        description: 'Typing game',
        html_url: 'https://github.com/farhankabir133/TypeRush',
        language: 'TypeScript',
        stargazers_count: 42,
        forks_count: 3,
        updated_at: '2026-01-01T00:00:00Z',
        topics: ['game'],
        homepage: null,
      }]), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const out = await collectText(streamAskTwin('how many stars does TypeRush have?', []));
    expect(out).toBe('Top repo: TypeRush');

    const narratePayload = JSON.parse(
      String(
        (fetchMock.mock.calls.filter(([u]) => String(u).includes('groq.com'))[1] as any[])[1].body
      )
    );
    const toolMsg = narratePayload.messages.find((m: any) => m.role === 'tool');
    const parsedResult = JSON.parse(toolMsg.content);
    expect(parsedResult.repositories[0]).toMatchObject({ name: 'TypeRush', stars: 42 });
  });

  it('sanitizes malformed history entries instead of failing', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);

    for await (const d of streamAskTwin('hi', [
      { role: 'hacker', content: 'injected' },
      null,
      { role: 'user', content: 'real question' },
    ] as any)) {
      void d;
    }

    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    const roles = payload.messages.map((m: any) => m.role);
    // 'hacker' must be coerced to assistant; no raw passthrough of bogus roles.
    expect(roles).not.toContain('hacker');
  });

  it('injects RAG context into the system prompt when a searcher is provided', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);

    const rag = {
      searchKnowledge: vi.fn().mockReturnValue([
        { title: 'Bio', content: 'Farhan studied CS.' },
        { title: 'Skills', content: 'TypeScript, React.' },
      ]),
    };

    for await (const d of streamAskTwin('background?', [], rag)) void d;

    expect(rag.searchKnowledge).toHaveBeenCalledWith('background?', { topK: 6, featuredOnly: false });
    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    const system = payload.messages.find((m: any) => m.role === 'system');
    expect(system.content).toContain('Farhan studied CS.');
    expect(system.content).toContain('## Bio');
  });

  it('falls back to the inline prompt when RAG retrieval throws', async () => {
    const fetchMock = vi.fn(async () => sseResponse(okGroqStream));
    vi.stubGlobal('fetch', fetchMock);

    const rag = { searchKnowledge: vi.fn(() => { throw new Error('index down'); }) };
    for await (const d of streamAskTwin('q?', [], rag)) void d;

    const payload = JSON.parse(String((fetchMock.mock.calls[0] as any)[1].body));
    const system = payload.messages.find((m: any) => m.role === 'system');
    expect(system.content).not.toContain('undefined');
  });

  it('propagates validation errors as ApiError before any streaming', async () => {
    vi.stubGlobal('fetch', vi.fn());
    await expect(async () => {
      for await (const d of streamAskTwin('   ', [])) void d;
    }).rejects.toMatchObject({ status: 400 });
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});

describe('summarizeBrief', () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = 'test-key';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GROQ_API_KEY;
  });

  it('throws ApiError(400) when required fields are missing', async () => {
    await expect(summarizeBrief({ projectType: '', goals: '' })).rejects.toMatchObject({ status: 400 });
    await expect(summarizeBrief({ projectType: 'web', goals: '' })).rejects.toMatchObject({
      status: 400,
    });
    await expect(summarizeBrief(null)).rejects.toMatchObject({ status: 400 });
  });

  it('returns the AI summary on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ choices: [{ message: { content: 'A crisp brief.' } }] }), {
            status: 200,
          })
      )
    );
    const result = await summarizeBrief({ projectType: 'SaaS', goals: 'Launch MVP' });
    expect(result).toEqual({ summary: 'A crisp brief.' });
  });
});

describe('processContact', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.GROQ_API_KEY;
  });

  const validBody = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Hello',
    message: 'I would like to work with you.',
  };

  it('rejects missing/invalid fields with 400', async () => {
    delete process.env.RESEND_API_KEY;
    await expect(processContact({ ...validBody, email: '' })).rejects.toMatchObject({ status: 400 });
    await expect(processContact({ ...validBody, email: 'not-an-email' })).rejects.toMatchObject({
      status: 400,
    });
    await expect(processContact({ email: 'jane@example.com' })).rejects.toMatchObject({ status: 400 });
  });

  it('skips email delivery and reports status when RESEND_API_KEY is unset', async () => {
    delete process.env.RESEND_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await processContact(validBody);
    expect(result.emailStatus.sent).toBe(false);
    expect(result.emailStatus.error).toContain('RESEND_API_KEY');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('delivers email with escaped HTML and a validated urgency subject', async () => {
    process.env.RESEND_API_KEY = 'resend-test';
    process.env.GROQ_API_KEY = 'groq-test';
    const analysis = { urgency: 'High', inquiryType: 'Freelance', summaryText: 'Wants to hire.' };
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        const url = _url as string;
        if (url.includes('groq.com')) {
          return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(analysis) } }] }), { status: 200 });
        }
        return new Response(JSON.stringify({ id: 'email-123' }), { status: 200 });
      })
    );

    const result = await processContact({ ...validBody, name: '<script>alert(1)</script>' });
    expect(result.emailStatus).toEqual({ sent: true, id: 'email-123' });

    const resendCall = vi.mocked(fetch).mock.calls.find(([u]) => String(u).includes('resend'))!;
    const body = JSON.parse(String(resendCall[1]!.body));
    expect(body.subject).toBe('[FarhanOS] 🔴 New contact message from jane@example.com');
    expect(body.html).not.toContain('<script>alert(1)</script>');
    expect(body.html).toContain('&lt;script&gt;');
    expect(body.to).toEqual(['farhankabir236@gmail.com']);
  });

  it('never loses the message when AI analysis fails', async () => {
    delete process.env.RESEND_API_KEY;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 500 }))
    );
    const result = await processContact(validBody);
    expect(result.analysis.urgency).toBeUndefined();
    expect(result.emailStatus.sent).toBe(false);
  });
});
