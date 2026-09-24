/**
 * Unified motion language for FarhanOS.
 *
 * One easing curve, two spring weights, one scroll-reveal preset — every
 * motion/react transition in the app should reference these tokens instead
 * of inline spring configs so the product animates in a single dialect.
 *
 * Values preserve the established feel (soft 300/20 reveals, snappy 400/20
 * micro-interactions); this file only centralizes them.
 */

export const MOTION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)' as const;

export const MOTION = {
  /** Section/card reveals on scroll. */
  springSoft: { type: 'spring', stiffness: 300, damping: 20 },
  /** Buttons, chips, hover/tap micro-interactions. */
  springSnappy: { type: 'spring', stiffness: 400, damping: 20 },
  /** Standard once-only scroll reveal trigger. */
  revealViewport: { once: true, margin: '-80px' },
} as const;
