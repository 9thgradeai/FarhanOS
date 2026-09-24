import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../utils/apiConfig';

export interface ApiHealth {
  ok: boolean;
  latencyMs: number | null;
  checked: boolean;
}

/**
 * Liveness probe for GET /api/health. Deferred to idle so it never competes
 * with first paint; single-shot (no polling) to avoid background chatter.
 */
export function useApiHealth(): ApiHealth {
  const [state, setState] = useState<ApiHealth>({ ok: false, latencyMs: null, checked: false });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/health`, { cache: 'no-store' });
        if (cancelled) return;
        const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
        setState({ ok: res.ok, latencyMs: Math.round(end - start), checked: true });
      } catch {
        if (!cancelled) setState({ ok: false, latencyMs: null, checked: true });
      }
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(check, { timeout: 8000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }
    const timer = setTimeout(check, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return state;
}
