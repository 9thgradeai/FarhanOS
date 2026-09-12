import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { AssistantGlyph } from './AssistantGlyph';
import type { GreetingCopy } from '../utils/assistantSuggestions';

interface ProactiveGreetingProps {
  greeting: GreetingCopy;
  isTerminal?: boolean;
  isLight?: boolean;
  onAsk: (query: string) => void;
  onDismiss: () => void;
}

/**
 * Discreet proactive greeting chip shown next to the Farhan AI launcher.
 * Pure presentation — all timing/cooldown logic lives in AssistantLauncher.
 */
export default function ProactiveGreeting({
  greeting,
  isTerminal = false,
  isLight = false,
  onAsk,
  onDismiss,
}: ProactiveGreetingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      onClick={() => onAsk(greeting.query)}
      className={`group w-[300px] rounded-2xl border p-3.5 shadow-2xl cursor-pointer select-none ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-slate-900/10'
          : 'bg-zinc-950/95 border-zinc-800/70 shadow-black/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
            isTerminal ? 'bg-[#33ff33]/10 border border-[#33ff33]/20' : 'bg-indigo-500/10 border border-indigo-500/20'
          }`}
        >
          <AssistantGlyph
            state="idle"
            className={`${isTerminal ? 'text-[#33ff33]' : 'text-indigo-400'} w-5 h-5`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`flex items-center justify-between gap-2`}>
            <span className={`text-[13px] font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              {greeting.title}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className={`shrink-0 p-1 rounded-md transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
              aria-label="Dismiss greeting"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className={`text-[11px] leading-relaxed mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            {greeting.message}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className={`text-[11px] font-semibold flex items-center gap-1 ${isTerminal ? 'text-[#33ff33]' : 'text-indigo-400'}`}>
          <Sparkles className="w-3 h-3" />
          Ask Farhan AI
        </span>
        <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
      </div>
    </motion.div>
  );
}