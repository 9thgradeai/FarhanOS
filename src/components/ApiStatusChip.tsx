import type { Theme } from '../types';
import { useApiHealth } from '../hooks/useApiHealth';

/** Live API liveness chip: latency when reachable, honest offline state. */
export function ApiStatusChip({ theme, className = '' }: { theme: Theme; className?: string }) {
  const { ok, latencyMs, checked } = useApiHealth();

  const palette = !checked
    ? (theme === 'light'
      ? 'border-slate-200 bg-white text-slate-500'
      : 'border-zinc-800 bg-black/40 text-zinc-500')
    : ok
      ? (theme === 'light'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300')
      : (theme === 'light'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-amber-500/25 bg-amber-500/10 text-amber-300');

  const label = !checked ? 'API …' : ok && latencyMs != null ? `API ${latencyMs}MS` : 'API OFFLINE';
  const dot = !checked ? 'bg-zinc-500' : ok ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400';

  return (
    <span
      role="status"
      title={ok ? `API reachable (${latencyMs}ms)` : 'API status'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono tracking-widest ${palette} ${className}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
