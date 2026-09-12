/**
 * Deterministic, zero-cost context awareness for Farhan AI.
 * Maps the visitor's current landing section or OS window to factual follow-up
 * questions and proactive greeting copy. Every question mirrors verified
 * knowledge — nothing here invents facts, and no model call is spent on
 * suggesting.
 */

export type LandingContextGroup =
  | 'about'
  | 'projects'
  | 'research'
  | 'skills'
  | 'career'
  | 'writing'
  | 'contact'
  | 'achievements';

const SECTION_GROUP_RULES: Array<[string[], LandingContextGroup]> = [
  [['about', 'hero-content'], 'about'],
  [['projects', 'demo', 'casestudies', 'opensource', 'garden', 'whiteboard', 'builds'], 'projects'],
  [['research'], 'research'],
  [['skills', 'certifications'], 'skills'],
  [['prof-timeline', 'timeline'], 'career'],
  [['writings', 'media', 'speaking'], 'writing'],
  [['contact', 'newsletter', 'resume', 'brief'], 'contact'],
  [['awards', 'impact'], 'achievements'],
];

const WINDOW_GROUP_RULES: Array<[string[], LandingContextGroup]> = [
  [['about'], 'about'],
  [['projects', 'garden', 'whiteboard', 'builds', 'skills'], 'projects'],
  [['research'], 'research'],
  [['skills'], 'skills'],
  [['profTimeline', 'timeline'], 'career'],
  [['writing'], 'writing'],
  [['resume', 'brief'], 'contact'],
  [['github'], 'writing'],
];

const GROUP_QUESTIONS: Record<LandingContextGroup, string[]> = {
  about: [
    'What is Farhan currently building?',
    'What drives Farhan’s interest in clinical NLP?',
    'How does Farhan approach ML problems?',
  ],
  projects: [
    'What is Farhan’s biggest project right now?',
    'Tell me about TypeRush and its architecture',
    'Which projects ship with Groq APIs?',
  ],
  research: [
    'Summarize the depression-detection paper',
    'What was the F1 score in the adversarial-prompt paper?',
    'What is Farhan’s current research focus?',
  ],
  skills: [
    'What is Farhan’s tech stack?',
    'How does Farhan use Go vs Node.js?',
    'What are Farhan’s AI/ML specializations?',
  ],
  career: [
    'Walk through Farhan’s career timeline',
    'What did Farhan work on at Synthetix Solutions?',
    'Where is Farhan based?',
  ],
  writing: [
    'Show Farhan’s latest Medium articles',
    'What does Farhan write about?',
    'Which publications has Farhan authored?',
  ],
  contact: [
    'How can I hire Farhan?',
    'What is Farhan’s email?',
    'Where is Farhan on LinkedIn?',
  ],
  achievements: [
    'What are Farhan’s most impressive achievements?',
    'Which research milestones stand out?',
    'What real-world impact has Farhan’s work had?',
  ],
};

const DEFAULT_QUESTIONS = [
  'What are Farhan’s main SaaS products and open source projects?',
  'Tell me about Farhan’s research papers and clinical NLP work',
  'What is Farhan’s technical stack and AI/ML expertise?',
  'How can I contact or hire Farhan Kabir?',
];

/** Resolve a landing section id to its context group (or null). */
export function sectionToContext(section: string | undefined | null): LandingContextGroup | null {
  if (!section) return null;
  const s = section.toLowerCase();
  for (const [ids, group] of SECTION_GROUP_RULES) {
    if (ids.includes(s)) return group;
  }
  return null;
}

/** Resolve an OS window id to its context group (or null). */
export function windowToContext(windowId: string | undefined | null): LandingContextGroup | null {
  if (!windowId) return null;
  const w = windowId.toLowerCase();
  for (const [ids, group] of WINDOW_GROUP_RULES) {
    if (ids.some((id) => id.toLowerCase() === w)) return group;
  }
  return null;
}

/** Pick the strongest context group from whatever the visitor is looking at. */
export function resolveContextGroup(opts: {
  activeSection?: string | null;
  activeWindow?: string | null;
  openWindows?: string[];
}): LandingContextGroup | null {
  const fromSection = sectionToContext(opts.activeSection);
  if (fromSection) return fromSection;
  const fromWindow = windowToContext(opts.activeWindow);
  if (fromWindow) return fromWindow;
  for (const wid of opts.openWindows ?? []) {
    const g = windowToContext(wid);
    if (g) return g;
  }
  return null;
}

/** Context-aware quick questions (falls back to the static default set). */
export function suggestQuestions(opts: {
  activeSection?: string | null;
  activeWindow?: string | null;
  openWindows?: string[];
  count?: number;
}): string[] {
  const count = opts.count ?? 4;
  const group = resolveContextGroup(opts);
  const pool = group
    ? [...GROUP_QUESTIONS[group], ...DEFAULT_QUESTIONS]
    : [...DEFAULT_QUESTIONS];
  // Deduplicate while keeping context-first ordering, then cap at `count`.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of pool) {
    if (seen.has(q)) continue;
    seen.add(q);
    out.push(q);
    if (out.length >= count) break;
  }
  return out;
}

export interface GreetingCopy {
  title: string;
  message: string;
  query: string;
}

/**
 * Proactive greeting copy. Always three parts so the UI can render a heading,
 * a line of prose, and a suggested follow-up query.
 */
export function suggestGreeting(opts: {
  returning: boolean;
  activeSection?: string | null;
}): GreetingCopy {
  const group = sectionToContext(opts.activeSection);

  if (group === 'research') {
    return {
      title: 'Research desk',
      message:
        'Digging into Farhan’s research? I can summarize any paper here with verified sources.',
      query: 'What is Farhan’s most significant research contribution?',
    };
  }
  if (group === 'projects') {
    return {
      title: 'Project explorer',
      message:
        'Curious what Farhan actually ships? I can walk you through his strongest projects.',
      query: 'What is Farhan’s most impressive shipped project?',
    };
  }
  if (group === 'contact') {
    return {
      title: 'Open to work',
      message: 'Looking to hire or collaborate? Farhan is available remotely from Bangladesh.',
      query: 'How can I hire Farhan Kabir?',
    };
  }

  if (opts.returning) {
    return {
      title: 'Welcome back',
      message: 'Want a fast recap of what Farhan is currently working on and shipping?',
      query: 'What is Farhan currently working on?',
    };
  }
  return {
    title: 'Farhan AI',
    message: "Hi, I'm Farhan AI — Farhan’s neural twin. Ask me about his research, projects, or career.",
    query: 'What are Farhan’s most impressive achievements?',
  };
}