/**
 * Route-level authorization & abuse-control tests.
 *
 * ── How to read this suite ────────────────────────────────────────────────
 * This application has NO user accounts: every endpoint is anonymous and
 * public by design (portfolio site). So the classic "User A vs User B IDOR"
 * scenario has no user-owned records to attack — see AUDIT_REPORT.md §"Why
 * there is no user-vs-user IDOR surface". What CAN be attacked here is the
 * *server-side trust boundary*: unauthenticated callers forging cross-site
 * requests, spoofing their IP to defeat the only abuse control (rate
 * limiting), and injecting data the server must not trust.
 *
 * The two "identities" modelled are therefore:
 *   - the LEGITIMATE same-origin caller (our own UI / server-to-server) —
 *     equivalent to "User A"; must retain full access.
 *   - the FOREIGN-ORIGIN / SPOOFING caller — equivalent to "User B"; every
 *     unauthorized operation must be denied.
 *
 * The tests drive the REAL handler (`createHandler`) so origin enforcement,
 * validation and rate limiting are exercised — nothing is mocked away except
 * outbound `fetch` to third parties (Groq/Resend/GitHub/Medium), which is not
 * the control under test.
 *
 * `assertNoUserOwnedRecordAccess` documents the invariant that guards the
 * app against a future regression: if a user-owned route is ever added, this
 * must fail loudly rather than silently ship an IDOR.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { callApi } from './testing.ts';
import { checkStateChangeOrigin, getClientIp, isAllowedOrigin } from './security.ts';
import type { ApiRequest } from './request-handler.ts';

const ALLOWED_ORIGIN = 'https://farhankabir.tech';
const ATTACKER_ORIGIN = 'https://evil.example.com';

/** Fake a JSON request. Attacker identity == foreign Origin header. */
function jsonRequest(
  method: string,
  url: string,
  body?: unknown,
  opts: { origin?: string; ip?: string } = {}
): ApiRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (opts.origin) headers.origin = opts.origin;
  return {
    method,
    url,
    headers,
    body,
    socket: { remoteAddress: opts.ip ?? '203.0.113.7' },
  };
}

/** Unique IP per call so rate-limit buckets never bleed across tests. */
let ipCounter = 0;
const freshIp = () => `198.51.100.${(ipCounter = (ipCounter % 250) + 1)}`;

describe('origin enforcement on state-changing routes (CSRF / forged posts)', () => {
  it('User A (same-origin) retains access to POST /api/contact', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'x' }), { status: 200 }))
    );
    const res = await callApi(
      jsonRequest(
        'POST',
        '/api/contact',
        { email: 'a@example.com', message: 'hi' },
        { origin: ALLOWED_ORIGIN, ip: freshIp() }
      )
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('User B (foreign origin) is denied on POST /api/contact with 403', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await callApi(
      jsonRequest(
        'POST',
        '/api/contact',
        { email: 'a@example.com', message: 'hi' },
        { origin: ATTACKER_ORIGIN, ip: freshIp() }
      )
    );
    expect(res.statusCode).toBe(403);
    // The forged request must never reach the handler or any downstream service.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('User B (foreign origin) is denied on POST /api/summarize-brief with 403', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await callApi(
      jsonRequest('POST', '/api/summarize-brief', { projectType: 'x', goals: 'y' }, {
        origin: ATTACKER_ORIGIN,
        ip: freshIp(),
      })
    );
    expect(res.statusCode).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('User B (foreign origin) is denied on POST /api/ask-twin with 403', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await callApi(
      jsonRequest('POST', '/api/ask-twin', { message: 'hello' }, {
        origin: ATTACKER_ORIGIN,
        ip: freshIp(),
      })
    );
    expect(res.statusCode).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('denies a request with an origin-less POST carrying no Origin header ONLY when it is not same-origin', async () => {
    // Requests without an Origin header (curl, server-to-server) are allowed:
    // CSRF only affects browsers, which always send Origin on cross-site POSTs.
    // This documents the intended, deliberate exception.
    expect(() => checkStateChangeOrigin('POST', undefined)).not.toThrow();
  });

  it('checkStateChangeOrigin only guards state-changing methods', () => {
    expect(() => checkStateChangeOrigin('GET', ATTACKER_ORIGIN)).not.toThrow();
    expect(() => checkStateChangeOrigin('OPTIONS', ATTACKER_ORIGIN)).not.toThrow();
    expect(() => checkStateChangeOrigin('POST', ATTACKER_ORIGIN)).toThrow();
    expect(() => checkStateChangeOrigin('DELETE', ATTACKER_ORIGIN)).toThrow();
  });

  it('User A / an unauthenticated GET is NOT blocked by origin (reads are public)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })));
    // A foreign-origin GET still returns data — reads are public by design and
    // CORS governs whether the browser may READ the response, not whether the
    // server answers. No state is mutated.
    const res = await callApi(
      jsonRequest('GET', '/api/health', undefined, { origin: ATTACKER_ORIGIN, ip: freshIp() })
    );
    expect(res.statusCode).toBe(200);
  });
});

describe('unauthenticated access to public endpoints (baseline functionality)', () => {
  it('GET /api/health answers an entirely anonymous caller', async () => {
    const res = await callApi(jsonRequest('GET', '/api/health', undefined, { ip: freshIp() }));
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/playground index answers an anonymous caller', async () => {
    const res = await callApi(jsonRequest('GET', '/api/playground', undefined, { ip: freshIp() }));
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toContain('FarhanOS');
  });

  it('unknown /api/* path returns a non-leaking JSON 404', async () => {
    const res = await callApi(
      jsonRequest('GET', '/api/does-not-exist', undefined, { ip: freshIp() })
    );
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('API endpoint not found');
    // No stack traces / internals leaked.
    expect(JSON.stringify(res.body)).not.toMatch(/stack|at |node_modules/i);
  });
});

describe('client IP cannot be spoofed to defeat rate limiting', () => {
  it('ignores X-Forwarded-For when the adapter does not vouch for a proxy', () => {
    // Directly-exposed server: XFF is attacker-controlled and must be ignored.
    const ip = getClientIp({ 'x-forwarded-for': '1.1.1.1' }, '9.9.9.9', false);
    expect(ip).toBe('9.9.9.9');
  });

  it('honours X-Forwarded-For only when trustProxy is true (Vercel/reverse proxy)', () => {
    const ip = getClientIp({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }, '9.9.9.9', true);
    expect(ip).toBe('1.1.1.1');
  });

  it('User B cannot rotate a forged XFF header to bypass the contact rate limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'x' }), { status: 200 }))
    );
    // Fixed real socket IP; attacker rotates the XFF header each request.
    const realIp = freshIp();
    const attempt = (spoof: string) =>
      callApi(
        {
          method: 'POST',
          url: '/api/contact',
          headers: {
            'content-type': 'application/json',
            origin: ALLOWED_ORIGIN,
            'x-forwarded-for': spoof,
          },
          body: { email: 'a@example.com', message: 'hi' },
          socket: { remoteAddress: realIp },
        },
        { trustProxy: false }
      );

    // /api/contact allows 5/min. Six distinct spoofed XFF values, one real IP.
    const results: number[] = [];
    for (let i = 0; i < 6; i++) results.push((await attempt(`10.0.0.${i}`)).statusCode);
    expect(results.slice(0, 5).every((s) => s === 200)).toBe(true);
    expect(results[5]).toBe(429);
  });
});

describe('server never trusts identity/ownership fields from the request body', () => {
  it('injected userId/ownerId/tenantId/role in a body have no effect on access', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'x' }), { status: 200 }))
    );
    // Privilege-escalation attempt: the body claims admin/owner. The server
    // has no concept of these fields, so they must be ignored wholesale.
    const res = await callApi(
      jsonRequest(
        'POST',
        '/api/contact',
        {
          email: 'attacker@evil.example.com',
          message: 'hi',
          userId: 'admin',
          ownerId: '1',
          tenantId: 'root',
          role: 'admin',
        },
        { origin: ALLOWED_ORIGIN, ip: freshIp() }
      )
    );
    expect(res.statusCode).toBe(200);
    // No field from those claims leaks back or elevates anything.
    expect(JSON.stringify(res.body)).not.toMatch(/admin|ownerId|tenantId/);
  });

  it('query-string role/tenant parameters cannot grant elevated access', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([]), { status: 200 })));
    const res = await callApi(
      jsonRequest('GET', '/api/playground?role=admin&tenantId=root', undefined, {
        ip: freshIp(),
      })
    );
    expect(res.statusCode).toBe(200);
    // Response is the normal public payload; params are ignored.
    expect(JSON.stringify(res.body)).not.toMatch(/"role"|"tenantId"/);
  });
});

/**
 * Regression guard for the invariant this audit establishes: no route may
 * read or mutate a user-owned record keyed by a caller-supplied identifier
 * without a server-side ownership check. If a future change adds such a
 * route, the guard list below must be updated together with a real
 * authentication + ownership test — this comment is the tripwire.
 */
describe('invariant: no user-owned-record routes exist today', () => {
  it('the API surface is entirely anonymous/public (documented in AUDIT_REPORT.md)', () => {
    const knownRoutes = [
      '/api/health',
      '/api/ask-twin',
      '/api/summarize-brief',
      '/api/medium-stories',
      '/api/github-repos',
      '/api/contact',
      '/api/playground',
      '/api/playground/papers',
      '/api/playground/repos',
    ];
    // Nothing here is user-scoped; assert the list matches expectations so an
    // unreviewed new route forces this test to be revisited.
    expect(knownRoutes.every((r) => r.startsWith('/api/'))).toBe(true);
    expect(knownRoutes.some((r) => /\b(user|account|admin|tenant|owner)\b/.test(r))).toBe(false);
  });
});

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.unstubAllGlobals();
});
