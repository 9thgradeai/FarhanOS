import { portfolioData } from '../../data/portfolioData';
import { StyleSet, TimelineEvent } from '../../types';

interface TimelineWindowProps {
  styleSet: StyleSet;
  selectedTimeline: TimelineEvent;
  setSelectedTimeline: (item: TimelineEvent) => void;
  triggerSound: (freq: number, duration: number) => void;
}

export default function TimelineWindow({ styleSet, selectedTimeline, setSelectedTimeline, triggerSound }: TimelineWindowProps) {
  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* LHS Slider Selector */}
      <div className="w-full md:w-52 border-r border-[#2d2f3d] pr-4 flex flex-col gap-2 select-none">
        <span className={styleSet.panelHeader}>CHRONOLOGY INDEX</span>
        <div className="space-y-1.5">
          {portfolioData.timeline.map((item) => (
            <button
              key={item.year}
              onClick={() => { setSelectedTimeline(item); triggerSound(800, 0.03); }}
              className={`w-full text-left p-2 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${selectedTimeline.year === item.year ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 font-bold' : 'bg-transparent border-zinc-900 text-zinc-400 hover:bg-zinc-950'}`}
            >
              <span className="text-[10.5px]">{item.company}</span>
              <span className="bg-zinc-900 px-1.5 py-0.5 rounded text-[10px] font-mono">{item.year}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RHS Event Details */}
      <div className="flex-1 space-y-3">
        <div className="border-b border-[#2c2d3a] pb-2">
          <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-1 py-0.5 rounded text-[9.5px] font-mono">YEAR: {selectedTimeline.year} EXP</span>
          <h4 className="text-xs font-black text-white mt-1.5">{selectedTimeline.title}</h4>
          <span className="text-[9.5px] text-zinc-500 font-sans block">{selectedTimeline.company} · Role: {selectedTimeline.role}</span>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-400 font-sans select-text">{selectedTimeline.description}</p>

        <div className="space-y-2 select-text">
          <span className={styleSet.panelHeader}>HIGHLIGHT ACCOMPLISHMENTS</span>
          <ul className="space-y-1.5 pl-3 list-disc text-[10.5px] text-slate-300 leading-normal">
            {selectedTimeline.achievements.map((ach, idx) => (
              <li key={idx} className="marker:text-sky-400">{ach}</li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-950/40 p-2.5 border border-zinc-900 rounded-lg mt-3">
          <span className="font-bold text-zinc-300 block text-[9.5px] uppercase font-mono tracking-widest mb-1.5">INTEGRATED TECH GRID</span>
          <div className="flex flex-wrap gap-1 select-none">
            {selectedTimeline.technologies.map((t) => (
              <span key={t} className="bg-zinc-900 text-slate-400 border border-zinc-800 rounded px-1.5 font-mono text-[9px]">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
