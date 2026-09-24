import React, { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback, startTransition } from 'react';
const AssistantLauncher = lazy(() => import('./components/AssistantLauncher'));
import {
  Terminal, Cpu, Layers, GitBranch, BookOpen, Network, FileText,
  Calendar, Award, Search,
  Maximize2, Minimize2, X, Menu, Sparkles,
  Rocket, Compass, PhoneCall, Palette,
  Clock, FileSpreadsheet, Settings, User, Volume2, VolumeX
} from 'lucide-react';
import { FarhanAIIcon } from './components/FarhanAIIcon';
import ClockText from './components/Clock';
import SkeletonWindow from './components/SkeletonWindow';
import { portfolioData } from './data/portfolioData';
import { Project, Paper, TimelineEvent, Article, Theme } from './types';
import LandingPage from './components/LandingPage';
import { playSound, setMuted as setMutedSound } from './utils/sound';
import { loadOsState, saveOsState, clearOsState, type PersistedOsState } from './utils/osState';
import { track } from './utils/analytics';
import { siteConfig } from './config/site';
const Whiteboard = lazy(() => import('./components/Whiteboard'));
const BuildsWindow = lazy(() => import('./os/windows/BuildsWindow'));
const TimelineWindow = lazy(() => import('./os/windows/TimelineWindow'));
const ResumeWindow = lazy(() => import('./os/windows/ResumeWindow'));
const GithubWindow = lazy(() => import('./os/windows/GithubWindow'));
const GardenWindow = lazy(() => import('./os/windows/GardenWindow'));
const SkillsWindow = lazy(() => import('./os/windows/SkillsWindow'));
const ProjectsWindow = lazy(() => import('./os/windows/ProjectsWindow'));
const ResearchWindow = lazy(() => import('./os/windows/ResearchWindow'));
const WritingWindow = lazy(() => import('./os/windows/WritingWindow'));
const TwinWindow = lazy(() => import('./os/windows/TwinWindow'));
const BriefWindow = lazy(() => import('./os/windows/BriefWindow'));
const ProfTimelineWindow = lazy(() => import('./os/windows/ProfTimelineWindow'));
const AboutWindow = lazy(() => import('./os/windows/AboutWindow'));
const SettingsWindow = lazy(() => import('./os/windows/SettingsWindow'));

// Warm the module cache when a visitor hovers an icon, so opening the window
// feels instant (feature 7: prefetch-on-hover).
const windowImportMap: Record<string, () => Promise<unknown>> = {
  whiteboard: () => import('./components/Whiteboard'),
  builds: () => import('./os/windows/BuildsWindow'),
  timeline: () => import('./os/windows/TimelineWindow'),
  resume: () => import('./os/windows/ResumeWindow'),
  github: () => import('./os/windows/GithubWindow'),
  garden: () => import('./os/windows/GardenWindow'),
  skills: () => import('./os/windows/SkillsWindow'),
  projects: () => import('./os/windows/ProjectsWindow'),
  research: () => import('./os/windows/ResearchWindow'),
  writing: () => import('./os/windows/WritingWindow'),
  twin: () => import('./os/windows/TwinWindow'),
  brief: () => import('./os/windows/BriefWindow'),
  profTimeline: () => import('./os/windows/ProfTimelineWindow'),
  about: () => import('./os/windows/AboutWindow'),
  settings: () => import('./os/windows/SettingsWindow'),
};
const prefetchWindow = (id: string) => {
  windowImportMap[id]?.().catch(() => {});
};
import { speakTextClient, getAskTwinFallback, generateClientBriefSummary } from './utils/aiFallback';
import { getApiBaseUrl } from './utils/apiConfig';
import { askTwin } from './utils/askTwin';
import {
  isOpenableExternalUrl,
  isOsTheme,
  isOsWindowId,
  type AssistantAction,
} from './utils/osActions';
import { useFocusTrap } from './hooks/useFocusTrap';
import { Toaster, notify } from './components/Toast';
import { ApiStatusChip } from './components/ApiStatusChip';


export default function App() {
  // Navigation View Modes
  const [viewMode, setViewMode] = useState<'landing' | 'os'>('landing');
  const [isWarping, setIsWarping] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock background scroll while the OS mobile drawer is open.
  useEffect(() => {
    if (viewMode !== 'os' || !mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [viewMode, mobileMenuOpen]);

  // Restore the visitor's saved OS session (theme, layout, accent, wallpaper).
  const initialOs = useMemo(() => loadOsState(), []);

  useEffect(() => {
    if (viewMode === 'os') {
      document.documentElement.classList.add('os-mode');
    } else {
      document.documentElement.classList.remove('os-mode');
    }
    return () => {
      document.documentElement.classList.remove('os-mode');
    };
  }, [viewMode]);

  // OS System States
  const [theme, setTheme] = useState<Theme>((initialOs.theme as Theme) || 'dark');
  
  // Window Management States
  // Each open window is represented by its unique id
  const [openWindows, setOpenWindows] = useState<string[]>(
    initialOs.openWindows && initialOs.openWindows.length
      ? initialOs.openWindows
      : ['twin'],
  );
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [focusedWindow, setFocusedWindow] = useState<string>('twin');
  const [windowPositions, setWindowPositions] = useState<Record<string, { x: number; y: number; isMaximized: boolean }>>(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const baseX = Math.min(50, vw - 400);
    const baseY = Math.min(70, vh - 300);
    const defaults: Record<string, { x: number; y: number; isMaximized: boolean }> = {
      twin: { x: baseX, y: baseY, isMaximized: false },
      projects: { x: baseX + 70, y: baseY + 70, isMaximized: false },
      research: { x: baseX + 130, y: baseY + 20, isMaximized: false },
      github: { x: baseX + 170, y: baseY + 90, isMaximized: false },
      writing: { x: baseX + 30, y: baseY + 150, isMaximized: false },
      garden: { x: baseX + 210, y: baseY - 30, isMaximized: false },
      resume: { x: baseX + 250, y: baseY + 130, isMaximized: false },
      timeline: { x: baseX + 90, y: baseY + 230, isMaximized: false },
      skills: { x: baseX + 350, y: baseY + 10, isMaximized: false },
      brief: { x: baseX + 300, y: baseY + 80, isMaximized: false },
      builds: { x: baseX + 150, y: baseY + 280, isMaximized: false },
      whiteboard: { x: baseX + 190, y: baseY + 40, isMaximized: false },
      profTimeline: { x: baseX + 110, y: baseY + 170, isMaximized: false },
    };
    // Sanitize persisted positions: a desktop-saved layout must never strand
    // windows off-screen on a smaller viewport, and corrupt values fall back.
    if (initialOs.windowPositions) {
      for (const k of Object.keys(initialOs.windowPositions)) {
        const saved = initialOs.windowPositions[k];
        if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) {
          defaults[k] = {
            x: Math.max(-160, Math.min(saved.x, 1600)),
            y: Math.max(0, Math.min(saved.y, 1200)),
            isMaximized: saved.isMaximized === true,
          };
        }
      }
    }
    return defaults;
  });
  const [windowReady, setWindowReady] = useState<Record<string, boolean>>({});

  const osTimelineProgressLineRef = useRef<HTMLDivElement | null>(null);

  // Dynamic window width for responsiveness (debounced). Window positions
  // are re-clamped here so rotation/resize never strands title bars off-screen.
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        setWindowPositions(prev => {
          const next: typeof prev = {};
          for (const k of Object.keys(prev)) {
            const p = prev[k];
            const c = clampWindowPos(p.x, p.y);
            next[k] = { ...p, x: c.x, y: c.y };
          }
          return next;
        });
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Pre-warm RAG knowledge base index during idle time
  useEffect(() => {
    const warmup = async () => {
      try {
        const base = getApiBaseUrl();
        await fetch(`${base}/api/ask-twin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'ping', history: [] }),
        });
      } catch { /* ignore warmup errors */ }
    };
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => { warmup(); }, { timeout: 10000 });
    } else {
      setTimeout(warmup, 3000);
    }
  }, []);

  // Resume AudioContext after first user interaction (Chrome autoplay policy)
  useEffect(() => {
    const resume = () => {
      try {
        const ac = (window as any)._farhanosAudioCtx;
        if (ac && ac.state === 'suspended') ac.resume();
      } catch { /* ignore */ }
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
    document.addEventListener('pointerdown', resume);
    return () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
      document.removeEventListener('pointerdown', resume);
    };
  }, []);

  const cycleTheme = useCallback(() => {
    const themes: Theme[] = ['dark', 'cyberpunk', 'ai', 'terminal', 'light'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
    document.getElementById('farhanos-announcer')!.textContent = `Theme changed to ${themes[nextIdx]}`;
    triggerSound(750, 0.03);
  }, [theme]);

  // Quick Action OS Bypass Helpers
  const handleOpenWindowDirectly = useCallback((winId: string) => {
    setViewMode('os');
    setOpenWindows(prev => {
      if (prev.includes(winId)) return prev;
      return [...prev, winId];
    });
    setFocusedWindow(winId);
    triggerSound(900, 0.05);
  }, []);

  const handleOpenArticleDirectly = useCallback((article: Article) => {
    setSelectedArticle(article);
    handleOpenWindowDirectly('writing');
  }, [handleOpenWindowDirectly]);

  // UI Interactive States
  const [selectedProject, setSelectedProject] = useState<Project>(portfolioData.projects[0]);
  const [selectedPaper, setSelectedPaper] = useState<Paper>(portfolioData.papers[0]);
  const [articles, setArticles] = useState<Article[]>(portfolioData.articles);
  const [selectedArticle, setSelectedArticle] = useState<Article>(portfolioData.articles[0]);
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineEvent>(portfolioData.timeline[0]);

  useEffect(() => {
    const fetchMediumStories = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/medium-stories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            startTransition(() => {
              setArticles(data);
              setSelectedArticle(data[0]);
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Medium stories endpoint unavailable, using static articles:', err);
      }

      startTransition(() => {
        setArticles(portfolioData.articles);
        setSelectedArticle(portfolioData.articles[0]);
      });
    };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => fetchMediumStories(), { timeout: 5000 });
    } else {
      setTimeout(fetchMediumStories, 1000);
    }
  }, []);
  const [skillFilter, setSkillFilter] = useState<'all' | 'AI/ML' | 'Frontend' | 'Backend' | 'Research' | 'Systems'>('all');
  const [resumeAudience, setResumeAudience] = useState<'recruiter' | 'investor' | 'founder' | 'researcher'>('recruiter');

  // Command Palette & Search States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const paletteListRef = useRef<HTMLDivElement | null>(null);
  // Focus trap for the command palette: Tab cycles inside, Esc closes,
  // focus returns to the invoking control on unmount.
  const closePalette = useCallback(() => setCommandPaletteOpen(false), []);
  const paletteTrapRef = useFocusTrap({
    enabled: commandPaletteOpen,
    onEscape: closePalette,
  });

  // Ask Twin AI State
  const [twinInput, setTwinInput] = useState('');
  const [twinMessages, setTwinMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; audio?: string; sources?: { title: string }[] }>>([
    { role: 'assistant', content: "Systems fully operational. I am Farhan's certified neural clone. Feel free to enquire about my NLP predictive pipelines, clinical depression research, full-stack architectures, or project command maps." }
  ]);
  const [twinLoading, setTwinLoading] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const [currentTTSAudio, setCurrentTTSAudio] = useState<{ stop: () => void } | null>(null);
  const twinSourcesRef = useRef<{ title: string }[]>([]);

  // Mission Brief State
  const [briefForm, setBriefForm] = useState({
    projectType: 'AI Engineering & LLMs',
    budget: '$5k - $10k',
    timeline: '1-3 Months',
    goals: '',
    comments: '',
    email: ''
  });
  const [briefSummary, setBriefSummary] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefDispatchLoading, setBriefDispatchLoading] = useState(false);

  // AI Guided Tour States
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourMsg, setTourMsg] = useState('');
  const [tourLoading, setTourLoading] = useState(false);

  // Custom Digital Garden Graph interactive states
  const [hoveredGardenNode, setHoveredGardenNode] = useState<string | null>(null);

  // Draggable State Management (Simple manual drag handler to avoid external libraries complexity)
  const [draggedWindow, setDraggedWindow] = useState<string | null>(null);

  // Sound engine + visitor customization (persisted)
  const [muted, setMutedState] = useState<boolean>(() => initialOs.muted);
  const [accent, setAccentState] = useState<string | null>(initialOs.accent ?? null);
  const [wallpaper, setWallpaperState] = useState<string | null>(initialOs.wallpaper ?? null);

  const triggerSound = useCallback((freq: number = 800, dur: number = 0.05) => {
    playSound(freq, dur);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setMutedSound(next);
      triggerSound(next ? 200 : 700, 0.05);
      return next;
    });
  }, [triggerSound]);

  const changeAccent = useCallback((hex: string | null) => {
    setAccentState(hex);
    if (hex) {
      document.documentElement.style.setProperty('--user-accent', hex);
    } else {
      document.documentElement.style.removeProperty('--user-accent');
    }
  }, []);

  const changeWallpaper = useCallback((url: string | null) => {
    setWallpaperState(url);
  }, []);

  const resetLayout = useCallback(() => {
    setWindowPositions({
      twin: { x: 50, y: 70, isMaximized: false },
    });
    setOpenWindows(['twin']);
    triggerSound(600, 0.06);
  }, [triggerSound]);

  const resetAll = useCallback(() => {
    clearOsState();
    changeAccent(null);
    changeWallpaper(null);
    setMutedSound(false);
    setMutedState(false);
    setTheme('dark');
    resetLayout();
    triggerSound(500, 0.08);
  }, [changeAccent, changeWallpaper, resetLayout, triggerSound]);

  // Persist OS session state (debounced inside saveOsState).
  useEffect(() => {
    saveOsState({
      theme,
      openWindows,
      windowPositions,
      muted,
      accent,
      wallpaper,
    });
  }, [theme, openWindows, windowPositions, muted, accent, wallpaper]);


  const handleWarpAndEnter = useCallback(() => {
    if (isWarping) return;
    triggerSound(1200, 0.4);
    setIsWarping(true);
    
    let step = 0;
    const soundInterval = setInterval(() => {
      if (step < 7) {
        triggerSound(150 + step * 200, 0.05);
        step++;
      } else {
        clearInterval(soundInterval);
      }
    }, 100);

    setTimeout(() => {
      setViewMode('os');
      setIsWarping(false);
    }, 1800);
  }, [isWarping]);

  // Command palette entry points: Cmd/Ctrl+K anywhere, or bare "K" outside
  // text fields (the hero advertises it). The palette lives in OS mode, so
  // invoking it from the landing page enters the OS first.
  const handleOpenPalette = useCallback(() => {
    setViewMode('os');
    setCommandPaletteOpen(true);
    triggerSound(800, 0.03);
  }, [triggerSound]);

  // Shareable deep links: #/w/<window-id> enters the OS with that window open.
  useEffect(() => {
    const m = window.location.hash.match(/^#\/w\/([\w-]+)/);
    if (m && isOsWindowId(m[1])) {
      setViewMode('os');
      openWindow(m[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global Key Down for Cmd + K Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (viewMode === 'landing') {
          handleOpenPalette();
        } else {
          setCommandPaletteOpen(prev => !prev);
          triggerSound(900, 0.04);
        }
      } else if (
        e.key === 'k' && !e.metaKey && !e.ctrlKey && !e.altKey &&
        viewMode === 'landing' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        handleOpenPalette();
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSound, viewMode, handleOpenPalette]);

  // Drag Window logic handlers - buttery smooth macOS-style dragging
  const draggedWindowRef = useRef<string | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragRafRef = useRef<number | null>(null);
  // Bottom-sheet gesture state (mobile): vertical swipe distance on the title bar.
  const isSheetDragRef = useRef(false);
  const sheetDyRef = useRef(0);
  // Indirection: minimizeWindow is declared below the drag handlers.
  const minimizeWindowRef = useRef<((windowId: string) => void) | null>(null);

  // Keep at least part of the title bar inside the viewport
  const clampWindowPos = useCallback((x: number, y: number) => {
    const marginX = Math.max(160, window.innerWidth - 160);
    return {
      x: Math.min(Math.max(x, -marginX), marginX),
      y: Math.min(Math.max(y, 0), Math.max(0, window.innerHeight - 56)),
    };
  }, []);

  // Pointer-event drag: works for mouse, touch, and stylus. Pointer capture
  // on the title bar means no window-level listeners are needed, and deltas
  // come from clientX/Y (movementX/Y is unreliable on touch/trackpads).
  // State commits are rAF-throttled to one render per frame.
  const flushDragPos = useCallback(() => {
    const activeWindow = draggedWindowRef.current;
    const pending = pendingPosRef.current;
    dragRafRef.current = null;
    if (!activeWindow || !pending) return;
    const { x, y } = pending;
    pendingPosRef.current = null;
    setWindowPositions(prev => ({
      ...prev,
      [activeWindow]: { ...prev[activeWindow], x, y }
    }));
  }, []);

  const handleDragStart = (windowId: string, e: React.PointerEvent) => {
    if (windowPositions[windowId]?.isMaximized) return;
    // Mobile uses a fixed bottom-sheet layout: track the vertical swipe so a
    // downward pull minimizes the sheet (handled in move/end below).
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setFocusedWindow(windowId);
      draggedWindowRef.current = windowId;
      dragPointerIdRef.current = e.pointerId;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      isSheetDragRef.current = true;
      sheetDyRef.current = 0;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch { /* ignore */ }
      return;
    }
    e.preventDefault();
    setFocusedWindow(windowId);

    draggedWindowRef.current = windowId;
    dragPointerIdRef.current = e.pointerId;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    currentPosRef.current = {
      x: windowPositions[windowId]?.x || 0,
      y: windowPositions[windowId]?.y || 0,
    };
    pendingPosRef.current = null;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* older browsers — moves still fire while pressed */ }

    setDraggedWindow(windowId);
    triggerSound(500, 0.01);
  };

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    const activeWindow = draggedWindowRef.current;
    if (!activeWindow || e.pointerId !== dragPointerIdRef.current) return;

    // Sheet gesture: accumulate vertical pull only; the sheet itself stays put.
    if (isSheetDragRef.current) {
      sheetDyRef.current += e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    const next = clampWindowPos(currentPosRef.current.x + dx, currentPosRef.current.y + dy);
    currentPosRef.current = { x: next.x, y: next.y };
    pendingPosRef.current = next;
    if (dragRafRef.current == null) {
      dragRafRef.current = requestAnimationFrame(flushDragPos);
    }
  }, [clampWindowPos, flushDragPos]);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (draggedWindowRef.current == null || e.pointerId !== dragPointerIdRef.current) return;
    // Sheet gesture: a decisive downward pull minimizes the sheet.
    if (isSheetDragRef.current) {
      const pulledDown = sheetDyRef.current > 90;
      const activeWindow = draggedWindowRef.current;
      isSheetDragRef.current = false;
      sheetDyRef.current = 0;
      draggedWindowRef.current = null;
      dragPointerIdRef.current = null;
      if (pulledDown && activeWindow) minimizeWindowRef.current?.(activeWindow);
      return;
    }
    if (dragRafRef.current != null) {
      cancelAnimationFrame(dragRafRef.current);
      dragRafRef.current = null;
    }
    flushDragPos();
    draggedWindowRef.current = null;
    dragPointerIdRef.current = null;
    setDraggedWindow(null);
  }, [flushDragPos]);

  // Abort an in-flight drag if the component unmounts mid-gesture.
  useEffect(() => {
    return () => {
      if (dragRafRef.current != null) cancelAnimationFrame(dragRafRef.current);
      draggedWindowRef.current = null;
    };
  }, []);

  const handleAnimationEnd = useCallback((windowId: string) => {
    setWindowReady(prev => ({ ...prev, [windowId]: true }));
  }, []);

  // Move DOM focus to a window's title bar so keyboard and screen-reader
  // users land inside the window that just opened / received focus.
  const focusWindow = useCallback((windowId: string) => {
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(`[data-window-title="${windowId}-title"]`)
        ?.focus({ preventScroll: true });
    });
  }, []);

  // Opening & Focusing a window
  const openWindow = useCallback((windowId: string) => {
    triggerSound(700, 0.05);
    document.getElementById('farhanos-announcer')!.textContent = `Window ${windowId} opened`;
    setOpenWindows(prev => {
      if (prev.includes(windowId)) return prev;
      return [...prev, windowId];
    });
    setMinimizedWindows(prev => prev.filter(w => w !== windowId));
    setFocusedWindow(windowId);
    setWindowReady(prev => ({ ...prev, [windowId]: false }));
    track('window_open', { window: windowId });
    focusWindow(windowId);
  }, [focusWindow]);

  // Apply persisted accent + mute on first paint (the setters only run on change).
  useEffect(() => {
    if (accent) {
      document.documentElement.style.setProperty('--user-accent', accent);
    }
    setMutedSound(initialOs.muted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Feature 8: privacy-friendly analytics (Plausible) — only loads when a domain is configured.
  useEffect(() => {
    if (!siteConfig.plausibleDomain) return;
    if (document.getElementById('plausible-script')) return;
    const s = document.createElement('script');
    s.id = 'plausible-script';
    s.defer = true;
    s.src = 'https://plausible.io/js/script.outbound-links.js';
    s.setAttribute('data-domain', siteConfig.plausibleDomain);
    document.head.appendChild(s);
    track('pageview');
  }, []);

  // Executes OS actions requested by the AI assistant (tool-calling bridge).
  // Every variant is allowlist-validated; the server validates too, this is
  // the client-side second gate.
  const handleAssistantAction = useCallback((action: AssistantAction) => {
    switch (action.type) {
      case 'open_window':
        if (isOsWindowId(action.window!)) {
          if (viewMode !== 'os') setViewMode('os');
          startTransition(() => openWindow(action.window!));
          triggerSound(900, 0.05);
        }
        break;
      case 'switch_theme':
        if (isOsTheme(action.theme!)) {
          setTheme(action.theme);
    document.getElementById('farhanos-announcer')!.textContent = `Theme changed to ${action.theme}`;
    triggerSound(750, 0.03);
        }
        break;
      case 'open_link':
        if (isOpenableExternalUrl(action.url)) {
          window.open(action.url, '_blank', 'noopener,noreferrer');
        }
        break;
    }
  }, [viewMode, openWindow]);

  const closeWindow = useCallback((windowId: string) => {
    triggerSound(400, 0.06);
    document.getElementById('farhanos-announcer')!.textContent = `Window ${windowId} closed`;
    const rest = openWindows.filter(w => w !== windowId && !minimizedWindows.includes(w));
    setOpenWindows(prev => prev.filter(w => w !== windowId));
    setWindowReady(prev => {
      const next = { ...prev };
      delete next[windowId];
      return next;
    });
    // Land focus on the next visible window so keyboard users aren't stranded.
    if (rest.length > 0) {
      const next = rest[rest.length - 1];
      setFocusedWindow(next);
      focusWindow(next);
    }
  }, [openWindows, minimizedWindows, focusWindow]);

  const minimizeWindow = useCallback((windowId: string) => {
    triggerSound(450, 0.04);
    setMinimizedWindows(prev => {
      if (prev.includes(windowId)) return prev;
      return [...prev, windowId];
    });
    setFocusedWindow(prev => {
      const rest = openWindows.filter(w => w !== windowId && !minimizedWindows.includes(w));
      document.getElementById('farhanos-announcer')!.textContent = `Window ${windowId} minimized`;
      if (rest.length > 0) focusWindow(rest[rest.length - 1]);
      return rest.length > 0 ? rest[rest.length - 1] : prev;
    });
  }, [openWindows, minimizedWindows, focusWindow]);

  // Kept in sync every render so gesture handlers above can minimize.
  minimizeWindowRef.current = minimizeWindow;

  const toggleMaximize = useCallback((windowId: string) => {
    triggerSound(800, 0.04);
    setWindowPositions(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMaximized: !prev[windowId]?.isMaximized }
    }));
  }, []);

  // TTS Speech Player — client-side Web Speech (no server round-trip).
  const speakText = useCallback((text: string, index: number | null = null, _mode: 'tour' | 'narrate' = 'narrate') => {
    try {
      if (currentTTSAudio) {
        currentTTSAudio.stop();
        setCurrentTTSAudio(null);
      }
      setPlayingMessageIndex(index);
      const audioControl = speakTextClient(text, () => {
        setPlayingMessageIndex(null);
      });
      if (audioControl) {
        setCurrentTTSAudio(audioControl);
      } else {
        setPlayingMessageIndex(null);
      }
    } catch (clientErr) {
      console.error('Client speech synthesis failed:', clientErr);
      setPlayingMessageIndex(null);
    }
  }, [currentTTSAudio]);

  const stopSpeaking = useCallback(() => {
    if (currentTTSAudio) {
      currentTTSAudio.stop();
      setCurrentTTSAudio(null);
    }
    setPlayingMessageIndex(null);
  }, [currentTTSAudio]);

  // Last OS action the twin performed, shown as an in-chat receipt banner.
  const [twinActionNote, setTwinActionNote] = useState<string | null>(null);

  const handleSendTwinMessage = useCallback(async (override?: string) => {
    const userMsg = (override ?? twinInput).trim();
    if (!userMsg) return;
    setTwinInput('');
    setTwinActionNote(null);
    setTwinMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTwinLoading(true);
    triggerSound(1100, 0.03);

    const historyPayload = twinMessages.map(m => ({
      role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content
    }));

    try {
      const streamedRef = { current: '' };
      const reply = await askTwin({
        message: userMsg,
        history: historyPayload,
        onDelta: fullText => {
          if (fullText.length <= streamedRef.current.length) return;
          streamedRef.current = fullText;
          setTwinMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && last.content === fullText) return prev;
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { role: 'assistant' as const, content: fullText }];
            }
            return [...prev, { role: 'assistant' as const, content: fullText }];
          });
        },
        onSources: (items) => {
          twinSourcesRef.current = items;
        },
        onAction: (action) => {
          // The twin operates the portfolio: validated server-side, then
          // re-validated here (defense in depth) before dispatch.
          if (action.type === 'open_window' && action.window && isOsWindowId(action.window)) {
            handleAssistantAction({ type: 'open_window', window: action.window });
            setTwinActionNote(`Opened the ${action.window} window`);
          } else if (action.type === 'switch_theme' && action.theme && isOsTheme(action.theme)) {
            handleAssistantAction({ type: 'switch_theme', theme: action.theme });
            setTwinActionNote(`Switched to ${action.theme} theme`);
          } else if (action.type === 'open_link' && isOpenableExternalUrl(action.url)) {
            handleAssistantAction({ type: 'open_link', url: action.url });
            setTwinActionNote('Opened the requested link');
          } else {
            return;
          }
          triggerSound(900, 0.05);
        },
      });

      const sources = twinSourcesRef.current.length ? twinSourcesRef.current : undefined;
      twinSourcesRef.current = [];
      setTwinMessages(prev => {
        const withoutPartial =
          prev[prev.length - 1]?.role === 'assistant'
            ? prev.slice(0, -1)
            : prev;
        return [...withoutPartial, { role: 'assistant' as const, content: reply, sources }];
      });
      setTwinLoading(false);
      // Honor the visitor's mute preference — never auto-play voice uninvited.
      if (!muted) speakText(reply, twinMessages.length + 1);
    } catch (err: any) {
      console.warn('Backend twin service failed, using local fallback:', err);
      const fallbackReply = getAskTwinFallback(userMsg, historyPayload);
      setTwinMessages(prev => {
        const withoutPartial =
          prev[prev.length - 1]?.role === 'assistant'
            ? prev.slice(0, -1)
            : prev;
        return [...withoutPartial, { role: 'assistant' as const, content: fallbackReply }];
      });
      setTwinLoading(false);
      if (!muted) speakText(fallbackReply, twinMessages.length + 1);
    }
  }, [twinInput, twinMessages, speakText, muted, handleAssistantAction]);

  const handleSendBrief = useCallback(async () => {
    if (!briefForm.goals.trim()) return;
    setBriefLoading(true);
    triggerSound(950, 0.05);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/summarize-brief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType: briefForm.projectType,
          budget: briefForm.budget,
          timeline: briefForm.timeline,
          goals: briefForm.goals,
          comments: briefForm.comments
        })
      });
      const data = await res.json();
      if (data.summary) {
        setBriefSummary(data.summary);
      }
    } catch (err) {
      console.warn('Backend brief summarizer failed, using local fallback:', err);
      const fallbackSummary = generateClientBriefSummary(briefForm);
      setBriefSummary(fallbackSummary);
    } finally {
      setBriefLoading(false);
    }
  }, [briefForm]);

  const handleDispatchBrief = useCallback(async () => {
    if (!briefForm.email.trim()) {
      notify('error', 'Please provide a valid transmission email address before dispatching.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(briefForm.email)) {
      notify('error', 'Please provide a valid email structure.');
      return;
    }
    setBriefDispatchLoading(true);
    triggerSound(1100, 0.05);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'OS Mission Collaborator',
          email: briefForm.email,
          subject: `Mission Brief: ${briefForm.projectType}`,
          message: `Strategic Brief Parameters:\n- Venture Domain: ${briefForm.projectType}\n- Financial Bounds: ${briefForm.budget}\n- Timeline Profile: ${briefForm.timeline}\n- Strategic Goals: ${briefForm.goals}\n- Operational Directives: ${briefForm.comments || 'None'}\n\nGenerated Assessment Architecture:\n${briefSummary}`,
          metadata: {
            source: 'OS_MISSION_BRIEF',
            projectType: briefForm.projectType,
            budget: briefForm.budget,
            timeline: briefForm.timeline,
            comments: briefForm.comments
          }
        })
      });
      
      if (!res.ok) {
        let errMsg = 'Failed to dispatch brief.';
        try {
          const d = await res.json();
          errMsg = d.error || errMsg;
        } catch {
          // non-JSON error body
        }
        throw new Error(errMsg);
      }
      
      notify('success', "Handshake confirmed. Strategy Brief successfully transmitted to Farhan's secure channel.");
      setBriefSummary(null);
      
      setBriefForm(prev => ({
        ...prev,
        goals: '',
        comments: '',
        email: ''
      }));
    } catch (err) {
      console.warn('Brief dispatch failed:', err);
      const detail = err instanceof Error && err.message ? ` (${err.message})` : '';
      notify('error', `Dispatch FAILED — your brief was NOT delivered${detail}. Please retry or email ${siteConfig.contactEmail} directly.`);
    } finally {
      setBriefDispatchLoading(false);
    }
  }, [briefForm, briefSummary]);

  const runTourCycle = useCallback(async () => {
    triggerSound(1200, 0.1);
    setIsTourActive(true);
    setTourLoading(true);
    setTourStep(1);

    const tourSteps = [
      {
        id: 'twin',
        title: 'Neural Core Clone',
        text: 'This is FK\'s AI Assistant, trained on Farhan\'s complete portfolio. You can query clinical results, NLP models, and full-stack architecture profiles.'
      },
      {
        id: 'projects',
        title: 'Project Galaxy Command',
        text: 'Review the high-precision mission panels showing fine-tuned Transformers, custom Go microservices, and metrics-driven SaaS applications.'
      },
      {
        id: 'research',
        title: 'Linguistic Research Laboratory',
        text: 'Inspect peer-reviewed NLP models, specialized Reddit depression classifiers, topological architectures, and citation modules.'
      },
      {
        id: 'skills',
        title: 'Skill Observational Map',
        text: 'Explore interactive visual expertise nodes across deep ML, distributed scalable systems, and fully secure client UI architectures.'
      },
      {
        id: 'brief',
        title: 'Mission Collaboration Brief',
          text: 'Submit custom initiatives to initiate automated feasibility evaluations driven directly by the Groq reasoning framework.'
      }
    ];

    const startStep = async (stepIdx: number) => {
      const cur = tourSteps[stepIdx - 1];
      if (!cur) {
        setIsTourActive(false);
        setTourStep(0);
        return;
      }
      setTourStep(stepIdx);
      setTourMsg(cur.text);
      openWindow(cur.id);
      setTourLoading(true);

      await speakText(cur.text, null, 'tour');
      setTourLoading(false);
    };

    await startStep(1);
  }, [openWindow, speakText]);

  const nextTourStep = useCallback(() => {
    if (tourStep < 5) {
      const next = tourStep + 1;
      setTourStep(next);
      triggerSound(800, 0.04);
      
      const tourStepsText = [
        'Review the high-precision mission panels showing fine-tuned Transformers, custom Go microservices, and metrics-driven SaaS applications.',
        'Inspect peer-reviewed NLP models, specialized Reddit depression classifiers, topological architectures, and citation modules.',
        'Explore interactive visual expertise nodes across deep ML, distributed scalable systems, and fully secure client UI architectures.',
        'Submit custom initiatives to initiate automated feasibility evaluations driven directly by the Groq reasoning framework.'
      ];
      const winIds = ['projects', 'research', 'skills', 'brief'];
      openWindow(winIds[next - 1]);
      setTourMsg(tourStepsText[next - 2]);
      speakText(tourStepsText[next - 2], null, 'tour');
    } else {
      setIsTourActive(false);
      setTourStep(0);
      stopSpeaking();
      triggerSound(1300, 0.05);
    }
  }, [tourStep, openWindow, speakText, stopSpeaking]);

  const filteredSkills = useMemo(() => portfolioData.skills.filter(s => {
    if (skillFilter === 'all') return true;
    if (skillFilter === 'AI/ML' && s.category === 'AI/ML') return true;
    if (skillFilter === 'Frontend' && s.category === 'Frontend') return true;
    if (skillFilter === 'Backend' && s.category === 'Backend') return true;
    if (skillFilter === 'Research' && s.category === 'Research & Science') return true;
    if (skillFilter === 'Systems' && s.category === 'Systems & Devops') return true;
    return false;
  }), [skillFilter]);

  // Global Command Palette matching items
  const getSearchItems = useCallback(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return [];
    
    const results = [];
    portfolioData.projects.forEach(p => {
      if (p.title.toLowerCase().includes(term) || p.techStack.some(t => t.toLowerCase().includes(term))) {
        results.push({ type: 'Project', title: p.title, subtitle: p.category, action: () => { openWindow('projects'); setSelectedProject(p); setCommandPaletteOpen(false); } });
      }
    });
    portfolioData.papers.forEach(p => {
      if (p.title.toLowerCase().includes(term) || p.abstract.toLowerCase().includes(term)) {
        results.push({ type: 'Research Paper', title: p.title, subtitle: `${p.year} - ${p.journal}`, action: () => { openWindow('research'); setSelectedPaper(p); setCommandPaletteOpen(false); } });
      }
    });
    articles.forEach(a => {
      if (a.title.toLowerCase().includes(term) || a.excerpt.toLowerCase().includes(term)) {
        results.push({ type: 'Blog/Article', title: a.title, subtitle: a.category, action: () => { openWindow('writing'); setSelectedArticle(a); setCommandPaletteOpen(false); } });
      }
    });
    portfolioData.skills.forEach(s => {
      if (s.name.toLowerCase().includes(term)) {
        results.push({ type: 'Tech Stack', title: s.name, subtitle: s.category, action: () => { openWindow('skills'); setSkillFilter(s.category === 'Research & Science' ? 'Research' : s.category === 'Systems & Devops' ? 'Systems' : s.category as any); setCommandPaletteOpen(false); } });
      }
    });

    if ('whiteboard'.includes(term) || 'ideation'.includes(term) || 'canvas'.includes(term) || 'drawing'.includes(term) || 'sketch'.includes(term) || 'paint'.includes(term)) {
      results.push({ type: 'OS Utility', title: 'Ideation Pad (Whiteboard)', subtitle: 'HTML5 digital canvas for sketching visual ideas', action: () => { openWindow('whiteboard'); setCommandPaletteOpen(false); } });
    }

    return results;
  }, [searchQuery, articles, openWindow, setSelectedProject, setSelectedPaper, setSelectedArticle, setSkillFilter, setCommandPaletteOpen]);

  const systemSearchResults = useMemo(
    () => (searchQuery ? getSearchItems() : []),
    [searchQuery, getSearchItems]
  );

  // Keyboard navigation for palette results (↑/↓ move, Enter activates).
  useEffect(() => { setHighlightedIndex(0); }, [searchQuery]);
  useEffect(() => {
    const el = paletteListRef.current?.querySelector('[data-highlighted="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, commandPaletteOpen]);

  // Desktop Icons Configuration for ease of access
  const desktopIcons = useMemo(() => [
    { id: 'twin', label: 'Ask Twin AI', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'projects', label: 'Mission Control', icon: Cpu, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { id: 'research', label: 'Research Lab', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'github', label: 'GitHub Monitor', icon: GitBranch, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
    { id: 'writing', label: 'Writing Hub', icon: FileText, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'garden', label: 'Garden Graph', icon: Network, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'resume', label: 'Resume Gen', icon: FileSpreadsheet, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { id: 'timeline', label: 'Career Index', icon: Calendar, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'profTimeline', label: 'Prof. Timeline', icon: Award, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'skills', label: 'Skill Observatory', icon: Compass, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'brief', label: 'Mission Brief', icon: Rocket, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'builds', label: 'Release Logs', icon: Layers, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    { id: 'whiteboard', label: 'Ideation Pad', icon: Palette, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { id: 'about', label: 'About Farhan', icon: User, color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' },
    { id: 'settings', label: 'Preferences', icon: Settings, color: 'text-slate-300 bg-zinc-500/10 border-zinc-500/20' },
  ], []);

  // Theme styling definitions mapping
  const getThemeStyles = useCallback(() => {
    switch (theme) {
      case 'cyberpunk':
        return {
          bg: 'bg-[#030610] text-[#00ffcc] font-mono selection:bg-pink-500/30 selection:text-white',
          glass: 'bg-black/80 border-2 border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.15)]',
          windowHeader: 'bg-gradient-to-r from-pink-600 to-indigo-900 text-white border-b-2 border-pink-500/60 font-mono',
          btnPrimary: 'bg-pink-600 hover:bg-pink-500 text-white border-2 border-pink-400 font-mono transition-transform duration-150 transform active:scale-95',
          btnSecondary: 'bg-zinc-900 border-2 border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc]/10 font-mono',
          accentColor: 'text-pink-500',
          accentBorder: 'border-pink-500/40',
          indicator: 'bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]',
          panelHeader: 'text-pink-400 uppercase tracking-widest text-[11px] font-bold',
          badge: 'bg-pink-500/20 border border-pink-500/40 text-pink-300'
        };
      case 'ai':
        return {
          bg: 'bg-[#050414] text-slate-100 selection:bg-purple-600/30 selection:text-white',
          glass: 'bg-purple-950/20 backdrop-blur-xl border border-purple-500/30 shadow-[0_20px_50px_rgba(147,51,234,0.15)] ring-1 ring-white/10',
          windowHeader: 'bg-gradient-to-r from-purple-950/50 via-slate-900 to-indigo-950/50 text-slate-100 border-b border-purple-500/30 font-sans backdrop-blur-md',
          btnPrimary: 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white border border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:opacity-90 transition-all active:scale-95 duration-100',
          btnSecondary: 'bg-purple-950/40 border border-cyan-500/40 text-cyan-200 hover:bg-purple-950/80 transition-all',
          accentColor: 'text-purple-400',
          accentBorder: 'border-purple-500/30',
          indicator: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse',
          panelHeader: 'text-purple-400 tracking-wider text-xs font-semibold',
          badge: 'bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs'
        };
      case 'terminal':
        return {
          bg: 'bg-black text-[#33ff33] font-mono selection:bg-[#33ff33]/20',
          glass: 'bg-black border border-[#33ff33] shadow-[0_0_15px_rgba(51,255,51,0.1)]',
          windowHeader: 'bg-zinc-950 text-[#33ff33] border-b border-[#33ff33] font-mono',
          btnPrimary: 'bg-[#33ff33] text-black border border-[#33ff33] font-bold hover:bg-[#33ff33]/80 transition-all',
          btnSecondary: 'bg-black border border-[#33ff33] text-[#33ff33] hover:bg-[#33ff33]/15 transition-all',
          accentColor: 'text-[#33ff33]',
          accentBorder: 'border-[#33ff33]/30',
          indicator: 'bg-[#33ff33] shadow-[0_0_10px_#33ff33]',
          panelHeader: 'text-[#33ff33] font-bold uppercase tracking-wider text-[11px]',
          badge: 'bg-transparent border border-[#33ff33] text-[#33ff33] text-xs'
        };
      case 'light':
        return {
          bg: 'bg-[#f8fafc] text-[#0f172a] selection:bg-sky-500/20',
          glass: 'bg-white/85 backdrop-blur-md border border-slate-200 shadow-xl',
          windowHeader: 'bg-slate-50 text-slate-800 border-b border-slate-200 font-sans',
          btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white transition-all duration-100 active:scale-95',
          btnSecondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all',
          accentColor: 'text-indigo-600',
          accentBorder: 'border-slate-300',
          indicator: 'bg-indigo-600 shadow-[0_0_5px_rgba(79,70,229,0.5)]',
          panelHeader: 'text-slate-500 uppercase tracking-widest text-[11px] font-bold',
          badge: 'bg-slate-100 border border-slate-200 text-slate-700 text-xs'
        };
      default: // dark mode / linear / verson
        return {
          bg: 'bg-[#090a10] text-[#f1f5f9] selection:bg-sky-500/20',
          glass: 'bg-[#11121d]/75 backdrop-blur-xl border border-[#2c2d3a] shadow-2xl shadow-black/80',
          windowHeader: 'bg-[#161726]/90 text-slate-200 border-b border-[#2c2d3a] font-sans',
          btnPrimary: 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/50 border border-sky-450 transition-all duration-150 active:scale-95',
          btnSecondary: 'bg-[#1a1b26] border border-[#2d2f3d] text-slate-300 hover:bg-[#202231] transition-all',
          accentColor: 'text-sky-400',
          accentBorder: 'border-sky-500/20',
          indicator: 'bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse',
          panelHeader: 'text-sky-450 uppercase tracking-wider text-[11px] font-bold',
          badge: 'bg-sky-500/10 border border-sky-500/20 text-sky-300'
        };
    }
  }, [theme]);

  const styleSet = useMemo(() => getThemeStyles(), [getThemeStyles]);

  return (
    <div className={`w-full ${viewMode === 'os' ? 'h-full overflow-hidden select-none' : 'min-h-screen'} ${styleSet.bg} transition-colors duration-500 flex flex-col relative`}>
      <div className="hidden" aria-live="polite" aria-atomic="true" id="farhanos-announcer" />
      <div className="hidden" aria-live="polite" aria-atomic="true" id="farhanos-announcer-window" />
      {viewMode === 'landing' ? (
        <LandingPage
          isWarping={isWarping}
          theme={theme}
          onLaunchOS={handleWarpAndEnter}
          onOpenWindowDirectly={handleOpenWindowDirectly}
          onOpenPalette={handleOpenPalette}
          articles={articles}
          onOpenArticleDirectly={handleOpenArticleDirectly}
        />
      ) : (
        <>
          {/* Skip link — first tabbable element, moves focus past the OS chrome to content */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[2000] focus:px-4 focus:py-2 focus:rounded focus:bg-sky-600 focus:text-white focus:text-xs focus:font-mono"
          >
            Skip to content
          </a>

          {/* 2. TOP MENU NAVIGATION BAR */}
          <header className="h-10 bg-black/40 backdrop-blur-md border-b border-zinc-800/40 flex items-center justify-between px-4 z-[99] select-none text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-pointer font-bold tracking-tight text-white hover:opacity-85" onClick={() => triggerSound(900, 0.05)}>
                <span
                  className="w-2 h-2 rounded opacity-90"
                  style={{ background: 'var(--user-accent, #38bdf8)', boxShadow: '0 0 6px var(--user-accent, #38bdf8)' }}
                />
                <span>FarhanOS</span>
                <span className="text-[9px] text-sky-400 px-1 border border-sky-500/20 rounded font-mono font-medium">BETA</span>
                {siteConfig.openToWork && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    OPEN TO WORK
                  </span>
                )}
              </div>

              {/* Portal route back trigger */}
              <button 
                onClick={() => { setViewMode('landing'); triggerSound(1105, 0.06); }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-indigo-400 hover:text-indigo-300 font-mono text-[10px] border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer"
                title="Return to Cosmos Portal"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                <span className="hidden sm:inline">Return to Cosmos</span>
              </button>
            </div>

            {/* Hamburger button - mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="site-mobile-hamburger md:hidden flex items-center justify-center w-11 h-11 rounded text-zinc-300 hover:text-white cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <nav className="site-desktop-nav hidden md:flex items-center gap-4 text-zinc-400 font-medium select-none">
              <button onClick={() => { setCommandPaletteOpen(true); triggerSound(800, 0.03); }} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                <Search className="w-3.5 h-3.5" />
                <span>Search <kbd className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 rounded px-1 ml-0.5">{typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘K' : 'Ctrl+K'}</kbd></span>
              </button>
              <button onClick={runTourCycle} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-purple-400 hover:text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Site Tour</span>
              </button>
              <button onClick={() => openWindow('brief')} className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Mission Brief</span>
              </button>
            </nav>

          <div className="flex items-center gap-4 select-none">
            {/* Quick theme toggles - hidden on mobile/tablet */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-950/60 border border-zinc-800/40 rounded px-1.5 py-0.5">
              <span className="text-[10px] text-zinc-500 font-medium mr-1.5">Mood Theme:</span>
              {['dark', 'cyberpunk', 'ai', 'terminal', 'light'].map((t) => (
                <button 
                  key={t}
                  onClick={() => { setTheme(t as any); triggerSound(750, 0.03); document.getElementById('farhanos-announcer')!.textContent = `Theme changed to ${t}`; }}
                  className={`text-[10px] px-1.5 py-0.5 rounded capitalize transition-all cursor-pointer ${theme === t ? 'bg-[#181926] text-white font-bold border border-zinc-700/60' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Single cycle button - visible ONLY on mobile/tablet */}
            <button 
              onClick={cycleTheme}
              className="md:hidden flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/40 rounded px-2 py-1 text-[10px] text-zinc-300 hover:text-white capitalize cursor-pointer active:scale-95 transition-all"
              title="Cycle Theme"
              aria-label={`Cycle Theme (current: ${theme})`}
            >
              <Palette className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Theme: {theme}</span>
            </button>

            {/* Palette search — mobile entry point (desktop has nav search) */}
            <button
              onClick={() => { setCommandPaletteOpen(true); triggerSound(800, 0.03); }}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded text-zinc-300 hover:text-white capitalize cursor-pointer active:scale-95 transition-all"
              title="Search projects, research and commands"
              aria-label="Open command palette search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mute toggle — visible on all breakpoints */}
            <button
              onClick={toggleMute}
              className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/40 rounded px-2 py-1 text-[10px] text-zinc-300 hover:text-white capitalize cursor-pointer active:scale-95 transition-all"
              title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
              aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            </button>

              <ApiStatusChip theme={theme} className="hidden sm:inline-flex" />
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 font-mono tracking-wider font-semibold bg-zinc-950/45 border border-zinc-800/40 px-2 py-0.5 rounded select-none">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span><ClockText /> (UTC)</span>
              </div>
            </div>
          </header>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="site-mobile-overlay fixed inset-0 z-[9999] md:hidden">
              <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div role="dialog" aria-modal="true" aria-label="OS menu" className="absolute right-0 top-0 h-full w-72 bg-zinc-950/95 border-l border-zinc-800/60 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-800/40">
                  <span className="text-xs font-mono font-bold text-white tracking-tight">MENU</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-8 h-8 rounded text-zinc-400 hover:text-white cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <button
                    onClick={() => { setCommandPaletteOpen(true); setMobileMenuOpen(false); triggerSound(800, 0.03); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all cursor-pointer text-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search <kbd className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 rounded px-1 ml-1">Cmd+K</kbd></span>
                  </button>
                  <button
                    onClick={() => { runTourCycle(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-zinc-900/60 transition-all cursor-pointer text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Site Tour</span>
                  </button>
                  <button
                    onClick={() => { openWindow('brief'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all cursor-pointer text-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Mission Brief</span>
                  </button>
                  <div className="pt-4 border-t border-zinc-800/40">
                    <p className="text-[10px] text-zinc-500 font-medium mb-2 px-3">MOOD THEME</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['dark', 'cyberpunk', 'ai', 'terminal', 'light'].map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTheme(t as any); triggerSound(750, 0.03); document.getElementById('farhanos-announcer')!.textContent = `Theme changed to ${t}`; }}
                          className={`text-[11px] px-2 py-1.5 rounded capitalize transition-all cursor-pointer ${theme === t ? 'bg-[#181926] text-white font-bold border border-zinc-700/60' : 'text-zinc-500 hover:text-zinc-300 bg-zinc-900/40'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-zinc-800/40">
                    <div className="flex items-center gap-2 px-3 text-zinc-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span><ClockText /> (UTC)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* 3. AI SITE GUIDED TOUR STATUS ALERTER */}
      {isTourActive && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-xl bg-purple-950/80 backdrop-blur-2xl border-2 border-purple-500/50 p-4 rounded-xl shadow-[0_10px_40px_rgba(168,85,247,0.3)] z-[999] flex items-start gap-4 select-text" style={{ animation: 'none' }}>
          <div className="p-2.5 bg-purple-500/20 rounded-lg border border-purple-400/40 text-purple-300">
            <Sparkles className="w-5 h-5 text-purple-400 animate-spin-slow" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">AI SYSTEM TOUR — ZONE {tourStep} OF 5</h4>
              {tourLoading && <span className="text-[10px] text-purple-300 animate-pulse font-mono select-none">Rendering Synthesized Voice...</span>}
            </div>
            <p className="text-xs text-[#ebd8fb] mt-1 pr-4 leading-relaxed font-sans">{tourMsg || 'Preparing...'}</p>
            <div className="flex items-center gap-2 mt-3">
              <button 
                onClick={nextTourStep} 
                className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] px-3 py-1 rounded border border-purple-400 transition-all font-bold tracking-tight cursor-pointer"
              >
                {tourStep === 5 ? 'Conclude Integration Tour' : 'Acknowledge & Sync Next Area'}
              </button>
              <button 
                onClick={() => { setIsTourActive(false); setTourStep(0); stopSpeaking(); triggerSound(400, 0.05); }} 
                className="text-zinc-400 hover:text-white text-[10px] ml-2 font-medium cursor-pointer"
              >
                Exit Tour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN WORKSPACE / MONITOR AREA */}
      <main id="main-content" tabIndex={-1} className="flex-1 relative overflow-auto p-4 md:p-6 scrollbar-none">

        {/* Visitor wallpaper layer */}
        {wallpaper && (
          <div
            className="absolute inset-0 pointer-events-none -z-20 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}

        {/* Dynamic ambient grid particle network background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 opacity-35">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute top-1/4 left-1/3 w-[30rem] h-[30rem] bg-gradient-to-tr from-sky-500/10 to-transparent rounded-full filter blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full filter blur-[100px] animate-pulse-slow" />
        </div>

        {/* Desktop Folders Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6 max-w-5xl relative z-10 p-2 pointer-events-auto">
          {desktopIcons.map((ico, idx) => {
            const ActiveIcon = ico.icon;
            const isOpen = openWindows.includes(ico.id);
            const isFocus = focusedWindow === ico.id && !minimizedWindows.includes(ico.id);
            
            return (
              <div
                key={ico.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${ico.label}`}
                aria-pressed={openWindows.includes(ico.id)}
                onClick={() => openWindow(ico.id)}
                onMouseEnter={() => prefetchWindow(ico.id)}
                onFocus={() => prefetchWindow(ico.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openWindow(ico.id);
                  }
                }}
                style={{ animationDelay: `${idx * 45}ms` }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border border-transparent hover:border-zinc-800/40 hover:bg-zinc-950/25 hover:backdrop-blur-md hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)] cursor-pointer transition-all duration-300 active:scale-95 group text-center relative animate-fade-in opacity-0 ${isOpen ? 'bg-zinc-950/15' : ''}`}
              >
                 <div className={`p-4 rounded-2xl ${ico.color} transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200 relative`}>
                  {ico.id === 'twin' ? (
                    <FarhanAIIcon className="w-6 h-6" isTerminal={theme === 'terminal'} />
                  ) : (
                    <ActiveIcon className="w-6 h-6" />
                  )}
                  {isOpen && (
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_6px_#10b981]" />
                  )}
                </div>
                <span className="text-slate-300 group-hover:text-white font-sans text-[11px] font-semibold mt-2.5 tracking-tight line-clamp-1">
                  {ico.label}
                </span>
                
                {/* Visual glow backdrop for focused window */}
                {isFocus && (
                  <span className="absolute inset-x-4 -bottom-1 h-0.5 bg-gradient-to-r from-sky-450 to-purple-500 rounded filter blur-xs" />
                )}
              </div>
            );
          })}
        </div>

        {/* 5. MULTI-WINDOW RENDERER CORE */}
        {openWindows.map((winId) => {
          if (minimizedWindows.includes(winId)) return null;

          const isFocused = focusedWindow === winId;
          const pos = windowPositions[winId] || { x: 100, y: 100, isMaximized: false };
          const desktopIco = desktopIcons.find(i => i.id === winId);
          const WinIcon = desktopIco ? desktopIco.icon : Terminal;

          // Responsive calculation (fallback on smaller views to always make screens relative wide/tall or static)
          const isMobile = windowWidth < 768;
          const windowStyle: React.CSSProperties = isMobile || pos.isMaximized 
            ? {
                position: 'fixed',
                top: '2.5rem',
                left: 0,
                right: 0,
                bottom: '4rem',
                zIndex: isFocused ? 50 : 20,
              }
            : {
                position: 'absolute',
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
                width: winId === 'twin' || winId === 'garden' || winId === 'skills' ? '540px' : '720px',
                height: winId === 'twin' ? '480px' : '550px',
                maxHeight: '85vh',
                zIndex: isFocused ? 50 : 20,
              };

          return (
            <div
              key={winId}
              id={`window-${winId}`}
              role="dialog"
              aria-modal="false"
              aria-label={`${desktopIco ? desktopIco.label : 'FarhanOS Sandbox'} window`}
              style={windowStyle}
              onClick={() => { setFocusedWindow(winId); triggerSound(400, 0.01); }}
              onAnimationEnd={() => handleAnimationEnd(winId)}
               className={`flex flex-col rounded-xl overflow-hidden shadow-2xl ${draggedWindow === winId ? '' : 'transition-all duration-150'} transform ${styleSet.glass} ${isFocused ? 'ring-2 ring-sky-500/35 scale-[1.002]' : 'opacity-90'} ${windowReady[winId] ? '' : 'animate-window-open'} ${isMobile ? 'max-md:rounded-t-3xl max-md:border-t-2 max-md:border-indigo-500/25' : ''}`}
            >

              {/* Window Bar Header */}
              <div
                data-window-title={`${winId}-title`}
                tabIndex={-1}
                onPointerDown={(e) => handleDragStart(winId, e)}
                onPointerMove={handleDragMove}
                onPointerUp={handleDragEnd}
                onPointerCancel={handleDragEnd}
                className={`relative h-10 md:h-9 px-3 flex items-center justify-between md:cursor-move touch-none select-none focus:outline-none ${styleSet.windowHeader}`}
              >
                {/* Bottom-sheet grab handle (mobile only; pull down to minimize) */}
                <span aria-hidden="true" className="md:hidden absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-zinc-600/80" />
                <div className="flex items-center gap-2 font-semibold tracking-tight text-xs">
                  <WinIcon className="w-3.5 h-3.5 opacity-80" />
                  <span>{desktopIco ? desktopIco.label : 'FarhanOS Sandbox'}</span>
                  {isFocused && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>

                <div className="flex items-center gap-1 md:gap-2" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => minimizeWindow(winId)}
                    className="p-2 md:p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
                    title="Minimize"
                    aria-label="Minimize window"
                  >
                    <Minimize2 className="w-3.5 h-3.5 md:w-3 md:h-3" />
                  </button>
                  <button
                    onClick={() => toggleMaximize(winId)}
                    className="p-2 md:p-1.5 text-slate-400 hover:text-white rounded hover:bg-white/10"
                    title="Toggle Maximize"
                    aria-label="Toggle maximize"
                  >
                    <Maximize2 className="w-3.5 h-3.5 md:w-3 md:h-3" />
                  </button>
                  <button
                    onClick={() => closeWindow(winId)}
                    className="p-2 md:p-1.5 text-rose-400 hover:text-rose-500 rounded hover:bg-rose-500/10"
                    title="Close Window"
                    aria-label="Close window"
                  >
                    <X className="w-3.5 h-3.5 md:w-3 md:h-3" />
                  </button>
                </div>
              </div>

              {/* Window Content Frame Container */}
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-5 text-xs font-sans scrollbar-thin scrollbar-thumb-zinc-800"
                onScroll={(e) => {
                  if (winId === 'profTimeline') {
                    const target = e.currentTarget;
                    const progress = target.scrollTop / (target.scrollHeight - target.clientHeight || 1);
                    if (osTimelineProgressLineRef.current) {
                      osTimelineProgressLineRef.current.style.transform = `scaleY(${progress})`;
                    }
                  }
                }}
              >
                
                {/* A. DIGITAL TWIN AI ASSISTANT PANEL */}
                {winId === 'twin' && (
                  <Suspense fallback={<SkeletonWindow lines={4} />}>
                    <TwinWindow
                      twinMessages={twinMessages}
                      twinLoading={twinLoading}
                      twinInput={twinInput}
                      setTwinInput={setTwinInput}
                      handleSendTwinMessage={handleSendTwinMessage}
                      actionNote={twinActionNote}
                      playingMessageIndex={playingMessageIndex}
                      speakText={speakText}
                      stopSpeaking={stopSpeaking}
                      styleSet={styleSet}
                    />
                  </Suspense>
                )}


                {/* B. PROJECT GALAXY COMMAND PANEL */}
                {winId === 'projects' && (
                  <Suspense fallback={<SkeletonWindow lines={6} />}>
                    <ProjectsWindow
                      styleSet={styleSet}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      triggerSound={triggerSound}
                      openWindow={openWindow}
                    />
                  </Suspense>
                )}


                {/* C. LINGUISTIC RESEARCH LAB PANEL */}
                {winId === 'research' && (
                  <Suspense fallback={<SkeletonWindow lines={5} />}>
                    <ResearchWindow
                      styleSet={styleSet}
                      selectedPaper={selectedPaper}
                      setSelectedPaper={setSelectedPaper}
                      triggerSound={triggerSound}
                    />
                  </Suspense>
                )}


                {/* D. GITHUB INTELLIGENCE MONITOR PANEL */}
                {winId === 'github' && (
                  <Suspense fallback={<SkeletonWindow lines={4} />}>
                    <GithubWindow styleSet={styleSet} />
                  </Suspense>
                )}


                {/* E. WRITING UNIVERSE / BLOG PANEL WITH AUDIO TTS NARRATOR */}
                {winId === 'writing' && (
                  <Suspense fallback={<SkeletonWindow lines={5} />}>
                    <WritingWindow
                      articles={articles}
                      selectedArticle={selectedArticle}
                      setSelectedArticle={setSelectedArticle}
                      styleSet={styleSet}
                      triggerSound={triggerSound}
                      playingMessageIndex={playingMessageIndex}
                      speakText={speakText}
                      stopSpeaking={stopSpeaking}
                    />
                  </Suspense>
                )}


                {/* F. DIGITAL GARDEN KNOWLEDGE GRAPH PANEL */}
                {winId === 'garden' && (
                  <Suspense fallback={<SkeletonWindow lines={3} />}>
                    <GardenWindow
                      styleSet={styleSet}
                      hoveredGardenNode={hoveredGardenNode}
                      setHoveredGardenNode={setHoveredGardenNode}
                      triggerSound={triggerSound}
                    />
                  </Suspense>
                )}


                {/* G. AI TAILORED RESUME GENERATOR */}
                {winId === 'resume' && (
                  <Suspense fallback={<SkeletonWindow lines={5} />}>
                    <ResumeWindow
                      styleSet={styleSet}
                      resumeAudience={resumeAudience}
                      setResumeAudience={setResumeAudience}
                      triggerSound={triggerSound}
                    />
                  </Suspense>
                )}


                {/* H. INTERACTIVE TIMELINE / EXPERIENCE BLOCK */}
                {winId === 'timeline' && (
                  <Suspense fallback={<SkeletonWindow lines={4} />}>
                    <TimelineWindow
                      styleSet={styleSet}
                      selectedTimeline={selectedTimeline}
                      setSelectedTimeline={setSelectedTimeline}
                      triggerSound={triggerSound}
                    />
                  </Suspense>
                )}

                {/* I. PROFESSIONAL TIMELINE / CHRONOLOGY BLOCK */}
                {winId === 'profTimeline' && (
                  <Suspense fallback={<SkeletonWindow lines={4} />}>
                    <ProfTimelineWindow osTimelineProgressLineRef={osTimelineProgressLineRef} />
                  </Suspense>
                )}


                {/* I. TECH OBSERVATORY / SKILLS OBSERVER */}
                {/* I. SKILLS MATRIX / OBSERVATORY PANEL */}
                {winId === 'skills' && (
                  <Suspense fallback={<SkeletonWindow lines={6} />}>
                    <SkillsWindow
                      filteredSkills={filteredSkills}
                      skillFilter={skillFilter}
                      setSkillFilter={setSkillFilter}
                      triggerSound={triggerSound}
                    />
                  </Suspense>
                )}


                {/* J. COLLABORATION HUB / STRATEGIC BRIEF PREVIEW */}
                {/* J. COLLABORATION HUB / STRATEGIC BRIEF PREVIEW */}
                {winId === 'brief' && (
                  <Suspense fallback={<SkeletonWindow lines={3} />}>
                    <BriefWindow
                      briefForm={briefForm}
                      setBriefForm={setBriefForm}
                      briefLoading={briefLoading}
                      briefSummary={briefSummary}
                      briefDispatchLoading={briefDispatchLoading}
                      handleSendBrief={handleSendBrief}
                      handleDispatchBrief={handleDispatchBrief}
                    />
                  </Suspense>
                )}


                {/* L. IDEATION PAD / DRAWING WHITEBOARD */}
                {winId === 'whiteboard' && (
                  <Suspense fallback={<SkeletonWindow lines={3} />}>
                    <Whiteboard theme={theme} triggerSound={triggerSound} />
                  </Suspense>
                )}

                {/* K. SYSTEM BUILD MONITOR / RELEASE LOGS */}
                {winId === 'builds' && (
                  <Suspense fallback={<SkeletonWindow lines={5} />}>
                    <BuildsWindow />
                  </Suspense>
                )}

                {/* M. ABOUT / PERSONAL STORY */}
                {winId === 'about' && (
                  <Suspense fallback={<SkeletonWindow lines={4} />}>
                    <AboutWindow styleSet={styleSet} />
                  </Suspense>
                )}

                {/* N. VISITOR PREFERENCES / CUSTOMIZATION */}
                {winId === 'settings' && (
                  <Suspense fallback={<SkeletonWindow lines={3} />}>
                    <SettingsWindow
                      styleSet={styleSet}
                      muted={muted}
                      onToggleMute={toggleMute}
                      accent={accent}
                      onAccentChange={changeAccent}
                      wallpaper={wallpaper}
                      onWallpaperChange={changeWallpaper}
                      onResetLayout={resetLayout}
                      onResetAll={resetAll}
                    />
                  </Suspense>
                )}

              </div>

            </div>
          );
        })}

      </main>

      {/* 6. SYSTEM FOOTER WORKSPACE DOCK */}
      <footer className="h-14 md:h-16 bg-black/45 backdrop-blur-2xl border-t border-zinc-800/40 flex items-center justify-center relative select-none">
        
        {/* Dynamic task bar container of apps */}
        <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 bg-zinc-950/65 border border-zinc-800/60 rounded-2xl shadow-xl max-w-[95vw] overflow-x-auto scrollbar-none select-none" style={{ scrollSnapType: 'x mandatory' }}>
          {desktopIcons.map((ico) => {
            const ActiveIcon = ico.icon;
            const isOpen = openWindows.includes(ico.id);
            const isFocus = focusedWindow === ico.id && !minimizedWindows.includes(ico.id);

            return (
              <button 
                key={ico.id}
                onClick={() => {
                  if (isOpen) {
                    if (isFocus) {
                      minimizeWindow(ico.id);
                    } else {
                      setFocusedWindow(ico.id);
                      setMinimizedWindows(prev => prev.filter(w => w !== ico.id));
                      focusWindow(ico.id);
                    }
                  } else {
                    openWindow(ico.id);
                  }
                }}
                className={`p-2.5 md:p-2 rounded-xl transition-all relative cursor-pointer ${ico.color} transform hover:scale-[1.29] active:scale-95 duration-100`}
                title={ico.label}
                aria-label={ico.label}
              >
                <ActiveIcon className="w-5 h-5" />
                
                {/* Active Indicator Light Dot beneath icon */}
                {isOpen && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_5px_#38bdf8]" />
                )}
                
                {/* Focused Glow layer */}
                {isFocus && (
                  <span className="absolute inset-x-2 -bottom-0.5 h-0.5 bg-gradient-to-r from-[#00ffcc] to-purple-500 rounded filter blur-xs" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile dock scroll indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#090a10] to-transparent pointer-events-none md:hidden" />

        {/* Global quick launch commands */}
        <div className="absolute right-4 hidden md:flex items-center gap-1.5">
          <button 
            type="button" 
            onClick={() => { setCommandPaletteOpen(true); triggerSound(800, 0.03); }}
            className="p-1 px-3 text-slate-400 hover:text-white rounded border border-zinc-800/80 hover:bg-zinc-950 text-[10px] font-mono cursor-pointer"
          >
            Terminal Commands (CMD+K)
          </button>
        </div>
      </footer>

      {/* 7. CMD + K GLOBAL COMMAND PALETTE SEARCH SCREEN PANEL */}
      {commandPaletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 bg-[#020204]/85 z-[1000] flex items-start justify-center pt-[15vh] px-4 font-normal"
          onClick={() => { setCommandPaletteOpen(false); triggerSound(400, 0.02); }}
        >
          <div
            ref={paletteTrapRef}
            role="document"
            aria-label="Command palette results"
            className="w-full max-w-lg bg-[#0e0f17] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[60vh] select-none animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center gap-3 p-3 bg-zinc-950 border-b border-zinc-850">
              <Search className="w-4 h-4 text-sky-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  const count = systemSearchResults.length;
                  if (!count) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex((i) => (i + 1) % count);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex((i) => (i - 1 + count) % count);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const hit = systemSearchResults[highlightedIndex];
                    if (hit) { triggerSound(1000, 0.03); hit.action(); }
                  }
                }}
                placeholder="Search projects, research papers, tech stack node keys, commands..."
                aria-label="Search projects, research papers and commands"
                role="combobox"
                aria-expanded={systemSearchResults.length > 0}
                aria-controls="palette-results"
                aria-activedescendant={
                  systemSearchResults.length > 0 ? `palette-option-${highlightedIndex}` : undefined
                }
                className="flex-1 bg-transparent text-slate-105 font-sans outline-hidden border-none text-xs text-white"
                autoFocus
              />
              <button
                onClick={() => { setCommandPaletteOpen(false); triggerSound(400, 0.02); }}
                className="p-1 text-zinc-500 hover:text-white rounded"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search guidelines / matching indices list */}
            <div ref={paletteListRef} id="palette-results" role="listbox" className="flex-1 overflow-y-auto p-2 scrollbar-none max-h-[300px]">
              {searchQuery.trim().length === 0 ? (
                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-500 font-bold px-2 block uppercase tracking-wide">SYSTEM DIAGNOSTIC CORES:</div>
                  <button 
                    onClick={() => { runTourCycle(); setCommandPaletteOpen(false); }}
                    className="w-full text-left p-2 hover:bg-zinc-900 rounded-lg text-emerald-300 font-bold flex items-center gap-2 cursor-pointer text-[10.5px]"
                  >
                    🚀 Trigger system AI Guided Tour with synthesized Voice narrations
                  </button>
                  <button 
                    onClick={() => { openWindow('brief'); setCommandPaletteOpen(false); }}
                    className="w-full text-left p-2 hover:bg-zinc-900 rounded-lg text-indigo-300 font-bold flex items-center gap-2 cursor-pointer text-[10.5px]"
                  >
                    💡 Open Mission Intake Consultation Workspace
                  </button>
                  <div className="text-[10px] text-zinc-550 italic font-sans px-2">
                    Enter queries parsing index models above to match academic research text parameters...
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-500 px-2 font-bold uppercase tracking-widest border-b border-zinc-900 pb-1 mb-1.5">MATCHED WORKSPACE PARAMS ({systemSearchResults.length})</div>
                  {systemSearchResults.length > 0 ? (
                    systemSearchResults.map((res, sIdx) => (
                      <button
                        key={sIdx}
                        id={`palette-option-${sIdx}`}
                        role="option"
                        aria-selected={sIdx === highlightedIndex}
                        data-highlighted={sIdx === highlightedIndex || undefined}
                        onClick={res.action}
                        onMouseEnter={() => setHighlightedIndex(sIdx)}
                        className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-colors border cursor-pointer text-[11px] ${
                          sIdx === highlightedIndex
                            ? 'bg-zinc-900 border-zinc-800'
                            : 'border-transparent hover:bg-zinc-900 hover:border-zinc-800'
                        }`}
                      >
                        <div>
                          <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1 py-0.5 rounded font-mono mr-2 uppercase">{res.type}</span>
                          <span className="text-white font-bold font-sans">{res.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{res.subtitle}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center text-zinc-500 text-[11px] py-6 font-sans">No matching intelligence indices found. Retry key parameters.</div>
                  )}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-[10px] text-zinc-500">
              <span className="font-mono">↑↓ NAVIGATE · ↵ SELECT</span>
              <span>ESC TO EXIT</span>
            </div>
          </div>
        </div>
        )}
      </>
    )}
    <Toaster />
    <Suspense fallback={null}>
    <AssistantLauncher
      theme={theme}
      triggerSound={triggerSound}
      placement={viewMode === 'landing' ? 'landing-left' : 'global-bottom-left'}
      onAction={handleAssistantAction}
      openWindows={openWindows}
      activeWindow={focusedWindow}
    />
    </Suspense>
  </div>
  );
}
