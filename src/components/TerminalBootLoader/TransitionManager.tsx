import type { ReactNode } from 'react';
import type { BootPhase } from '../../hooks/useTerminalBoot';

export function Overlay({
  phase,
  reduced,
  children,
}: {
  phase: BootPhase;
  reduced: boolean;
  children: ReactNode;
}) {
  const revealing = phase === 'revealing' || phase === 'done';
  const duration = reduced ? '320ms' : '900ms';
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // Continuity: as the terminal dissolves it gently scales up, while the
  // desktop scales in beneath — one continuous camera move, not a hard cut.
  const overlayTransform = revealing && !reduced ? 'scale(1.04)' : 'none';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[99999] flex items-center justify-center will-change-[opacity,transform]"
      style={{
        transition: `opacity ${duration} ${easing}, transform ${duration} ${easing}`,
        opacity: revealing ? 0 : 1,
        transform: overlayTransform,
        pointerEvents: revealing ? 'none' : 'auto',
      }}
    >
      <div className="absolute inset-0 bg-[#070809]" />
      <div className="relative w-full px-4">{children}</div>
    </div>
  );
}

export function ContentReveal({
  phase,
  reduced,
  children,
}: {
  phase: BootPhase;
  reduced: boolean;
  children: ReactNode;
}) {
  const revealing = phase === 'revealing' || phase === 'done';
  const duration = reduced ? '320ms' : '900ms';
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';

  const contentTransform = revealing || reduced ? 'none' : 'scale(0.985)';

  return (
    <div
      className="min-h-screen will-change-[opacity,transform]"
      style={{
        visibility: revealing ? 'visible' : 'hidden',
        opacity: revealing ? 1 : 0,
        transform: contentTransform,
        transition: `opacity ${duration} ${easing}, transform ${duration} ${easing}, visibility 0ms linear ${duration}`,
        transitionDelay: revealing ? '0ms' : '0ms',
      }}
    >
      {revealing ? children : null}
    </div>
  );
}
