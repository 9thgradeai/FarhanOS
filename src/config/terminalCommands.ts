/**
 * Configuration for the Premium Terminal Boot Loader.
 *
 * The script tells the story of a visitor remotely connecting to a developer
 * workstation before the portfolio is revealed. It is intentionally calm and
 * developer-focused (inspired by Warp, Raycast, Linear, Arc, Vercel and the
 * macOS Terminal) and avoids stereotypical "hacker" aesthetics.
 */

export type LineKind = 'cmd' | 'out' | 'ok' | 'info';

export interface BootLine {
  /** How the line is rendered and coloured. */
  kind: LineKind;
  /** Prompt shown before a command, e.g. `visitor@portfolio:~$`. */
  prompt?: string;
  /** Text that is typed out (or shown instantly for reduced motion). */
  text: string;
  /** Characters per second while typing this line. */
  cps?: number;
  /** Quiet pause (ms) after this line finishes before the next begins. */
  after?: number;
}

export const BOOT_TIMING = {
  /** Hard floor so the experience never feels abrupt. */
  minDurationMs: 2000,
  /** Safety cap: never block the portfolio longer than this. */
  maxDurationMs: 8000,
  /** Length of the dissolve transition into the homepage. */
  revealMs: 800,
  /** Hold time when reduced motion is enabled before revealing. */
  reducedMotionHoldMs: 520,
} as const;

export const WORKSTATION_HOST = 'farhan-kabir.dev';

export const BOOT_SCRIPT: BootLine[] = [
  { kind: 'cmd', prompt: 'farhan@workstation ~ %', text: 'ssh portfolio', cps: 80, after: 120 },
  { kind: 'out', text: `Connecting to ${WORKSTATION_HOST} …`, cps: 140, after: 100 },
  { kind: 'out', text: 'Authenticated as "farhan" · session secured', cps: 140, after: 120 },
  { kind: 'cmd', prompt: 'farhan@portfolio ~ %', text: 'source .env && fetch profile', cps: 80, after: 120 },
  { kind: 'out', text: 'Resolving runtime · node 20.11 · pnpm 9 · rustc 1.78', cps: 150, after: 100 },
  { kind: 'out', text: 'Mounting workspace modules · 14 packages', cps: 150, after: 120 },
  { kind: 'cmd', prompt: 'farhan@portfolio ~ %', text: 'build --optimize', cps: 80, after: 120 },
  { kind: 'ok', text: 'Compiled portfolio bundle · 0 warnings', cps: 150, after: 100 },
  { kind: 'ok', text: 'Optimized assets · fonts + images prefetched', cps: 150, after: 120 },
  { kind: 'out', text: 'Establishing secure session → portfolio', cps: 140, after: 120 },
  { kind: 'cmd', prompt: 'visitor@portfolio:~$', text: 'farhanos --boot desktop', cps: 76, after: 160 },
  { kind: 'ok', text: 'Desktop environment mounted · neural core online', cps: 130, after: 120 },
  { kind: 'info', text: 'Rendering workspace →', cps: 100 },
];
