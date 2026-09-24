import { Send, Cpu, Volume2, VolumeX, FileText, ExternalLink } from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { sourceWindowFor } from '../../utils/osActions';
import { StyleSet } from '../../types';

interface TwinMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  sources?: { title: string }[];
}

interface TwinWindowProps {
  twinMessages: TwinMessage[];
  twinLoading: boolean;
  twinInput: string;
  setTwinInput: (val: string) => void;
  handleSendTwinMessage: (override?: string) => void;
  /** Receipt banner for the last OS action the twin performed. */
  actionNote?: string | null;
  /** Open the OS window a cited source maps to (RAG transparency). */
  onOpenSource?: (title: string) => void;
  playingMessageIndex: number | null;
  speakText: (text: string, index: number) => void;
  stopSpeaking: () => void;
  styleSet: StyleSet;
}

export default function TwinWindow({
  twinMessages,
  twinLoading,
  twinInput,
  setTwinInput,
  handleSendTwinMessage,
  actionNote,
  onOpenSource,
  playingMessageIndex,
  speakText,
  stopSpeaking,
  styleSet
}: TwinWindowProps) {
  return (
    <div className="flex flex-col h-full gap-3">
      <div className="border-b border-zinc-800/60 pb-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-indigo-400">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <path d="M22 20L22 44L36 44L36 34L44 34L44 44L52 44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="22" cy="20" r="3" fill="#34d399" />
              <circle cx="22" cy="44" r="2.5" fill="currentColor" />
              <circle cx="36" cy="44" r="2.5" fill="currentColor" />
              <circle cx="36" cy="34" r="2.5" fill="currentColor" />
              <circle cx="44" cy="34" r="2.5" fill="currentColor" />
              <circle cx="52" cy="44" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold text-slate-100 tracking-tight">Interactive Ask Twin Engine</span>
        </div>
        <p className="text-zinc-400 text-[10px] mt-0.5 leading-relaxed font-normal">
          Enter any prompt below. The model responds based on Farhan's publications, NLP methodologies, and complete career achievements.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-1 scrollbar-none text-[11px] leading-relaxed select-text font-normal max-h-[220px]">
        {twinMessages.map((m, idx) => (
          <div key={idx} className={`flex flex-col gap-1 w-full ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-xl max-w-[90%] select-text border shadow-xs ${m.role === 'user' ? 'bg-sky-500/10 border-sky-500/20 text-slate-100' : 'bg-zinc-950/40 border-zinc-900 text-slate-300'}`}>
              {m.role === 'assistant' ? (
                <MarkdownRenderer content={m.content} />
              ) : (
                <p className="whitespace-pre-wrap text-[11px]">{m.content}</p>
              )}
            </div>

            {/* Message timestamp */}
            {m.timestamp && (
              <span className="text-[10px] text-zinc-600 font-mono ml-1">
                {new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(m.timestamp))}
              </span>
            )}

            {/* Synth TTS play button for model messages */}
            {m.role === 'assistant' && (
              <button
                onClick={() => {
                  if (playingMessageIndex === idx) {
                    stopSpeaking();
                  } else {
                    speakText(m.content, idx);
                  }
                }}
                className="text-[9px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                {playingMessageIndex === idx ? (
                  <>
                    <VolumeX className="w-3 h-3 text-rose-400 animate-pulse" />
                    <span className="text-rose-400">Silence Audio Narrator</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>Speak Response Model</span>
                  </>
                )}
              </button>
            )}

            {/* Verified knowledge sources behind this answer */}
            {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-mono mr-1 self-center">Verified sources:</span>
                {m.sources.slice(0, 4).map((s, i) => {
                  const target = sourceWindowFor(s.title);
                  const label = s.title.length > 28 ? `${s.title.slice(0, 28)}…` : s.title;
                  return target && onOpenSource ? (
                    <button
                      key={`${s.title}-${i}`}
                      onClick={() => onOpenSource(s.title)}
                      title={`${s.title} — open ${target} window`}
                      className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/40 cursor-pointer transition-colors max-w-[160px]"
                    >
                      <FileText className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{label}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" aria-hidden="true" />
                    </button>
                  ) : (
                    <span
                      key={`${s.title}-${i}`}
                      title={s.title}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 max-w-[160px] truncate"
                    >
                      {s.title}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {twinLoading && (
          <div className="flex items-center gap-2 text-purple-400 animate-pulse font-mono text-[10px]">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span>FarhanTwin processing query…</span>
          </div>
        )}
      </div>

      {/* Action receipt: the twin operates the portfolio, not just chats. */}
      {actionNote && (
        <div role="status" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-[10px] font-mono">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          {actionNote}
        </div>
      )}

      {/* Chat Suggestion Prompt Chips — tapping sends immediately. */}
      <div className="border-t border-zinc-800/40 pt-2 grid grid-cols-2 gap-1.5 z-10">
        {[
          "Explain depression text research",
          "Open the Research Lab",
          "What SaaS packages did Farhan build?",
          "Switch to cyberpunk theme"
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => { handleSendTwinMessage(chip); }}
            disabled={twinLoading}
            className="text-[10px] text-left p-1.5 rounded-lg bg-zinc-950/30 hover:bg-zinc-950/80 border border-zinc-900 text-zinc-400 hover:text-slate-200 truncate cursor-pointer transition-colors disabled:opacity-50"
          >
            → {chip}
          </button>
        ))}
      </div>

      {/* Chat Input deck */}
      <div className="flex items-center gap-2 mt-auto border-t border-zinc-800/40 pt-2 select-none">
        <label htmlFor="twin-chat-input" className="sr-only">Chat input</label>
        <input
          id="twin-chat-input"
          type="text"
          value={twinInput}
          onChange={(e) => setTwinInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendTwinMessage()}
          placeholder="Inquire about clinical studies, model performance parameters..."
          className="flex-1 scroll-p-2 bg-black/60 border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500/50 text-[11px] text-slate-100 placeholder-zinc-500"
        />
        <button
          onClick={() => handleSendTwinMessage()}
          disabled={!twinInput.trim() || twinLoading}
          className={`p-2.5 rounded-lg cursor-pointer ${styleSet.btnPrimary}`}
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
