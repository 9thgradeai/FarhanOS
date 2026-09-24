// Lightweight Web Audio sound engine. Replaces the previous no-op stub so the
// OS can emit tactile UI feedback (clicks, boot chimes, errors). All sounds are
// synthesized — no asset downloads. Respects a global mute flag persisted to
// localStorage so a returning visitor keeps their preference.

let ctx: AudioContext | null = null;
let muted = false;
// Last-play timestamp: throttles rapid hover/repeat triggers so stacked
// oscillators can't pile up faster than human perception.
let lastPlayAt = 0;
const MIN_INTERVAL_MS = 30;

// NOTE: mute persistence lives in osState (single source of truth, applied by
// App on mount). This module keeps the flag in memory only.

export function setMuted(value: boolean): void {
  muted = value;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
      (window as any)._farhanosAudioCtx = ctx;
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

interface ToneOptions {
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
}

export function playSound(
  freq = 800,
  duration = 0.05,
  opts: ToneOptions = {},
): void {
  if (muted) return;
  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (nowMs - lastPlayAt < MIN_INTERVAL_MS) return;
  lastPlayAt = nowMs;
  const ac = getCtx();
  if (!ac) return;
  try {
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (opts.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), now + duration);
    }
    const peak = Math.min(0.12, opts.gain ?? 0.04);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  } catch {
    /* ignore audio errors — never block UI */
  }
}


