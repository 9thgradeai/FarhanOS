import { useEffect, useState } from 'react';
import { Activity, Server, Clock3, Users, LayoutGrid, Palette, BarChart3, Package } from 'lucide-react';
import { useApiHealth } from '../../hooks/useApiHealth';
import { siteConfig } from '../../config/site';
import type { StyleSet, Theme } from '../../types';

interface TelemetryWindowProps {
  styleSet: StyleSet;
  theme: Theme;
  openCount: number;
  sessionStart: number;
}

function readVisitCount(): number | null {
  try {
    const raw = localStorage.getItem('farhanos.visits');
    const n = raw == null ? NaN : Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function formatUptime(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const h = Math.floor(s / 3600);
  return h > 0 ? `${h}h ${mm}m` : `${mm}:${ss}`;
}

/**
 * Mission-control view of the portfolio's own vitals: API liveness, session
 * uptime, visit history, and build provenance. Dogfoods the site's telemetry
 * as interface — everything here is measured live, nothing is mocked.
 */
export default function TelemetryWindow({ styleSet, theme, openCount, sessionStart }: TelemetryWindowProps) {
  const api = useApiHealth();
  const [now, setNow] = useState(() => Date.now());
  const [visits] = useState<number | null>(readVisitCount);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const buildStamp = (() => {
    try {
      const d = new Date(document.lastModified);
      return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleString();
    } catch {
      return 'unknown';
    }
  })();

  const rows: Array<{ Icon: typeof Activity; label: string; value: string; tone: string }> = [
    {
      Icon: Server,
      label: 'API BACKEND',
      value: !api.checked ? 'PROBING…' : api.ok && api.latencyMs != null ? `ONLINE · ${api.latencyMs}MS` : 'OFFLINE',
      tone: !api.checked ? 'text-zinc-400' : api.ok ? 'text-emerald-400' : 'text-amber-400',
    },
    {
      Icon: Clock3,
      label: 'SESSION UPTIME',
      value: formatUptime(now - sessionStart),
      tone: 'text-sky-400',
    },
    {
      Icon: Users,
      label: 'YOUR VISITS',
      value: visits == null ? 'FIRST CONTACT' : `${visits}× RETURNING`,
      tone: 'text-indigo-400',
    },
    {
      Icon: LayoutGrid,
      label: 'WINDOWS OPEN',
      value: `${openCount} ACTIVE`,
      tone: 'text-cyan-400',
    },
    {
      Icon: Palette,
      label: 'INTERFACE THEME',
      value: theme.toUpperCase(),
      tone: 'text-purple-400',
    },
    {
      Icon: BarChart3,
      label: 'ANALYTICS',
      value: siteConfig.plausibleDomain ? 'PLAUSIBLE · ON' : 'PLAUSIBLE · OFF',
      tone: siteConfig.plausibleDomain ? 'text-emerald-400' : 'text-zinc-500',
    },
    {
      Icon: Package,
      label: 'BUILD STAMP',
      value: buildStamp.toUpperCase(),
      tone: 'text-zinc-400',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className={styleSet.panelHeader}>SYSTEM TELEMETRY</span>
        <p className="text-[10px] text-zinc-500 font-sans mt-1">
          Live vitals for this portfolio instance — measured in your browser right now.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="status" aria-label="System telemetry">
        {rows.map(({ Icon, label, value, tone }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 bg-zinc-950/40 border border-zinc-900 rounded-lg px-3 py-2.5"
          >
            <Icon className={`w-4 h-4 shrink-0 ${tone}`} aria-hidden="true" />
            <div className="min-w-0">
              <div className="text-[9px] font-mono text-zinc-500 tracking-widest">{label}</div>
              <div className={`text-[11px] font-mono font-bold truncate ${tone}`}>{value}</div>
            </div>
            <span aria-hidden="true" className={`ml-auto w-1.5 h-1.5 rounded-full shrink-0 ${tone.replace('text-', 'bg-')}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
