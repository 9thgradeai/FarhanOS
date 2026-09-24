import { portfolioData } from '../../data/portfolioData';
import { StyleSet } from '../../types';

interface GardenWindowProps {
  styleSet: StyleSet;
  hoveredGardenNode: string | null;
  setHoveredGardenNode: (val: string | null) => void;
  triggerSound: (freq: number, duration: number) => void;
}

export default function GardenWindow({ styleSet, hoveredGardenNode, setHoveredGardenNode, triggerSound }: GardenWindowProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-[#2c2d3a] pb-2">
        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">Topological Semantics Mapping</span>
        <h3 className="text-xs font-black text-white mt-1">Interconnected Semantic Knowledge Field</h3>
      </div>

      <div>
        <span className={styleSet.panelHeader}>INTERACTIVE CONCEPT NODES</span>
        <div className="relative h-44 bg-zinc-950 p-2 border border-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-35" />

          <div className="relative w-full h-full">
            {portfolioData.gardenNodes.map((gn, idx) => {
              const posX = (idx * 11) % 80 + 10;
              const posY = (idx * 7) % 65 + 15;
              const isNodeHovered = hoveredGardenNode === gn.id;

              return (
                <button
                  key={gn.id}
                  aria-label={`Concept node: ${gn.label}`}
                  aria-pressed={isNodeHovered}
                  onMouseEnter={() => { setHoveredGardenNode(gn.id); triggerSound(1100, 0.01); }}
                  onMouseLeave={() => setHoveredGardenNode(null)}
                  onFocus={() => setHoveredGardenNode(gn.id)}
                  onBlur={() => setHoveredGardenNode(null)}
                  onClick={() => { setHoveredGardenNode(gn.id); triggerSound(1100, 0.01); }}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 py-0.5 rounded border text-[9px] transition-all cursor-pointer font-mono ${isNodeHovered ? 'bg-[#00ffcc] text-black border-[#00ffcc] scale-110 shadow-[0_0_8px_#00ffcc] z-50' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'}`}
                >
                  {gn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanatory Node Card */}
      <div className="bg-zinc-950 p-3 border border-zinc-900 rounded-lg min-h-[50px] select-text">
        <span className="font-bold text-cyan-300 block text-[9.5px] uppercase font-mono tracking-widest mb-1">
          Active Node Spectrum Details:
        </span>
        {hoveredGardenNode ? (
          <p className="text-[10px] text-zinc-400 leading-normal font-sans">
            {hoveredGardenNode === 'nlp' && "Clinical NLP: Integrates semantic transformers explicitly tuned on Reddit discourse corpus mapping mental distress."}
            {hoveredGardenNode === 'transformers' && "Transformers: Multi-attention neural architectures providing topological weights maps."}
            {hoveredGardenNode === 'depression' && "Depression Dialectics: Analysis of negation markers and cognitive distortions."}
            {hoveredGardenNode === 'ethics' && "Research Ethics: Strict patient confidentiality controls verified against strict healthcare safety parameters."}
            {hoveredGardenNode === 'saas' && "AI SaaS: Low-latency scale-to-zero container workloads deployed across GCP Kubernetes mesh integrations."}
            {!['nlp', 'transformers', 'depression', 'ethics', 'saas'].includes(hoveredGardenNode) && `Semantic connection active on ${hoveredGardenNode}. High performance clustering coefficient evaluated.`}
          </p>
        ) : (
          <p className="text-[10px] text-zinc-500 font-sans">Hover, focus, or tap any interactive concept node above to evaluate corresponding diagnostic dependencies...</p>
        )}
      </div>
    </div>
  );
}
