import { Copy } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { Paper, StyleSet } from '../../types';

interface ResearchWindowProps {
  styleSet: StyleSet;
  selectedPaper: Paper;
  setSelectedPaper: (p: Paper) => void;
  triggerSound: (freq: number, duration: number) => void;
}

export default function ResearchWindow({ styleSet, selectedPaper, setSelectedPaper, triggerSound }: ResearchWindowProps) {
  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* LHS Switcher */}
      <div className="w-full md:w-56 border-r border-[#2d2f3d] pr-4 flex flex-col gap-2">
        <span className={styleSet.panelHeader}>PUBLICATIONS CATALOG</span>
        <div className="space-y-1 select-none">
          {portfolioData.papers.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPaper(p); triggerSound(800, 0.03); }}
              className={`w-full text-left p-2 rounded-lg border flex flex-col gap-1 transition-all cursor-pointer ${selectedPaper.id === p.id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-transparent border-zinc-900 text-zinc-400 hover:bg-zinc-950'}`}
            >
              <span className="font-bold text-[10px] line-clamp-2 leading-snug">{p.title}</span>
              <span className="text-[9px] opacity-75 font-mono">{p.journal} ({p.year})</span>
            </button>
          ))}
        </div>

        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg mt-auto text-[10px] select-text">
          <span className="font-bold text-emerald-300">Clinician Alerts</span>
          <p className="text-zinc-500 leading-normal font-sans mt-1">Automatic alert pipeline triggers clinical assessment support metrics on exceeding distress metrics threshold.</p>
        </div>
      </div>

      {/* RHS Contents */}
      <div className="flex-1 space-y-4">
        <div className="border-b border-zinc-800/40 pb-2 flex-col gap-0.5 justify-start">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded px-2 py-0.5 text-[9.5px]">PEER-REVIEWED JOURNAL</span>
          <h3 className="text-xs font-black text-slate-100 tracking-tight leading-relaxed select-text mt-1.5">{selectedPaper.title}</h3>
          <div className="text-[9.5px] text-zinc-500 italic mt-0.5 select-text">Authors: {selectedPaper.authors} · Published in {selectedPaper.journal} ({selectedPaper.year})</div>
        </div>

        {/* Paper Abstract */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-3 relative select-text">
          <span className="font-bold text-zinc-300 text-[10px] block uppercase tracking-wide mb-1">Anatomical Abstract:</span>
          <p className="text-slate-400 font-sans leading-normal text-[10px]">{selectedPaper.abstract}</p>
        </div>

        {/* Plain-language key finding — quotable on-site. */}
        {selectedPaper.takeaway && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 relative select-text">
            <span className="font-bold text-emerald-300 text-[10px] block uppercase tracking-wide mb-1">Key Finding:</span>
            <p className="text-slate-300 font-sans leading-normal text-[10px]">{selectedPaper.takeaway}</p>
          </div>
        )}

        {/* Interactive block representing high level engineering classification pipelines */}
        <div>
          <span className={styleSet.panelHeader}>CLASSIFIER PIPELINE DATAFLOW</span>
          <div className="flex items-center gap-1 mt-1.5 select-none text-[9px] bg-zinc-950/30 p-2 border border-zinc-900 rounded-lg justify-around overflow-x-auto text-center font-mono">
            <div className="bg-zinc-900 border border-zinc-800 p-1 px-1.5 rounded text-slate-400">Ingestion</div>
            <span className="text-zinc-600">→</span>
            <div className="bg-zinc-900 border border-zinc-800 p-1 px-1.5 rounded text-slate-400">POS normalise</div>
            <span className="text-[#33ff33]">→</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 p-1 px-1.5 rounded animate-pulse">RoBERTa Tensor Matrix</span>
            <span className="text-[#33ff33]">→</span>
            <div className="bg-red-500/20 text-red-300 border border-red-500/30 p-1 px-1.5 rounded">Clinician Alert</div>
          </div>
        </div>

        {/* Metrics Performance Comparison Table */}
        <div>
          <span className={styleSet.panelHeader}>EVALUATION ACCURACY STATISTICS</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-1.5 font-mono text-[10px]">
            {selectedPaper.results.map((r, idx) => (
              <div key={idx} className="bg-zinc-950 p-2 border border-zinc-900 rounded-md text-center">
                <div className="text-zinc-500 text-[9px] truncate" title={r.metric}>{r.metric}</div>
                <div className="font-bold text-emerald-400 text-xs mt-0.5">{r.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BibTeX citation block Copy/Paste */}
        <div className="border border-zinc-900 bg-zinc-950/60 p-2.5 rounded-lg">
          <div className="flex items-center justify-between pointer-events-auto select-none mb-1">
            <span className="text-[10px] text-zinc-500 font-bold block">BIBTEX CITATION RESOURCE</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedPaper.citation);
                triggerSound(1200, 0.05);
              }}
              className="bg-zinc-900 text-zinc-400 hover:text-white px-1.5 py-0.5 rounded text-[9.5px] border border-zinc-850 flex items-center gap-0.5 cursor-pointer"
            >
              <Copy className="w-2.5 h-2.5" />
              <span>Copy Citation</span>
            </button>
          </div>
          <code className="text-[9.5px] text-zinc-400 font-mono select-all block leading-tight">{selectedPaper.citation}</code>
        </div>
      </div>
    </div>
  );
}
