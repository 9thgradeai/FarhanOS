import { useCallback, useEffect, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

interface ToastMsg {
  id: number;
  kind: ToastKind;
  text: string;
}

let pushToast: ((kind: ToastKind, text: string) => void) | null = null;

/** Non-blocking replacement for window.alert(). Safe to call from anywhere. */
export function notify(kind: ToastKind, text: string): void {
  pushToast?.(kind, text);
}

const KIND_STYLES: Record<ToastKind, { box: string; Icon: typeof Info }> = {
  success: { box: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100', Icon: CheckCircle2 },
  error: { box: 'border-rose-500/40 bg-rose-950/90 text-rose-100', Icon: AlertTriangle },
  info: { box: 'border-sky-500/40 bg-zinc-950/90 text-zinc-100', Icon: Info },
};

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);

  useEffect(() => {
    let id = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    pushToast = (kind, text) => {
      const msg: ToastMsg = { id: ++id, kind, text };
      setItems((prev) => [...prev.slice(-2), msg]);
      timers.push(
        setTimeout(() => {
          setItems((prev) => prev.filter((t) => t.id !== msg.id));
        }, 6000)
      );
    };
    return () => {
      pushToast = null;
      timers.forEach(clearTimeout);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col gap-2 w-[min(92vw,28rem)]"
    >
      {items.map((t) => {
        const { box, Icon } = KIND_STYLES[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl text-xs font-sans ${box}`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="flex-1 leading-relaxed">{t.text}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="p-1 -m-1 rounded text-current opacity-70 hover:opacity-100 min-w-11 min-h-11 flex items-center justify-center"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
