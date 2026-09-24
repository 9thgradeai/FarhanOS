// IndexNow submission — notifies Bing (+ Yandex and other participants)
// instantly when URLs change, instead of waiting for the next crawl.
//
// PREREQUISITE: the key file public/<KEY>.txt must be deployed and publicly
// reachable at https://farhankabir.tech/<KEY>.txt BEFORE running this.
// Verify with: curl https://farhankabir.tech/0ae717e33cd8c662e87b4ece3a89aa05.txt
//
// Usage: npm run seo:submit-indexnow
// Run after every production deploy that changes indexable content.

const HOST = 'farhankabir.tech';
const KEY = '0ae717e33cd8c662e87b4ece3a89aa05';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Single-page app: one canonical indexable URL. Only submit URLs that
// exist in sitemap.xml — never anchor (#) or /api URLs.
const URL_LIST = [`https://${HOST}/`];

// Official endpoint per https://www.indexnow.org/documentation is POST /indexnow
// (api.indexnow.org notifies all participating engines: Bing, Yandex, …).
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: URL_LIST,
  }),
});

if (res.status === 200 || res.status === 202) {
  console.log(`IndexNow accepted (${res.status}) for: ${URL_LIST.join(', ')}`);
} else {
  const body = await res.text();
  console.error(`IndexNow failed (${res.status}): ${body}`);
  process.exit(1);
}
