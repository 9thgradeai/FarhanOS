# Security Audit 2: Route-Level Authorization and Record Ownership

**Date:** 2026-10-20  
**Target:** FarhanOS (Express + Vercel Serverless, TypeScript)  
**Auditor:** senior backend security engineer (automated)  
**Scope:** every route, server action, RPC endpoint, data-access operation, background job, file access, export, nested resource, and alternate route

## 1) Inventory of all endpoints / server actions / RPCs

### Express adapter (`server.ts`) + shared handler (`api/core/request-handler.ts`)
The two deployment adapters (Express + Vercel) **now share a single runtime-agnostic handler**, so authorization/rate-limiting/validation behaviour is identical across targets.

| # | Method | Path | Handler location | Invocation type | Auth mechanism | Required role / permission | Resource accessed | Ownership / tenant verification | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `GET` | `/api/health` | `api/core/request-handler.ts:createHandler` | HTTP GET | **None** (anonymous) | None | Liveness metadata (runtime, uptime, time) | N/A — no user/tenant data | Never indexed; cheap. |
| 2 | `POST` | `/api/ask-twin` | `api/core/request-handler.ts` → `handlers.streamAskTwin` | HTTP POST (SSE response) | **None** (anonymous) | None | AI chat over public portfolio knowledge (Groq) + optional RAG over public `knowledge/*.md` | N/A — no user-owned records read/written | Input validated by `validateAskTwinInput` (message clamped 4000, history ≤40). Tools limited to allowlisted client actions + 2 read-only server tools. **Origin enforced** on POST. |
| 3 | `POST` | `/api/summarize-brief` | `api/core/request-handler.ts` → `handlers.summarizeBrief` | HTTP POST (JSON) | **None** (anonymous) | None | Groq completion (brief summary) | N/A | Requires `projectType` and `goals`. Clamped. **Origin enforced** on POST. |
| 4 | `GET` | `/api/medium-stories` | `api/core/request-handler.ts` → `handlers.getMediumStories` | HTTP GET | **None** (anonymous) | None | Public Medium RSS (cached 15m, ETag/Last-Modified, `304` supported) | N/A | Outbound fetch to third party; no user data. |
| 5 | `GET` | `/api/github-repos` | `api/core/request-handler.ts` → `handlers.getGithubRepos` | HTTP GET | **None** (anonymous) | None | Public GitHub API (cached 1h) | N/A | Token optional (`GITHUB_TOKEN`). No user data. |
| 6 | `POST` | `/api/contact` | `api/core/request-handler.ts` → `handlers.processContact` | HTTP POST (JSON) | **None** (anonymous) | None | Sends email via Resend (best-effort AI analysis) | N/A — writes to owner inbox only; no user-owned records stored/read by the caller | Input validated (email required+format, message required). HTML escaped. **Origin enforced** on POST. |
| 7 | `GET` | `/api/playground` | `api/core/request-handler.ts` | HTTP GET | **None** (anonymous) | None | Public index document | N/A | Read-only. |
| 8 | `GET` | `/api/playground/papers` | `api/core/request-handler.ts` | HTTP GET | **None** (anonymous) | None | Public `portfolioData.papers` | N/A | Read-only, public on-site data. |
| 9 | `GET` | `/api/playground/repos` | `api/core/request-handler.ts` → `handlers.getPlaygroundRepos` | HTTP GET | **None** (anonymous) | None | Derives from cached public GitHub repos | N/A | Read-only. |
| 10 | `*` | `/api/*` (fallback) | `api/core/request-handler.ts` | HTTP any | **None** (anonymous) | None | N/A | N/A | Returns JSON `404 { "error": "API endpoint not found" }`; never falls through to SPA HTML. |

### Server actions / “agent” operations
| Operation | Type | Auth | Ownership check | Notes |
|---|---|---|---|---|
| Assistant tool `open_os_window` | Client action (validated server-side, executed in browser) | Anonymous (UI action) | N/A — affects visitor's own UI only | Validated against `OS_WINDOW_IDS` allowlist. |
| Assistant tool `switch_os_theme` | Client action | Anonymous | N/A | Validated against `OS_THEMES`. |
| Assistant tool `open_external_link` | Client action | Anonymous | N/A | Validated against `LINK_ALLOWLIST` + owned GitHub path regex. |
| Server tool `get_live_github_repos` | Server-side fetch (triggered by model) | Anonymous | N/A | Read-only public data; uses cached `getGithubRepos`. |
| Server tool `get_recent_medium_stories` | Server-side fetch | Anonymous | N/A | Read-only public data. |

### Background jobs / file access / exports / dynamic routes
| Item | Type | Notes |
|---|---|---|
| Knowledge loader (`api/knowledge-loader.ts`) | File read (Node-only) | Reads `knowledge/**/*.md` at runtime/index time; all docs have `public: true`. No user-uploaded files, no per-user paths, no IDOR surface. |
| Crawler/static files (`robots.txt`, `sitemap.xml`, `llms.txt`) | Static file access | Public, cached 1h. |
| Vite assets | Static | Immutable cache; no user data. |
| `scripts/submit-indexnow.mjs` | One-shot script | No network-exposed route; not a web endpoint. |

### Vercel routing
`vercel.json` rewrites `/api/(.*)` → `/api/index.ts` (shared handler with `trustProxy: true` because Vercel overwrites `X-Forwarded-For`). No user-scoped rewrites/paths exist.

## 2) Trace of authenticated identity

There is **no authentication system** in this codebase (no sessions, no JWT, no cookies, no OAuth, no passwords, no user table). The “identity” available to the server is:

1. `req.headers.origin` — browser-supplied, used only for **origin allowlisting on state-changing requests** (not as an identity). CORS is not authorization.
2. Client IP — derived by `getClientIp(headers, remoteAddress, trustProxy)`. **X-Forwarded-For is ONLY honoured when `trustProxy === true`** (Vercel sets this; Express requires `TRUST_PROXY=1`). On a directly-exposed Express server, spoofed `X-Forwarded-For` is **ignored** and the unspoofable socket peer address is used. This prevents an attacker from rotating headers to bypass per-IP rate limits.
3. Nothing from the request body/query/string is trusted as identity/role/ownership/tenant. All fields are either validated against allowlists (`window`, `theme`, `url`) or clamped/escaped (`clamp`, `escapeHtml`).

**Conclusion:** “Authenticated identity” is effectively *anonymous*. There are no user-owned resources to scope to a userId/ownerId/tenantId. Any future route that does introduce user ownership **must** derive the identity from a trusted server-side session/token (never from client-supplied fields) and enforce ownership with a DB query scoped to that identity.

## 3) Ownership / tenant verification
**None required today** because no endpoint reads or mutates user-owned records. All data is either public (site content, GitHub, Medium, playground data) or written only to the owner’s inbox (`contact` → `farhankabir236@gmail.com`) with no caller-scoped retrieval path. 

Guard added in tests (`api/core/authorization.test.ts`) to fail the invariant review if user-scoped routes appear without updating the suite.

## 4) Admin access
No admin concept exists. No route grants admin privileges via client state. No mechanism to escalate role exists. Safe.

## 5) Authorization on every request / alternate routes / bulk / background
- Origin allowlisting enforced on **all state-changing methods** (`POST/PUT/PATCH/DELETE`) via `checkStateChangeOrigin` **before** rate limiting.
- Every `/api/*` path is handled by the shared handler; unknown paths return JSON 404.
- No bulk-delete/update routes; no background worker routes exposed over HTTP; no alternate “admin” paths.
- Rate limiting remains keyed on an unspoofable IP when not behind a trusted proxy.

## 6) Error behaviour (non-leaking)
- Unauthenticated/anonymous requests: **allowed** where endpoints are public by design; no 401s exist because there is nothing to authenticate against.
- Unauthorized resource access (e.g., forged cross-site POST): **403** via `checkStateChangeOrigin` → `ApiError(403, "Origin not allowed.")`.
- Not found: **404** `{ "error": "API endpoint not found" }` for unknown `/api/*`.
- Bad input: **400** from `ApiError`.
- Upstream failures: **502/503** as appropriate, messages sanitized.
- **No stack traces leaked** to JSON responses.

## 7) Exact code changes (hardening applied)

| File | Change | Rationale |
|---|---|---|
| `api/core/security.ts` | Added `checkStateChangeOrigin(method, origin)` — throws `ApiError(403, "Origin not allowed.")` if a browser-supplied foreign origin makes a state-changing request. Browsers still send cross-site POSTs in no-cors `<form>` scenarios, so CORS alone is insufficient. | **Prevents forged cross-site requests** (contact spam / unnecessary Groq spend / abuse). Enforced **before** rate limiting. |
| `api/core/security.ts` | Changed `getClientIp(headers, remoteAddress, trustProxy = false)`. **X-Forwarded-For is ignored unless `trustProxy` is true.** Takes first hop only when trusted. | **Prevents IP spoofing** from bypassing per-IP rate limits on directly-exposed servers. Vercel/Express behind trusted proxy must opt in. |
| `api/core/request-handler.ts` *(new)* | **Single runtime-agnostic handler** used by both adapters. Enforces origin on state-changes, uses non-spoofable IP by default, validates inputs, returns non-leaking errors. Knowledge searcher injected via deps (no `node:fs` in the handler). | **Single source of truth** — eliminates drift between Express and Vercel adapters; makes behaviour testable with real middleware. |
| `api/knowledge-source.ts` *(new)* | Node-only adapter that lazy-loads `api/knowledge-loader.js` and injects it into the shared handler. | Keeps fs-backed code out of the handler’s transport-agnostic path. |
| `api/index.ts` | Rewritten as thin Vercel adapter delegating to `createHandler` with `trustProxy: true` (Vercel overwrites XFF at edge). | Correct trust boundary for the platform. |
| `server.ts` | `createApp()` exported (testable), mounts shared handler at `/api` with `trustProxy: process.env.TRUST_PROXY === '1'`, boots only when run directly via `import.meta.url` check, disables `x-powered-by`. | Enables **real middleware integration tests**; correct defaults for directly-exposed server. |
| `api/core/testing.ts` *(new)* | Test harness driving the **real** handler (no middleware mocked away). | Supports testing without stubbing the controls under test. |
| `api/core/authorization.test.ts` *(new)* | Two-identity model tests (legitimate same-origin vs foreign-origin attacker), unauthenticated access, spoofed-XFF bypass attempts, body/query injection of `userId/ownerId/tenantId/role`, invariant guard for future user-owned routes. | Meets the verification requirements. |
| `api/core/server-app.test.ts` *(new)* | **Real Express integration tests** against a loopback server using `node:http` (unaffected by `fetch` stubs) — origin enforcement, unknown-route 404, `x-powered-by` disabled, rate-limit keyed on unspoofable IP. | Exercises the **real authorization middleware** as requested. |
| `api/core/security.test.ts` | Extended with tests for `getClientIp` trust-proxy behaviour and `checkStateChangeOrigin`. | Coverage for new primitives. |

## 8) Negative and positive test results

Ran with: `npx vitest run` (and targeted runs).

```
Test Files  11 passed (11)
     Tests  139 passed (139)
  Duration  ~10.00s
TypeScript: `npx tsc --noEmit` → clean (no output)
```

### Key scenarios verified

| Scenario | Expected | Result |
|---|---|---|
| User A (same-origin `https://farhankabir.tech`) POST `/api/contact` | **Allowed** | ✅ 200, downstream called, success response |
| User B (foreign `https://evil.example.com`) POST `/api/contact` | **Denied 403, no downstream call** | ✅ 403, `fetch` spy not called |
| User B POST `/api/summarize-brief` (foreign origin) | **Denied 403** | ✅ 403 |
| User B POST `/api/ask-twin` (foreign origin) | **Denied 403** | ✅ 403 |
| Origin-less POST (curl/server-to-server) | **Allowed** (CSRF only affects browsers) | ✅ No throw |
| GET requests from foreign origin | **Allowed** (public reads; CORS governs browser response access) | ✅ 200 |
| Unauthenticated GET `/api/health`, GET `/api/playground` | **Allowed** | ✅ 200 |
| Unknown `/api/*` | **404 JSON, non-leaking** | ✅ 404 `{ "error": "API endpoint not found" }` |
| `X-Forwarded-For` spoof on directly-exposed server | **Ignored; rate limit keyed on socket IP** | ✅ 6th request throttled to 429 despite rotating forged XFF |
| `X-Forwarded-For` honoured only with `trustProxy: true` | **First hop used** | ✅ Verified |
| Body contains `userId/ownerId/tenantId/role: "admin"` | **Ignored; no escalation** | ✅ Normal response, no leaked fields |
| Query string contains `role=admin&tenantId=root` | **Ignored** | ✅ Normal public payload |
| Express `x-powered-by` | **Disabled** | ✅ `undefined` |
| State-changing methods (`PUT/PATCH/DELETE`) from foreign origin | **Denied 403** | ✅ Verified |

## 9) List of unprotected routes

**None.**

Every HTTP route and alternate path is accounted for:

- All known `/api/*` endpoints are handled by the shared handler with origin enforcement on state changes, input validation, and IP-based rate limiting.
- The catch-all `app.all('/api/*')` / handler fallback returns JSON 404.
- Static/crawler files have no dynamic authorization surface (public).
- No hidden admin/debug routes, no background HTTP endpoints, no bulk endpoints, no file-download/export endpoints scoped to users exist.

**Important note about the “unprotected” classification:** these endpoints are intentionally **anonymous and public** (a portfolio site). They are not “unprotected” in the sense of missing authorization — there is *nothing to authorize against*. The hardening added (origin allowlist on POST, non-spoofable rate-limit keys) addresses real abuse vectors without inventing an auth system.

## Quick verification commands
```bash
# Type check
npx tsc --noEmit

# All tests (including new authorization + Express integration)
npm test

# Targeted
npx vitest run api/core/authorization.test.ts api/core/server-app.test.ts api/core/security.test.ts
```
