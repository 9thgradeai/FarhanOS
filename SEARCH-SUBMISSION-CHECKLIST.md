# Search Submission Checklist — farhankabir.tech

One-sitting manual tasks. Technical items (marked [DONE]) are already in the
repo; everything below needs the site owner's logged-in accounts.

## A. Bing + the 5-for-1 surfaces [~15 min]

Bing's index feeds Bing, DuckDuckGo, Yahoo, Ecosia, and partly ChatGPT/Copilot
web browsing — so this section covers five surfaces at once.

- [ ] 1. Go to https://www.bing.com/webmasters → sign in → **Add a site** →
      enter `https://farhankabir.tech/`.
- [ ] 2. Verify ownership: copy the `msvalidate.01` token, paste it into
      `index.html` (uncomment the placeholder line), commit, push, wait for
      Vercel deploy.
- [ ] 3. Back in Webmaster Tools → **Sitemaps** → submit
      `https://farhankabir.tech/sitemap.xml`.
- [ ] 4. **URL Inspection** → inspect `https://farhankabir.tech/` → confirm
      "Indexed". If not, click **Request indexing**.
- [ ] 5. After the deploy containing the IndexNow key file is live, verify:
      `curl https://farhankabir.tech/0ae717e33cd8c662e87b4ece3a89aa05.txt`
      must print the key. Then run `npm run seo:submit-indexnow`.
      (Key file: `public/0ae717e33cd8c662e87b4ece3a89aa05.txt` [DONE];
      submit script: `scripts/submit-indexnow.mjs` [DONE].)
- [ ] 6. Spot-check the downstream engines (no accounts needed):
      search `farhankabir` on DuckDuckGo, Yahoo, and Ecosia after ~1–2 weeks.

## B. Google (confirm, since ranking already observed)

- [ ] 1. https://search.google.com/search-console → verify (uncomment the
      `google-site-verification` placeholder in `index.html` with the real
      token, deploy) → submit `https://farhankabir.tech/sitemap.xml`.
- [ ] 2. URL Inspection → confirm the homepage is indexed and the canonical
      is recognized as `https://farhankabir.tech/`.

## C. AI-citation surfaces [~30 min, highest value for ChatGPT/Perplexity/Gemini]

AI engines cite verifiable third-party sources. Make every profile point home:

- [ ] 1. **GitHub** (https://github.com/farhankabir133): profile README and
      profile "website" field → `https://farhankabir.tech`.
- [ ] 2. **LinkedIn** (https://www.linkedin.com/in/farhankabir133/): website /
      featured section → `https://farhankabir.tech`.
- [ ] 3. **Medium** (https://medium.com/@farhankabir133): profile + link back
      to the site from new articles where genuinely relevant.
- [ ] 4. **Google Scholar**: https://scholar.google.com → create/claim profile,
      add the 4 IEEE papers, set homepage to `https://farhankabir.tech`.
- [ ] 5. **ORCID**: https://orcid.org → create/claim record, add papers +
      homepage URL.
- [ ] 6. **IEEE author pages**: ensure author profiles link to
      `https://farhankabir.tech` where the platform allows it.
- [ ] 7. **X bio** (https://x.com/fkh_236): website → `https://farhankabir.tech`.

## D. Brave Search [~5 min]

Brave runs its own index and offers no webmaster portal — discovery is
automatic. Just confirm crawlability (already true: single canonical URL,
no crawler blocks, `Allow: /`) and search `farhankabir` on
https://search.brave.com after a few weeks.

## E. Developer-profile backlinks (optional, ~20 min)

Free profiles that recruiters and AI crawlers both read. Use real info only:

- [ ] Peerlist: https://peerlist.io
- [ ] Wellfound: https://wellfound.com
- [ ] Contra: https://contra.com

Each should link back to `https://farhankabir.tech`.

## Reference: IndexNow docs

- Protocol: https://www.indexnow.org
- [DONE] Key hosted at `https://farhankabir.tech/0ae717e33cd8c662e87b4ece3a89aa05.txt`
- [DONE] Submit via `npm run seo:submit-indexnow` (only after key URL is live)
