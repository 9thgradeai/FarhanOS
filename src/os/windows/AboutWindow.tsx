import { Quote, Sparkles, GraduationCap, Star, BookOpen, Brain } from 'lucide-react';
import { portfolioData } from '../../data/portfolioData';
import { StyleSet } from '../../types';

interface AboutWindowProps {
  styleSet: StyleSet;
}

export default function AboutWindow({ styleSet }: AboutWindowProps) {
  const {
    about,
    focus,
    readingNow,
    learningNow,
    thinkingAbout,
    certifications,
    testimonials,
  } = portfolioData;

  return (
    <div className="h-full overflow-y-auto scrollbar-none pr-1 space-y-5 text-slate-200">
      {/* Identity / story */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400">Who I Am</h3>
        </div>
        <p className="text-[12px] leading-relaxed select-text">{about}</p>
      </section>

      {/* Focus areas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: Brain, label: 'Current Focus', value: focus },
          { icon: BookOpen, label: 'Reading Now', value: readingNow },
          { icon: Sparkles, label: 'Learning Now', value: learningNow },
          { icon: Star, label: 'Thinking About', value: thinkingAbout },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3">
            <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-zinc-500">
              <Icon className="w-3 h-3" />
              {label}
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300 select-text">{value}</p>
          </div>
        ))}
      </section>

      {/* Certifications */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Certifications</h3>
        </div>
        <div className="space-y-2">
          {certifications.map((c) => (
            <div key={c.title} className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-slate-100">{c.title}</span>
                <span className="text-[10px] font-mono text-zinc-500">{c.date}</span>
              </div>
              <p className="text-[10px] text-zinc-500 mb-1.5">{c.issuer}</p>
              <div className="flex flex-wrap gap-1">
                {c.skills.map((s) => (
                  <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Quote className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">What Collaborators Say</h3>
        </div>
        <div className="space-y-2">
          {testimonials.map((t) => (
            <div key={t.author} className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 p-3">
              <p className="text-[11px] leading-relaxed text-zinc-300 select-text italic">"{t.text}"</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                  {t.initials}
                </span>
                <div className="leading-tight">
                  <p className="text-[10px] font-semibold text-slate-200">{t.author}</p>
                  <p className="text-[9px] text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
