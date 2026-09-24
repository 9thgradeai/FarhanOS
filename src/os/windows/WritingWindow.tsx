import { Volume2, VolumeX, Play } from 'lucide-react';
import { Article, StyleSet } from '../../types';

interface WritingWindowProps {
  articles: Article[];
  selectedArticle: Article;
  setSelectedArticle: (a: Article) => void;
  styleSet: StyleSet;
  triggerSound: (freq: number, duration: number) => void;
  playingMessageIndex: number | null;
  speakText: (text: string, index: number) => void;
  stopSpeaking: () => void;
}

export default function WritingWindow({
  articles,
  selectedArticle,
  setSelectedArticle,
  styleSet,
  triggerSound,
  playingMessageIndex,
  speakText,
  stopSpeaking
}: WritingWindowProps) {
  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* LHS Index Switcher */}
      <div className="w-full md:w-56 border-r border-[#2d2f3d] pr-4 flex flex-col gap-2 select-none">
        <span className={styleSet.panelHeader}>NARRATIVE CHRONICLES</span>
        <div className="space-y-1">
          {articles.map((a) => (
            <button
              key={a.id}
              onClick={() => { setSelectedArticle(a); triggerSound(800, 0.03); }}
              className={`w-full text-left p-2 rounded-lg border flex flex-col gap-0.5 transition-all cursor-pointer ${selectedArticle.id === a.id ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-transparent border-zinc-900 text-zinc-400 hover:bg-zinc-950'}`}
            >
              <span className="font-extrabold text-[10.5px] line-clamp-1 truncate">{a.title}</span>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-0.5 font-mono">
                <span>{a.category}</span>
                <span>{a.readTime}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg mt-auto text-[10px]">
          <span className="font-bold text-amber-300 block mb-0.5">Medium Syndicate</span>
          <p className="text-zinc-500 leading-normal font-sans">Curated articles focus on the overlapping spheres of diagnostic ML architectures and UX.</p>
        </div>
      </div>

      {/* RHS Story Detail */}
      <div className="flex-1 space-y-3 relative">
        {/* Audio Narrator Control Panel */}
        <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-mono border-zinc-800 pr-1 select-none">SYSTÉME NARRATOR</span>
              <p className="text-[11px] text-white font-bold select-text">Read aloud with synthesized clinical AI speech?</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {playingMessageIndex === 999 ? (
              <button
                onClick={stopSpeaking}
                className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1 text-[10px] rounded flex items-center gap-1 cursor-pointer font-bold"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Narration</span>
              </button>
            ) : (
              <button
                onClick={() => speakText(selectedArticle.content, 999)}
                className="bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 px-3 py-1 text-[10px] rounded flex items-center gap-1 cursor-pointer font-bold"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Play Voiceover</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-zinc-850 pb-2 flex items-start justify-between">
          <div>
            <span className="text-[9.5px] bg-amber-500/20 text-amber-300 border border-amber-500/35 px-1.5 py-0.5 rounded uppercase font-mono">{selectedArticle.category} COLUMN</span>
            <h3 className="text-xs font-black text-white tracking-snug mt-1.5 leading-relaxed select-text">{selectedArticle.title}</h3>
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mt-1">Written on {selectedArticle.date} · {selectedArticle.readTime}</span>
          </div>
          {selectedArticle.link && (
            <a
              href={selectedArticle.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => triggerSound(900, 0.02)}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-mono uppercase tracking-wider ml-2"
            >
              <span>Read on Medium ↗</span>
            </a>
          )}
        </div>

        <div className="text-[10.5px] leading-relaxed text-slate-300 font-sans select-all font-normal space-y-2 mt-2 max-h-[180px] overflow-y-auto pr-1">
          <p>{selectedArticle.content}</p>
        </div>
      </div>
    </div>
  );
}
