/**
 * Framework-agnostic endpoint logic. Adapters (Vercel function, Express
 * server, Supabase Edge) translate transport <-> these functions.
 */
import { clamp } from './security.js';
import { ApiError, escapeHtml } from './security.js';
import {
  buildAskTwinSystemPrompt,
  buildBriefPrompt,
  buildContactAnalysisPrompt,
  CONTINUATION_SYSTEM_PROMPT,
} from './prompts.js';
import {
  streamGroqChatEvents,
  groqChat,
  MODEL_DEFAULT,
  MODEL_FAST,
  type GroqMessage,
  type GroqToolCall,
} from './groq.js';
import { getCache, setCache } from './cache.js';
import { parseMediumRSS, type MediumStory } from './rssParser.js';
import { getEnv } from './env.js';
import {
  TOOL_SCHEMAS,
  SERVER_TOOL_NAMES,
  validateClientAction,
  type AssistantAction,
} from './tools.js';
import { buildModePrompt, inferIntentMode, isIntentMode, type IntentMode } from './intents.js';

export { ApiError };
export type { MediumStory };

// ─── ask-twin ────────────────────────────────────────────────────────────────

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Typed SSE frames emitted by streamAskTwin (serialized verbatim by adapters). */
export type AskTwinEvent =
  | { type: 'delta'; delta: string }
  | { type: 'sources'; items: Array<{ title: string }> }
  | { type: 'action'; action: AssistantAction }
  | { type: 'followups'; items: string[] };

/** Minimal contract the host implements to supply RAG context (Node-only). */
export interface RagSearcher {
  searchKnowledge(
    query: string,
    options?: { topK?: number; featuredOnly?: boolean }
  ): Array<{ title: string; content: string }>;
}

/**
 * Eagerly validates /api/ask-twin input so adapters can reject bad requests
 * with a proper status code before opening an SSE stream.
 * Returns the clamped message on success.
 */
export function validateAskTwinInput(rawMessage: unknown, rawHistory: unknown): string {
  const message = clamp(rawMessage, 4000);
  if (!message.trim()) {
    throw new ApiError(400, 'Message is required.');
  }
  if (rawHistory !== undefined && (!Array.isArray(rawHistory) || rawHistory.length > 40)) {
    throw new ApiError(400, 'Invalid conversation history.');
  }
  return message;
}

// ─── Model routing ───────────────────────────────────────────────────────────

/** Micro-intents that never need a 120B reasoning model (see prompt tiers). */
const MICRO_INTENT_RE =
  /\b(email|e-?mail address|phone|whatsapp|linkedin|portfolio|resume|cv|x\/twitter|instagram|contact info|hello|hi|hey|good (morning|afternoon|evening)|thanks|thank you)\b/i;

/** Anything wanting live data or screen actions must stay on the flagship. */
const TOOL_INTENT_RE =
  /\b(stars?|repos?|repositor|latest|recent|open|show|switch|launch|apply|theme|mode|articl|wrote|publish|count)\b/i;

/** Questions that unambiguously need a live-data fetch on the first turn. */
const LIVE_DATA_RE = /\b(stars?|forks?|repos?|repositor|articl(es)?|published?|wrote)\b/i;

/**
 * Cheap heuristic router: tiny direct-answer queries go to the fast small
 * model; everything else keeps the flagship. Never routes when the query
 * looks like a multi-part or technical discussion.
 */
export function pickModel(message: string): string {
  const m = message.trim();
  if (m.length <= 90 && MICRO_INTENT_RE.test(m) && !TOOL_INTENT_RE.test(m)) return MODEL_FAST;
  return MODEL_DEFAULT;
}

// ─── Server-side tool execution ──────────────────────────────────────────────

function safeParseToolArgs(rawArgs: unknown): Record<string, unknown> {
  if (typeof rawArgs !== 'string' || !rawArgs.trim()) return {};
  try {
    const parsed = JSON.parse(rawArgs);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function executeServerTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === 'get_live_github_repos') {
    void args;
    const entry = await getGithubRepos();
    const compact = entry.data.slice(0, 10).map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      description: clamp(r.description, 160),
      url: r.html_url,
      topics: r.topics.slice(0, 5),
    }));
    return JSON.stringify({ retrieved_at: new Date().toISOString(), repositories: compact });
  }
  if (name === 'get_recent_medium_stories') {
    void args;
    const entry = await getMediumStories();
    const compact = entry.data.slice(0, 8).map((s: MediumStory) => ({
      title: s.title,
      url: s.link,
      published: s.date,
      category: s.category,
      excerpt: clamp(s.excerpt, 160),
    }));
    return JSON.stringify({ retrieved_at: new Date().toISOString(), articles: compact });
  }
  return JSON.stringify({ error: 'unknown_tool' });
}

const MAX_TOOL_TURNS = 4;

/**
 * Validates input and streams typed events for /api/ask-twin:
 * RAG source refs → streamed answer deltas → dispatched OS actions →
 * generated follow-up suggestions.
 */
export async function* streamAskTwin(
  rawMessage: unknown,
  rawHistory: unknown,
  rag?: RagSearcher,
  sessionContext?: {
    openWindows?: string[];
    activeWindow?: string;
    activeSection?: string;
    mode?: string;
    visitCount?: number;
  }
): AsyncGenerator<AskTwinEvent> {
  const message = validateAskTwinInput(rawMessage, rawHistory);

  const history: GroqMessage[] = Array.isArray(rawHistory)
    ? (rawHistory.slice(-8) as any[])
        .filter((h) => h && typeof h === 'object')
        .map((h: any) => ({
          role: h?.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: clamp(h?.content, 4000),
        }))
    : [];

  let systemPrompt = buildAskTwinSystemPrompt();
  const sources: Array<{ title: string }> = [];
  let sessionContextBlock = '';
  let modePrompt = '';

  // Inject session context for contextual awareness. Kept as a separate block
  // because RAG retrieval below rebuilds the prompt from scratch.
  if (sessionContext) {
    const contextParts: string[] = [];
    if (sessionContext.openWindows && sessionContext.openWindows.length > 0) {
      contextParts.push(`Visitor has these OS windows open: ${sessionContext.openWindows.join(', ')}. Reference them naturally if relevant.`);
    }
    if (sessionContext.activeWindow) {
      contextParts.push(`Visitor is currently viewing: ${sessionContext.activeWindow}.`);
    }
    if (sessionContext.activeSection) {
      contextParts.push(`Visitor is currently browsing the "${sessionContext.activeSection}" section of the landing page. Anchor answers there if relevant.`);
    }
    if (sessionContext.visitCount && sessionContext.visitCount > 1) {
      contextParts.push(`This is visit #${sessionContext.visitCount} — returning visitor.`);
    }
    if (contextParts.length > 0) {
      sessionContextBlock = `\n\nSESSION CONTEXT:\n${contextParts.join('\n')}`;
    }
  }

  // Tailor the persona to the detected intent mode (recruiter / developer /
  // research). The client may hint the mode, but the server always validates
  // it before it reaches the prompt.
  const requestedMode = sessionContext?.mode && isIntentMode(sessionContext.mode)
    ? (sessionContext.mode as IntentMode)
    : inferIntentMode(message);
  if (requestedMode) modePrompt = `\n\n${buildModePrompt(requestedMode)}`;

  if (rag) {
    try {
      // Blend the latest user turn into the query so follow-ups like
      // "what did he do there?" still retrieve the right documents.
      const lastUserTurn = [...(Array.isArray(rawHistory) ? rawHistory : [])]
        .reverse()
        .find((h: any) => h?.role === 'user');
      const searchQuery = lastUserTurn
        ? `${message}\n${clamp(lastUserTurn?.content, 200)}`
        : message;
      const docs = rag.searchKnowledge(searchQuery, { topK: 6, featuredOnly: false });
      if (docs.length > 0) {
        sources.push(...docs.map((d) => ({ title: d.title })));
        // Capped tightly: on Groq free tiers every prompt token counts
        // against an 8k TPM budget AND a hard daily cap, so context bloat
        // directly costs availability. ~5k chars ≈ 1.2-1.5k tokens leaves
        // room for the completion and conversation inside one window.
        const context = docs
          .map((d) => `## ${d.title}\n${clamp(d.content, 1200)}`)
          .join('\n\n---\n\n')
          .slice(0, 5000);
        systemPrompt = buildAskTwinSystemPrompt(context);
      }
    } catch (err) {
      console.error('[ask-twin] RAG retrieval failed, falling back to inline prompt', err);
    }
  }

  // Session context and mode shaping are appended last so they survive the
  // RAG prompt rebuild above, and sit closest to the <user_message> where
  // instruction influence is strongest.
  systemPrompt += sessionContextBlock;
  systemPrompt += modePrompt;

  // Source chips reach the UI immediately, before the first token lands.
  if (sources.length > 0) yield { type: 'sources', items: sources };

  const model = pickModel(message);
  let conversation: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: `<user_message>\n${message}\n</user_message>` },
  ];

  // Agentic loop: stream each turn; when the model requests tools, execute
  // them (server-side data fetches here, client OS actions as validated
  // events) and let the model continue with the results.
  let fullAnswer = '';
  for (let turn = 0; ; turn++) {
    const toolsAvailable = turn < MAX_TOOL_TURNS;
    const requestedTools: GroqToolCall[] = [];

    for await (const ev of streamGroqChatEvents(conversation, {
      temperature: 0.6,
      // Headroom for gpt-oss reasoning + answer; reasoning tokens count
      // against this budget AND the 8k TPM / daily token caps, so keep it
      // lean. Long-form editing is rare on this site; 1000 covers answers.
      maxTokens: 1000,
      model,
      fallbackModel: model === MODEL_DEFAULT ? MODEL_FAST : undefined,
      tools: toolsAvailable ? TOOL_SCHEMAS : undefined,
      // Live-data questions force a first tool call so answers are never
      // guessed from stale memory.
      toolChoice: turn === 0 && LIVE_DATA_RE.test(message) ? 'required' : 'auto',
      // Keep chain-of-thought short so visible answers always fit.
      reasoningEffort: 'low',
    })) {
      if (ev.type === 'text') {
        fullAnswer += ev.delta;
        yield { type: 'delta', delta: ev.delta };
      } else {
        requestedTools.push(...ev.toolCalls);
      }
    }

    if (requestedTools.length === 0 || !toolsAvailable) break;

    conversation.push({
      role: 'assistant',
      content: '',
      tool_calls: requestedTools.map((t) => ({
        id: t.id,
        type: 'function',
        function: { name: t.function.name, arguments: t.function.arguments },
      })),
    });

    for (const call of requestedTools) {
      const name = call.function.name;
      let result: string;
      const action = validateClientAction(name, safeParseToolArgs(call.function.arguments));
      if (action) {
        yield { type: 'action', action };
        result = JSON.stringify({
          status: 'dispatched',
          detail: 'The action executed on the visitor’s screen.',
        });
      } else if (SERVER_TOOL_NAMES.has(name)) {
        try {
          result = await executeServerTool(name, safeParseToolArgs(call.function.arguments));
        } catch (err) {
          console.error(`[ask-twin] server tool ${name} failed:`, err);
          result = JSON.stringify({ error: 'tool_unavailable', hint: 'Answer from verified static knowledge instead.' });
        }
      } else {
        result = JSON.stringify({ error: 'unknown_tool' });
      }
      conversation.push({
        role: 'tool',
        tool_call_id: call.id,
        content: clamp(result, 4000),
      });
    }

    // Continuation turns swap the multi-kilobyte knowledge prompt for a
    // compact one — tool results are already in context and this keeps
    // agentic loops inside tight TPM budgets.
    conversation = [ { role: 'system', content: CONTINUATION_SYSTEM_PROMPT }, ...conversation.slice(1) ];
  }

  // Contextual follow-ups — generated after the answer so they never block
  // perceived latency. Best-effort: silently skipped on any failure.
  try {
    if (fullAnswer.trim()) {
      // No json_mode: reasoning models truncate under tight token caps and
      // Groq then hard-rejects the invalid JSON. Lenient parsing instead.
      const raw = await groqChat(
        [
          {
            role: 'user',
            content: `Based on this exchange about Farhan Kabir, suggest exactly 3 short follow-up questions (max 9 words each) the visitor would plausibly ask next. Vary the angle (depth, proof, practical next step). Respond ONLY with a JSON object: {"items":["...","...","..."]}

User asked: ${clamp(message, 300)}
Assistant answered: ${clamp(fullAnswer, 1200)}`,
          },
        ],
        { model: MODEL_FAST, temperature: 0.9, maxTokens: 400, reasoningEffort: 'low', timeoutMs: 10_000 }
      );
      // Lenient extraction — some models wrap JSON in prose or code fences.
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      if (Array.isArray(parsed?.items)) {
        const items = parsed.items
          .filter((s: unknown): s is string => typeof s === 'string')
          .map((s: string) => s.replace(/^["'\d.)\-\s]+/, '').trim())
          .filter((s: string) => s.length > 3 && s.length <= 120)
          .slice(0, 3);
        if (items.length > 0) yield { type: 'followups', items };
      }
    }
  } catch {
    // Follow-ups are cosmetic — never fail the stream over them.
  }
}

// ─── summarize-brief ─────────────────────────────────────────────────────────

export async function summarizeBrief(body: any): Promise<{ summary: string }> {
  const projectType = clamp(body?.projectType, 200);
  const budget = clamp(body?.budget, 100);
  const timeline = clamp(body?.timeline, 100);
  const goals = clamp(body?.goals, 4000);
  const comments = clamp(body?.comments, 2000);

  if (!projectType.trim() || !goals.trim()) {
    throw new ApiError(400, 'Project Type and Goals are required parameters.');
  }

  const summary = await groqChat(
    [{ role: 'user', content: buildBriefPrompt({ projectType, budget, timeline, goals, comments }) }],
    { temperature: 0.7, maxTokens: 400 }
  );
  return { summary };
}

// ─── medium-stories ──────────────────────────────────────────────────────────

const MEDIUM_FEED_URL = 'https://medium.com/feed/@farhankabir133';
const MEDIUM_TTL_MS = 15 * 60 * 1000;

export async function getMediumStories(): Promise<CacheEntryShape<MediumStory[]>> {
  const cached = getCache<MediumStory[]>('medium-stories');
  if (cached) return cached;

  const response = await fetch(MEDIUM_FEED_URL, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    console.error('[medium] RSS fetch failed:', response.status);
    throw new ApiError(502, 'Failed to fetch stories. Please try again later.');
  }

  const xmlText = await response.text();
  const stories = parseMediumRSS(xmlText);
  setCache('medium-stories', stories, MEDIUM_TTL_MS);
  return getCache<MediumStory[]>('medium-stories')!;
}

// ─── github-repos ────────────────────────────────────────────────────────────

export interface RepoSummary {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  homepage: string | null;
}

const GITHUB_TTL_MS = 60 * 60 * 1000;

export async function getGithubRepos(): Promise<CacheEntryShape<RepoSummary[]>> {
  const cached = getCache<RepoSummary[]>('github-repos');
  if (cached) return cached;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'FarhanOS-Portfolio/1.0',
  };
  const token = getEnv('GITHUB_TOKEN');
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch('https://api.github.com/users/farhankabir133/repos?sort=stars&per_page=100', {
    headers,
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    console.error('[github] API failed:', response.status);
    throw new ApiError(502, 'Failed to fetch repositories. Please try again later.');
  }

  const repos = await response.json();
  const topRepos: RepoSummary[] = (Array.isArray(repos) ? repos : [])
    .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
      homepage: repo.homepage,
    }));

  setCache('github-repos', topRepos, GITHUB_TTL_MS);
  return getCache<RepoSummary[]>('github-repos')!;
}

// Structural type to avoid importing CacheEntry generic plumbing into adapters.
export interface CacheEntryShape<T> {
  data: T;
  etag: string;
  fetchedAt: number;
}

// ─── contact ─────────────────────────────────────────────────────────────────

export interface ContactResult {
  analysis: {
    urgency?: string;
    inquiryType?: string;
    summaryText?: string;
    suggestedAutoReply?: string;
  };
  emailStatus: { sent: boolean; id?: string; error?: string };
}

const CONTACT_RECIPIENT = 'farhankabir236@gmail.com';
const CONTACT_FROM = 'Farhan Kabir <contact@farhankabir.me>';

function dhakaTimestamp(): string {
  return (
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' (GMT+6)'
  );
}

function buildContactEmailHtml(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
  metadata?: unknown;
  urgency: string;
  inquiryType: string;
  summaryText: string;
  suggestedAutoReply: string;
}): string {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #111;">
  <h2>New Contact Transmission</h2>
  <p><strong>Name:</strong> ${e(opts.name) || 'Anonymous'}</p>
  <p><strong>Email:</strong> ${e(opts.email)}</p>
  <p><strong>Subject:</strong> ${e(opts.subject) || 'No Subject'}</p>
  <p><strong>Message:</strong></p>
  <p>${e(opts.message).replace(/\r?\n/g, '<br>')}</p>
  ${opts.metadata ? `<pre>${e(JSON.stringify(opts.metadata, null, 2).slice(0, 2000))}</pre>` : ''}
  <p><strong>Urgency:</strong> ${opts.urgency}</p>
  <p><strong>Type:</strong> ${e(opts.inquiryType) || 'General Inquiry'}</p>
  <p><strong>Summary:</strong> ${e(opts.summaryText) || 'No analysis available.'}</p>
  <p><strong>Suggested Auto Reply:</strong></p>
  <blockquote>${e(opts.suggestedAutoReply).replace(/\r?\n/g, '<br>') || 'None'}</blockquote>
  <p><strong>Timestamp:</strong> ${dhakaTimestamp()}</p>
</body>
</html>`;
}

/**
 * Full contact pipeline: validate → best-effort AI analysis → email delivery.
 * Analysis failure never blocks or loses the message.
 */
export async function processContact(body: any): Promise<ContactResult> {
  const name = clamp(body?.name, 120).trim();
  const email = clamp(body?.email, 254).trim();
  const subject = clamp(body?.subject, 200).trim();
  const message = clamp(body?.message, 8000);

  if (!email || !message.trim()) {
    throw new ApiError(400, 'Email and message are required fields.');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, 'A valid email address is required.');
  }

  console.log(`[Message Transmission]: From: ${name || 'N/A'} <${email}>, Subject: ${subject || 'N/A'}`);

  // Best-effort urgency classification — never block delivery on AI failure.
  let analysis: ContactResult['analysis'] = {};
  try {
    const analysisJson = await groqChat(
      [{ role: 'user', content: buildContactAnalysisPrompt({ name, email, subject, message }) }],
      { temperature: 0.2, maxTokens: 400, json: true, timeoutMs: 20_000 }
    );
    try {
      analysis = JSON.parse(analysisJson);
    } catch (_e) {
      // proceed without analysis
    }
  } catch (err) {
    console.error('[contact] analysis failed:', err);
  }

  const safeUrgency = ['High', 'Medium', 'Low'].includes(String(analysis.urgency))
    ? String(analysis.urgency)
    : 'Medium';
  const inquiryType = clamp(analysis.inquiryType, 80);
  const urgencyIcon = safeUrgency === 'High' ? '🔴' : safeUrgency === 'Medium' ? '🟡' : '🟢';

  const resendApiKey = getEnv('RESEND_API_KEY');
  let emailStatus: ContactResult['emailStatus'];
  if (!resendApiKey) {
    console.warn('[Contact] RESEND_API_KEY not set — email notification skipped.');
    emailStatus = { sent: false, error: 'RESEND_API_KEY not configured.' };
  } else {
    // Model output deliberately kept out of the subject line beyond a
    // validated urgency icon, to prevent forged notification subjects.
    const emailSubject = `[FarhanOS] ${urgencyIcon} New contact message from ${email}`;
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: CONTACT_FROM,
          to: [CONTACT_RECIPIENT],
          subject: emailSubject,
          html: buildContactEmailHtml({
            name,
            email,
            subject,
            message,
            metadata: body?.metadata,
            urgency: safeUrgency,
            inquiryType,
            summaryText: clamp(analysis.summaryText, 300),
            suggestedAutoReply: clamp(analysis.suggestedAutoReply, 1000),
          }),
        }),
        signal: AbortSignal.timeout(15_000),
      });

      const emailBody = await emailRes.json().catch(() => ({}) as any);
      if (emailRes.ok) {
        emailStatus = { sent: true, id: (emailBody as any).id };
      } else {
        console.error('[Contact] Resend error:', emailRes.status, (emailBody as any)?.message);
        emailStatus = { sent: false, error: `Email delivery failed (${emailRes.status}).` };
      }
    } catch (emailErr) {
      console.error('[Contact] Resend request threw:', emailErr);
      emailStatus = { sent: false, error: 'Email delivery timed out or failed.' };
    }
  }

  return { analysis, emailStatus };
}
