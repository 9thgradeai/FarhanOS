# SEO / AI-Search Implementation — FarhanOS

Production URL: https://farhankabir.tech/ (see `public/CNAME`)
Framework: React 19 + Vite 6 SPA (client-rendered), Express (`server.ts`) for
local/prod serving, Vercel static-build + Node API (`api/index.ts`).

> Architecture note: this is a **single-page application with one canonical
> indexable URL** (`/`). "Pages" (About, Skills, Projects, Research, Contact)
> are same-URL anchor sections (`/#about`, …) and OS windows — not separate
> routes. The SEO strategy below is deliberately built around that reality:
> no fake subpage URLs in sitemaps, canonicals, or llms.txt.

## 1. Metadata architecture

- All head metadata lives in `index.html` (single entry point; no router, so
  no per-route metadata system is needed or faked).
- Unique title + description, canonical, robots (`index, follow,
  max-image-preview:large`), `lang="en"`, viewport, theme-color.
- Open Graph (`og:title/description/image/url/type/site_name/locale`) +
  `twitter:card=summary_large_image` with absolute URLs.
- Search-verification placeholders are commented out in `index.html`
  (`google-site-verification`, `msvalidate.01`) — uncomment and fill with
  real tokens when available.

## 2. Sitemap / robots

- `public/sitemap.xml`: single canonical URL, absolute, `lastmod` maintained
  manually (anchor sections excluded on purpose — crawlers must not see
  duplicate/noindex URLs).
- `public/robots.txt`: `Allow: /`, `Disallow: /api/` (app data endpoints),
  references sitemap. No AI-crawler blocks.
- `server.ts` serves `robots.txt`/`sitemap.xml`/`llms.txt` explicitly so the
  SPA fallback never swallows them; `vercel.json` gives them
  `Cache-Control: public, max-age=3600`.

## 3. Canonical strategy

- Exactly one canonical: `https://farhankabir.tech/` (`<link rel=canonical>`).
- `vercel.json` redirects: `www.` → apex (301), trailing-slash variants →
  clean URLs (`cleanUrls`, `trailingSlash: false`).
- No query-param duplicates exist (no search/filter URLs are indexable).

## 4. Structured data (`index.html`, JSON-LD `@graph`)

- `Person` (Farhan Kabir): jobTitle, description, `knowsAbout`, and `sameAs`
  links limited to verified profiles (GitHub, LinkedIn, Medium, X,
  Instagram, Gravatar — all present in repo/landing code).
- `WebSite` (`inLanguage: en`) + `ProfilePage` with `mainEntity` → Person.
- No ratings, reviews, FAQs, or credentials invented. Papers/projects schema
  intentionally omitted: that content renders client-side and schema must
  match visible, crawler-accessible content.

## 5. AI-search / AEO / GEO

- `<main id="main-content">` landmark + one `sr-only` H1; section H2s and
  card H3s already hierarchical in `LandingBelowFold.tsx`.
- `public/llms.txt`: entity summary, anchor-section map, verified profiles
  (optional convention only — not a replacement for sitemap/robots/schema).
- Entity clarity sourced from `knowledge/profile/overview.md` and
  `src/data/portfolioData.ts` — no invented credentials.

## 6. Analytics

- Plausible via `VITE_PLAUSIBLE_DOMAIN` (`src/utils/analytics.ts`,
  `src/config/site.ts`). Empty = silent no-op. No duplicate tracking; no
  secrets in frontend code.

## 7. Search Console / Bing setup (manual)

1. Add real tokens to the commented meta tags in `index.html`, deploy.
2. Google Search Console → verify → submit
   `https://farhankabir.tech/sitemap.xml`.
3. Bing Webmaster Tools → verify (`msvalidate.01`) → submit sitemap.

## 8. Performance / a11y foundations (preserved)

- Existing: code-split OS windows, lazy below-fold + 3D scene (mobile
  skips WebGL), AVIF/WebP responsive avatar with dimensions (no CLS),
  preconnect/dns-prefetch, `prefers-reduced-motion` support, skip links,
  focus-trapped mobile menu, aria-live announcer.
- Not changed: visual design, Three.js scene, animation system.

## 9. Security preserved

- Additive headers only (`X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options: DENY`, `Permissions-Policy`, existing CSP in
  `vercel.json`). No auth/rate-limit changes; `/api/` disallowed for
  crawlers, not exposed.

## 10. Error handling

- SPA fallback in `server.ts` skips `/api/*` (API errors stay JSON with
  proper status codes via `respondError`). Crawler files served before
  fallback. No custom 404 route exists (SPA) — out-of-scope, not faked.

## 10b. IndexNow (instant indexing for Bing and co.)

- Key: `0ae717e33cd8c662e87b4ece3a89aa05`, hosted at
  `public/0ae717e33cd8c662e87b4ece3a89aa05.txt` → served from `dist/` by both
  Express static middleware and the Vercel static build (no extra config;
  the SPA fallback never swallows it because the file exists in `dist/`).
- Submit script: `scripts/submit-indexnow.mjs` (`npm run seo:submit-indexnow`).
  Submits only the canonical homepage (the sole sitemap URL — never anchors
  or `/api` URLs). Posts to `https://api.indexnow.org/indexnow.json`, which
  notifies Bing, Yandex, and all IndexNow participants at once.
- Run ONLY after a deploy containing the key file is live (the endpoint
  verifies key ownership). Manual checklist: `SEARCH-SUBMISSION-CHECKLIST.md`.

## 11. Validation

- `npm run lint` (tsc --noEmit), `npm run build`, `npm test`
- Manual: fetch `/robots.txt`, `/sitemap.xml`, `/llms.txt` from deploy;
  validate JSON-LD (e.g. Schema Markup Validator / Rich Results Test);
  confirm canonical + OG via View Source.
