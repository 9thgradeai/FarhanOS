/**
 * Runtime-agnostic request handler for every /api endpoint.
 *
 * This is the single source of truth used by BOTH deployment adapters
 * (`api/index.ts` for Vercel, `server.ts` + `createApp()` for Express). It is
 * deliberately free of `express`, `node:fs` and any DOM dependency so it can
 * run unchanged on Node, Vercel, Deno or Supabase Edge.
 *
 * Security posture
 * ----------------
 * This application exposes no user accounts and no user-owned records. Every
 * endpoint is anonymous and public, so there is no route-level authorization
 * matrix to enforce here — the controls that DO apply are:
 *   1. Origin allowlist on all state-changing (POST) requests — CORS alone is
 *      not an authorization control because browsers still deliver cross-site
 *      POSTs even when the response is unreadable to the attacker.
 *   2. Input clamping/validation (never trust request bodies).
 *   3. Per-IP rate limiting (with a non-spoofable client IP).
 * Everything a caller can reach is data that is already public on the site,
 * so exposing it to an anonymous caller leaks nothing new. A capability that
 * serves user-owned data MUST add an authentication + ownership check before
 * it is registered here.
 *
 * The knowledge searcher is injected by the adapter via `deps.getRagSearcher`
 * so that fs-backed code never enters the Serverless bundle path.
 */
import {
  ApiError,
  streamAskTwin,
  validateAskTwinInput,
  summarizeBrief,
  getMediumStories,
  getGithubRepos,
  getPlaygroundIndex,
  getPlaygroundPapers,
  getPlaygroundRepos,
  processContact,
  type RagSearcher,
} from './handlers.js';
import { isAllowedOrigin, checkApiRateLimit, checkStateChangeOrigin, getClientIp } from './security.js';
import { etagMatches } from './cache.js';

/** Minimal request/response contract satisfied by Node, Vercel and Edge. */
export interface ApiRequest {
  method?: string;
  url?: string;
  headers?: Record<string, any>;
  body?: any;
  socket?: { remoteAddress?: string };
}

export interface ApiResponse {
  setHeader(name: string, value: string): any;
  status(code: number): ApiResponse;
  json(body: unknown): any;
  end(chunk?: any): any;
  write?(chunk: any): any;
  flushHeaders?(): void;
  headersSent?: boolean;
}

export interface HandlerDeps {
  /** Node-only RAG loader. When omitted the handler answers from inline knowledge. */
  getRagSearcher?: () => Promise<RagSearcher | undefined>;
  /**
   * X-Forwarded-For may only be trusted behind a proxy that overwrites it
   * (Vercel, or a reverse proxy in front of Express). Defaults to false so a
   * directly-exposed server cannot be rate-limit-bypassed by spoofing XFF.
   */
  trustProxy?: boolean;
  /** Inject the current time; kept overridable for deterministic tests. */
  now?: () => Date;
}

export function createHandler(deps: HandlerDeps = {}) {
  const { getRagSearcher, trustProxy = false, now = () => new Date() } = deps;

  return async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
    res.setHeader('Cache-Control', 'no-store');

    const origin = req.headers?.origin as string | undefined;
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      const path = (req.url || '/').split('?')[0];

      // (1) Origin allowlist for state-changing requests — before rate
      // limiting so forged junk never consumes a budget.
      checkStateChangeOrigin(req.method, origin);

      // (3) Rate limit keyed on a client IP that cannot be spoofed unless
      // the adapter has explicitly vouched for a trustworthy proxy.
      const clientIp = getClientIp(req.headers || {}, req.socket?.remoteAddress, trustProxy);
      if (checkApiRateLimit(path, clientIp)) {
        res.status(429).json({ error: 'Too many requests. Please slow down.' });
        return;
      }

      // ─── GET /api/health ───────────────────────────────────────────────
      if ((path === '/api/health' || path === '/api/health/') && req.method === 'GET') {
        res.status(200).json({ status: 'ok', runtime: 'api', time: now().toISOString() });
        return;
      }

      // ─── POST /api/ask-twin ────────────────────────────────────────────
      if (path.startsWith('/api/ask-twin') && req.method === 'POST') {
        try {
          // Validate before opening the SSE stream so bad input gets a 400.
          validateAskTwinInput(req.body?.message, req.body?.history);
        } catch (err) {
          if (err instanceof ApiError) {
            res.status(err.status).json({ error: err.message });
            return;
          }
          throw err;
        }
        const rag = getRagSearcher ? await getRagSearcher() : undefined;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();

        try {
          for await (const event of streamAskTwin(
            req.body?.message,
            req.body?.history,
            rag,
            req.body?.context
          )) {
            res.write?.(`data: ${JSON.stringify(event)}\n\n`);
          }
          res.write?.('data: [DONE]\n\n');
          res.end();
        } catch (err) {
          // Headers are already sent — surface the failure as an SSE event.
          const message =
            err instanceof ApiError ? err.message : 'AI service unavailable. Please try again shortly.';
          console.error('[ask-twin] stream failed:', err);
          res.write?.(`data: ${JSON.stringify({ error: message })}\n\n`);
          res.write?.('data: [DONE]\n\n');
          res.end();
        }
        return;
      }

      // ─── POST /api/summarize-brief ─────────────────────────────────────
      if (path.startsWith('/api/summarize-brief') && req.method === 'POST') {
        res.json(await summarizeBrief(req.body));
        return;
      }

      // ─── GET /api/medium-stories ───────────────────────────────────────
      if (path.startsWith('/api/medium-stories') && req.method === 'GET') {
        const entry = await getMediumStories();
        applyValidatorHeaders(res, entry, 'public, max-age=900, stale-while-revalidate=86400');
        if (etagMatchesRequest(req, entry.etag)) {
          res.status(304).end();
          return;
        }
        res.json(entry.data);
        return;
      }

      // ─── GET /api/github-repos ─────────────────────────────────────────
      if (path.startsWith('/api/github-repos') && req.method === 'GET') {
        const entry = await getGithubRepos();
        applyValidatorHeaders(res, entry, 'public, max-age=3600, stale-while-revalidate=86400');
        if (etagMatchesRequest(req, entry.etag)) {
          res.status(304).end();
          return;
        }
        res.json(entry.data);
        return;
      }

      // ─── POST /api/contact ─────────────────────────────────────────────
      if (path.startsWith('/api/contact') && req.method === 'POST') {
        const result = await processContact(req.body);
        res.json({
          success: true,
          message: 'Transmission successfully established and analyzed.',
          ...result,
        });
        return;
      }

      // ─── GET /api/playground* (public read-only developer API) ──────────
      if (path === '/api/playground' && req.method === 'GET') {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.json(getPlaygroundIndex());
        return;
      }
      if (path === '/api/playground/papers' && req.method === 'GET') {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.json(getPlaygroundPapers());
        return;
      }
      if (path === '/api/playground/repos' && req.method === 'GET') {
        res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        res.json(await getPlaygroundRepos());
        return;
      }

      res.status(404).json({ error: 'API endpoint not found' });
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      console.error('API error:', err);
      res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
  };
}

function etagMatchesRequest(req: ApiRequest, etag: string): boolean {
  return etagMatches(req.headers?.['if-none-match'], etag);
}

function applyValidatorHeaders(
  res: ApiResponse,
  entry: { etag: string; fetchedAt: number },
  cacheControl: string
): void {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('ETag', entry.etag);
  res.setHeader('Last-Modified', new Date(entry.fetchedAt).toUTCString());
}
