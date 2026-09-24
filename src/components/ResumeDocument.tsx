import { Printer, ArrowLeft } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { siteConfig } from '../config/site';

/**
 * Printable, ATS-friendly resume rendered from the same live portfolioData
 * that powers the site — a single source of truth. Route: #/resume.
 * Screen shows a light document page with a floating toolbar (hidden in
 * print); print output is a clean black-on-white document.
 */
export function parseResumeRoute(): boolean {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#/resume');
}

export default function ResumeDocument({ onBack }: { onBack: () => void }) {
  const skillGroups = portfolioData.skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s.name);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-200 text-slate-900 font-sans">
      <style>{`@page { margin: 13mm; }`}</style>

      {/* Toolbar — screen only */}
      <div className="print:hidden sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to site
          </button>
          <span className="text-[10px] font-mono text-zinc-500 ml-1">farhankabir.tech/#/resume</span>
          <button
            onClick={() => window.print()}
            className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-white text-zinc-900 hover:bg-zinc-200 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <main className="max-w-3xl mx-auto my-6 print:my-0 bg-white shadow-2xl print:shadow-none px-8 py-10 print:px-0 print:py-0 text-slate-900">
        <header className="border-b-2 border-slate-900 pb-4 mb-5">
          <h1 className="text-3xl font-black tracking-tight">{portfolioData.name}</h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">{portfolioData.title}</p>
          <p className="text-xs text-slate-600 mt-2">
            {siteConfig.contactEmail} · https://farhankabir.tech · https://github.com/farhankabir133 · https://www.linkedin.com/in/farhankabir133/
          </p>
        </header>

        <section className="mb-5">
          <h2 className="text-xs font-black tracking-widest uppercase border-b border-slate-300 pb-1 mb-2">Summary</h2>
          <p className="text-xs leading-relaxed">{portfolioData.about}</p>
        </section>

        <section className="mb-5">
          <h2 className="text-xs font-black tracking-widest uppercase border-b border-slate-300 pb-1 mb-2">Experience</h2>
          <div className="space-y-3">
            {portfolioData.timeline.map((t) => (
              <div key={`${t.year}-${t.title}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold">{t.title} — {t.company}</h3>
                  <span className="text-xs text-slate-500 shrink-0">{t.year}</span>
                </div>
                <p className="text-xs italic text-slate-600">{t.role}</p>
                <p className="text-xs mt-0.5">{t.description}</p>
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  {t.achievements.map((a) => (
                    <li key={a} className="text-xs">{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="text-xs font-black tracking-widest uppercase border-b border-slate-300 pb-1 mb-2">Skills</h2>
          <div className="space-y-1">
            {Object.entries(skillGroups).map(([cat, names]) => (
              <p key={cat} className="text-xs">
                <strong>{cat}:</strong> {names.join(', ')}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="text-xs font-black tracking-widest uppercase border-b border-slate-300 pb-1 mb-2">Publications</h2>
          <div className="space-y-2">
            {portfolioData.papers.map((p) => (
              <div key={p.id}>
                <h3 className="text-xs font-bold">{p.title}</h3>
                <p className="text-xs text-slate-600">{p.authors} · {p.journal} ({p.year})</p>
                {p.takeaway && <p className="text-xs mt-0.5">Finding: {p.takeaway}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="text-xs font-black tracking-widest uppercase border-b border-slate-300 pb-1 mb-2">Selected Projects</h2>
          <div className="space-y-2">
            {portfolioData.projects.map((p) => (
              <div key={p.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-xs font-bold">{p.title}</h3>
                  <span className="text-xs text-slate-500 shrink-0">{p.timeline}</span>
                </div>
                <p className="text-xs text-slate-600">{p.techStack.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black tracking-widest uppercase border-b border-slate-300 pb-1 mb-2">Certifications</h2>
          <ul className="list-disc ml-5 space-y-0.5">
            {portfolioData.certifications.map((c) => (
              <li key={`${c.title}-${c.date}`} className="text-xs">
                <strong>{c.title}</strong> — {c.issuer} ({c.date})
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
