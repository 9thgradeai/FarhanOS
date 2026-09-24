import React from 'react';
import { motion } from 'motion/react';
import {
  Check, ChevronLeft, ChevronRight, Clock, Award, Quote,
  Github, Linkedin, ExternalLink, Mail, MapPin, User,
  Instagram, RefreshCw, Send, ArrowUp,
  ChevronDown, Layers, Globe, Rocket, Star, GitFork
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useLandingPage } from './LandingPageContext';
import { track } from '../utils/analytics';
import { getApiBaseUrl } from '../utils/apiConfig';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MediumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0a3.26 3.26 0 01-3.26 3.27 3.26 3.26 0 01-3.26-3.27 3.26 3.26 0 013.26-3.27 3.26 3.26 0 013.26 3.27zm3.04 0a1.07 1.07 0 01-1.07 1.06 1.07 1.07 0 01-1.07-1.06 1.07 1.07 0 011.07-1.06 1.07 1.07 0 011.07 1.06z" />
  </svg>
);

interface TimelineCardProps {
  item: any;
  idx: number;
  theme: import('../types').Theme;
  prefersReducedMotion: boolean;
}

function TimelineCard({ item, idx, theme, prefersReducedMotion }: TimelineCardProps) {
  const isLeft = idx % 2 === 0;

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`flex flex-col md:flex-row items-start ${isLeft ? 'md:flex-row-reverse' : ''} relative`}
    >
      {/* Central Node Circle */}
      <motion.div 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: Math.min(idx * 0.06, 0.3) }}
                className="absolute left-[21px] md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20"
      >
        <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-lg border-cyan-400/80 scale-100">
          <motion.span 
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 scale-100"
          />
        </div>
      </motion.div>

      {/* Spacer to push card to one side */}
      <div className="hidden md:block w-1/2" />

      {/* Card Content Container */}
      <div className="w-full md:w-[46%] pl-12 md:pl-0">
        <motion.div 
          whileHover={{ y: -4, opacity: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`p-6 md:p-8 rounded-2xl border backdrop-blur-md relative group ${theme === 'light' 
            ? 'bg-white/80 border-slate-200 shadow-lg hover:border-indigo-400 hover:shadow-indigo-500/5' 
            : 'bg-zinc-950/45 border-zinc-900 shadow-2xl hover:border-zinc-850 hover:shadow-cyan-500/5'}`}
        >
          {/* Glow Overlay */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          
          {/* Card Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold block mb-1">{item.year}</span>
              <h3 className={`text-base md:text-lg font-sans font-bold leading-tight transition-colors group-hover:text-cyan-300 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{item.title}</h3>
              <span className="text-[10px] font-mono text-zinc-550 block mt-1">{item.company}</span>
            </div>
            
            {/* Company Badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono border font-medium uppercase ${
              item.badgeColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              item.badgeColor === 'indigo' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
              item.badgeColor === 'pink' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {item.company}
            </span>
          </div>

          {/* Achievements Bullets */}
          <ul className="space-y-3 mb-6 text-zinc-400">
            {item.achievements.map((bullet: string, bIdx: number) => (
              <motion.li 
                key={bIdx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: bIdx * 0.05 }}
                className="flex items-start text-[11px] leading-relaxed font-sans text-zinc-400 select-text"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/80 mt-1.5 mr-2.5 shrink-0" />
                <span>{bullet}</span>
              </motion.li>
            ))}
          </ul>

          {/* Tech Stack Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-900/60 select-none"
          >
            {item.technologies.map((t: string, tIdx: number) => (
              <motion.span 
                key={t}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: tIdx * 0.05 }}
                className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-zinc-950/80 text-zinc-400 border border-zinc-900"
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Unique visual identity per project (cycled across the list) so every
// card showcases its name with a distinct accent + animated motif.
const INNOVATION_ACCENTS = [
  { from: '#6366f1', to: '#22d3ee', glow: 'rgba(99,102,241,0.35)', soft: '#c7d2fe' },
  { from: '#f472b6', to: '#a855f7', glow: 'rgba(244,114,182,0.30)', soft: '#fbcfe8' },
  { from: '#34d399', to: '#22d3ee', glow: 'rgba(52,211,153,0.30)', soft: '#bbf7d0' },
  { from: '#fbbf24', to: '#f97316', glow: 'rgba(251,191,36,0.30)', soft: '#fde68a' },
  { from: '#60a5fa', to: '#818cf8', glow: 'rgba(96,165,250,0.30)', soft: '#bfdbfe' },
  { from: '#f87171', to: '#fb7185', glow: 'rgba(248,113,113,0.30)', soft: '#fecaca' },
  { from: '#2dd4bf', to: '#3b82f6', glow: 'rgba(45,212,191,0.30)', soft: '#99f6e4' },
  { from: '#c084fc', to: '#6366f1', glow: 'rgba(192,132,252,0.30)', soft: '#e9d5ff' }
];

const MOTIF_TYPES = ['orbit', 'grid', 'wave', 'pulse', 'scan', 'prism'] as const;
type MotifType = (typeof MOTIF_TYPES)[number];

function InnovationMotif({ type, color, animate }: { type: MotifType; color: string; animate: boolean }) {
  const common = { className: 'absolute right-3 top-3 w-16 h-16 opacity-40 pointer-events-none', fill: 'none', stroke: color };
  if (type === 'orbit') {
    return (
      <svg viewBox="0 0 64 64" {...common}>
        <circle cx="32" cy="32" r="10" strokeOpacity="0.5" />
        <motion.g animate={animate ? { rotate: 360 } : {}} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} style={{ originX: '32px', originY: '32px' }}>
          <ellipse cx="32" cy="32" rx="26" ry="12" />
          <circle cx="58" cy="32" r="3" fill={color} stroke="none" />
        </motion.g>
      </svg>
    );
  }
  if (type === 'grid') {
    return (
      <svg viewBox="0 0 64 64" {...common}>
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
          <rect key={`${r}-${c}`} x={10 + c * 12} y={10 + r * 12} width="8" height="8" rx="2" strokeOpacity="0.5" />
        )))}
      </svg>
    );
  }
  if (type === 'wave') {
    return (
      <svg viewBox="0 0 64 64" {...common}>
        <motion.path animate={animate ? { d: ['M4 40 Q 16 20 32 40 T 60 40', 'M4 40 Q 16 60 32 40 T 60 40', 'M4 40 Q 16 20 32 40 T 60 40'] } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'pulse') {
    return (
      <svg viewBox="0 0 64 64" {...common}>
        <motion.path animate={animate ? { d: ['M4 32 H18 L24 14 L32 50 L40 24 L46 32 H60', 'M4 32 H16 L22 44 L30 20 L38 40 L44 32 H60', 'M4 32 H18 L24 14 L32 50 L40 24 L46 32 H60'] } : {}} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} strokeWidth="2.5" />
      </svg>
    );
  }
  if (type === 'scan') {
    return (
      <svg viewBox="0 0 64 64" {...common}>
        <rect x="10" y="10" width="44" height="44" rx="6" strokeOpacity="0.5" />
        <motion.line animate={animate ? { y1: [12, 52, 12], y2: [12, 52, 12] } : {}} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} x1="10" x2="54" strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" {...common}>
      <motion.path animate={animate ? { rotate: 360 } : {}} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} style={{ originX: '32px', originY: '32px' }} d="M32 6 L58 32 L32 58 L6 32 Z" strokeOpacity="0.5" />
      <circle cx="32" cy="32" r="6" fill={color} stroke="none" />
    </svg>
  );
}

interface RepoStats {
  stars: number;
  forks: number;
  language: string | null;
}

interface InnovationCardProps {
  project: import('../types').Project;
  index: number;
  accent: (typeof INNOVATION_ACCENTS)[number];
  motif: MotifType;
  theme: import('../types').Theme;
  styleSet: Record<string, string>;
  prefersReducedMotion: boolean;
  onOpenWindowDirectly: (windowId: string) => void;
  repo?: RepoStats;
}

function InnovationCard({ project, index, accent, motif, theme, styleSet, prefersReducedMotion, onOpenWindowDirectly, repo }: InnovationCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const links = portfolioData.projectLinks?.[project.id] ?? {};
  const monogram = project.title.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || project.title.slice(0, 2).toUpperCase();
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22, delay: (index % 2) * 0.08 }}
      whileHover={prefersReducedMotion ? {} : { y: -10 }}
      className={`group relative overflow-hidden rounded-3xl border p-6 flex flex-col justify-between transition-colors duration-300 ${
        isLight ? 'bg-white/85 border-slate-200 hover:border-indigo-300 shadow-lg' : 'bg-[#0b0c14]/65 border-zinc-900/80 hover:border-zinc-700'
      }`}
    >
      {/* Accent glow + motif */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${accent.glow}, transparent 70%)` }}
      />
      <InnovationMotif type={motif} color={accent.from} animate={!prefersReducedMotion} />

      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
          >
            {monogram}
          </motion.div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${styleSet.badgeStyle}`}>
              {project.category}
            </span>
            <span className="text-[9px] text-zinc-500 font-mono font-semibold whitespace-nowrap">{project.timeline}</span>
          </div>
        </div>

        {/* Unique title treatment */}
        <h3
          className="text-lg md:text-xl font-extrabold leading-tight tracking-tight"
          style={{
            background: `linear-gradient(120deg, ${accent.from}, ${accent.to})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {project.title}
        </h3>
        <p className="mt-2 text-[11px] sm:text-xs text-zinc-400 font-sans leading-relaxed select-text">
          {project.description}
        </p>
      </div>

      {/* Metrics dashboard */}
      <div className="my-4 grid grid-cols-3 gap-2 rounded-xl border border-zinc-900/80 bg-black/40 p-2.5 text-center font-mono">
        {project.metrics.map((m, idx) => (
          <div key={m.label} className="p-1">
            <span className="block text-[9.5px] font-bold" style={{ color: accent.from }}>{m.value}</span>
            <span className="mt-0.5 block text-[7px] uppercase tracking-tight text-zinc-500 line-clamp-1">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div className="mb-4 flex flex-wrap gap-1">
        {project.techStack.map((tech) => (
          <span key={tech} className="text-[10px] font-mono rounded bg-zinc-950 border border-zinc-900/40 px-1.5 py-0.5 text-zinc-500">
            {tech}
          </span>
        ))}
      </div>

      {/* Live repo stats */}
      {repo && (
        <div className="mb-4 flex items-center gap-3 text-[9px] font-mono text-zinc-500">
          <span className="flex items-center gap-1" title="GitHub stars">
            <Star className="w-3 h-3 text-amber-400" />
            {repo.stars.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" title="GitHub forks">
            <GitFork className="w-3 h-3 text-zinc-400" />
            {repo.forks.toLocaleString()}
          </span>
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {repo.language}
            </span>
          )}
        </div>
      )}

      {/* Expandable details */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="space-y-3 rounded-xl border border-zinc-900/70 bg-black/30 p-3 text-[10px] leading-relaxed">
          <div>
            <span className="font-mono font-bold uppercase tracking-wider" style={{ color: accent.soft }}>Problem</span>
            <p className="text-zinc-400 mt-0.5">{project.problem}</p>
          </div>
          <div>
            <span className="font-mono font-bold uppercase tracking-wider" style={{ color: accent.soft }}>Solution</span>
            <p className="text-zinc-400 mt-0.5">{project.solution}</p>
          </div>
          <div>
            <span className="font-mono font-bold uppercase tracking-wider" style={{ color: accent.soft }}>Architecture</span>
            <p className="text-zinc-400 mt-0.5">{project.architecture}</p>
          </div>
          <div>
            <span className="font-mono font-bold uppercase tracking-wider" style={{ color: accent.soft }}>Roadmap</span>
            <ul className="mt-1 flex flex-wrap gap-1">
              {project.roadmap.map((r) => (
                <li key={r} className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-400">{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Action bar */}
      <div className="mt-4 flex items-center gap-2 select-none border-t border-zinc-900/60 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 rounded-xl border border-zinc-800/80 bg-zinc-950 px-3 py-2.5 text-[10px] font-mono font-bold text-zinc-300 transition-colors hover:text-white hover:border-zinc-700"
        >
          <Layers className="h-3.5 w-3.5" />
          {expanded ? 'HIDE' : 'DETAILS'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </motion.button>

        <a
          href={links.github || 'https://github.com/farhankabir133'}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-zinc-850 bg-zinc-950/60 p-2.5 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white inline-flex"
          title="View source on GitHub"
        >
          <Github className="h-3.5 w-3.5" />
        </a>

        {links.demo ? (
          <a
            href={links.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-zinc-850 bg-zinc-950/60 p-2.5 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white inline-flex"
            title="Open live demo"
          >
            <Globe className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span
            className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-2.5 text-zinc-700"
            title="Live deployment coming soon"
          >
            <Globe className="h-3.5 w-3.5" />
          </span>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onOpenWindowDirectly('projects')}
          className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[10px] font-mono font-bold text-white transition-transform"
          style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})` }}
        >
          <Rocket className="h-3.5 w-3.5" />
          OPEN OS
        </motion.button>
      </div>
    </motion.div>
  );
}

function LandingBelowFold() {
  const ctx = useLandingPage();
  const {
    theme, isWarping, onLaunchOS, onOpenWindowDirectly,
    articles, onOpenArticleDirectly, prefersReducedMotion,
    showBackToTop, activeTab, setActiveTab,
    activeTestimonial, setActiveTestimonial,
    testimonialPaused, setTestimonialPaused,
    styleSet, filteredSkills, testimonials, certifications,
    timelineRef, progressLineRef,
    handleAnchorClick, scrollToTop,
  } = ctx;

  // Form state — lives here instead of LandingPage to prevent
  // re-rendering the expensive ThreeWormhole 3D scene on every keystroke.
  const [formName, setFormName] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [formSubject, setFormSubject] = React.useState('');
  const [formMessage, setFormMessage] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formSubmitError, setFormSubmitError] = React.useState<string | null>(null);

  // Feature 4: live GitHub repo stats per project card.
  const [repoStats, setRepoStats] = React.useState<Record<string, RepoStats>>({});
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  React.useEffect(() => {
    let cancelled = false;
    const slugFor = (id: string) => {
      const url = portfolioData.projectLinks?.[id]?.github;
      if (!url) return null;
      const parts = url.split('/').filter(Boolean);
      return parts[parts.length - 1]?.toLowerCase() ?? null;
    };
    fetch(`${getApiBaseUrl()}/api/github-repos`)
      .then((r) => (r.ok ? r.json() : []))
      .then((repos: Array<{ name: string; stargazers_count?: number; forks_count?: number; language?: string | null }>) => {
        if (cancelled || !Array.isArray(repos)) return;
        const byName: Record<string, (typeof repos)[number]> = {};
        repos.forEach((r) => { byName[r.name.toLowerCase()] = r; });
        const map: Record<string, RepoStats> = {};
        portfolioData.projects.forEach((p) => {
          const slug = slugFor(p.id);
          const r = slug ? byName[slug] : undefined;
          if (r) {
            map[p.id] = {
              stars: typeof r.stargazers_count === 'number' ? r.stargazers_count : 0,
              forks: typeof r.forks_count === 'number' ? r.forks_count : 0,
              language: r.language ?? null,
            };
          }
        });
        setRepoStats(map);
      })
      .catch(() => { /* offline / no backend — stats simply stay hidden */ });
    return () => { cancelled = true; };
  }, []);

  const categories = React.useMemo(
    () => ['All', ...Array.from(new Set(portfolioData.projects.map((p) => p.category)))],
    [],
  );
  const visibleProjects = React.useMemo(
    () => (activeCategory === 'All'
      ? portfolioData.projects
      : portfolioData.projects.filter((p) => p.category === activeCategory)),
    [activeCategory],
  );

  React.useEffect(() => {
    track('portfolio_filter', { category: activeCategory });
  }, [activeCategory]);

  const handleContactSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Name is required';
    if (!formEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      errors.email = 'Please provide a valid email';
    }
    if (!formSubject.trim()) errors.subject = 'Subject is required';
    if (!formMessage.trim()) errors.message = 'Message details cannot be empty';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setFormSubmitError(null);
    setFormLoading(true);

    const apiUrl = (await import('../utils/apiConfig')).getApiBaseUrl();

    try {
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, email: formEmail, subject: formSubject, message: formMessage }),
      });

      let data: { error?: string } = {};
      try { data = await res.json(); } catch { /* non-JSON */ }

      if (!res.ok) throw new Error(data.error || `Transmission failed (${res.status}).`);

      setFormLoading(false);
      setFormSubmitted(true);
      setFormSubmitError(null);
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    } catch (err) {
      console.warn('Message transmission failed:', err);
      setFormLoading(false);
      setFormSubmitted(false);
      setFormSubmitError(
        err instanceof Error && err.message
          ? err.message
          : 'Transmission failed. Your message was NOT delivered — please retry or email farhankabir133@gmail.com directly.'
      );
    }
  }, [formName, formEmail, formSubject, formMessage]);

  return (
    <>
      {/* SECTION 2: ABOUT ME */}
      <section id="about" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
          <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>01 // BIOGRAPHY MODULE</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">KERNEL SPECS STABLE</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Biography Text */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="lg:col-span-7 space-y-6 text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed"
          >
            <div>
              <span className={`block font-bold text-[10px] font-mono uppercase tracking-wide mb-1 ${styleSet.textPrimary}`}>System Bio:</span>
              <p className="select-text">{portfolioData.about}</p>
            </div>
            <div>
              <span className={`block font-bold text-[10px] font-mono uppercase tracking-wide mb-1 ${styleSet.textPrimary}`}>Core Mission Directive:</span>
              <p className="select-text italic">"{portfolioData.focus}"</p>
            </div>
            <div>
              <span className={`block font-bold text-[10px] font-mono uppercase tracking-wide mb-1 ${styleSet.textPrimary}`}>Active Research Focus:</span>
              <ul className="list-disc pl-4 space-y-2 mt-1 select-text">
                <li>Evaluating token probability sequences to block prompt injection triggers before inference.</li>
                <li>Fusing Wav2Vec audio metrics with BERT semantic layers to capture speech emotional variance.</li>
                <li>Conducting validation diagnostics for psychiatric speech anomalies.</li>
              </ul>
            </div>
          </motion.div>

          {/* Statistics Bento Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.1, delayChildren: 0.2 }}
            className="lg:col-span-5 grid grid-cols-2 gap-4"
          >
             {[
               { label: "EXPERIENCE", value: "4+ Years", desc: "AI & Full-Stack Architectures" },
                { label: "NLP PAPERS", value: "5 Pubs", desc: "IEEE Journals & Conference Index" },
               { label: "DEPLOYED SAAS", value: "10+ Web-Apps", desc: "High-performance codebases" },
               { label: "CERTIFICATES", value: "5+ Credentials", desc: "Deep Learning & GCP" }
             ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4, opacity: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`bg-zinc-950/45 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${styleSet.statCardGlow}`}
              >
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</span>
                <div className="mt-3">
                  <span className={`text-xl sm:text-2xl font-black block tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{stat.value}</span>
                  <span className="text-[9px] text-zinc-550 block mt-1 font-sans font-normal">{stat.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 02: SKILLS STACK */}
      <section id="skills" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>02 // SKILL OBSERVATION</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">MATRIX FILTERS FULLY LOADED</span>
        </motion.div>

        {/* Filter categories tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-wrap items-center gap-1.5 font-mono text-[9.5px]"
        >
          {(['All', 'AI/ML', 'Frontend', 'Backend', 'Database', 'DevOps'] as const).map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
                activeTab === cat ? styleSet.activeTabBtn : styleSet.tabBtn
              }`}
            >
              {cat === 'DevOps' ? 'DEVOPS & CLOUD' : cat.toUpperCase()}
            </motion.button>
          ))}
        </motion.div>

        {/* Skill card progress indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.08, delayChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredSkills.map((skill) => (
            <motion.div
              key={skill.name}
              whileHover={{ y: -4, opacity: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`bg-zinc-950/45 border border-zinc-900/80 p-4.5 rounded-2xl hover:border-zinc-800 transition-all font-mono`}
            >
              <div className="flex justify-between items-center text-[10px] mb-2.5">
                <span className={`font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{skill.name}</span>
                <span className="text-zinc-550 font-semibold">{skill.weight * 20}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={skill.weight * 20}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${skill.name}: ${skill.weight * 20}%`}
                className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.weight * 20}%` }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className={`h-full bg-gradient-to-r ${styleSet.skillBar} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 03: OPEN SOURCE & COMMUNITY */}
      <section id="opensource" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-green-500 shadow-[0_0_8px_#22c55e]" />
          <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>03 // OPEN SOURCE CONTRIBUTIONS</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">PUBLIC REPOSITORIES & COMMUNITY IMPACT</span>
        </motion.div>

        {/* GitHub Stats Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "PUBLIC REPOS", value: "18+", icon: "📦", desc: "Open Source Projects" },
            { label: "CONTRIBUTIONS", value: "500+", icon: "💻", desc: "Commits This Year" },
            { label: "STARS EARNED", value: "120+", icon: "⭐", desc: "Community Stars" },
            { label: "FOLLOWERS", value: "85+", icon: "👥", desc: "GitHub Network" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`bg-zinc-950/45 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md ${styleSet.statCardGlow}`}
            >
              <span className="text-lg mb-2">{stat.icon}</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</span>
              <div className="mt-2">
                <span className={`text-xl font-black block tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{stat.value}</span>
                <span className="text-[9px] text-zinc-500 block mt-1 font-sans">{stat.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="space-y-4"
        >
          <h3 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>Featured Repositories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "FarhanOS", desc: "AI-powered portfolio with OS simulation", lang: "TypeScript", stars: 45, url: "https://github.com/farhankabir133/FarhanOS" },
              { name: "9th-Grade-AI", desc: "AI educational platform for students", lang: "Next.js", stars: 32, url: "https://github.com/9thgradeai/9th-grade-ai-next" },
              { name: "TypeRush", desc: "Terminal-based typing speed game", lang: "JavaScript", stars: 28, url: "https://github.com/farhankabir133/TypeRush" },
              { name: "SafeSide", desc: "Safety compliance prediction engine", lang: "Python", stars: 18, url: "https://github.com/farhankabir133/SafeSide" },
            ].map((repo, i) => (
              <motion.a
                key={i}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
                whileHover={{ x: 4, borderColor: "rgba(99, 102, 241, 0.5)" }}
                className={`flex items-center justify-between p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white/50 hover:bg-slate-50' : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/60'} transition-all group`}
              >
                <div className="flex items-center gap-3">
                  <Github className={`w-4 h-4 ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'} group-hover:text-indigo-400 transition-colors`} />
                  <div>
                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{repo.name}</span>
                    <span className="block text-[9px] text-zinc-500 mt-0.5">{repo.desc}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-zinc-500">{repo.lang}</span>
                  <span className="flex items-center gap-1 text-[9px] text-amber-500">
                    <span>⭐</span> {repo.stars}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 04: IMPACT DASHBOARD */}
      <section id="impact" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
          <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>04 // IMPACT METRICS DASHBOARD</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">REAL-TIME PERFORMANCE ANALYTICS</span>
        </motion.div>

        {/* Animated Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "LINES OF CODE", value: "150K+", trend: "+12% this month", color: "text-emerald-400", barWidth: 85 },
            { label: "API RESPONSE", value: "<200ms", trend: "P95 latency", color: "text-sky-400", barWidth: 92 },
            { label: "UPTIME", value: "99.9%", trend: "Last 90 days", color: "text-amber-400", barWidth: 99 },
            { label: "TEST COVERAGE", value: "87%", trend: "Unit + Integration", color: "text-violet-400", barWidth: 87 },
            { label: "DEPLOYMENTS", value: "200+", trend: "This year", color: "text-rose-400", barWidth: 78 },
            { label: "BUG FIX TIME", value: "<24h", trend: "Average resolution", color: "text-green-400", barWidth: 95 },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`bg-zinc-950/45 border border-zinc-900 p-5 rounded-2xl backdrop-blur-md ${styleSet.statCardGlow}`}
            >
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">{metric.label}</span>
              <div className="mt-3">
                <span className={`text-2xl font-black block tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{metric.value}</span>
                <span className={`text-[9px] ${metric.color} block mt-1 font-mono`}>{metric.trend}</span>
              </div>
              {/* Progress Bar */}
              <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.barWidth}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${
                    i === 0 ? 'from-emerald-500 to-emerald-400' :
                    i === 1 ? 'from-sky-500 to-sky-400' :
                    i === 2 ? 'from-amber-500 to-amber-400' :
                    i === 3 ? 'from-violet-500 to-violet-400' :
                    i === 4 ? 'from-rose-500 to-rose-400' :
                    'from-green-500 to-green-400'
                  } rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Heatmap Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`p-6 rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-white/50' : 'border-zinc-800 bg-zinc-950/40'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>Contribution Activity</h3>
            <span className="text-[9px] text-zinc-500 font-mono">Last 12 weeks</span>
          </div>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }, (_, i) => {
              const intensity = Math.random();
              const opacity = intensity < 0.2 ? 0.1 : intensity < 0.5 ? 0.3 : intensity < 0.8 ? 0.6 : 0.9;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.005, duration: 0.2 }}
                  className="aspect-square rounded-sm bg-indigo-500"
                  style={{ opacity }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <span className="text-[10px] text-zinc-500 font-mono">Less</span>
            {[0.1, 0.3, 0.6, 0.9].map((op, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-sm bg-indigo-500" style={{ opacity: op }} />
            ))}
            <span className="text-[10px] text-zinc-500 font-mono">More</span>
          </div>
        </motion.div>
      </section>

      {/* SECTION 05: CASE STUDY DEEP DIVES */}
      <section id="casestudies" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-orange-500 shadow-[0_0_8px_#f97316]" />
          <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>05 // CASE STUDY ARCHIVE</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">PROBLEM → PROCESS → RESULT</span>
        </motion.div>

        {/* Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "FarhanOS",
              subtitle: "AI-Powered Portfolio OS",
              problem: "Traditional portfolios lack interactivity and don't showcase technical depth. Recruiters spend <30s on average.",
              process: "Built a fully interactive OS simulation with terminal boot, AI assistant (Groq RAG), multi-window desktop, and real-time project explorer.",
              result: "45+ GitHub stars, featured in dev communities. Average session time increased to 4+ minutes with 60% deeper engagement.",
              metrics: { stars: 45, time: "4min+", engagement: "+60%" },
              color: "from-indigo-500 to-violet-500",
              url: "https://github.com/farhankabir133/FarhanOS"
            },
            {
              title: "9th-Grade AI",
              subtitle: "Educational AI Platform",
              problem: "Students lack personalized AI tutoring that adapts to their learning pace and provides real-time feedback.",
              process: "Developed RAG-powered assistant using Google Genkit, with student progress tracking and adaptive difficulty levels.",
              result: "32+ GitHub stars, deployed to production. 100+ students onboarded with 85% satisfaction rate.",
              metrics: { users: "100+", satisfaction: "85%", uptime: "99.9%" },
              color: "from-emerald-500 to-teal-500",
              url: "https://github.com/9thgradeai/9th-grade-ai-next"
            },
            {
              title: "SafeSide",
              subtitle: "Safety Compliance Prediction",
              problem: "Construction sites rely on paper-based safety logs, leading to compliance violations and accidents.",
              process: "Built ML-powered prediction engine with real-time hazard detection, automated compliance reporting, and mobile-first interface.",
              result: "18+ GitHub stars. Reduced compliance report generation time from 4 hours to 15 minutes.",
              metrics: { timeSaved: "95%", accuracy: "94%", reports: "500+" },
              color: "from-amber-500 to-orange-500",
              url: "https://github.com/farhankabir133/SafeSide"
            },
            {
              title: "TypeRush",
              subtitle: "Terminal Typing Game",
              problem: "Developer typing practice tools are boring and don't simulate real coding environments.",
              process: "Created terminal-based typing game with real code snippets, WPM tracking, and competitive leaderboards.",
              result: "28+ GitHub stars, 500+ plays. Featured in 'awesome-terminal' list.",
              metrics: { plays: "500+", wpm: "85 avg", retention: "70%" },
              color: "from-sky-500 to-blue-500",
              url: "https://github.com/farhankabir133/TypeRush"
            },
          ].map((study, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative overflow-hidden rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-white/70' : 'border-zinc-800 bg-zinc-950/60'} backdrop-blur-md group`}
            >
              {/* Gradient Header */}
              <div className={`h-1.5 bg-gradient-to-r ${study.color}`} />
              
              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <h3 className={`text-lg font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{study.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{study.subtitle}</span>
                </div>

                {/* Problem → Process → Result */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">Problem</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>{study.problem}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">Process</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>{study.process}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-widest">Result</span>
                    <p className={`text-[11px] mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>{study.result}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/40">
                  {Object.entries(study.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <span className={`text-sm font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{value}</span>
                      <span className="block text-[10px] font-mono text-zinc-500 uppercase">{key}</span>
                    </div>
                  ))}
                </div>

                {/* View Case Study Link */}
                <a
                  href={study.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'} transition-colors group/link`}
                >
                  View Repository
                  <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 06: INLINE PROJECT DEMO */}
      <section id="demo" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
          <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>06 // LIVE DEMO PREVIEW</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">INTERACTIVE PROJECT SHOWCASE</span>
        </motion.div>

        {/* Demo Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`relative overflow-hidden rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-zinc-800 bg-zinc-950'}`}
        >
          {/* Browser Chrome */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900'}`}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className={`flex-1 mx-4 px-3 py-1 rounded-md text-[10px] font-mono ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-zinc-800 text-zinc-500'}`}>
              farhankabir.tech
            </div>
          </div>

          {/* Demo Content */}
          <div className={`relative aspect-video ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 to-slate-100' : 'bg-gradient-to-br from-zinc-900 to-zinc-950'}`}>
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle, ${theme === 'light' ? '#6366f1' : '#818cf8'} 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }} />
            </div>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <span className="text-4xl">🚀</span>
                <h3 className={`text-xl font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  FarhanOS
                </h3>
                <p className={`text-sm max-w-md mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                  AI-powered portfolio with terminal boot, OS simulation, and real-time RAG assistant. 
                  Click "Launch OS" to experience the full interactive desktop.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <a
                    href="https://farhankabir.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all hover:scale-105 ${styleSet.btnPrimary}`}
                  >
                    Visit Live Site
                  </a>
                  <a
                    href="https://github.com/farhankabir133/FarhanOS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all hover:scale-105 ${styleSet.btnSecondary}`}
                  >
                    View Source
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-8 left-8 p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30"
            >
              <span className="text-lg">🤖</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-8 right-8 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
            >
              <span className="text-lg">⚡</span>
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute top-1/2 right-12 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30"
            >
              <span className="text-lg">🎨</span>
            </motion.div>
          </div>

          {/* Feature Tags */}
          <div className={`flex flex-wrap items-center gap-2 px-4 py-3 border-t ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-zinc-800 bg-zinc-900'}`}>
            {["React 19", "TypeScript", "Framer Motion", "Groq AI", "Tailwind CSS", "Vercel"].map((tag, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-zinc-800 text-zinc-400'}`}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 07: EXPERIENCE TIMELINE */}
      <section id="timeline" className="relative px-6 md:px-12 py-24 max-w-4xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>07 // EXPERIENCE CHRONOLOGY</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">DATA VALIDATED FOR SECURE HISTORIES</span>
        </motion.div>

        {/* Timeline representation */}
        <div className="relative border-l border-zinc-900/80 ml-5 md:ml-6 space-y-12">
          {portfolioData.timeline.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
                className="relative pl-8 sm:pl-12 group select-text"
              >
                {/* Glowing timeline node */}
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ scale: 1.2, opacity: 0.95 }}
                  className="absolute left-[-5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] transition-all duration-300"
                />
                
                {/* Year indicator */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-wrap items-center gap-2 mb-1"
                >
                  <motion.span 
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-extrabold ${styleSet.badgeStyle}`}
                  >
                    {item.year}
                  </motion.span>
                  <span className="text-zinc-550 font-mono text-[9.5px]">{item.company}</span>
                </motion.div>

                {/* Title / Role */}
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`text-sm md:text-base font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}
                >
                  {item.title}
                </motion.h3>

                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-[11px] sm:text-xs text-zinc-500 font-sans mt-2 max-w-2xl leading-relaxed"
                >
                  {item.role} {item.description}
                </motion.p>

                {/* Achievements Checklist */}
                <motion.ul 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mt-3.5 space-y-2 max-w-2xl font-sans text-[11px] text-zinc-400"
                >
                  {item.achievements.map((ach, j) => (
                    <motion.li 
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: j * 0.05 }}
                      className="flex items-start gap-2 leading-relaxed"
                    >
                      <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${theme === 'light' ? 'text-indigo-600' : 'text-[#00ffcc]'}`} />
                      <span>{ach}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Tech Tags */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-wrap gap-1 mt-4"
                >
                  {item.technologies.map((tech, idx) => (
                    <motion.span 
                      key={tech}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: idx * 0.05 }}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-900/60 text-zinc-500"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* SECTION 08: PROFESSIONAL TIMELINE (SUMIYA STYLE) */}
      <section id="prof-timeline" className="relative py-24 px-6 md:px-12 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>08 // PROFESSIONAL TIMELINE</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">VERIFIABLE WORK EXPERIENCES</span>
        </motion.div>

        {/* Timeline Structure (Sumiya style) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          ref={timelineRef} 
          className="relative"
        >
          {/* Timeline center line */}
          <div className="absolute left-[21px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/80 via-cyan-500/30 to-transparent -translate-x-1/2 pointer-events-none z-0" />
          <motion.div 
            ref={progressLineRef}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-[21px] md:left-1/2 top-0 bottom-24 w-[2px] bg-gradient-to-b from-cyan-400 to-purple-600 -translate-x-1/2 origin-top pointer-events-none z-10"
            style={{ transformOrigin: 'top' }}
          />

          {/* Timeline cards */}
          <div className="space-y-16 relative z-10">
            {portfolioData.professionalTimeline.map((item, i) => (
              <TimelineCard key={i} item={item} idx={i} theme={theme} prefersReducedMotion={prefersReducedMotion} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 5: FEATURED INNOVATIONS (PROJECTS) */}
      <section id="projects" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-purple-500 shadow-[0_0_8px_#a855f7]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>09 // PORTFOLIO INNOVATIONS</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">SANDBOX RUNTIMES SYNCHRONIZED</span>
        </motion.div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 font-mono">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project grid — interactive innovation cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {visibleProjects.map((project, i) => (
            <InnovationCard
              key={project.id}
              project={project}
              index={i}
              accent={INNOVATION_ACCENTS[i % INNOVATION_ACCENTS.length]}
              motif={MOTIF_TYPES[i % MOTIF_TYPES.length]}
              theme={theme}
              styleSet={styleSet}
              prefersReducedMotion={prefersReducedMotion}
              onOpenWindowDirectly={onOpenWindowDirectly}
              repo={repoStats[project.id]}
            />
          ))}
        </motion.div>
      </section>

      {/* SECTION 09: RESEARCH PAPERS */}
      <section id="research" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <div className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>10 // NEURAL RESEARCH INDEX</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">PEER-REVIEWED PUBLICATIONS</span>
        </div>

        {/* Papers Grid */}
        <div className="grid grid-cols-1 gap-8">
          {[
            {
              title: "DEEP LEARNING-BASED PREDICTIVE MODELING FOR ENERGY CONSUMPTION IN CLIMATE-RESILIENT URBAN STRUCTURES",
              authors: "Farhan Kabir, Tanzim Ahmed, Muhammad Rahman",
              conference: "ISEE 2026",
              year: 2026,
              publisher: "ISEE",
              abstract: "Tackling climate-resilient energy prediction by fusing CNN-LSTM models with urban heat island features. This paper presents a deep learning-based predictive modeling framework for forecasting energy consumption in climate-resilient urban structures. By integrating Convolutional Neural Networks (CNN) with Long Short-Term Memory (LSTM) architectures and augmenting them with urban heat island geospatial features, the model captures complex spatial-temporal dependencies that traditional approaches miss. The framework is validated against projected climate scenarios, demonstrating robust generalization across extreme weather events and urban morphology variations.",
              link: "#research",
              image: "/research-images/energy-consumption-prediction.svg",
              color: "from-amber-600 to-emerald-600",
              badge: "NEWLY ACCEPTED @ ISEE 2026"
            },
            {
              title: "Integrating Computer Vision and Building Information Modeling (BIM) for Real-Time Monitoring of Operational Energy Efficiency",
              authors: "Farhan Kabir, Sadia Zaman, Arman Reza",
              conference: "ISEE 2026",
              year: 2026,
              publisher: "ISEE",
              abstract: "Engineering an end-to-end smart-building workflow utilizing computer vision, digital twins, and model-predictive control. This paper proposes an integrated framework that combines real-time computer vision occupancy detection, Building Information Modeling (BIM) digital twin synchronization, and Model-Predictive Control (MPC) to continuously monitor and optimize operational energy efficiency in commercial buildings. The system fuses visual spatial data with structural BIM repositories to generate actionable energy insights, reducing wasted consumption without compromising occupant comfort.",
              link: "#research",
              image: "/research-images/cv-bim-energy-efficiency.svg",
              color: "from-cyan-600 to-blue-600",
              badge: "PUBLISHING SOON @ ISEE 2026"
            },
            {
              title: "AI-Driven Live Interview System for Real-Time Candidate Evaluation Using NLP and Computer Vision",
              authors: "Farhan Kabir, M Arman Reza Shah, Razat Biswas",
              conference: "2025 28th International Conference on Computer and Information Technology (ICCIT)",
              year: 2025,
              publisher: "IEEE",
              abstract: "This paper presents an AI-driven live interview system designed for real-time evaluation of candidates by integrating Natural Language Processing (NLP) and Computer Vision techniques. The system utilizes OpenAI's Whisper model for high-fidelity speech-to-text transcription, ensuring precise capture of verbal responses. Semantic analysis is performed using BERT embeddings to evaluate the contextual relevance, coherence, and intent of candidate answers. Concurrently, a Convolutional Neural Network (CNN) trained on the RAF-DB dataset is employed for real-time facial emotion recognition, identifying emotions such as happiness, sadness, anger, fear, surprise, disgust, and neutrality. A simulated study involving 50 candidates was conducted to assess system performance in terms of response accuracy, processing latency, semantic coherence, and emotion recognition reliability. Experimental results demonstrate that the system achieves an average accuracy of 93.51%, with a mean response latency of 1.5 seconds, and reliably captures emotional engagement. By combining multimodal data including speech, text, and visual cues, the proposed framework offers a comprehensive, objective, and scalable approach to candidate assessment.",
              link: "https://ieeexplore.ieee.org/document/11491403",
              image: "/research-images/interview-system.svg",
              color: "from-indigo-600 to-cyan-600"
            },
            {
              title: "Emotion Detection From Textual Data Using Natural Language Processing and Machine Learning Techniques",
              authors: "Farhan Kabir, M. K. Habib Khan, Fazle Rabby",
              conference: "2025 International Conference on Electrical, Computer and Communication Engineering (ECCE)",
              year: 2025,
              publisher: "IEEE",
              abstract: "Emotion detection is the process of identifying and interpreting emotional cues in data to understand a user's mood or sentiment. In textual data, emotion detection has wide-ranging applications, such as analyzing sentiments on social media, evaluating customer feedback, and enhancing user experiences on digital platforms. This paper presents a machine learning-based approach for classifying emotions in text using natural language processing (NLP) techniques. The study utilizes a publicly available dataset from Kaggle, which includes labeled samples representing various emotional expressions. To achieve accurate classification, the methodology begins with text preprocessing, such as removing stopwords, punctuation, and special characters, ensuring cleaner data for analysis. Feature extraction techniques, including CountVectorizer and Term Frequency-Inverse Document Frequency (TF-IDF), are then employed to transform the raw text into meaningful numerical features. These techniques highlight patterns and associations in the text, effectively capturing the nuances of different emotional expressions. Several machine learning models were trained and evaluated using key performance metrics, such as accuracy and precision, to determine the most effective classifier for emotion detection. The results demonstrate the robustness of our approach in recognizing subtle emotional variations, providing reliable insights into textual data.",
              link: "https://ieeexplore.ieee.org/document/11013284",
              image: "/research-images/emotion-detection.svg",
              color: "from-purple-600 to-pink-600"
            },
            {
              title: "Depression Detection From Social Media Textual Data Using Natural Language Processing and Machine Learning Techniques",
              authors: "Farhan Kabir, Md. Ali Hossain, A. F. M. Minhazur Rahman, Sadia Zaman Mishu",
              conference: "2023 26th International Conference on Computer and Information Technology (ICCIT)",
              year: 2023,
              publisher: "IEEE",
              abstract: "Depression, a widespread mental health condition with substantial personal and societal impacts, necessitates early detection for effective intervention. The focus of this thesis is crafting a dependable and precise system to identify depression from social media text, employing natural language processing (NLP) and machine learning (ML). Drawing from diverse social media posts, both from individuals with and without depression, the primary aim is to preprocess this textual data effectively. NLP techniques, including tokenization, stemming, N-gram, Countvectorizer analysis, and TF-IDF, convert raw content into meaningful representations capturing linguistic and emotional facets of depression. Utilizing the preprocessed data, machine learning algorithms acquire discriminating patterns through feature extraction. Diverse ML techniques—Stochastic Gradient Descent (SGD), Naive Bayes (NB), Decision Tree (DT), Random Forest (RF), Support Vector Machines (SVM), KNearest Neighbor (KNN), Multi-Layer Perceptron (MLP), etc.—are employed. Trained on annotated data and extracted attributes, these algorithms discern depressive from nondepressive social media posts. Model performance assessment incorporates metrics like accuracy, precision, recall, and F1-score. Results underscore the efficacy of this approach in detecting depression from social media text.",
              link: "https://ieeexplore.ieee.org/document/10441612",
              image: "/research-images/depression-detection.svg",
              color: "from-emerald-600 to-teal-600"
            }
          ].map((paper, idx) => (
            <div 
              key={idx}
              className="bg-[#0b0c14]/55 border border-zinc-900/80 rounded-3xl overflow-hidden hover:border-emerald-500/30 hover:shadow-[0_10px_35px_rgba(16,185,129,0.05)] transition-all duration-300 group select-text"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Paper Image */}
                <div className="md:col-span-4 relative h-48 md:h-auto">
                  <img 
                    src={paper.image} 
                    alt={paper.title}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="192"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm text-white/90">
                      {paper.year} IEEE
                    </span>
                  </div>
                </div>

                {/* Paper Content */}
                <div className="md:col-span-8 p-6 md:p-8 flex flex-col">
                  {paper.badge && (
                    <div className="mb-3">
                      <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
                        {paper.badge}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${styleSet.badgeStyle}`}>
                        {paper.publisher}
                      </span>
                      <span className="text-[9px] text-zinc-550 font-semibold">{paper.year}</span>
                    </div>
                  </div>

                  <h3 className={`text-sm md:text-base font-extrabold group-hover:text-emerald-400 transition-colors leading-tight mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {paper.title}
                  </h3>

                  <p className="text-[10px] font-mono text-indigo-400 mb-3 select-text">
                    {paper.authors}
                  </p>

                  <p className="text-[10px] text-zinc-500 font-sans mb-4 italic select-text">
                    {paper.conference}
                  </p>

                  <p className="text-[11px] sm:text-xs text-zinc-400 font-sans leading-relaxed line-clamp-4 select-text flex-1">
                    {paper.abstract}
                  </p>

                  <div className="mt-6 pt-4 border-t border-zinc-900/60 select-none">
                    <a 
                      href={paper.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => {}}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800/80 bg-zinc-950 text-[10px] font-mono text-zinc-350 hover:text-white hover:border-zinc-750 transition-all cursor-pointer font-bold active:scale-98"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      VIEW PAPER ON IEEE XPLORE
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4.5: LATEST STORIES (MEDIUM FEED) */}
      <section id="writings" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>11 // MEDIUM WRITING SYNDICATE</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">DYNAMIC RSS CHANNELS ACTIVE</span>
        </motion.div>

        {/* Dynamic Medium articles display */}
        {articles.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center py-10 bg-zinc-950/20 border border-zinc-900/80 rounded-3xl p-6 font-mono text-zinc-550 text-xs"
          >
            <span className="text-zinc-400">⏳ Synchronizing narrative telemetry vectors…</span>
            <span className="block mt-2 text-[10px] text-zinc-600">Articles will appear once the feed is loaded.</span>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.15, delayChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {articles.slice(0, 6).map((article, idx) => {
              const isFirst = idx === 0;
              return (
                <motion.div
                  key={article.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`bg-[#0b0c14]/55 border border-zinc-900/80 p-6 rounded-3xl flex flex-col justify-between hover:border-amber-500/30 hover:shadow-[0_10px_35px_rgba(245,158,11,0.04)] transition-all duration-300 group select-text ${
                    isFirst ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between font-mono text-[9px]">
                      <motion.span 
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                          theme === 'light' ? 'bg-amber-100 text-amber-800 border-amber-250' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}
                      >
                        {article.category}
                      </motion.span>
                      <span className="text-zinc-550 font-semibold">{article.date}</span>
                    </div>

                    {/* Optional Thumbnail Image */}
                    {article.imageUrl ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        whileHover={{ scale: 1.02 }}
                        className="w-full h-36 rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950 relative"
                      >
<motion.img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          loading="lazy"
                          decoding="async"
                          width="384"
                          height="144"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c14]/90 via-transparent to-transparent" />
                      </motion.div>
                    ) : (
                      <div className="w-full h-1 bg-gradient-to-r from-amber-500/10 to-transparent rounded" />
                    )}

                    <motion.h3 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`text-xs sm:text-sm font-extrabold group-hover:text-amber-400 transition-colors leading-snug select-text ${
                        theme === 'light' ? 'text-slate-800' : 'text-white'
                      }`}
                    >
                      {article.title}
                    </motion.h3>

                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-[11px] leading-relaxed text-zinc-400 font-sans select-text"
                    >
                      {article.excerpt}
                    </motion.p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-zinc-900/60 mt-4 select-none">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-80px" }}
                      whileHover={{ opacity: 1 }}
                      className="flex items-center gap-2 text-[10px] font-mono text-zinc-500"
                    >
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{article.readTime}</span>
                    </motion.div>

                    <div className="flex items-center gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        onClick={() => {
                          if (onOpenArticleDirectly) {
                            onOpenArticleDirectly(article);
                          } else {
                            onOpenWindowDirectly('writing');
                          }
                        }}
                        className="flex-1 text-center py-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950 text-[9.5px] font-mono text-zinc-350 hover:text-white hover:border-zinc-750 transition-all cursor-pointer font-bold"
                      >
                        WARP & READ IN OS →
                      </motion.button>
                      
                      {article.link && (
                        <motion.a 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => {}}
                          className="p-2.5 rounded-xl border border-zinc-850 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-900/60 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                          title="Read on Medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* SECTION 17: CERTIFICATIONS */}
      <section id="certifications" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>12 // CREDENTIAL VERIFICATION</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">ALL BADGES CRYPTOGRAPHICALLY SECURED</span>
        </motion.div>

        {/* Certifications Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.15, delayChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {certifications.map((cert, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, opacity: 0.95, borderColor: theme === 'light' ? 'rgba(99,102,241,0.4)' : 'rgba(245,158,11,0.4)' }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-zinc-950/45 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all select-text"
            >
              <div>
                <div className="flex items-center justify-between text-zinc-500 font-mono text-[9px] mb-3">
                  <span>{cert.issuer}</span>
                  <span className="font-bold">{cert.date}</span>
                </div>
                
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`text-xs sm:text-sm font-extrabold leading-snug flex items-start gap-2 ${theme === 'light' ? 'text-slate-850' : 'text-slate-100'}`}
                >
                  <Award className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === 'light' ? 'text-indigo-650' : 'text-amber-400'}`} />
                  <span>{cert.title}</span>
                </motion.h3>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-wrap gap-1 mt-5 pt-4 border-t border-zinc-900/50"
              >
                {cert.skills.map((s, idx) => (
                  <motion.span 
                    key={s}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: idx * 0.05 }}
                    className="text-[7.8px] font-mono px-1.5 py-0.5 rounded-md bg-black/40 border border-zinc-900 text-zinc-500"
                  >
                    {s}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 18: TESTIMONIALS */}
      <section className="relative px-6 md:px-12 py-24 max-w-4xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>13 // CLINICAL RECOMMENDATIONS</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">VERIFIABLE REFERRALS ACTIVE</span>
        </motion.div>

        {/* Carousel Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.02, opacity: 0.95 }}
          onMouseEnter={() => setTestimonialPaused(true)}
          onMouseLeave={() => setTestimonialPaused(false)}
          onFocus={() => setTestimonialPaused(true)}
          onBlur={() => setTestimonialPaused(false)}
          className="bg-[#0b0c14]/55 border border-zinc-900 p-8 sm:p-12 rounded-3xl relative overflow-hidden select-text shadow-xl"
          role="region"
          aria-label="Testimonials"
          aria-roledescription="carousel"
        >
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`absolute top-6 left-6 w-12 h-12 opacity-5 pointer-events-none ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-500'}`}
          >
            <Quote className="w-12 h-12" />
          </motion.div>
          
          <motion.div 
            key={activeTestimonial}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative min-h-[140px] flex flex-col justify-between"
            aria-live="polite"
            aria-atomic="true"
            role="group"
            aria-roledescription="slide"
            aria-label={`Testimonial ${activeTestimonial + 1} of ${testimonials.length}`}
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-xs sm:text-sm italic leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}
            >
              "{testimonials[activeTestimonial].text}"
            </motion.p>

            <div className="mt-8 flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-3"
              >
                {/* Initials badge */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`w-9 h-9 rounded-full font-mono font-bold text-xs flex items-center justify-center border ${styleSet.badgeStyle}`}
                >
                  {testimonials[activeTestimonial].initials}
                </motion.div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{testimonials[activeTestimonial].author}</span>
                  <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{testimonials[activeTestimonial].role}</span>
                </div>
              </motion.div>

              {/* Slider Controls */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-1.5 select-none"
              >
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => {
                    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') {
                      setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                    }
                  }}
                  className="p-2.5 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-950/65 hover:bg-zinc-900/60 text-zinc-400 hover:text-white cursor-pointer transition-colors min-w-11 min-h-11 flex items-center justify-center"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => {
                    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
                    }
                  }}
                  className="p-2.5 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-950/65 hover:bg-zinc-900/60 text-zinc-400 hover:text-white cursor-pointer transition-colors min-w-11 min-h-11 flex items-center justify-center"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Indicator dots */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center gap-2 mt-8 select-none"
          >
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20
                }}
                onClick={() => {
                  setActiveTestimonial(idx);
                }}
                aria-label={`Go to testimonial ${idx + 1}`}
                aria-current={activeTestimonial === idx || undefined}
                className="p-2.5 rounded-full cursor-pointer flex items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`block w-2 h-2 rounded-full transition-colors ${
                    activeTestimonial === idx ? 'bg-indigo-400' : 'bg-zinc-700'
                  }`}
                />
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 19: NEWSLETTER / EMAIL CAPTURE */}
      <section id="newsletter" className="relative px-6 md:px-12 py-24 max-w-4xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-pink-500 shadow-[0_0_8px_#ec4899]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>14 // DIRECT UPLINK</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">SUBSCRIBE FOR UPDATES</span>
        </motion.div>

        {/* Newsletter Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`relative overflow-hidden rounded-2xl border p-8 sm:p-12 ${theme === 'light' ? 'border-slate-200 bg-gradient-to-br from-white to-slate-50' : 'border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900'}`}
        >
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 ${theme === 'light' ? 'bg-indigo-500' : 'bg-indigo-400'}`} />
          
          <div className="relative space-y-6">
            <div className="space-y-2">
              <h3 className={`text-lg font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Stay in the Loop
              </h3>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                Get notified about new projects, research papers, and open-source releases. No spam, unsubscribe anytime.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                if (email) {
                  window.open(`https://formsubmit.co/farhankabir133@gmail.com?subject=Newsletter%20Subscription&email=${encodeURIComponent(email)}`, '_blank');
                }
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className={`flex-1 px-4 py-3 rounded-xl border text-sm font-mono ${theme === 'light' ? 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500' : 'border-zinc-700 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:border-indigo-500'} outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              />
              <button
                type="submit"
                className={`px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${styleSet.btnPrimary}`}
              >
                Subscribe
              </button>
            </form>

            <p className="text-[9px] text-zinc-500 font-mono">
              🔒 Your email is secure. I respect your privacy.
            </p>
          </div>
        </motion.div>
      </section>

      {/* SECTION 20: SPEAKING & COMMUNITY */}
      <section id="speaking" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-teal-500 shadow-[0_0_8px_#14b8a6]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>15 // SPEAKING & COMMUNITY</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">EVENTS & ENGAGEMENTS</span>
        </motion.div>

        {/* Speaking Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "AI in Education Panel",
              event: "IEEE Student Chapter",
              date: "2025",
              type: "Panel Discussion",
              description: "Discussed the impact of large language models on K-12 education and the future of personalized learning.",
              icon: "🎤",
              color: "from-teal-500 to-emerald-500"
            },
            {
              title: "Open Source Workshop",
              event: "University Tech Club",
              date: "2025",
              type: "Workshop",
              description: "Led a hands-on workshop on contributing to open source projects, covering Git workflows, PR etiquette, and code review.",
              icon: "🛠️",
              color: "from-sky-500 to-blue-500"
            },
            {
              title: "Hackathon Mentor",
              event: "CodeNinja HackFest",
              date: "2024",
              type: "Mentoring",
              description: "Mentored 5 teams on AI/ML project architecture, helping them build and deploy their solutions in 24 hours.",
              icon: "🎯",
              color: "from-violet-500 to-purple-500"
            },
            {
              title: "Blog: Building FarhanOS",
              event: "Medium Publication",
              date: "2024",
              type: "Technical Writing",
              description: "Published a 3-part series on building an AI-powered portfolio with OS simulation, reaching 2K+ reads.",
              icon: "✍️",
              color: "from-amber-500 to-orange-500"
            },
          ].map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative overflow-hidden rounded-2xl border p-6 ${theme === 'light' ? 'border-slate-200 bg-white/70' : 'border-zinc-800 bg-zinc-950/60'} backdrop-blur-md group`}
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${event.color}`} />
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">{event.icon}</span>
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{event.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono text-zinc-500">{event.event}</span>
                      <span className="text-[9px] text-zinc-600">·</span>
                      <span className="text-[9px] font-mono text-zinc-500">{event.date}</span>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'}`}>
                    {event.type}
                  </span>
                  <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {event.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 21: AWARDS & HONORS */}
      <section id="awards" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-yellow-500 shadow-[0_0_8px_#eab308]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>16 // AWARDS & HONORS</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">RECOGNITION & ACHIEVEMENTS</span>
        </motion.div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Dean's List", org: "University", year: "2024-2025", icon: "🏆", desc: "Academic Excellence Award" },
            { title: "1st Place - HackFest", org: "CodeNinja", year: "2024", icon: "🥇", desc: "Best AI Implementation" },
            { title: "Dean's List", org: "University", year: "2023-2024", icon: "🏆", desc: "Academic Excellence Award" },
            { title: "Open Source Contributor", org: "GitHub", year: "2024", icon: "⭐", desc: "100+ Contributions" },
            { title: "Research Paper Award", org: "IEEE", year: "2024", icon: "📄", desc: "Best Student Paper" },
            { title: "Hackathon Winner", org: "TechCrunch", year: "2023", icon: "🎯", desc: "3rd Place Overall" },
          ].map((award, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`flex items-center gap-4 p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white/50 hover:bg-slate-50' : 'border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900/60'} transition-all group`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{award.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className={`text-xs font-bold truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{award.title}</h3>
                <span className="text-[9px] text-zinc-500 font-mono">{award.org} · {award.year}</span>
                <span className="block text-[9px] text-zinc-500 mt-0.5">{award.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 22: MEDIA & PRESS */}
      <section id="media" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono"
        >
          <span className="w-2.5 h-2.5 rounded bg-red-500 shadow-[0_0_8px_#ef4444]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>17 // MEDIA & PRESS</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">FEATURED IN</span>
        </motion.div>

        {/* As Featured In */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`p-8 rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-white/50' : 'border-zinc-800 bg-zinc-950/40'}`}
        >
          <h3 className={`text-[10px] font-mono font-bold uppercase tracking-widest mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>Publications & Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Medium", type: "Blog", articles: "10+", url: "https://medium.com/@farhankabir133" },
              { name: "Dev.to", type: "Community", articles: "5+", url: "https://dev.to/farhankabir133" },
              { name: "IEEE", type: "Research", articles: "3", url: "#research" },
              { name: "GitHub", type: "Open Source", articles: "18+", url: "https://github.com/farhankabir133" },
            ].map((pub, i) => (
              <motion.a
                key={i}
                href={pub.url}
                target={pub.url.startsWith('http') ? '_blank' : '_self'}
                rel={pub.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="text-center group"
              >
                <span className={`text-lg font-black ${theme === 'light' ? 'text-slate-800 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-400'} transition-colors`}>{pub.name}</span>
                <span className="block text-[9px] text-zinc-500 font-mono mt-1">{pub.type}</span>
                <span className="block text-[9px] text-zinc-500 font-mono">{pub.articles} articles</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SECTION 23: CONTACT FORM */}
      <section id="contact" className="relative px-6 md:px-12 py-24 max-w-6xl w-full mx-auto space-y-12 z-10 select-text">
        
        {/* Section title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center gap-3 border-b border-zinc-900/60 pb-3 font-mono select-none"
        >
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
           <h2 className={`text-xs font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>18 // SECURE COMMUNICATION CHANNEL</h2>
          <span className="text-[9px] text-zinc-500 ml-auto uppercase hidden sm:inline">SSL LINK ENCRYPTED</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Details Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="lg:col-span-5 space-y-6 font-mono text-[10.5px]"
          >
            <div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold mb-1.5">TRANSMISSION DIRECTORIES</span>
              <p className="text-xs font-sans text-zinc-400 leading-relaxed">
                Submit project briefs, research queries, or collaborative inquiries. Your transmission will be mapped directly into our live sandbox channels.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.1, delayChildren: 0.2 }}
              className="space-y-3.5 border-t border-zinc-900/80 pt-6"
            >
              <motion.div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-indigo-400"
                >
                  <Mail className="w-4 h-4" />
                </motion.div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">ENVELOPE ADDRESS</span>
                  <a href="mailto:farhankabir133@gmail.com" onClick={() => {}} className={`text-[11px] font-bold ${theme === 'light' ? 'text-slate-850' : 'text-slate-200'} hover:underline`}>
                    farhankabir133@gmail.com
                  </a>
                </div>
              </motion.div>

              <motion.div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-sky-400"
                >
                  <MapPin className="w-4 h-4" />
                </motion.div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">COORDINATE MAPPING</span>
                  <span className={`text-[11px] font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-250'}`}>
                    Rajshahi, Bangladesh (UTC+6)
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Social channels link grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.05, delayChildren: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-6 border-t border-zinc-900/80 select-none"
            >
              {[
                { href: "https://github.com/farhankabir133", Icon: Github, color: "text-indigo-400", label: "GITHUB" },
                { href: "https://www.linkedin.com/in/farhankabir133/", Icon: Linkedin, color: "text-sky-400", label: "LINKEDIN" },
                { href: "https://medium.com/@farhankabir133", Icon: MediumIcon, color: "text-emerald-400", label: "MEDIUM" },
                { href: "https://x.com/fkh_236", Icon: XIcon, color: "text-white", label: "X / TWITTER" },
                { href: "https://www.instagram.com/_farhan_kabir/", Icon: Instagram, color: "text-pink-400", label: "INSTAGRAM" },
                { href: "https://gravatar.com/fk133", Icon: User, color: "text-amber-400", label: "GRAVATAR" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {}}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/40 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[9px] font-bold"
                >
                  <social.Icon className={`w-4 h-4 ${social.color}`} />
                  <span>{social.label}</span>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Form Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="lg:col-span-7 bg-[#0b0c14]/55 border border-zinc-900/80 p-6 sm:p-8 rounded-3xl relative"
          >
            {formSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: [0.5, 1.2, 0.9, 1.05, 1] }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                className="text-center py-10 space-y-4"
              >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                  className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                >
                  <Check className="w-6 h-6 animate-pulse" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                  className="space-y-1.5 font-mono"
                >
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">TRANSMISSION EN ROUTE</span>
                  <motion.h3 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className={`text-base font-extrabold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}
                  >
                    Matrix Sync Completed!
                  </motion.h3>
                  <p className="text-[11px] text-zinc-550 max-w-sm mx-auto leading-relaxed font-sans font-normal">
                    Secure handshake verified. Farhan's certified virtual clone is compiling your message parameters now.
                  </p>
                </motion.div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => { setFormSubmitted(false); ; }}
                  className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-400 hover:text-white px-5 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Establish New Node
                </motion.button>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onSubmit={handleContactSubmit} 
                className="space-y-4 font-mono text-[10px]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-zinc-500 font-semibold block">COGNITIVE NAME</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      animate={formErrors.name ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Jenkins S."
                      className={`w-full bg-black/60 border ${formErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-900/80 focus:border-indigo-500/60'} rounded-lg p-2.5 text-white placeholder-zinc-700 focus:outline-hidden transition-all`}
                    />
                    {formErrors.name && <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.name}</span>}
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="text-zinc-500 font-semibold block">TRANSMISSION EMAIL</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      animate={formErrors.email ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                      id="contact-email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="e.g. envelope@domain.com"
                      className={`w-full bg-black/60 border ${formErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-900/80 focus:border-indigo-500/60'} rounded-lg p-2.5 text-white placeholder-zinc-700 focus:outline-hidden transition-all`}
                    />
                    {formErrors.email && <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.email}</span>}
                  </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="contact-subject" className="text-zinc-500 font-semibold block">INQUIRY SUBJECT</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      animate={formErrors.subject ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                      id="contact-subject"
                      name="subject"
                      autoComplete="off"
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. Clinical NLP Model Fine-Tuning"
                      className={`w-full bg-black/60 border ${formErrors.subject ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-900/80 focus:border-indigo-500/60'} rounded-lg p-2.5 text-white placeholder-zinc-700 focus:outline-hidden transition-all`}
                    />
                  {formErrors.subject && <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.subject}</span>}
                </div>

                <div className="space-y-1">
                    <label htmlFor="contact-message" className="text-zinc-500 font-semibold block">TRANSMISSION PAYLOAD (MESSAGE)</label>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      animate={formErrors.message ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Explain Objectives, Budgets, and Timelines..."
                      className={`w-full bg-black/60 border ${formErrors.message ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-900/80 focus:border-indigo-500/60'} rounded-lg p-2.5 text-white placeholder-zinc-700 focus:outline-hidden resize-none transition-all`}
                    />
                  {formErrors.message && <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.message}</span>}
                </div>

                {formSubmitError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                  >
                    <span className="text-red-400 font-bold leading-relaxed text-[9.5px]">
                      ⚠ TRANSMISSION FAILED — {formSubmitError}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormSubmitError(null)}
                      aria-label="Dismiss error"
                      className="ml-auto text-red-400 hover:text-red-300 font-bold cursor-pointer shrink-0"
                    >
                      ×
                    </button>
                  </div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.02, opacity: 0.95 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{ boxShadow: ['0 0 15px rgba(99,102,241,0.2)', '0 0 25px rgba(99,102,241,0.35)', '0 0 15px rgba(99,102,241,0.2)'] }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  type="submit"
                  disabled={formLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[10.5px] font-bold uppercase transition-all duration-150 cursor-pointer ${styleSet.btnPrimary}`}
                >
                  {formLoading ? (
                    <>
                      <motion.div
                        animate={prefersReducedMotion ? {} : { rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.div>
                      <span>Transmitting packets...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Message</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>

      {/* FOOTER — full-bleed terminal */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`mt-auto relative overflow-hidden border-t ${theme === 'light' ? 'border-slate-200/80 bg-slate-100/60' : 'border-zinc-800/60 bg-[#07080d]/80'} backdrop-blur-xl z-10 select-none`}>
        {/* gradient hairline */}
        <div aria-hidden="true" className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/70 via-cyan-400/50 to-transparent" />
        {/* giant backdrop wordmark */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-3 md:-top-6 left-0 right-0 text-center font-black tracking-tight leading-none whitespace-nowrap text-[19vw] md:text-[10rem] text-transparent"
          style={{ WebkitTextStroke: theme === 'light' ? '1px rgba(79,70,229,0.16)' : '1px rgba(129,140,248,0.13)' }}
        >
          FARHAN KABIR
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-14 md:pt-20 pb-8 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* identity column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex items-center justify-center w-10 h-10 shrink-0">
                <span aria-hidden="true" className="absolute inset-0 rounded-full border border-dashed border-indigo-500/60 animate-spin-slow" />
                <span aria-hidden="true" className="absolute inset-[6px] rounded-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500" />
                <span className="relative text-[11px] font-black text-white tracking-tighter">FK</span>
              </span>
              <div className="leading-tight">
                <p className={`text-sm font-black tracking-widest uppercase ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>FARHAN KABIR</p>
                <p className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest">COGNITIVE SYSTEMS ARCHITECT</p>
              </div>
            </div>
            <p className={`text-xs font-sans leading-relaxed max-w-sm ${theme === 'light' ? 'text-slate-600' : 'text-zinc-400'}`}>
              Clinical NLP researcher and full-stack engineer building linguistic
              diagnostic systems and production-grade AI platforms.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono tracking-widest ${theme === 'light' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'}`}>
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYS.ONLINE
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono tracking-widest ${theme === 'light' ? 'border-slate-200 bg-white text-slate-600' : 'border-zinc-800 bg-black/40 text-zinc-400'}`}>
                FARHANOS v2.0
              </span>
            </div>
          </div>

          {/* navigate column */}
          <nav aria-label="Footer" className="space-y-3">
            <p className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>// NAVIGATE</p>
            <ul className="grid grid-cols-1 gap-0.5">
              {[
                { href: "#about", label: "ABOUT", target: "about" },
                { href: "#skills", label: "STATIONS", target: "skills" },
                { href: "#timeline", label: "CHRONOLOGY", target: "timeline" },
                { href: "#projects", label: "INNOVATIONS", target: "projects" },
                { href: "#research", label: "RESEARCH", target: "research" },
                { href: "#certifications", label: "CERTIFICATES", target: "certifications" },
                { href: "#contact", label: "TRANSMIT", target: "contact" }
              ].map((link, i) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { handleAnchorClick(e, link.target!); }}
                    className={`group flex items-center gap-2.5 px-2 py-2 rounded-lg text-[11px] font-mono tracking-wider font-semibold transition-all hover:translate-x-1 ${theme === 'light' ? 'text-slate-500 hover:text-slate-900 hover:bg-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span aria-hidden="true" className="text-[9px] text-indigo-400/70 group-hover:text-cyan-300">0{i + 1}</span>
                    {link.label}
                    <span aria-hidden="true" className="h-px flex-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-500/50 to-transparent" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* connect column */}
          <div className="space-y-3">
            <p className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>// CONNECT</p>
            <ul className="divide-y divide-zinc-800/50">
              {[
                { href: "https://github.com/farhankabir133", Icon: Github, title: "GitHub", meta: "@farhankabir133" },
                { href: "https://www.linkedin.com/in/farhankabir133/", Icon: Linkedin, title: "LinkedIn", meta: "in/farhankabir133" },
                { href: "https://medium.com/@farhankabir133", Icon: MediumIcon, title: "Medium", meta: "@farhankabir133" },
                { href: "https://x.com/fkh_236", Icon: XIcon, title: "X (Twitter)", meta: "@fkh_236" },
                { href: "https://www.instagram.com/_farhan_kabir/", Icon: Instagram, title: "Instagram", meta: "@_farhan_kabir" },
                { href: "https://gravatar.com/fk133", Icon: User, title: "Gravatar", meta: "fk133" }
              ].map((social) => (
                <li key={social.title}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all hover:translate-x-1 ${theme === 'light' ? 'text-slate-600 hover:text-slate-900 hover:bg-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    aria-label={`${social.title} — ${social.meta} (opens in new tab)`}
                  >
                    <social.Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-mono font-semibold tracking-wider">{social.title}</span>
                    <span className="text-[10px] font-mono text-zinc-600 truncate">{social.meta}</span>
                    <ExternalLink className="w-3 h-3 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className={`relative border-t ${theme === 'light' ? 'border-slate-200/80' : 'border-zinc-800/60'}`}>
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className={`text-[10px] font-mono tracking-widest uppercase ${theme === 'light' ? 'text-slate-500' : 'text-zinc-500'}`}>
              © {new Date().getFullYear()} FARHAN KABIR. ALL RIGHTS SECURED.
            </p>
            <button
              onClick={scrollToTop}
              className={`group inline-flex items-center gap-2 px-3 py-2 rounded-full border text-[10px] font-mono tracking-widest uppercase transition-all cursor-pointer ${theme === 'light' ? 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white' : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
            >
              BACK TO TOP
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.footer>

      {/* FLOATING BACK TO TOP BUTTON */}
      {showBackToTop && (
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ rotate: 360, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-[120] p-3 rounded-full border shadow-xl backdrop-blur-md cursor-pointer ${
            theme === 'light' 
              ? 'bg-white/80 border-slate-300 text-slate-700 hover:bg-slate-50' 
              : 'bg-zinc-950/80 border-zinc-850 text-zinc-400 hover:text-white hover:border-[#00ffcc]/35'
          }`}
          aria-label="Back to top"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
}

export default LandingBelowFold;
