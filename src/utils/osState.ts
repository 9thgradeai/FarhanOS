// Persists visitor-specific OS state to localStorage so the "operating system"
// feels like a real desktop that remembers you between visits: theme, open
// windows, window layout, mute, accent color, and wallpaper.
//
// Stored data is untrusted input: every field is validated on load so corrupt
// or hand-edited values fall back to safe defaults instead of crashing the
// window manager.

const STORAGE_KEY = 'farhanos:state:v1';

const VALID_THEMES = ['dark', 'cyberpunk', 'ai', 'terminal', 'light'] as const;

// Upper bounds keep a single poisoned entry from blowing quota or layout.
const MAX_WINDOWS = 20;
const MAX_POSITION = 4000;
const MAX_STRING = 500;

export interface PersistedOsState {
  theme?: string;
  openWindows?: string[];
  windowPositions?: Record<string, { x: number; y: number; isMaximized: boolean }>;
  muted?: boolean;
  accent?: string | null;
  wallpaper?: string | null;
}

const DEFAULT_STATE: Required<PersistedOsState> = {
  theme: 'dark',
  openWindows: ['twin'],
  windowPositions: {},
  muted: false,
  accent: null,
  wallpaper: null,
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function sanitize(parsed: unknown): Required<PersistedOsState> {
  const state = { ...DEFAULT_STATE };
  if (!isRecord(parsed)) return state;

  if (typeof parsed.theme === 'string' && (VALID_THEMES as readonly string[]).includes(parsed.theme)) {
    state.theme = parsed.theme;
  }
  if (Array.isArray(parsed.openWindows)) {
    const ids = parsed.openWindows
      .filter((w): w is string => typeof w === 'string' && w.length > 0 && w.length <= 64)
      .slice(0, MAX_WINDOWS);
    if (ids.length > 0) state.openWindows = ids;
  }
  if (isRecord(parsed.windowPositions)) {
    const positions: Required<PersistedOsState>['windowPositions'] = {};
    for (const [k, v] of Object.entries(parsed.windowPositions)) {
      if (Object.keys(positions).length >= MAX_WINDOWS) break;
      if (k.length === 0 || k.length > 64 || !isRecord(v)) continue;
      const { x, y, isMaximized } = v as { x?: unknown; y?: unknown; isMaximized?: unknown };
      if (typeof x !== 'number' || typeof y !== 'number') continue;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (Math.abs(x) > MAX_POSITION || Math.abs(y) > MAX_POSITION) continue;
      positions[k] = {
        x,
        y,
        isMaximized: isMaximized === true,
      };
    }
    state.windowPositions = positions;
  }
  if (typeof parsed.muted === 'boolean') state.muted = parsed.muted;
  if (parsed.accent === null || parsed.accent === undefined) {
    state.accent = null;
  } else if (typeof parsed.accent === 'string' && parsed.accent.length <= MAX_STRING) {
    state.accent = parsed.accent;
  }
  if (parsed.wallpaper === null || parsed.wallpaper === undefined) {
    state.wallpaper = null;
  } else if (typeof parsed.wallpaper === 'string' && parsed.wallpaper.length <= MAX_STRING) {
    state.wallpaper = parsed.wallpaper;
  }
  return state;
}

export function loadOsState(): Required<PersistedOsState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_STATE };
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function saveOsState(state: PersistedOsState): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const json = JSON.stringify(state);
      // ~100KB cap: refuse to persist runaway state (e.g. huge wallpaper URLs).
      if (json.length > 100_000) return;
      localStorage.setItem(STORAGE_KEY, json);
    } catch {
      /* quota / private mode — ignore */
    }
  }, 250);
}

export function clearOsState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
