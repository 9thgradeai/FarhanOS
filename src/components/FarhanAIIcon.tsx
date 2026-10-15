import React from 'react';

type FarhanAIIconProps = React.SVGProps<SVGSVGElement> & {
  isTerminal?: boolean;
};

/**
 * "Ask Farhan AI" desktop + welcome mark v2 — "Ask Tile".
 * A high-contrast gradient tile (indigo → cyan) with a white
 * bold-F + lightning bolt, chat-tail notch, and a star spark
 * breaking out of the top-right corner for shelf pop.
 * Hand-built paths only — no generated blob data.
 */
export function FarhanAIIcon({ className = '', width = 64, height = 64, isTerminal = false, ...props }: FarhanAIIconProps) {
  const bg = isTerminal ? '#052e16' : undefined;
  const bgGrad = 'faTileBg';
  const sparkGrad = 'faTileSpark';

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="Ask Farhan AI"
      {...props}
    >
      <defs>
        <linearGradient id={bgGrad} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          {isTerminal ? (
            <>
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#052e16" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#6D6AFE" />
              <stop offset="52%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#06B6D4" />
            </>
          )}
        </linearGradient>
        <linearGradient id={sparkGrad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        <filter id="faTileGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tile body — rounded square + chat tail */}
      <rect x="4" y="7" width="48" height="48" rx="13" fill={bg ?? `url(#${bgGrad})`} />
      <rect x="4" y="7" width="48" height="48" rx="13" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M14 55 L11 60.5 L18.5 55.5 Z" fill={bg ?? '#4F46E5'} stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.2" strokeLinejoin="round" />

      {/* Gloss highlight */}
      <path d="M10 12 Q10 9.5 12.5 9.5 H44 Q46.5 9.5 46.5 12 V17 Q22 13 10 22 Z" fill="#FFFFFF" opacity="0.22" />

      {/* Bold white F */}
      <g stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M21 18 V44" />
        <path d="M21 19.5 H37" />
        <path d="M21 30.5 H33.5" />
      </g>
      {/* Lightning cut */}
      <path
        d="M28.5 15.5 L22.5 31 H26.8 L24.8 44.5 L32.5 28.5 H28 L30.5 15.5 Z"
        fill={`url(#${sparkGrad})`}
        stroke="#7C2D12"
        strokeOpacity="0.25"
        strokeWidth="0.8"
        strokeLinejoin="round"
        filter="url(#faTileGlow)"
      />

      {/* Breakout spark — pops above the tile edge */}
      <path
        d="M49 0 Q49 7.5 56.5 7.5 Q49 7.5 49 15 Q49 7.5 41.5 7.5 Q49 7.5 49 0 Z"
        fill={`url(#${sparkGrad})`}
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinejoin="round"
        filter="url(#faTileGlow)"
      />
      <circle cx="56.5" cy="20" r="2.2" fill="#FFFFFF" opacity="0.95" />
      <circle cx="60" cy="14.5" r="1.3" fill="#A5F3FC" opacity="0.9" />

      {/* AI pill */}
      <rect x="30" y="41.5" width="18.5" height="10" rx="5" fill="#0B0B1E" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1.2" />
      <text x="39.2" y="49.2" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="800" fontSize="7" letterSpacing="0.5" fill="#FFFFFF">
        AI
      </text>
    </svg>
  );
}
