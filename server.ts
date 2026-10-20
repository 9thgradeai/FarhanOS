import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { pathToFileURL } from 'node:url';
import { createServer as createViteServer } from 'vite';
import compression from 'compression';
import { constants as zlibConstants } from 'node:zlib';
import { createHandler } from './api/core/request-handler.js';
import { getRagSearcher } from './api/knowledge-source.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

/**
 * Builds the Express app with compression, JSON parsing and the full /api
 * stack. Exported so authorization tests can exercise the REAL middleware;
 * callers decide how (or whether) to listen.
 *
 * The /api layer delegates to the SAME runtime-agnostic handler the Vercel
 * function uses, so origin/rate-limit/validation behaviour is identical
 * across deployment targets.
 */
export function createApp(): express.Express {
  const app = express();

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

  // ─── API (all endpoints handled by the shared framework-agnostic handler) ───
  const apiHandler = createHandler({
    getRagSearcher,
    // XFF is only trustworthy behind a reverse proxy that overwrites it.
    // The server binds 0.0.0.0, so trusting XFF by default would let anyone
    // bypass the per-IP rate limits with a forged header.
    trustProxy: process.env.TRUST_PROXY === '1',
  });

  app.use('/api', (req, res, next) => {
    // Post-response middleware registered after our handler is skipped, but
    // this one runs first and always delegates. `next('route')` is avoided so
    // the shared handler owns the full response lifecycle.
    void next;
    void apiHandler(
      {
        method: req.method,
        url: req.originalUrl || req.url,
        headers: req.headers as Record<string, any>,
        body: req.body,
        socket: req.socket,
      },
      res as any
    );
  });

  return app;
}

// ─── Main Server Boot & Vite Integration ─────────────────────────────────────

async function startServer() {
  const app = createApp();

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

// Boot only when executed directly (`tsx server.ts`); importing this module
// (e.g. from authorization tests) must never open a listener.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
