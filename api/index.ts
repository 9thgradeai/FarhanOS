/**
 * Vercel Serverless adapter. All business logic lives in
 * `api/core/request-handler.ts` (shared with the Express server). This file is
 * only the transport shim: it binds the frozen Node knowledge loader and
 * declares that the platform edge overwrites X-Forwarded-For.
 */
import { createHandler } from './core/request-handler.js';
import { getRagSearcher } from '../api/knowledge-source.js';

// Vercel overwrites X-Forwarded-For at its edge with the verified client IP,
// so trusting it here is safe (clients cannot spoof it) and keeps the per-IP
// rate limits meaningful.
export default createHandler({ getRagSearcher, trustProxy: true });
