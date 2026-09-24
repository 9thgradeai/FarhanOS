import { Cpu, Workflow, Check, RefreshCw, Calendar } from 'lucide-react';

import { siteConfig } from '../../config/site';
import { notify } from '../../components/Toast';
interface BriefForm {
  projectType: string;
  budget: string;
  timeline: string;
  goals: string;
  comments: string;
  email: string;
}

interface BriefWindowProps {
  briefForm: BriefForm;
  setBriefForm: (val: BriefForm) => void;
  briefLoading: boolean;
  briefSummary: string | null;
  briefDispatchLoading: boolean;
  handleSendBrief: () => void;
  handleDispatchBrief: () => void;
}

export default function BriefWindow({
  briefForm,
  setBriefForm,
  briefLoading,
  briefSummary,
  briefDispatchLoading,
  handleSendBrief,
  handleDispatchBrief
}: BriefWindowProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-[#2c2d3a] pb-2">
        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">INTELLIGENT INTAKE PROCESS</span>
        <h3 className="text-xs font-black text-white mt-1">Initiate Feasibility Evaluation Strategy</h3>
      </div>

      {siteConfig.calendlyUrl && (
        <a
          href={siteConfig.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-sky-600 hover:bg-sky-500 text-white border border-sky-400 py-2 rounded-lg text-[10.5px] cursor-pointer font-bold tracking-tight"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book a Call Instead</span>
        </a>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Configuration Parameter Fields */}
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-mono">VENTURE DOMAIN:</label>
            <select
              value={briefForm.projectType}
              onChange={(e) => setBriefForm({ ...briefForm, projectType: e.target.value })}
              className="w-full bg-black/60 border border-zinc-800 rounded px-2.5 py-1.5 text-slate-100 text-[10.5px] outline-hidden focus:border-rose-500/50 cursor-pointer"
            >
              <option>AI Engineering & LLMs</option>
              <option>Clinical NLP & Mental State analysis</option>
              <option>SaaS Automation Development</option>
              <option>Interactive UI/UX Projects</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-mono">FINANCIAL BOUNDS:</label>
              <select
                value={briefForm.budget}
                onChange={(e) => setBriefForm({ ...briefForm, budget: e.target.value })}
                className="w-full bg-black/60 border border-zinc-800 rounded px-2 text-slate-100 text-[10.5px] py-1.5 outline-hidden cursor-pointer"
              >
                <option>$5k - $10k</option>
                <option>$10k - $25k</option>
                <option>$25k+</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-mono">TIMELINE PROFILE:</label>
              <select
                value={briefForm.timeline}
                onChange={(e) => setBriefForm({ ...briefForm, timeline: e.target.value })}
                className="w-full bg-black/60 border border-zinc-800 rounded px-2 text-slate-100 text-[10.5px] py-1.5 outline-hidden cursor-pointer"
              >
                <option>1-3 Months</option>
                <option>3 Months-half year</option>
                <option>Complex Multiphase</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-mono">TRANSMISSION EMAIL:</label>
              <input
                type="email"
                value={briefForm.email}
                onChange={(e) => setBriefForm({ ...briefForm, email: e.target.value })}
                placeholder="e.g. name@domain.com"
                className="w-full bg-black/60 border border-zinc-800 rounded px-2.5 py-1.5 text-slate-100 text-[10.5px] outline-hidden focus:border-rose-500/50 placeholder-zinc-700 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-mono">OPERATIONAL DIRECTIVES:</label>
              <input
                type="text"
                value={briefForm.comments}
                onChange={(e) => setBriefForm({ ...briefForm, comments: e.target.value })}
                placeholder="e.g. Custom requirements, NDA, etc."
                className="w-full bg-black/60 border border-zinc-800 rounded px-2.5 py-1.5 text-slate-100 text-[10.5px] outline-hidden focus:border-rose-500/50 placeholder-zinc-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-mono">STRATEGIC GOALS / OBJECTIVES:</label>
            <textarea
              value={briefForm.goals}
              onChange={(e) => setBriefForm({ ...briefForm, goals: e.target.value })}
              rows={3}
              placeholder="Detail parameters (e.g. evaluating clinical texts via custom token systems, building offline CRDT platforms)"
              className="w-full bg-black/60 border border-zinc-800 rounded p-2 text-slate-100 text-[10.5px] outline-hidden focus:border-rose-500/50 placeholder-zinc-650"
            />
          </div>

          <button
            onClick={handleSendBrief}
            disabled={!briefForm.goals.trim() || briefLoading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 py-2 rounded-lg text-[10.5px] cursor-pointer font-bold tracking-tight shadow-lg shadow-rose-950/50 flex items-center justify-center gap-1.5"
          >
            {briefLoading ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Deconstruct parameters algorithms...</span>
              </>
            ) : (
              <>
                <Workflow className="w-3.5 h-3.5" />
                <span>Evaluate Feasibility Strategy</span>
              </>
            )}
          </button>
        </div>

        {/* Strategic analysis read-out panel */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-3.5 flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="font-bold text-rose-300 block text-[9.5px] uppercase font-mono tracking-widest border-b border-zinc-850 pb-1.5 mb-2.5">
              ASSESSMENT & ARCHITECTURE STRATEGY:
            </span>
            {briefSummary ? (
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans select-text">{briefSummary}</p>
            ) : (
              <div className="text-zinc-600 font-sans text-[10.5px] italic text-center py-10">
                Formulate objectives on LHS & execute evaluation to render Groq predictive architecture recommendations...
              </div>
            )}
          </div>

          {briefSummary && (
            <div className="border-t border-zinc-900 pt-2 text-[10px] flex items-center justify-between mt-4 gap-2 flex-wrap">
              <span className="text-zinc-500 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3 text-emerald-400" /> API SECURE Rails
              </span>
              <div className="flex items-center gap-2">
                {siteConfig.formspreeId && (
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`https://formspree.io/f/${siteConfig.formspreeId}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                          body: JSON.stringify({
                            email: briefForm.email,
                            projectType: briefForm.projectType,
                            budget: briefForm.budget,
                            timeline: briefForm.timeline,
                            goals: briefForm.goals,
                            comments: briefForm.comments,
                            summary: briefSummary,
                          }),
                        });
                        notify('success', 'Brief sent via Formspree.');
                      } catch {
                        notify('error', 'Formspree delivery failed — please use Dispatch Brief or email directly.');
                      }
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold p-1 px-3 border border-zinc-700 rounded text-[9.5px] cursor-pointer"
                  >
                    Send via Formspree
                  </button>
                )}
                <button
                  onClick={handleDispatchBrief}
                  disabled={briefDispatchLoading || !briefForm.email.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-850 disabled:text-zinc-500 disabled:border-zinc-800 text-white font-bold p-1 px-3 border border-emerald-400 disabled:border-transparent rounded text-[9.5px] cursor-pointer flex items-center gap-1.5"
                >
                  {briefDispatchLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <span>Dispatch Brief</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
