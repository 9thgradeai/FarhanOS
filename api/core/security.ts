/**
 * Shared security primitives. Web-API only — safe for Node, Vercel,
 * Deno and Supabase Edge runtimes.
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const ALLOWED_ORIGINS = [
  'https://farhankabir.tech',
  'https://www.farhankabir.tech',
  'https://farhankabir.me',
  'https://www.farhankabir.me',
];

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // same-origin / server-to-server requests carry no Origin
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/farhanos-[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/farhanos\.vercel\.app$/.test(origin)) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

/**
 * Rejects state-changing requests forged from a foreign origin (CSRF-style
 * abuse of the contact form and AI endpoints). CORS alone is NOT an
 * authorization control: browsers still deliver cross-site POSTs (e.g. via
 * <form> in no-cors mode) even when the response is unreadable, so the
 * server must refuse them. Requests with no Origin header (curl,
 * server-to-server, same-origin navigations) are unaffected.
 * Throws ApiError(403) when the request must be refused.
 */
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function checkStateChangeOrigin(method: string | undefined, origin: string | undefined): void {
  if (!method || !STATE_CHANGING_METHODS.has(method.toUpperCase())) return;
  if (origin === undefined) return; // non-browser clients; CSRF only applies to browsers
  if (!isAllowedOrigin(origin)) {
    throw new ApiError(403, 'Origin not allowed.');
  }
}

/**
 * fetch with mandatory timeout so a hung upstream socket can't pin the runtime.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Escape untrusted text before embedding it into HTML emails. */
export function escapeHtml(text: unknown): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Cap any user-supplied string to a sane length. */
export function clamp(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : '';
}

// ─── Rate limiting ───────────────────────────────────────────────────────────

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    if (rateBuckets.size > 10_000) {
      // opportunistic sweep to bound memory
      for (const [k, v] of rateBuckets) {
        if (now > v.resetAt) rateBuckets.delete(k);
      }
    }
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

export interface RateRule {
  prefix: string;
  limit: number;
  windowMs: number;
}

/** Metered endpoints get tighter budgets than plain reads. */
const RATE_RULES: RateRule[] = [
  { prefix: '/api/ask-twin', limit: 20, windowMs: 60_000 },
  { prefix: '/api/summarize-brief', limit: 10, windowMs: 60_000 },
  { prefix: '/api/contact', limit: 5, windowMs: 60_000 },
  { prefix: '/api/playground', limit: 30, windowMs: 3_600_000 },
];

const GLOBAL_RULE: RateRule = { prefix: '/api/', limit: 120, windowMs: 60_000 };

/**
 * Fixed-window in-memory rate limiting (per warm instance).
 * Returns true when the request should be rejected with 429.
 */
export function checkApiRateLimit(path: string, clientIp: string): boolean {
  const specific = RATE_RULES.find((r) => path.startsWith(r.prefix));
  if (specific) {
    return isRateLimited(`${clientIp}:${specific.prefix}`, specific.limit, specific.windowMs);
  }
  if (path.startsWith(GLOBAL_RULE.prefix)) {
    return isRateLimited(`${clientIp}:global`, GLOBAL_RULE.limit, GLOBAL_RULE.windowMs);
  }
  return false;
}

/**
 * Best-effort client IP extraction.
 *
 * The X-Forwarded-For header is attacker-controlled whenever the server is
 * reachable directly (the Express server binds 0.0.0.0), so it is only
 * honoured when the caller has explicitly enabled trust:
 *   - Express: set TRUST_PROXY=1 (only when behind YOUR trusted reverse
 *     proxy, which must overwrite XFF).
 *   - Vercel: the platform always overwrites XFF with the verified client
 *     IP, so the adapter passes trustProxy=true.
 * Otherwise the socket peer address is used, which cannot be spoofed and
 * keeps the per-IP rate limits (the only abuse control on these anonymous
 * endpoints) un-bypassable.
 */
export function getClientIp(
  headersLike: Record<string, unknown>,
  remoteAddress?: string,
  trustProxy = false
): string {
  if (trustProxy) {
    const fwd = headersLike?.['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  }
  return remoteAddress || 'unknown';
}
