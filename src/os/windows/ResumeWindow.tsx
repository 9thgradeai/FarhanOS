import { Download } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { StyleSet } from '../../types';

interface ResumeWindowProps {
  styleSet: StyleSet;
  resumeAudience: 'recruiter' | 'investor' | 'founder' | 'researcher';
  setResumeAudience: (val: 'recruiter' | 'investor' | 'founder' | 'researcher') => void;
  triggerSound: (freq: number, duration: number) => void;
}

export default function ResumeWindow({ styleSet, resumeAudience, setResumeAudience, triggerSound }: ResumeWindowProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2c2d3a] pb-2">
        <div>
          <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">VIRTUAL RESUME ARCHITECT</span>
          <h3 className="text-sm font-extrabold text-white mt-1">Interactively Tailored Professional Profile</h3>
        </div>

        <button
          onClick={() => { window.print(); triggerSound(1100, 0.05); }}
          className="bg-zinc-950 text-zinc-300 border border-zinc-800 hover:text-white px-2.5 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer font-bold mt-2 sm:mt-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print Resume Draft</span>
        </button>
        <a
          href="/resume/Senior Full Stack Engineer/Resume.pdf"
          download
          onClick={() => triggerSound(1100, 0.05)}
          className="bg-pink-500/10 text-pink-300 border border-pink-500/30 hover:text-white px-2.5 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer font-bold mt-2 sm:mt-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Resume PDF</span>
        </a>
      </div>

      {/* Selector of Target Audience */}
      <div className="bg-zinc-950 p-2.5 border border-zinc-900 rounded-lg select-none">
        <span className="text-[10px] text-zinc-500 font-bold block mb-1">CONFIGURE AUDIENCE TAILORING SYSTEM:</span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 text-center">
          {[
            { id: 'recruiter', label: 'HR / Recruiter', text: 'Stresses full-stack frameworks, production scale parameters, and GCP deployment latency F1 scores.' },
            { id: 'investor', label: 'Venture Capital', text: 'Emphasizes SaaS monetization indices, model scaling cost reductions, and architectural automation.' },
            { id: 'founder', label: 'Startups / Founder', text: 'Highlights rapid zero-to-one product engineering, Docker stacks, and low-latency API integration.' },
            { id: 'researcher', label: 'Clinical Academics', text: 'Focuses on linguistic models, peer-reviewed indices, topological sentiment classification levels, and statistical dataset weights.' }
          ].map((aud) => (
            <button
              key={aud.id}
              onClick={() => { setResumeAudience(aud.id as 'recruiter' | 'investor' | 'founder' | 'researcher'); triggerSound(800, 0.02); }}
              className={`p-2 rounded-lg border text-[10px] text-left flex flex-col gap-0.5 capitalize transition-all cursor-pointer ${resumeAudience === aud.id ? 'bg-pink-500/10 border-pink-500/30 text-pink-300 font-bold' : 'bg-transparent border-zinc-900 text-zinc-400 hover:bg-zinc-950'}`}
            >
              <span>👤 {aud.label}</span>
              <span className="text-[10px] opacity-70 font-normal leading-normal">{aud.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Resume Paper sheet */}
      <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-lg text-[10.5px] leading-relaxed max-h-[220px] overflow-y-auto font-sans text-slate-300 pr-1 select-text">
        <div className="border-b border-zinc-850 pb-2 mb-2 text-center select-text">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">{portfolioData.name}</h4>
          <span className="text-[9px] text-[#00ffcc] font-mono tracking-widest">{portfolioData.title}</span>
        </div>

        {resumeAudience === 'recruiter' && (
          <div className="space-y-3">
            <div>
              <span className="font-extrabold text-[#00ffcc] block text-[9.5px] uppercase font-mono">EXECUTIVE SUMMARY (RECRUITER ALIGNED)</span>
              <p>Result-oriented AI engineer possessing over 6 years of contiguous development building fast-response classification models and robust, horizontally-scaled TypeScript SaaS applications with absolute type-safety protocols.</p>
            </div>
            <div>
              <span className="font-extrabold text-[#00ffcc] block text-[9.5px] uppercase font-mono">CORE TECHNICAL SPECIFICATIONS</span>
              <p>React/Next.js, Tailwind v4, Node.js, Go microservices, Python PyTorch matrix operations, PostgreSQL schemas, Redis caches, and Docker container orchestration.</p>
            </div>
          </div>
        )}

        {resumeAudience === 'investor' && (
          <div className="space-y-3">
            <div>
              <span className="font-extrabold text-[#ebd8fb] block text-[9.5px] uppercase font-mono">STRATEGIC SYNOPSIS (VENTURE CAPITAL ALIGNED)</span>
              <p>Product developer specializing in compiling scalable business models. Highly skilled at engineering zero-cold-start ML SaaS containers, driving serverless scale-to-zero GCP costs, and structuring predictive customer diagnostics panels decreasing friction indices by up to 42%.</p>
            </div>
            <div>
              <span className="font-extrabold text-[#ebd8fb] block text-[9.5px] uppercase font-mono">PROVEN MONETIZATION HIGHLIGHTS</span>
              <p>Built SafeSide prediction engines processing live football simulation data in real-time, executing Poisson risk evaluation algorithms with 0.88 F1 metric scores.</p>
            </div>
          </div>
        )}

        {resumeAudience === 'founder' && (
          <div className="space-y-3">
            <div>
              <span className="font-extrabold text-amber-300 block text-[9.5px] uppercase font-mono">PRODUCT FOUNDRY PROTOCOL (FOUNDER ALIGNED)</span>
              <p>High-tempo zero-to-one software architect constructing high-performance platforms immediately on demand. Combines outstanding visual UI craftsmanship with decoupled scalable database designs, providing functional, production-ready systems without overhead.</p>
            </div>
            <div>
              <span className="font-extrabold text-amber-300 block text-[9.5px] uppercase font-mono">CORE FLUIDITY TOOLS</span>
              <p>TypeScript endpoints, instant responsive Tailwind designs, container networks, vector caches, and real-time bimodal communication interfaces.</p>
            </div>
          </div>
        )}

        {resumeAudience === 'researcher' && (
          <div className="space-y-3">
            <div>
              <span className="font-extrabold text-emerald-300 block text-[9.5px] uppercase font-mono">RESEARCH STATEMENT (ACADEMIC ALIGNED)</span>
              <p>Quantitative researcher researching the diagnostic intersection of linguistics analytics and mental wellness forums. Formulating custom bidirectional classification weights metrics that leverage fine-grained RoBERTa embeddings to map emotional distress on social media platforms.</p>
            </div>
            <div>
              <span className="font-extrabold text-emerald-300 block text-[9.5px] uppercase font-mono">ACADEMIC RESEARCH TRACK RECORD</span>
              <p>First-named author on clinical papers (RoBERTa depression classifier F1 accuracy of 0.914 against traditional baselines of 0.781). Outlined topological multidimensional sentiment models.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
