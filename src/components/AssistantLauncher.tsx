import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X, Send, ChevronRight, Copy, Check, Volume2, VolumeX,
  RefreshCw, Sparkles,
  FileText, Square, RotateCcw
} from 'lucide-react';
import { askTwin, AskTwinHistoryMessage, AskTwinSourceRef, AssistantAction } from '../utils/askTwin';
import { sourceWindowFor, type AssistantSourceRef } from '../utils/osActions';
import MarkdownRenderer from './MarkdownRenderer';
import { AssistantGlyph } from './AssistantGlyph';
import { FarhanAIIcon } from './FarhanAIIcon';
import ProactiveGreeting from './ProactiveGreeting';
import { useActiveSection } from '../utils/useActiveSection';
import { suggestGreeting, suggestQuestions } from '../utils/assistantSuggestions';
import { track } from '../utils/analytics';

export interface AssistantLauncherProps {
  theme?: string;
  triggerSound?: (freq?: number, dur?: number) => void;
  placement?: 'landing-left' | 'global-bottom-left';
  defaultOpen?: boolean;
  /** Executes OS actions requested by the assistant (open windows/themes/links). */
  onAction?: (action: AssistantAction) => void;
  /** Currently open OS windows for contextual awareness. */
  openWindows?: string[];
  /** Currently focused window for contextual awareness. */
  activeWindow?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
  /** True while a response is streaming in token-by-token. */
  streaming?: boolean;
  /** RAG document titles that informed this answer. */
  sources?: AssistantSourceRef[];
  /** Model-generated follow-up questions for this answer. */
  followUps?: string[];
}

const STORAGE_KEY = 'farhanos.twin.chat';
const VISIT_KEY = 'farhanos.visits';
const GREETING_DISMISS_KEY = 'farhanos.greeting.dismissedAt';
const GREETING_COOLDOWN_MS = 24 * 60 * 60 * 1000; // once a day max
const GREETING_DELAY_MS = 4500; // not before the page breathes
const GREETING_HIDE_MS = 12000; // auto-dismiss if ignored

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "All systems operational. I'm Farhan AI — Farhan Kabir's certified neural twin. Query research, projects, career, or anything else on this page.",
  timestamp: new Date(),
};

const RETURNING_WELCOME: Message = {
  id: 'welcome-returning',
  role: 'assistant',
  content:
    "Welcome back. Farhan AI is online and ready — what would you like to explore today?",
  timestamp: new Date(),
};

const FOLLOW_UPS = [
  'What are Farhan\'s most impressive achievements?',
  'How does Farhan\'s depression-detection model work?',
  'Can you summarize Farhan\'s current research focus?',
];

/** Load a previously persisted conversation, falling back to the welcome message. */
const loadStoredMessages = (): Message[] => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp), streaming: false }));
      }
    }
  } catch {
    // ignore corrupt / unavailable storage
  }

  // Detect returning visitor
  try {
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    localStorage.setItem(VISIT_KEY, String(visits + 1));
    if (visits > 0) return [RETURNING_WELCOME];
  } catch { /* ignore */ }

  return [WELCOME_MESSAGE];
};

// Same visit-count read the greeting uses. Reads AFTER loadStoredMessages has
// incremented it during state init, so the very first visit sees a "1".
const readVisitCount = (): number => {
  try {
    const n = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
};

export default function AssistantLauncher({
  theme = 'dark',
  triggerSound,
  placement = 'global-bottom-left',
  defaultOpen = false,
  onAction,
  openWindows = [],
  activeWindow,
}: AssistantLauncherProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>(loadStoredMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mirror the action handler in a ref so streaming callbacks stay stable.
  const onActionRef = useRef(onAction);
  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'thinking' | 'responding' | 'success' | 'error'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(0);

  // Render exactly one panel variant (desktop window OR mobile sheet).
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // In-flight request + tracked timers so unmount/close never leaks work.
  const abortRef = useRef<AbortController | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const isLight = theme === 'light';
  const isTerminal = theme === 'terminal';
  const isLandingLeft = placement === 'landing-left';

  // Contextual awareness: the landing section being viewed feeds the server,
  // the quick actions, and the proactive greeting.
  const activeSection = useActiveSection(isLandingLeft);
  const [visitCount] = useState(readVisitCount);
  const contextualQuestions = useMemo(
    () => suggestQuestions({ activeSection, activeWindow, openWindows }),
    [activeSection, activeWindow, openWindows]
  );
  const greeting = useMemo(
    // VISIT_KEY is incremented inside loadStoredMessages during state init,
    // so "has visited before" means the counter is already above 1.
    () => suggestGreeting({ returning: visitCount > 1, activeSection }),
    [visitCount, activeSection]
  );

  // Proactive greeting — shown once per session, on landing only, not while
  // the panel is open, and never within 24h of a manual dismissal.
  const [greetingVisible, setGreetingVisible] = useState(false);
  const greetingShownRef = useRef(false);

  useEffect(() => {
    if (!isLandingLeft || isOpen) return;
    const id = setTimeout(() => {
      if (greetingShownRef.current) return;
      try {
        const lastDismiss = parseInt(localStorage.getItem(GREETING_DISMISS_KEY) || '0', 10);
        if (Number.isFinite(lastDismiss) && Date.now() - lastDismiss < GREETING_COOLDOWN_MS) {
          greetingShownRef.current = true; // don't re-advertise this session
          return;
        }
      } catch { /* ignore */ }
      greetingShownRef.current = true;
      setGreetingVisible(true);
      track('assistant_greeting_shown');
    }, GREETING_DELAY_MS);
    return () => clearTimeout(id);
  }, [isLandingLeft, isOpen]);

  useEffect(() => {
    if (!greetingVisible) return;
    const id = setTimeout(() => setGreetingVisible(false), GREETING_HIDE_MS);
    return () => clearTimeout(id);
  }, [greetingVisible]);

  const dismissGreeting = useCallback(() => {
    setGreetingVisible(false);
    try {
      localStorage.setItem(GREETING_DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const updateHeight = () => {
        setSheetHeight(window.innerHeight);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      // Scroll input into view when sheet opens, with slight delay for render
      const scrollId = setTimeout(() => {
        inputRef.current?.scrollIntoView({ block: 'end', inline: 'nearest' });
      }, 100);
      return () => {
        window.removeEventListener('resize', updateHeight);
        clearTimeout(scrollId);
      };
    }
  }, [isOpen]);

  // Persist conversation across reloads — debounced, and skipped mid-stream
  // (messages updates fire on every throttled delta flush).
  useEffect(() => {
    if (messages[messages.length - 1]?.streaming) return;
    const id = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // ignore quota / availability errors
      }
    }, 800);
    return () => clearTimeout(id);
  }, [messages]);

  // Global keyboard shortcut: "/" focuses input when panel is open.
  // Cmd/Ctrl+K intentionally belongs to the OS command palette (App.tsx).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && isOpen && document.activeElement !== inputRef.current) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  /**
   * Core streaming reply. `appendUser` is false when regenerating (the user
   * bubble already exists in `historyMessages`) so we never duplicate it.
   */
  const streamReply = useCallback(
    async (content: string, historyMessages: Message[], appendUser = true) => {
      triggerSound?.(900, 0.03);
      setAiState('thinking');

      if (appendUser) {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      const assistantId = `assistant-${Date.now()}`;
      // Placeholder assistant bubble we stream tokens into. It renders a typing
      // indicator until the first token arrives.
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), streaming: true },
      ]);

      setInput('');
      setIsLoading(true);

      const setAssistantContent = (patch: Partial<Message>) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)));

      try {
        const history = historyMessages.map<AskTwinHistoryMessage>((m) => ({
          role: m.role,
          content: m.content,
        }));

        const controller = new AbortController();
        abortRef.current = controller;

        const reply = await askTwin({
          message: content,
          history,
          context: {
            openWindows,
            activeWindow,
            activeSection: activeSection ?? undefined,
            visitCount,
          },
          signal: controller.signal,
          onDelta: (full) => {
            setAiState('responding');
            setAssistantContent({ content: full });
          },
          onSources: (items: AskTwinSourceRef[]) => {
            setAssistantContent({
              sources: items.map((i) => ({ title: i.title, window: sourceWindowFor(i.title) })),
            });
          },
          onFollowups: (items) => {
            setAssistantContent({ followUps: items });
          },
          onAction: (action) => {
            track('assistant_action', { type: action.type });
            onActionRef.current?.(action);
          },
        });

        setAssistantContent({ content: reply || 'No verified information available.', streaming: false });
        setAiState('success');
        later(() => setAiState('idle'), 1200);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setAssistantContent({ streaming: false });
          setAiState('idle');
        } else {
          setAiState('error');
          setAssistantContent({
            content: (err as Error).message || 'Neural link unstable. Retry transmission.',
            streaming: false,
          });
          later(() => setAiState('idle'), 2000);
        }
      } finally {
        abortRef.current = null;
        setIsLoading(false);
      }
    },
    [openWindows, activeWindow, activeSection, visitCount, triggerSound, later]
  );

  const sendMessage = useCallback(
    (text?: string) => {
      const content = (text || input).trim();
      if (!content || isLoading) return;
      track('assistant_send');
      streamReply(content, messages);
      setInput('');
    },
    [input, isLoading, messages, streamReply]
  );

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const lastAssistant = messages[messages.length - 1];
    if (!lastUser || isLoading) return;
    if (lastAssistant && lastAssistant.role === 'assistant' && lastAssistant.content && !lastAssistant.streaming) {
      track('assistant_regenerate');
      // Replace the trailing answer in place — no duplicated user bubble.
      const history = messages.filter((m) => m.id !== lastAssistant.id);
      setMessages(history);
      streamReply(lastUser.content, history, false);
    }
  }, [messages, isLoading, streamReply]);

  const openGreetingAsk = useCallback((query: string) => {
    track('assistant_greeting_accept');
    setGreetingVisible(false);
    setIsOpen(true);
    triggerSound?.(850, 0.03);
    // Let the panel mount before sending so the typing indicator shows.
    later(() => sendMessage(query), 250);
  }, [sendMessage, triggerSound, later]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleClose = useCallback(() => {
    stopSpeaking();
    abortRef.current?.abort();
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    track('assistant_voice');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    later(() => setCopiedId(null), 2000);
  };

  const [isPressed, setIsPressed] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !isHovering) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.12;
    const deltaY = (e.clientY - centerY) * 0.12;
    setMousePosition({ x: deltaX, y: deltaY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    triggerSound?.(1200, 0.02);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const prefersReducedMotion = useReducedMotion();

  const motionStyle = isHovering ? { x: mousePosition.x, y: mousePosition.y } : {};

  // Dialog semantics: Escape closes; focus moves into the dialog on open
  // and returns to the launcher button on close (handled in handleClose).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(focusTimer);
    };
  }, [isOpen, handleClose]);

  const glassClass = isLight
    ? 'bg-white/85 border-slate-200/80 shadow-xl shadow-slate-900/10'
    : 'bg-zinc-950/92 border-zinc-800/70 shadow-2xl shadow-black/60';

  const inputGlass = isLight
    ? 'bg-slate-50/80 border-slate-200 focus:border-indigo-400'
    : 'bg-black/70 border-zinc-800 focus:border-indigo-500/50';

  const userBubble = isLight
    ? 'bg-indigo-50 border-indigo-100 text-slate-800'
    : 'bg-indigo-500/10 border-indigo-500/20 text-slate-100';

  const assistantBubble = isLight
    ? 'bg-slate-50 border-slate-200 text-slate-700'
    : 'bg-zinc-900/50 border-zinc-800 text-zinc-200';

  const contextLabel = useMemo(
    () =>
      activeSection
        ? activeSection === 'hero-content'
          ? 'hero'
          : activeSection
        : null,
    [activeSection]
  );

  const renderMessages = () => {
    const lastMsgId = messages[messages.length - 1]?.id;
    return (
      <>
        {messages.length === 1 && (
          <div className="space-y-5">
            <div className="text-center py-8 px-4">
              <div
                className={`w-24 h-24 mx-auto rounded-2xl overflow-hidden mb-5 transition-colors ${
                  isTerminal
                    ? 'bg-[#33ff33]/10 border border-[#33ff33]/20'
                    : 'bg-indigo-500/10 border border-indigo-500/20'
                }`}
              >
                {isTerminal ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <AssistantGlyph state={aiState} className="text-[#33ff33] w-12 h-12" />
                  </div>
                ) : (
                  <FarhanAIIcon className="w-full h-full" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
                Farhan AI
              </h3>
              <p id="assistant-dialog-description" className={`text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'} max-w-xs mx-auto`}>
                Farhan Kabir's certified neural twin. Every answer is grounded in verified portfolio intelligence and live data.
              </p>
              {contextLabel && (
                <p className={`mt-2 inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border ${
                  isLight ? 'border-indigo-200 bg-indigo-50/60 text-indigo-500' : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  context: {contextLabel}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5 px-2">
              {contextualQuestions.map((q, i) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm transition-all cursor-pointer border ${
                    isLight
                      ? 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/60 text-slate-700 hover:shadow-sm'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 text-zinc-300 hover:text-slate-200 hover:shadow-sm'
                  }`}
                >
                  <span
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    {q.replace(/[^a-zA-Z]/g, '')[0]?.toUpperCase() ?? i + 1}
                  </span>
                  <span className="flex-1 font-medium">{q}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map(
            (msg) =>
              messages.length > 1 && (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[88%] border shadow-sm ${
                      msg.role === 'user' ? userBubble : assistantBubble
                    }`}
                  >
                    {msg.streaming && !msg.content ? (
                      /* Animated typing indicator while awaiting the first token */
                      <div className="flex items-center gap-1.5 py-0.5" aria-label="Assistant is typing">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    ) : msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'assistant' && msg.content && !msg.streaming && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(msg.content);
                          }
                        }}
                        className="text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer p-1"
                        title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                        aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer p-1"
                        title="Copy"
                        aria-label="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {msg.id === lastMsgId && (
                        <button
                          onClick={regenerate}
                          disabled={isLoading}
                          className="text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Regenerate response"
                          aria-label="Regenerate response"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  {/* Verified knowledge sources behind this answer */}
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && !msg.streaming && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {msg.sources.slice(0, 4).map((src) =>
                        src.window ? (
                          <button
                            key={src.title}
                            onClick={() =>
                              onActionRef.current?.({ type: 'open_window', window: src.window! })
                            }
                            className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border transition-all cursor-pointer ${
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:border-indigo-500/40 hover:text-indigo-300'
                            }`}
                            title={`Open ${src.window} window`}
                          >
                            <FileText className="w-3 h-3" />
                            {src.title.length > 28 ? `${src.title.slice(0, 28)}…` : src.title}
                          </button>
                        ) : (
                          <span
                            key={src.title}
                            className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border ${
                              isLight
                                ? 'border-slate-200 bg-slate-50 text-slate-400'
                                : 'border-zinc-800/70 bg-zinc-900/40 text-zinc-600'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            {src.title.length > 28 ? `${src.title.slice(0, 28)}…` : src.title}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </motion.div>
              )
          )}
        </AnimatePresence>

        {(() => {
          const lastDone = [...messages]
            .reverse()
            .find((m) => m.role === 'assistant' && m.content && !m.streaming);
          const showSuggestions = !!lastDone && !isLoading && lastDone.id !== 'welcome' && messages.length > 1;
          // Prefer model-generated follow-ups; fall back to the static trio.
          const suggestions = lastDone?.followUps?.length ? lastDone.followUps : FOLLOW_UPS;
          return showSuggestions ? (
            <div className="flex flex-wrap gap-2 pl-1 pt-0.5">
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    isLight
                      ? 'border-indigo-200 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300'
                      : 'border-zinc-700 bg-zinc-900/40 text-indigo-300 hover:bg-zinc-800 hover:border-indigo-500/40'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null;
        })()}
        <div ref={messagesEndRef} />
      </>
    );
  };

  // Shared dialog chrome — a single implementation rendered into whichever
  // panel variant (desktop floating window vs mobile bottom sheet) is active.
  const headerBar = (compact: boolean) => (
    <div
      className={`flex items-center justify-between px-4 h-12 border-b shrink-0 ${
        isLight ? 'border-slate-200 bg-white/70 backdrop-blur-md' : 'border-zinc-800/60 bg-black/50 backdrop-blur-md'
      }`}
    >
      <div className={`flex items-center gap-3 ${compact ? 'min-w-0 flex-1' : ''}`}>
        <div className="relative shrink-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isTerminal ? 'bg-[#33ff33]/10 border border-[#33ff33]/20' : 'bg-indigo-500/10 border border-indigo-500/20'
            }`}
          >
            <AssistantGlyph
              state={aiState}
              className={`${isTerminal ? 'text-[#33ff33]' : 'text-indigo-400'} w-4 h-4`}
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white dark:border-zinc-900" />
        </div>
        <div className={`flex flex-col ${compact ? 'min-w-0' : ''}`}>
          <span className={`text-sm font-bold tracking-tight ${compact ? 'truncate' : ''} ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
            Farhan AI
          </span>
          <span className={`text-[10px] text-emerald-400 font-mono font-medium ${compact ? 'hidden min-[420px]:inline' : ''}`}>Online</span>
        </div>
      </div>
      {compact ? (
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 transition-all cursor-pointer"
          aria-label="Close assistant"
        >
          <X className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }])}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
            title="New chat"
            aria-label="New chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
            title="Close"
            aria-label="Close assistant"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  const messagesColumn = (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {renderMessages()}
    </div>
  );

  const composer = (compact: boolean) => (
    <div
      className={`p-3 border-t shrink-0 ${
        isLight ? 'border-slate-200 bg-white/60 backdrop-blur-md' : 'border-zinc-800/60 bg-black/40 backdrop-blur-md'
      }`}
      style={compact ? { paddingBottom: 'max(12px, env(safe-area-inset-bottom))' } : undefined}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Farhan AI anything…"
          rows={1}
          className={`flex-1 resize-none rounded-xl px-4 py-3 text-[13px] outline-none border transition-all ${inputGlass}`}
          style={{ minHeight: '44px', maxHeight: '120px' }}
          aria-label="Chat input"
          inputMode="text"
          enterKeyHint="send"
        />
        <button
          onClick={() => (isLoading ? abortRef.current?.abort() : sendMessage())}
          disabled={!isLoading && !input.trim()}
          className={`shrink-0 w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            isLoading
              ? 'bg-red-500/90 hover:bg-red-500'
              : 'bg-indigo-500 hover:bg-indigo-400'
          }`}
          aria-label={isLoading ? 'Stop generating' : 'Send message'}
          title={isLoading ? 'Stop generating' : 'Send'}
        >
          {isLoading ? <Square className="w-3.5 h-3.5 fill-current" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const dialogProps = {
    role: 'dialog' as const,
    'aria-modal': true as const,
    'aria-label': "Farhan AI",
    'aria-describedby': 'assistant-dialog-description',
  };

  const openPanel = () => {
    track('assistant_open');
    setGreetingVisible(false);
    setIsOpen(true);
    triggerSound?.(800, 0.03);
  };

  const statusAnnouncement =
    aiState === 'thinking'
      ? 'Farhan AI is thinking'
      : aiState === 'responding'
        ? 'Farhan AI is responding'
        : aiState === 'error'
          ? 'Farhan AI encountered an error'
          : aiState === 'success'
            ? 'Farhan AI has responded'
            : '';

  return (
    <div
      className={`fixed z-[9999] flex items-end gap-3 ${
        isLandingLeft
          ? 'left-3 bottom-3 sm:left-4 sm:bottom-4 flex-col-reverse'
          : 'left-3 bottom-3 sm:left-4 sm:bottom-4 flex-row-reverse'
      }`}
    >
      {/* Proactive greeting chip — floats just above the launcher button */}
      <AnimatePresence>
        {greetingVisible && (
          <div className="absolute bottom-16 left-0 w-[300px] max-w-[calc(100vw-2rem)]">
            <ProactiveGreeting
              greeting={greeting}
              isTerminal={isTerminal}
              isLight={isLight}
              onAsk={openGreetingAsk}
              onDismiss={dismissGreeting}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          isMobile ? (
            /* Mobile Fullscreen Sheet */
            <motion.div
              key="assistant-mobile-sheet"
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="assistant-mobile-sheet fixed inset-x-0 bottom-0 z-[9998] w-full h-[90vh] rounded-t-2xl border border-b-0 bg-zinc-950/97 backdrop-blur-2xl overflow-hidden flex flex-col"
              style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
              {...dialogProps}
            >
              {headerBar(true)}
              {messagesColumn}
              {composer(true)}
            </motion.div>
          ) : (
            /* Desktop & Tablet Chat Window */
            <motion.div
              key="assistant-desktop-window"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
              className="assistant-desktop-window assistant-chat-window flex w-[90vw] md:w-[35vw] lg:w-[400px] max-w-[600px] min-w-[320px] max-h-[70vh] flex-col rounded-2xl border backdrop-blur-2xl overflow-hidden"
              {...dialogProps}
            >
              {headerBar(false)}
              {messagesColumn}
              {composer(false)}
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Live-region status for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {statusAnnouncement}
      </div>

      {/* Floating Launcher Button */}
      <button
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={openPanel}
        className={`
          relative flex items-center justify-center cursor-pointer
          rounded-2xl p-0 w-12 h-12
          bg-zinc-950/95 border border-zinc-700/60 shadow-xl md:backdrop-blur-xl
          hover:border-indigo-400/60 hover:shadow-indigo-500/20
          transition-all outline-none
          focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
          touch-manipulation
          will-change-transform
          active:scale-90
        `}
        aria-label="Open Farhan AI"
        aria-expanded={isOpen}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: isPressed ? 0.92 : 1,
            y: 0,
            ...motionStyle,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            y: prefersReducedMotion ? undefined : {
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            scale: {
              type: 'spring',
              stiffness: 400,
              damping: 17,
            },
          }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="absolute inset-0 rounded-2xl"
        >
          {/* Breathing glow */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-indigo-500/10 opacity-0"
              animate={{ opacity: isHovering ? [0.4, 0.8, 0.4] : 0 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {/* Halo ring */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute inset-[-6px] rounded-3xl border border-indigo-400/0"
              animate={{
                scale: isHovering ? [1, 1.08, 1] : 1,
                opacity: isHovering ? [0.3, 0.7, 0.3] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.div>

        {/* Glyph */}
        <AssistantGlyph
          state={aiState}
          className={`${isTerminal ? 'text-[#33ff33]' : 'text-indigo-400'} w-6 h-6 relative z-10 transition-all duration-300 ${
            isHovering ? 'rotate-12 scale-110' : ''
          }`}
        />

        {/* Status dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950 shadow-lg z-20" aria-hidden="true" />
        <span className="sr-only">Online</span>
      </button>
    </div>
  );
}