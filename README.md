# FarhanOS

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless-black?logo=vercel)](https://vercel.com/)
[![CI](https://github.com/9thgradeai/FarhanOS/actions/workflows/ci.yml/badge.svg?branch=Production)](https://github.com/9thgradeai/FarhanOS/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An interactive portfolio OS for clinical NLP research and full-stack AI engineering — a cinematic landing page fused with a working desktop environment operated in part by an AI twin.

**Live:** [https://farhankabir.tech](https://farhankabir.tech) · **Resume:** [farhankabir.tech/#/resume](https://farhankabir.tech/#/resume) · **Release:** [v2.4.0](https://github.com/9thgradeai/FarhanOS/releases/tag/v2.4.0)

---

## Overview

FarhanOS presents peer-reviewed publications, open-source systems, and AI engineering work inside two connected experiences:

- **Landing page** — scrollable single-page site (hero, about, skills, timelines, projects, research with plain-language findings, writings, contact) with a 3D starfield, custom command-bar header, and a full-bleed footer terminal.
- **OS mode** — a desktop environment with draggable windows, a command palette, five themes, a floating AI assistant, and a live telemetry window.

Built by **Farhan Kabir** — AI Engineer, NLP Researcher, and Full-Stack Developer.

---

## Signature features

- **Boot-to-desktop continuity** — the terminal boot sequence narrates its own launch (`farhanos --boot desktop`) and crossfades into the desktop in one continuous camera move.
- **Twin that operates the portfolio** — the Ask Twin executes validated OS actions (open windows, switch themes, open allowlisted links) with in-chat receipts; suggestion chips send immediately.
- **Search-first navigation** — hero `K`-shortcut pill, `Cmd/Ctrl+K` palette everywhere, shareable `#/w/<window>` deep links into OS windows.
- **Live telemetry** — `GET /api/health` on both runtimes with status chips in the footer and OS bar, plus a Telemetry window (API latency, session uptime, visits, build stamp).
- **RAG transparency** — twin citations render as clickable verified-source chips that open the mapped OS window.
- **Printable resume** — `#/resume` generates an ATS-friendly document from the same live data (skips boot on direct entry, print CSS included).
- **Public playground API** — read-only `/api/playground`, `/papers`, `/repos` (30 req/hour/IP, edge-cached, documented in `llms.txt`).

---

## Content modules

- **Projects Explorer** — 16 projects with stack, architecture, metrics, and links.
- **Publications Reader** — 6 peer-reviewed papers with abstracts, plain-language key findings, methodology, pipelines, results, and copyable citations.
- **Timelines** — career and professional chronologies.
- **Skills Observatory, Concept Garden, Resume Gen, Mission Brief, Whiteboard, Builds (release notes), Telemetry, Settings.**

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript 5.8, Vite 6 |
| Styling | Tailwind CSS v4 (custom theme tokens) |
| Animation | Motion (single shared token set in `src/utils/motion.ts`), CSS |
| 3D / WebGL | Three.js (skipped on mobile / reduced motion) |
| Icons | Lucide React, custom SVG |
| Backend | Vercel Serverless (`api/index.ts`) + Express (`server.ts`) over one core in `api/core/*` |
| AI | Groq API (`llama-3.3-70b-versatile`), SSE streaming, allowlisted function tools |
| Email | Resend (3-attempt retry with backoff) |
| Data | GitHub API + Medium RSS (ETag, SWR edge caching, static fallbacks) |
| Fonts | ABCFavorit woff2 (all 4 cuts preloaded), `font-display: swap` |
| Runtime | Node 24.x |
| Deployment | Vercel (auto-deploy on push to `Production`), CI gate via GitHub Actions |

---

## Architecture

### Request lifecycle
1. **Dev** — `npm run dev` starts Express + Vite middleware on `PORT` (default `3001`); API routes share the app.
2. **Production (Vercel)** — `vercel.json` rewrites `/api/*` to the serverless function; static `dist/` serves the SPA; www→apex 301, security headers, and crawler-file caching declared in config.
3. **Production (Express)** — `npm start` serves `dist/` with security headers; unknown `/api/*` returns JSON 404 (never SPA HTML); deep paths fall back to `index.html`.

### Routes
| Route | Description |
|-------|-------------|
| `/` | Single canonical page (landing + OS) |
| `#/resume` | Printable resume document |
| `#/w/<window>` | Deep link into an OS window |
| `/api/ask-twin` | SSE AI chat with tools (20/min) |
| `/api/summarize-brief`, `/api/contact` | Brief AI + contact pipeline (10/5 per min) |
| `/api/medium-stories`, `/api/github-repos` | Cached feeds (ETag + SWR) |
| `/api/health` | Liveness probe (both runtimes) |
| `/api/playground[/papers\|/repos]` | Public read-only API (30/hr) |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/og-image.png` | Crawler + social assets |

Security is built into the core: per-endpoint rate limits, CORS allowlist, payload caps, outbound timeouts, HTML escaping, prompt-injection delimiting, validated model actions.

### Frontend structure
- `src/App.tsx` — view modes, window manager (pointer drag + bottom-sheet gestures), palette, focus management, toasts.
- `src/components/LandingPage.tsx` / `LandingBelowFold.tsx` — landing + lazy below-fold; `MOTION` tokens throughout.
- `src/os/windows/` — 16 lazily-loaded desktop windows (incl. `TelemetryWindow`).
- `src/components/TerminalBootLoader/` — typing engine, particles, continuous reveal transition.
- `src/components/Toast.tsx`, `ApiStatusChip.tsx`, `ResumeDocument.tsx` — notifications, liveness, printable resume.
- `src/utils/` — `osActions` (assistant contract), `osState` (validated persistence), `sound`, `motion`, `analytics` (Plausible, opt-in).
- `src/data/portfolioData.ts` — single source of truth, typed by `src/types.ts`.

### Backend structure (`api/core/*`)
`handlers.ts` (endpoints) · `tools.ts` (model tool schemas + validators) · `groq.ts` (client with retry) · `security.ts` (rate limits, CORS, escaping) · `cache.ts` (TTL + ETag) · `prompts.ts` · `intents.ts` · `rssParser.ts` · `env.ts` · RAG via `api/knowledge-loader.ts` over `knowledge/`.

---

## Project structure

```
├── api/                    # Vercel adapter + shared core
├── server.ts               # Express adapter (dev + prod)
├── scripts/                # submit-indexnow.mjs, generate-og-image.py
├── knowledge/              # RAG corpus (versioned markdown)
├── public/                 # robots.txt, sitemap.xml, llms.txt, og-image.png, fonts
├── src/os/windows/         # 16 OS windows (lazy)
├── src/components/         # Landing, boot, chat, resume, toasts, chips
├── .github/workflows/      # CI gate
├── SEO-AI-IMPLEMENTATION.md
├── SEARCH-SUBMISSION-CHECKLIST.md
└── vercel.json
```

---

## Getting started

Prerequisites: **Node.js 24**, npm.

```bash
npm install          # or npm ci (reproducible)
cp .env.example .env # then fill GROQ_API_KEY / RESEND_API_KEY
npm run dev          # http://localhost:3001
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Express + Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run start` | Serve `dist/` with Express |
| `npm run lint` | `tsc --noEmit` |
| `npm test` | Vitest suite |
| `npm run seo:submit-indexnow` | Notify search engines after deploy (key must be live) |

---

## Discovery & SEO

Single canonical URL (`https://farhankabir.tech/`); sitemap, robots (`Disallow: /api/`), `llms.txt`, enriched Person/WebSite JSON-LD, 1200×630 social card, IndexNow key + submit script. Verification placeholders live in `index.html`. Manual submission steps: `SEARCH-SUBMISSION-CHECKLIST.md`. Full design record: `SEO-AI-IMPLEMENTATION.md`.

---

## Deployment

Push to `Production` → GitHub Actions CI (install → typecheck → tests → build → SEO smoke checks) → Vercel auto-deploys. Live deploy: `npx vercel --prod`. Secrets (`GROQ_API_KEY`, `RESEND_API_KEY`, optional `VITE_PLAUSIBLE_DOMAIN`) live in the Vercel dashboard, never in the repo.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | AI completions + brief/contact analysis |
| `RESEND_API_KEY` | Yes | Contact email delivery |
| `GITHUB_TOKEN` | No | Raises GitHub rate limit (fine-grained, public-read) |
| `VITE_PLAUSIBLE_DOMAIN` | No | Enables privacy-friendly analytics (unset = silent no-op) |
| `VITE_API_URL` | No | API base override (default: same-origin) |
| `PORT` | No | Server port (default `3001`) |

---

## Performance & accessibility

Code-split windows/routes, lazy below-fold + 3D (mobile skips WebGL), AVIF/WebP responsive images with dimensions, rAF-throttled drag, idle-deferred non-critical work, SWR feed caching, Brotli/gzip. Keyboard: skip links, focus-trapped dialogs, palette + window focus management, 44px targets, labelled forms, `prefers-reduced-motion` throughout, aria-live announcements.

---

## Browser support

Chrome/Edge 90+, Firefox 88+, Safari 14+, Mobile Safari 14+, Chrome for Android. ES2022, `react-jsx` transform.

---

## License

MIT

---

## Maintainer

**Farhan Kabir** — [farhankabir.tech](https://farhankabir.tech) · [GitHub](https://github.com/farhankabir133) · [LinkedIn](https://www.linkedin.com/in/farhankabir133) · farhankabir133@gmail.com
