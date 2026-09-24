/**
 * Vercel Serverless adapter. All business logic lives in api/core/*.
 */
import {
  ApiError,
  streamAskTwin,
  validateAskTwinInput,
  summarizeBrief,
  getMediumStories,
  getGithubRepos,
  processContact,
} from './core/handlers.js';
import { isAllowedOrigin, checkApiRateLimit, getClientIp } from './core/security.js';
import { etagMatches } from './core/cache.js';

let knowledgeLoader: Promise<typeof import('./knowledge-loader.js')> | null = null;
let knowledgeLoaderError: string | null = null;

async function getRagSearcher() {
  if (!knowledgeLoader && !knowledgeLoaderError) {
    knowledgeLoader = import('./knowledge-loader.js').catch((err) => {
      knowledgeLoaderError = err instanceof Error ? err.message : String(err);
      console.error('[knowledge] dynamic import failed:', knowledgeLoaderError);
      return null;
    });
  }
  const mod = await knowledgeLoader;
  return mod ? { searchKnowledge: mod.searchKnowledge } : undefined;
}

export default async function handler(req: any, res: any) {
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
    const clientIp = getClientIp(req.headers || {}, req.socket?.remoteAddress);

    if (checkApiRateLimit(path, clientIp)) {
      res.status(429).json({ error: 'Too many requests. Please slow down.' });
      return;
    }

    // ─── GET /api/health ─────────────────────────────────────────────────
    if ((path === '/api/health' || path === '/api/health/') && req.method === 'GET') {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ status: 'ok', runtime: 'vercel', time: new Date().toISOString() });
      return;
    }

    // ─── POST /api/ask-twin ──────────────────────────────────────────────
    if (path.startsWith('/api/ask-twin') && req.method === 'POST') {
      try {
        // Validate before opening the SSE stream so bad input gets a proper 400.
        validateAskTwinInput(req.body?.message, req.body?.history);
      } catch (err) {
        if (err instanceof ApiError) {
          res.status(err.status).json({ error: err.message });
          return;
        }
        throw err;
      }
      const rag = await getRagSearcher();
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders?.();

      try {
        for await (const event of streamAskTwin(req.body?.message, req.body?.history, rag, req.body?.context)) {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err) {
        // Headers are already sent — surface the failure as an SSE error event.
        const message =
          err instanceof ApiError ? err.message : 'AI service unavailable. Please try again shortly.';
        console.error('[ask-twin] stream failed:', err);
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
      return;
    }

    // ─── POST /api/summarize-brief ───────────────────────────────────────
    if (path.startsWith('/api/summarize-brief') && req.method === 'POST') {
      const result = await summarizeBrief(req.body);
      res.json(result);
      return;
    }

    // ─── GET /api/medium-stories ─────────────────────────────────────────
    if (path.startsWith('/api/medium-stories') && req.method === 'GET') {
      const entry = await getMediumStories();
      applyValidatorHeaders(res, entry, 'public, max-age=900');
      if (etagMatchesRequest(req, entry.etag)) {
        res.status(304).end();
        return;
      }
      res.json(entry.data);
      return;
    }

    // ─── GET /api/github-repos ───────────────────────────────────────────
    if (path.startsWith('/api/github-repos') && req.method === 'GET') {
      const entry = await getGithubRepos();
      applyValidatorHeaders(res, entry, 'public, max-age=3600');
      if (etagMatchesRequest(req, entry.etag)) {
        res.status(304).end();
        return;
      }
      res.json(entry.data);
      return;
    }

    // ─── POST /api/contact ───────────────────────────────────────────────
    if (path.startsWith('/api/contact') && req.method === 'POST') {
      const result = await processContact(req.body);
      res.json({
        success: true,
        message: 'Transmission successfully established and analyzed.',
        ...result,
      });
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
}

function etagMatchesRequest(req: any, etag: string): boolean {
  return etagMatches(req.headers?.['if-none-match'], etag);
}

function applyValidatorHeaders(
  res: any,
  entry: { etag: string; fetchedAt: number },
  cacheControl: string
): void {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('ETag', entry.etag);
  res.setHeader('Last-Modified', new Date(entry.fetchedAt).toUTCString());
}
