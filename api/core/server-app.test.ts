/**
 * Integration tests for the Express adapter (`createApp`) — these run the
 * REAL middleware stack (compression, JSON body parsing, the shared /api
 * handler) over a live loopback listener. Only outbound third-party fetch is
 * faked. This is the closest reproduction of production behaviour for the
 * Node deployment target and complements the unit-level tests in
 * `authorization.test.ts`.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../../server.ts';

let server: Server;
let base: string;

/** Minimal HTTP client using node:http so vi.stubGlobal('fetch') (which the
 *  app under test legitimately uses for outbound calls) never hijacks the
 *  test's own request to the loopback server. */
function httpRequest(
  path: string,
  opts: { method?: string; headers?: Record<string, string>; body?: string } = {}
): Promise<{ status: number; headers: Record<string, string>; text: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(base + path);
    import('node:http').then(({ request }) => {
      const req = request(
        {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: opts.method || 'GET',
          headers: opts.headers,
        },
        (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (c) => (data += c));
          res.on('end', () =>
            resolve({
              status: res.statusCode || 0,
              headers: res.headers as Record<string, string>,
              text: data,
            })
          );
        }
      );
      req.on('error', reject);
      if (opts.body) req.write(opts.body);
      req.end();
    });
  });
}

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const ALLOWED = 'https://farhankabir.tech';
const ATTACKER = 'https://evil.example.com';

describe('Express adapter: origin enforcement on state-changing routes', () => {
  it('accepts a same-origin POST /api/contact (legitimate owner path)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'x' }), { status: 200 }))
    );
    const res = await httpRequest('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ALLOWED },
      body: JSON.stringify({ email: 'a@example.com', message: 'hello' }),
    });
    expect(res.status).toBe(200);
    expect(JSON.parse(res.text).success).toBe(true);
  });

  it('rejects a foreign-origin POST /api/contact with 403 and never calls downstream', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await httpRequest('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ATTACKER },
      body: JSON.stringify({ email: 'a@example.com', message: 'hello' }),
    });
    expect(res.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a foreign-origin POST /api/ask-twin with 403', async () => {
    const res = await httpRequest('/api/ask-twin', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ATTACKER },
      body: JSON.stringify({ message: 'hello' }),
    });
    expect(res.status).toBe(403);
  });
});

describe('Express adapter: public reads & error behaviour', () => {
  it('serves GET /api/health to an anonymous caller', async () => {
    const res = await httpRequest('/api/health');
    expect(res.status).toBe(200);
    expect(JSON.parse(res.text).status).toBe('ok');
  });

  it('returns a non-leaking JSON 404 for unknown /api routes', async () => {
    const res = await httpRequest('/api/nope');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/json');
    expect(JSON.parse(res.text).error).toBe('API endpoint not found');
  });

  it('does not advertise the server technology (x-powered-by disabled)', async () => {
    const res = await httpRequest('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('Express adapter: rate limiting is keyed on the unspoofable socket IP', () => {
  it('a forged, rotating X-Forwarded-For cannot bypass the /api/contact limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: 'x' }), { status: 200 }))
    );
    // /api/contact allows 5/min per real IP. Earlier tests in this file share
    // the loopback socket IP, so send well past the window to guarantee the
    // bucket is exhausted, then confirm spoofed XFF still cannot get through.
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) {
      const res = await httpRequest('/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: ALLOWED,
          'x-forwarded-for': `10.9.9.${i}`, // attacker rotates a forged header
        },
        body: JSON.stringify({ email: 'a@example.com', message: 'hi' }),
      });
      statuses.push(res.status);
    }
    // At least one request was rejected despite a fresh forged XFF each time…
    expect(statuses).toContain(429);
    // …and once throttled, a brand-new spoofed IP does not restore access.
    const last = await httpRequest('/api/contact', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: ALLOWED,
        'x-forwarded-for': '172.16.0.1',
      },
      body: JSON.stringify({ email: 'a@example.com', message: 'hi' }),
    });
    expect(last.status).toBe(429);
  });
});
