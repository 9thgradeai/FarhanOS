import { RefObject } from 'react';
import { portfolioData } from '../../data/portfolioData';

interface ProfTimelineWindowProps {
  osTimelineProgressLineRef: RefObject<HTMLDivElement | null>;
}

export default function ProfTimelineWindow({ osTimelineProgressLineRef }: ProfTimelineWindowProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#2c2d3a] pb-2">
        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">PRO TIMELINE NODE</span>
        <h3 className="text-xs font-black text-white mt-1">Professional Experience & Verification Chronology</h3>
      </div>

      <div className="relative pl-6 md:pl-0 pt-4">
        <div className="absolute left-[13px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/60 via-cyan-500/20 to-transparent -translate-x-1/2 pointer-events-none z-0"></div>
        <div
          ref={osTimelineProgressLineRef}
          className="absolute left-[13px] md:left-1/2 top-0 bottom-16 w-[2px] bg-gradient-to-b from-cyan-400 to-purple-600 -translate-x-1/2 origin-top pointer-events-none z-10"
          style={{ transform: `scaleY(0)`, transformOrigin: 'top' }}
        ></div>

        <div className="space-y-10 relative z-10">
          {portfolioData.professionalTimeline.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div key={idx} className={`flex flex-col md:flex-row items-start ${isLeft ? 'md:flex-row-reverse' : ''} relative`}>
                <div className="absolute left-[13px] md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                  <div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500"></span>
                  </div>
                </div>

                <div className="hidden md:block w-1/2" />

                <div className="w-full md:w-[46%] pl-8 md:pl-0">
                  <div className="p-5 rounded-xl bg-zinc-900/30 border border-zinc-900/80 relative group hover:border-zinc-800 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 blur-lg pointer-events-none group-hover:bg-cyan-500/10 transition-colors"></div>

                    <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold block mb-0.5">{item.year}</span>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">{item.title}</h4>
                        <span className="text-[9px] text-zinc-550 block font-mono mt-0.5">{item.company}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-medium uppercase ${
                        item.badgeColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        item.badgeColor === 'indigo' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                        item.badgeColor === 'pink' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>{item.company}</span>
                    </div>

                    <ul className="space-y-2 mb-4 text-[10.5px] text-zinc-400">
                      {item.achievements.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start leading-relaxed text-zinc-400 select-text">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 mt-1.5 mr-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1 pt-3 border-t border-zinc-900/60 select-none">
                      {item.technologies.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-950/80 text-zinc-400 border border-zinc-900">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
