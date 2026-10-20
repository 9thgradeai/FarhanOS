/**
 * Node-only knowledge source adapter.
 *
 * The request handler in `api/core/request-handler.ts` is runtime-agnostic
 * and receives its RAG searcher as an injected dependency. This module is the
 * single place that wires the Node `fs`-backed knowledge loader into it, so
 * neither the Vercel function nor the Express server has to import fs-backed
 * code directly (which would pull `node:fs` into the Serverless bundle).
 *
 * `getRagSearcher()` never throws: if the knowledge base cannot be loaded the
 * handler degrades gracefully to the inline prompt.
 */

export interface RagSearcher {
  searchKnowledge(
    query: string,
    options?: { topK?: number; featuredOnly?: boolean }
  ): Array<{ title: string; content: string }>;
}

let searcher: RagSearcher | undefined;
let attempted = false;

export async function getRagSearcher(): Promise<RagSearcher | undefined> {
  if (attempted) return searcher;
  attempted = true;
  try {
    const mod = await import('./knowledge-loader.js');
    searcher = { searchKnowledge: mod.searchKnowledge };
  } catch (err) {
    console.error('[knowledge] load failed:', err);
  }
  return searcher;
}
