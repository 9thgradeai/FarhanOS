import { createContext, memo, useContext } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const proseClasses = 'prose prose-invert max-w-none text-[13px] leading-relaxed prose-zinc';

// react-markdown v9+ removed the `inline` prop; detect block code by pre-parent instead.
const InPreContext = createContext(false);

const SAFE_HREF = /^(https?:|mailto:|#|\/)/i;

const components: Components = {
  // Rendered inside dialogs/windows that already live under the page H1 —
  // cap markdown headings at h2 so AI content can never inject a second h1.
  h1: ({ children }) => <h2 className="text-lg font-bold text-white mb-2">{children}</h2>,
  h2: ({ children }) => <h2 className="text-base font-bold text-white mb-1.5">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-200 mb-1">{children}</h3>,
  p: ({ children }) => <p className="text-zinc-300 mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside text-zinc-300 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside text-zinc-300 mb-2 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-zinc-300">{children}</li>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-500/50 pl-3 text-zinc-400 italic mb-2">{children}</blockquote>,
  pre: ({ children }) => (
    <InPreContext.Provider value={true}>
      <pre className="mb-2">{children}</pre>
    </InPreContext.Provider>
  ),
  code: ({ children, className }) => {
    const inPre = useContext(InPreContext);
    return inPre ? (
      <code className={`block bg-zinc-900 text-zinc-300 p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2 ${className ?? ''}`}>{children}</code>
    ) : (
      <code className="bg-zinc-900 text-indigo-300 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
    );
  },
  table: ({ children }) => <div className="overflow-x-auto mb-2"><table className="min-w-full text-xs border border-zinc-800 rounded-lg overflow-hidden">{children}</table></div>,
  thead: ({ children }) => <thead className="bg-zinc-900/80 text-zinc-300">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-zinc-800">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  td: ({ children }) => <td className="px-3 py-2 text-zinc-300">{children}</td>,
  th: ({ children }) => <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">{children}</th>,
  hr: () => <hr className="border-zinc-800 my-3" />,
  a: ({ href, children }) => {
    const safeHref = typeof href === 'string' && SAFE_HREF.test(href) ? href : undefined;
    const isExternal = typeof safeHref === 'string' && /^https?:/i.test(safeHref);
    return (
      <a
        href={safeHref}
        className="text-indigo-400 hover:text-indigo-300 underline"
        {...(isExternal
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-zinc-400 italic">{children}</em>,
};

function MarkdownRendererImpl({ content, className = '' }: { content: string; className?: string }) {
  return (
    <div className={`${proseClasses} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownRendererImpl);
