import { useEffect, useState } from 'react';

/**
 * Tracks which landing-page section the visitor is currently looking at via
 * IntersectionObserver over `section[id]` elements. Returns null until the
 * first qualifying section intersects (or when disabled — e.g. OS mode).
 */
export function useActiveSection(enabled: boolean, rootMargin = '-25% 0px -65% 0px'): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('section[id]')
    ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);

    if (sections.length === 0) return;

    let currentBest: string | null = null;
    let rafId: number | null = null;

    const update = () => {
      // Recompute intersection ratios on request to catch scroll-only changes.
      let best: string | null = null;
      let bestRatio = 0;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        const viewport = window.innerHeight;
        const visibleStart = Math.max(rect.top, 0);
        const visibleEnd = Math.min(rect.bottom, viewport);
        const visible = Math.max(0, visibleEnd - visibleStart);
        const ratio = visible / Math.max(rect.height, 1);
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = el.id;
        }
      }
      if (best !== currentBest) {
        currentBest = best;
        setActive(best);
      }
    };

    // Batch scroll/resize recalculations into animation frames so the
    // landing page never pays layout-thrash costs while scrolling.
    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    };
    const onObserverVisible = (anyVisible: boolean) => {
      if (anyVisible) scheduleUpdate();
      else if (currentBest) setActive(null);
    };

    const observer = new IntersectionObserver(
      (entries) => onObserverVisible(entries.some((e) => e.isIntersecting)),
      { rootMargin, threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    update();

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [enabled, rootMargin]);

  return active;
}