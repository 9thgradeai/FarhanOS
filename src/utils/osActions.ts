/** Shared contract between the AI assistant and the FarhanOS desktop. */

export const OS_WINDOW_IDS = [
  'twin',
  'projects',
  'research',
  'github',
  'writing',
  'garden',
  'resume',
  'timeline',
  'skills',
  'brief',
  'builds',
  'whiteboard',
  'profTimeline',
  'about',
  'settings',
  'telemetry',
] as const;

export type OsWindowId = (typeof OS_WINDOW_IDS)[number];

export const OS_THEMES = ['dark', 'cyberpunk', 'ai', 'terminal', 'light'] as const;
export type OsTheme = (typeof OS_THEMES)[number];

export type AssistantAction =
  | { type: 'open_window'; window: OsWindowId }
  | { type: 'switch_theme'; theme: OsTheme }
  | { type: 'open_link'; url: string };

export interface AssistantSourceRef {
  title: string;
  /** Window to open when this source is clicked, when one maps cleanly. */
  window?: OsWindowId | null;
}

const SOURCE_WINDOW_RULES: Array<[RegExp, OsWindowId]> = [
  [/\b(publication|paper|research|perplexity|emotion detection|depression detection|interview system)\b/i, 'research'],
  [/\b(article|writing|medium|blog)\b/i, 'writing'],
  [/\b(repo|repository|github|open[- ]?source)\b/i, 'github'],
  [/\b(skill|stack|expertise|tech tree)\b/i, 'skills'],
  [/\b(resume|cv)\b/i, 'resume'],
  [/\b(timeline|career|experience|journey)\b/i, 'profTimeline'],
  [/\b(contact|hire|hiring|email|reach|brief)\b/i, 'brief'],
  [/\b(garden|mind ?map|focus areas)\b/i, 'garden'],
  [/\b(whiteboard|sketch|ideation)\b/i, 'whiteboard'],
  [/\b(build log|builds)\b/i, 'builds'],
  [/\b(about|story|bio|who is|background|value|mission)\b/i, 'about'],
  [/\b(project|saas|product|typerush|ink home|safeside|rankflow|omniva|buildsafe|autospark|exam survival|buddy-?script)\b/i, 'projects'],
];

/** Best-effort mapping from a RAG document title to an OS window. */
export function sourceWindowFor(title: string): OsWindowId | null {
  for (const [re, id] of SOURCE_WINDOW_RULES) {
    if (re.test(title)) return id;
  }
  return null;
}

/** Client-side sanity check before opening any model-suggested link. */
export function isOpenableExternalUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url.length > 500) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isOsWindowId(value: string): value is OsWindowId {
  return (OS_WINDOW_IDS as readonly string[]).includes(value);
}

export function isOsTheme(value: string): value is OsTheme {
  return (OS_THEMES as readonly string[]).includes(value);
}
