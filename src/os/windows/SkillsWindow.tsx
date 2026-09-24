import React, { useState, useEffect } from 'react';
import { SkillNode } from '../../types';

interface SkillsWindowProps {
  filteredSkills: SkillNode[];
  skillFilter: 'all' | 'AI/ML' | 'Frontend' | 'Backend' | 'Research' | 'Systems';
  setSkillFilter: (val: 'all' | 'AI/ML' | 'Frontend' | 'Backend' | 'Research' | 'Systems') => void;
  triggerSound: (freq: number, duration: number) => void;
}

export default function SkillsWindow({ filteredSkills, skillFilter, setSkillFilter, triggerSound }: SkillsWindowProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const filterOptions = ['all', 'AI/ML', 'Frontend', 'Backend', 'Research', 'Systems'];

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [skillFilter]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, -1));
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filterOptions.length - 1));
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        setSkillFilter(filterOptions[highlightedIndex] as 'all' | 'AI/ML' | 'Frontend' | 'Backend' | 'Research' | 'Systems');
        triggerSound(800, 0.02);
      }
    }
  };

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      <div className="border-b border-[#2c2d3a] pb-2 flex-col gap-0.5">
        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">Observatory Deck</span>
        <h3 className="text-xs font-black text-white mt-1">Linguistic, Structural & Compute Matrices</h3>
      </div>

      <div className="flex items-center gap-2 bg-zinc-950/60 p-1 border border-zinc-900 rounded-lg overflow-x-auto scrollbar-none select-none">
        {(['all', 'AI/ML', 'Frontend', 'Backend', 'Research', 'Systems'] as const).map((filter) => {
          const isHighlighted = highlightedIndex === filterOptions.indexOf(filter);
          const isSelected = skillFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => { setSkillFilter(filter); triggerSound(800, 0.02); }}
              aria-pressed={isSelected}
              className={`text-[9.5px] px-2.5 py-1 rounded capitalize cursor-pointer transition-colors ${
                isSelected ? 'bg-indigo-600 font-bold text-white shadow-[0_0_8px_#4f46e5]' :
                isHighlighted ? 'bg-indigo-500/20 text-indigo-400' :
                'bg-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {filter === 'all' ? 'All Matrices' : filter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1 scrollbar-none">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full text-center py-8 text-zinc-500 text-[11px] font-mono">
            No skills match this filter.
          </div>
        ) : (
          filteredSkills.map((sk) => {
            const weightPct = sk.weight === 5 ? 'border-sky-500/50 bg-sky-500/5 text-sky-200' : sk.weight === 4 ? 'border-indigo-500/30 bg-indigo-500/5 text-indigo-200' : 'border-zinc-800 bg-zinc-900/40 text-zinc-400';
            return (
              <div
                key={sk.name}
                onClick={() => triggerSound(700 + sk.weight * 100, 0.03)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerSound(700 + sk.weight * 100, 0.03); } }}
                className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all hover:scale-103 select-none flex flex-col items-center justify-center gap-1 relative overflow-hidden ${weightPct}`}
              >
                <span className="text-[10.5px] font-bold md:tracking-tight font-sans text-stone-100">{sk.name}</span>
                <span className="text-[10px] opacity-75 uppercase tracking-widest font-mono text-zinc-400">{sk.category}</span>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, stIdx) => (
                    <span key={stIdx} className={`w-1 h-1 rounded-full ${stIdx < sk.weight ? 'bg-indigo-400 shadow-[0_0_4px_#818cf8]' : 'bg-zinc-800'}`} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
