import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import compression from 'compression';
import { constants as zlibConstants } from 'node:zlib';
import {
  ApiError,
  streamAskTwin,
  validateAskTwinInput,
  summarizeBrief,
  getMediumStories,
  getGithubRepos,
  processContact,
} from './api/core/handlers.js';
import { isAllowedOrigin, checkApiRateLimit, getClientIp } from './api/core/security.js';
import { etagMatches } from './api/core/cache.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(compression({
  threshold: 1024,
  level: 9,
  brotli: {
    enabled: true,
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
      [zlibConstants.BROTLI_PARAM_LGWIN]: 22,
    },
  } as any,
}));
app.use(express.json({ limit: '128kb' }));
app.disable('x-powered-by');

// ─── Shared middleware ───────────────────────────────────────────────────────

app.use('/api', (req, res, next) => {
  const origin = req.headers.origin as string | undefined;
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

  // originalUrl is absolute (/api/...) while req.path is mount-relative.
  const apiPath = (req.originalUrl || req.url).split('?')[0];
  const clientIp = getClientIp(req.headers as Record<string, unknown>, req.socket?.remoteAddress);
  if (checkApiRateLimit(apiPath, clientIp)) {
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
    return;
  }
  next();
});

// RAG wiring — Node-only fs loader shared with the Vercel adapter.
type RagSearcher = Parameters<typeof streamAskTwin>[2];
let ragSearcher: RagSearcher | undefined;
let ragLoadAttempted = false;
async function getRagSearcher(): Promise<RagSearcher | undefined> {
  if (ragLoadAttempted) return ragSearcher;
  ragLoadAttempted = true;
  try {
    const mod = await import('./api/knowledge-loader.js');
    ragSearcher = { searchKnowledge: mod.searchKnowledge };
  } catch (err) {
    console.error('[knowledge] load failed:', err);
  }
  return ragSearcher;
}

// ─── API routes (logic in api/core) ──────────────────────────────────────────

app.post('/api/ask-twin', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    // Validate before opening the SSE stream so bad input gets a proper 400.
    validateAskTwinInput(req.body?.message, req.body?.history);
  } catch (err) {
    respondError(res, err);
    return;
  }
  const rag = await getRagSearcher();
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
  try {
    for await (const event of streamAskTwin(req.body?.message, req.body?.history, rag)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[ask-twin] stream failed:', err);
    const message =
      err instanceof ApiError ? err.message : 'AI service unavailable. Please try again shortly.';
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.post('/api/summarize-brief', async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store');
    res.json(await summarizeBrief(req.body));
  } catch (err) {
    respondError(res, err);
  }
});

function applyValidatorHeaders(
  res: express.Response,
  entry: { etag: string; fetchedAt: number },
  cacheControl: string
): void {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('ETag', entry.etag);
  res.setHeader('Last-Modified', new Date(entry.fetchedAt).toUTCString());
}

app.get('/api/medium-stories', async (req, res) => {
  try {
    const entry = await getMediumStories();
    applyValidatorHeaders(res, entry, 'public, max-age=900');
    if (etagMatches(req.headers['if-none-match'], entry.etag)) {
      res.status(304).end();
      return;
    }
    res.json(entry.data);
  } catch (err) {
    respondError(res, err);
  }
});

app.get('/api/github-repos', async (req, res) => {
  try {
    const entry = await getGithubRepos();
    applyValidatorHeaders(res, entry, 'public, max-age=3600');
    if (etagMatches(req.headers['if-none-match'], entry.etag)) {
      res.status(304).end();
      return;
    }
    res.json(entry.data);
  } catch (err) {
    respondError(res, err);
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const result = await processContact(req.body);
    res.json({
      success: true,
      message: 'Transmission successfully established and analyzed.',
      ...result,
    });
  } catch (err) {
    respondError(res, err);
  }
});

// Liveness probe for the status chips in the UI. Cheap, unauthenticated,
// never indexed (robots.txt disallows /api/).
app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    runtime: 'node',
    uptimeSeconds: Math.round(process.uptime()),
    time: new Date().toISOString(),
  });
});

// Unknown /api/* paths must never fall through to the SPA HTML shell —
// API consumers get a JSON 404 for any method. Registered before static
// serving and the SPA fallback so it holds in both dev and production.
app.all('/api/*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(404).json({ error: 'API endpoint not found' });
});

function respondError(res: express.Response, err: unknown): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error('API error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  } else {
    res.end();
  }
}

// ─── Main Server Boot & Vite Integration ─────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Baseline security headers for crawlers and browsers (mirrors vercel.json).
    // Never weakens auth/security; purely additive hardening headers.
    app.use((_req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
      );
      next();
    });
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.woff2')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Access-Control-Allow-Origin', '*');
        }
        if (/robots\.txt|sitemap\.xml|llms\.txt$/.test(filePath)) {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
      },
    }));
    // Serve crawler files explicitly so SPA fallback never swallows them.
    for (const f of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
      app.get(`/${f}`, (_req, res) => {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(path.join(distPath, f));
      });
    }
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FarhanOS full-stack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
