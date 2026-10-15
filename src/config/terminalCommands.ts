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
  minDurationMs: 900,
  /** Safety cap: never block the portfolio longer than this. */
  maxDurationMs: 3500,
  /** Length of the dissolve transition into the homepage. */
  revealMs: 350,
  /** Hold time when reduced motion is enabled before revealing. */
  reducedMotionHoldMs: 200,
} as const;

export const WORKSTATION_HOST = 'farhan-kabir.dev';

export const BOOT_SCRIPT: BootLine[] = [
  { kind: 'cmd', prompt: 'farhan@workstation ~ %', text: 'ssh portfolio', cps: 220, after: 40 },
  { kind: 'out', text: `Connecting to ${WORKSTATION_HOST} …`, cps: 320, after: 30 },
  { kind: 'out', text: 'Authenticated as "farhan" · session secured', cps: 320, after: 30 },
  { kind: 'cmd', prompt: 'farhan@portfolio ~ %', text: 'farhanos --boot desktop', cps: 200, after: 50 },
  { kind: 'ok', text: 'Desktop environment mounted · neural core online', cps: 300, after: 40 },
  { kind: 'info', text: 'Rendering workspace →', cps: 260 },
];
