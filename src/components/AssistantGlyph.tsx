import React from 'react';

type AssistantGlyphProps = React.SVGProps<SVGSVGElement> & {
  state?: 'idle' | 'thinking' | 'responding' | 'success' | 'error';
  size?: number;
};

/**
 * Caffeine launcher mark v2 — "Signal F".
 * A bold geometric F with a lightning-cut spine, locked inside a
 * broken orbit ring. The 4-point spark sits in the ring gap and
 * acts as the attention anchor (pulses via .glyph-core).
 *
 * Class hooks (glyph-core / glyph-node / glyph-node-inner) are
 * consumed by index.css and must not be renamed.
 */
export function AssistantGlyph({ state = 'idle', size = 64, className = '', ...props }: AssistantGlyphProps) {
  const stateClass = state !== 'idle' ? `glyph-${state}` : 'glyph-idle';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={`${className} ${stateClass}`}
      {...props}
    >
      <defs>
        <linearGradient id="fa-spark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="55%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="fa-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
        <filter id="fa-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Attention halo — faint dashed orbit, opposite rotation feel */}
      <circle
        cx="32"
        cy="33"
        r="26.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 5"
        strokeLinecap="round"
        opacity="0.28"
      />

      {/* Main orbit ring — thick, opens top-right to cradle the spark */}
      <path
        d="M 53.5 27.5 A 22 22 0 1 1 36.5 10.6"
        stroke="url(#fa-ring)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Bold F monogram — chunky, high legibility at 24px */}
      <g
        stroke="currentColor"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M25 19 V43" />
        <path d="M25 20 H40" />
        <path d="M25 31 H36" />
      </g>
      {/* Lightning cut through the F spine — the "catchy" hook */}
      <path
        d="M30.5 15 L23.5 32.5 H28 L25.5 47 L34.5 29 H29.5 L32.5 15 Z"
        fill="url(#fa-spark)"
        opacity="0.95"
      />

      {/* Nodes at the ring termini (animated via CSS) */}
      <circle cx="36.5" cy="10.6" r="2.4" fill="url(#fa-spark)" className="glyph-node" filter="url(#fa-glow)" />
      <circle cx="53.5" cy="27.5" r="2" fill="currentColor" className="glyph-node-inner" />

      {/* Hero spark — large 4-point star, gradient filled, always glowing */}
      <path
        d="M47.5 2.5 Q47.5 11.5 56.5 11.5 Q47.5 11.5 47.5 20.5 Q47.5 11.5 38.5 11.5 Q47.5 11.5 47.5 2.5 Z"
        fill="url(#fa-spark)"
        className="glyph-core"
        filter="url(#fa-glow)"
      />
    </svg>
  );
}
