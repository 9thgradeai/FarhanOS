/**
 * Assistant tool catalog: OpenAI-format tool schemas for Groq function
 * calling, plus strict validators for client-side OS actions. Pure data +
 * validation — server-side execution is wired in handlers.ts.
 */

export interface GroqToolSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/** Windows that can be opened on the FarhanOS desktop (mirrors App.tsx). */
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

/** Tools executed inside the API runtime; results feed back to the model. */
export const SERVER_TOOL_NAMES = new Set(['get_live_github_repos', 'get_recent_medium_stories']);

/** Tools whose validated result is dispatched to the browser as an action. */
const CLIENT_ACTION_TOOLS = new Set(['open_os_window', 'switch_os_theme', 'open_external_link']);

/** Allowlisted external link targets — exact profile URLs + owned repo paths. */
const LINK_ALLOWLIST = [
  'https://github.com/farhankabir133',
  'https://www.linkedin.com/in/farhankabir133/',
  'https://medium.com/@farhankabir133',
  'https://x.com/fkh_236',
  'https://www.instagram.com/_farhan_kabir/',
  'https://gravatar.com/fk133',
  'https://farhankabir.tech',
  'https://farhankabir.me',
];

function isAllowlistedLink(rawUrl: unknown): rawUrl is string {
  if (typeof rawUrl !== 'string' || rawUrl.length > 500) return false;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:') return false;
  const href = parsed.href;
  if (LINK_ALLOWLIST.some((allowed) => href === allowed || href.startsWith(`${allowed}/`))) {
    return true;
  }
  // Any repo/blob/issues path under the owned GitHub account.
  return (
    parsed.origin === 'https://github.com' &&
    /^\/farhankabir133\/[\w.-]+(\/.*)?$/.test(parsed.pathname)
  );
}

/**
 * Validates a model-issued client-action tool call against strict allowlists.
 * Returns null for anything malformed or outside the catalog.
 */
export function validateClientAction(
  toolName: unknown,
  rawArgs: unknown
): AssistantAction | null {
  if (!CLIENT_ACTION_TOOLS.has(String(toolName))) return null;
  let args: any = rawArgs;
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch {
      return null;
    }
  }
  if (typeof args !== 'object' || args === null) return null;

  switch (toolName) {
    case 'open_os_window':
      return OS_WINDOW_IDS.includes(args.window)
        ? { type: 'open_window', window: args.window }
        : null;
    case 'switch_os_theme':
      return OS_THEMES.includes(args.theme)
        ? { type: 'switch_theme', theme: args.theme }
        : null;
    case 'open_external_link':
      return isAllowlistedLink(args.url) ? { type: 'open_link', url: args.url } : null;
    default:
      return null;
  }
}

export const TOOL_SCHEMAS: GroqToolSchema[] = [
  {
    type: 'function',
    function: {
      name: 'open_os_window',
      description:
        "Open one of FarhanOS's desktop windows in front of the visitor. Use when the user wants to see projects, papers, skills, resume, contact form, etc. The visitor's screen actually switches, so mention what you opened.",
      parameters: {
        type: 'object',
        properties: {
          window: {
            type: 'string',
            enum: [...OS_WINDOW_IDS],
            description: 'The window to open.',
          },
        },
        required: ['window'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'switch_os_theme',
      description:
        "Switch the FarhanOS interface theme. Use when the user asks for a different look (e.g. 'make it cyberpunk').",
      parameters: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            enum: [...OS_THEMES],
            description: 'Theme to apply.',
          },
        },
        required: ['theme'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_external_link',
      description:
        'Open an allowlisted external profile link (GitHub, LinkedIn, Medium, X, Instagram, portfolio). Only URLs you were given in verified knowledge are valid.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The exact allowlisted https URL to open.',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_live_github_repos',
      description:
        'Fetch Farhan Kabir’s CURRENT top GitHub repositories with live star counts, languages and descriptions. Use whenever the user asks about repos, open-source work, stars or latest code.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recent_medium_stories',
      description:
        'Fetch Farhan Kabir’s most recent published Medium articles with links. Use for questions about articles, blog posts, or recent writing.',
      parameters: { type: 'object', properties: {} },
    },
  },
];
