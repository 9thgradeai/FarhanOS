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

/** Best-effort client IP extraction from proxy headers or socket. */
export function getClientIp(headersLike: Record<string, unknown>, remoteAddress?: string): string {
  const fwd = headersLike?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return remoteAddress || 'unknown';
}
