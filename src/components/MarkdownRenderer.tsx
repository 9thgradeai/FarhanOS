import { createContext, memo, useContext } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type MarkdownTone = 'dark' | 'light' | 'terminal' | 'cyberpunk' | 'ai';

interface ToneClasses {
  root: string;
  h1: string;
  h2: string;
  h3: string;
  p: string;
  li: string;
  ul: string;
  ol: string;
  quote: string;
  inlineCode: string;
  codeBlock: string;
  codeWrap: string;
  tableWrap: string;
  table: string;
  thead: string;
  th: string;
  td: string;
  hr: string;
  link: string;
  strong: string;
  em: string;
}

/**
 * Production-grade answer typography.
 * One renderer, five theme tones — same rhythm/spacing everywhere,
 * only the palette shifts. Tight vertical rhythm (no double margins),
 * outside list markers so wrapped lines align, real tables, and
 * code blocks that never blow out the bubble width.
 */
const TONES: Record<MarkdownTone, ToneClasses> = {
  dark: {
    root: 'font-sans',
    h1: 'text-[15px] font-bold tracking-tight text-white mt-1 mb-2',
    h2: 'text-[14px] font-bold tracking-tight text-slate-100 mt-3 mb-1.5',
    h3: 'text-[13px] font-semibold tracking-tight text-slate-200 mt-2.5 mb-1',
    p: 'text-slate-300 mb-2 last:mb-0',
    li: 'text-slate-300',
    ul: 'list-disc list-outside ml-4 pl-1 mb-2 space-y-1',
    ol: 'list-decimal list-outside ml-4 pl-1 mb-2 space-y-1',
    quote: 'border-l-2 border-indigo-500/60 pl-3 text-zinc-400 italic my-2',
    inlineCode: 'bg-zinc-800/80 text-indigo-300 px-1.5 py-px rounded-md text-[11.5px] font-mono whitespace-nowrap',
    codeBlock: 'block bg-zinc-950 text-zinc-200 p-3 rounded-xl text-[11.5px] font-mono overflow-x-auto border border-zinc-800',
    codeWrap: 'my-2 rounded-xl overflow-hidden',
    tableWrap: 'overflow-x-auto my-2 rounded-lg border border-zinc-800',
    table: 'min-w-full text-xs border-collapse',
    thead: 'bg-zinc-900/90 text-zinc-300',
    th: 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider',
    td: 'px-3 py-2 text-zinc-300 border-t border-zinc-800/80 align-top',
    hr: 'border-zinc-800 my-3',
    link: 'text-indigo-400 hover:text-indigo-300 underline underline-offset-2 decoration-indigo-500/40 font-medium break-words',
    strong: 'text-white font-semibold',
    em: 'text-zinc-400 italic',
  },
  light: {
    root: 'font-sans',
    h1: 'text-[15px] font-bold tracking-tight text-slate-900 mt-1 mb-2',
    h2: 'text-[14px] font-bold tracking-tight text-slate-900 mt-3 mb-1.5',
    h3: 'text-[13px] font-semibold tracking-tight text-slate-800 mt-2.5 mb-1',
    p: 'text-slate-700 mb-2 last:mb-0',
    li: 'text-slate-700',
    ul: 'list-disc list-outside ml-4 pl-1 mb-2 space-y-1',
    ol: 'list-decimal list-outside ml-4 pl-1 mb-2 space-y-1',
    quote: 'border-l-2 border-indigo-400 pl-3 text-slate-500 italic my-2',
    inlineCode: 'bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-px rounded-md text-[11.5px] font-mono whitespace-nowrap',
    codeBlock: 'block bg-slate-900 text-slate-100 p-3 rounded-xl text-[11.5px] font-mono overflow-x-auto',
    codeWrap: 'my-2 rounded-xl overflow-hidden',
    tableWrap: 'overflow-x-auto my-2 rounded-lg border border-slate-200',
    table: 'min-w-full text-xs border-collapse',
    thead: 'bg-slate-100 text-slate-700',
    th: 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider',
    td: 'px-3 py-2 text-slate-700 border-t border-slate-100 align-top',
    hr: 'border-slate-200 my-3',
    link: 'text-indigo-600 hover:text-indigo-500 underline underline-offset-2 font-medium break-words',
    strong: 'text-slate-900 font-semibold',
    em: 'text-slate-500 italic',
  },
  terminal: {
    root: 'font-mono',
    h1: 'text-[13px] font-bold uppercase tracking-widest text-[#33ff33] mt-1 mb-2',
    h2: 'text-xs font-bold uppercase tracking-widest text-[#33ff33] mt-3 mb-1.5',
    h3: 'text-[11px] font-bold uppercase tracking-widest text-[#33ff33]/90 mt-2.5 mb-1',
    p: 'text-[#33ff33]/90 mb-2 last:mb-0',
    li: 'text-[#33ff33]/90',
    ul: 'list-disc list-outside ml-4 pl-1 mb-2 space-y-1',
    ol: 'list-decimal list-outside ml-4 pl-1 mb-2 space-y-1',
    quote: 'border-l-2 border-[#33ff33]/60 pl-3 text-[#33ff33]/70 italic my-2',
    inlineCode: 'bg-[#33ff33]/10 text-[#33ff33] border border-[#33ff33]/30 px-1.5 py-px rounded text-[11px] whitespace-nowrap',
    codeBlock: 'block bg-black text-[#33ff33] p-3 rounded-lg text-[11px] overflow-x-auto border border-[#33ff33]/40',
    codeWrap: 'my-2 rounded-lg overflow-hidden',
    tableWrap: 'overflow-x-auto my-2 rounded-lg border border-[#33ff33]/30',
    table: 'min-w-full text-[11px] border-collapse',
    thead: 'bg-[#33ff33]/10 text-[#33ff33]',
    th: 'px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest',
    td: 'px-3 py-2 text-[#33ff33]/85 border-t border-[#33ff33]/20 align-top',
    hr: 'border-[#33ff33]/30 my-3',
    link: 'text-[#33ff33] underline underline-offset-2 font-bold break-words',
    strong: 'text-[#33ff33] font-bold',
    em: 'text-[#33ff33]/70 italic',
  },
  cyberpunk: {
    root: 'font-mono',
    h1: 'text-[13px] font-bold uppercase tracking-widest text-pink-400 mt-1 mb-2',
    h2: 'text-xs font-bold uppercase tracking-widest text-pink-300 mt-3 mb-1.5',
    h3: 'text-[11px] font-bold uppercase tracking-widest text-[#00ffcc] mt-2.5 mb-1',
    p: 'text-[#00ffcc]/90 mb-2 last:mb-0',
    li: 'text-[#00ffcc]/90',
    ul: 'list-disc list-outside ml-4 pl-1 mb-2 space-y-1',
    ol: 'list-decimal list-outside ml-4 pl-1 mb-2 space-y-1',
    quote: 'border-l-2 border-pink-500/70 pl-3 text-pink-300/80 italic my-2',
    inlineCode: 'bg-pink-500/10 text-pink-300 border border-pink-500/40 px-1.5 py-px rounded text-[11px] whitespace-nowrap',
    codeBlock: 'block bg-black text-[#00ffcc] p-3 rounded-lg text-[11px] overflow-x-auto border border-pink-500/50',
    codeWrap: 'my-2 rounded-lg overflow-hidden',
    tableWrap: 'overflow-x-auto my-2 rounded-lg border border-pink-500/40',
    table: 'min-w-full text-[11px] border-collapse',
    thead: 'bg-pink-500/10 text-pink-300',
    th: 'px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest',
    td: 'px-3 py-2 text-[#00ffcc]/85 border-t border-pink-500/20 align-top',
    hr: 'border-pink-500/30 my-3',
    link: 'text-pink-400 hover:text-pink-300 underline underline-offset-2 font-bold break-words',
    strong: 'text-white font-bold',
    em: 'text-pink-300/70 italic',
  },
  ai: {
    root: 'font-mono',
    h1: 'text-[13px] font-bold uppercase tracking-widest text-purple-300 mt-1 mb-2',
    h2: 'text-xs font-bold uppercase tracking-widest text-purple-200 mt-3 mb-1.5',
    h3: 'text-[11px] font-bold uppercase tracking-widest text-cyan-300 mt-2.5 mb-1',
    p: 'text-slate-300 mb-2 last:mb-0',
    li: 'text-slate-300',
    ul: 'list-disc list-outside ml-4 pl-1 mb-2 space-y-1',
    ol: 'list-decimal list-outside ml-4 pl-1 mb-2 space-y-1',
    quote: 'border-l-2 border-purple-500/60 pl-3 text-purple-300/80 italic my-2',
    inlineCode: 'bg-purple-500/10 text-cyan-200 border border-purple-500/30 px-1.5 py-px rounded text-[11px] whitespace-nowrap',
    codeBlock: 'block bg-[#0a0618] text-slate-200 p-3 rounded-xl text-[11.5px] font-mono overflow-x-auto border border-purple-500/30',
    codeWrap: 'my-2 rounded-xl overflow-hidden',
    tableWrap: 'overflow-x-auto my-2 rounded-lg border border-purple-500/30',
    table: 'min-w-full text-xs border-collapse',
    thead: 'bg-purple-500/10 text-purple-200',
    th: 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider',
    td: 'px-3 py-2 text-slate-300 border-t border-purple-500/20 align-top',
    hr: 'border-purple-500/25 my-3',
    link: 'text-cyan-300 hover:text-cyan-200 underline underline-offset-2 font-medium break-words',
    strong: 'text-white font-semibold',
    em: 'text-purple-300/70 italic',
  },
};

const SAFE_HREF = /^(https?:|mailto:|#|\/)/i;

function buildComponents(t: ToneClasses): Components {
  return {
    h1: ({ children }) => <h2 className={t.h1}>{children}</h2>,
    h2: ({ children }) => <h2 className={t.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={t.h3}>{children}</h3>,
    h4: ({ children }) => <h3 className={t.h3}>{children}</h3>,
    p: ({ children }) => <p className={`text-[13px] leading-[1.7] ${t.p}`}>{children}</p>,
    ul: ({ children }) => <ul className={t.ul}>{children}</ul>,
    ol: ({ children }) => <ol className={t.ol}>{children}</ol>,
    li: ({ children }) => <li className={`text-[13px] leading-[1.7] [overflow-wrap:anywhere] ${t.li}`}>{children}</li>,
    blockquote: ({ children }) => <blockquote className={t.quote}>{children}</blockquote>,
    pre: ({ children }) => (
      <InPreContext.Provider value={true}>
        <div className={t.codeWrap}>
          <pre className="m-0 p-0 bg-transparent">{children}</pre>
        </div>
      </InPreContext.Provider>
    ),
    code: ({ children, className }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const inPre = useContext(InPreContext);
      if (inPre) return <code className={`${t.codeBlock} ${className ?? ''}`}>{children}</code>;
      return <code className={t.inlineCode}>{children}</code>;
    },
    table: ({ children }) => (
      <div className={t.tableWrap}>
        <table className={t.table}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className={t.thead}>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    td: ({ children }) => <td className={t.td}>{children}</td>,
    th: ({ children }) => <th scope="col" className={t.th}>{children}</th>,
    hr: () => <hr className={t.hr} />,
    a: ({ href, children }) => {
      const safeHref = typeof href === 'string' && SAFE_HREF.test(href) ? href : undefined;
      const isExternal = typeof safeHref === 'string' && /^https?:/i.test(safeHref);
      return (
        <a href={safeHref} className={t.link} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className={t.strong}>{children}</strong>,
    em: ({ children }) => <em className={t.em}>{children}</em>,
  };
}

const InPreContext = createContext(false);

function MarkdownRendererImpl({
  content,
  className = '',
  tone = 'dark',
}: {
  content: string;
  className?: string;
  tone?: MarkdownTone;
}) {
  const t = TONES[tone] ?? TONES.dark;
  return (
    <div className={`max-w-none text-[13px] leading-[1.7] [overflow-wrap:anywhere] ${t.root} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={buildComponents(t)}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownRendererImpl);
