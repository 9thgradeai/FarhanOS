import { useEffect, useState } from 'react';

const fmt = () =>
  new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

/**
 * Self-contained live clock text.
 *
 * Owns its own 1s tick so a second-boundary update only re-renders this tiny
 * component instead of the entire OS workspace tree (which previously held the
 * `currentTime` state in `App.tsx`). The interval is started via
 * `requestIdleCallback` so it never competes with first paint / LCP.
 */
export default function ClockText() {
  const [time, setTime] = useState(fmt);

  useEffect(() => {
    const update = () => setTime(fmt());
    let timerId: ReturnType<typeof setInterval>;
    const start = () => {
      timerId = setInterval(update, 1000);
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 4000 });
      return () => {
        cancelIdleCallback(id);
        clearInterval(timerId);
      };
    }
    start();
    return () => clearInterval(timerId);
  }, []);

  // Decorative live clock: hidden from screen readers so the 1s tick doesn't
  // spam the accessibility tree (the static "(UTC)" label beside it remains).
  return <span aria-hidden="true" suppressHydrationWarning>{time}</span>;
}
