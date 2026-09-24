import React, { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from 'react';
import {
  Sparkle, Download, PhoneCall, Menu, X, Github, Linkedin, Instagram, User
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { Article, Theme } from '../types';
const ThreeWormhole = lazy(() => import('./ThreeWormhole'));
// Hoisted so LazySection's effect deps see a stable identity across renders.
const loadBelowFold = () => import('./LandingBelowFold');
import LoopingTypewriter from './LoopingTypewriter';
import OneTimeTypewriter from './OneTimeTypewriter';
import avatarImg from '../../assets/avatar.png';
import avatar288 from '../../assets/avatar-288.png';
import avatarImgWebp from '../../assets/avatar.webp';
import avatarImgAvif from '../../assets/avatar.avif';
import { getApiBaseUrl } from '../utils/apiConfig';
import { LazySection } from './LazySection';
import { LandingPageContext, LandingPageContextType } from './LandingPageContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

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

interface LandingPageProps {
  isWarping: boolean;
  theme: Theme;
  onLaunchOS: () => void;
  onOpenWindowDirectly: (winId: string) => void;
  articles?: Article[];
  onOpenArticleDirectly?: (article: Article) => void;
}

export default function LandingPage({
  isWarping,
  theme,
  onLaunchOS,
  onOpenWindowDirectly,
  articles = [],
  onOpenArticleDirectly
}: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'AI/ML' | 'Frontend' | 'Backend' | 'Database' | 'DevOps'>('All');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialPaused, setTestimonialPaused] = useState(false);

  const mobileMenuRef = useFocusTrap({
    enabled: mobileMenuOpen,
    onEscape: () => setMobileMenuOpen(false),
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const progressLineRef = useRef<HTMLDivElement | null>(null);

  // Scroll Detection for Back-to-Top Button & Timeline Line Animation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          setShowBackToTop(scrollTop > 500);

          const timelineElement = timelineRef.current;
          if (timelineElement) {
            const rect = timelineElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const elementTop = rect.top;
            const elementHeight = rect.height;

            const triggerStart = viewportHeight * 0.8;
            const triggerEnd = viewportHeight * 0.2;

            const totalDist = elementHeight + triggerStart - triggerEnd;
            const currentScroll = triggerStart - elementTop;

            const progress = Math.min(Math.max(currentScroll / totalDist, 0), 1);
            
            if (progressLineRef.current) {
              progressLineRef.current.style.transform = `scaleY(${progress})`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize on load
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetTop = rect.top + scrollTop - 64; // offset the h-16 (64px) sticky header
      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // Auto-play Testimonials — deferred to after LCP, respects pause state
  useEffect(() => {
    const startRotation = () => {
      const timer = setInterval(() => {
        if (!testimonialPaused) {
          setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }
      }, 8000);
      return () => clearInterval(timer);
    };
    let stopRotation: (() => void) | null = null;
    let scheduledCancel: (() => void) | null = null;
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => {
        stopRotation = startRotation();
      }, { timeout: 4000 });
      scheduledCancel = () => cancelIdleCallback(id);
    } else {
      stopRotation = startRotation();
    }
    return () => {
      scheduledCancel?.();
      stopRotation?.();
    };
  }, [testimonialPaused]);

  // Theme Config mapper
  const getThemeStyles = useCallback(() => {
    switch (theme) {
      case 'cyberpunk':
        return {
          textPrimary: 'text-[#00ffcc]',
          textSecondary: 'text-pink-300',
          borderAccent: 'border-pink-500/20 hover:border-pink-500/50',
          btnPrimary: 'bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] border border-pink-400/50',
          btnSecondary: 'border-pink-500/30 text-pink-200 hover:bg-pink-550/10 bg-black/60',
          statCardGlow: 'hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.15)]',
          skillBar: 'from-pink-500 to-[#00ffcc]',
          activeTabBtn: 'bg-pink-600 text-white border-pink-500',
          tabBtn: 'text-pink-300 border-pink-500/20 hover:border-pink-500/40 bg-zinc-950/40',
          badgeStyle: 'bg-pink-500/10 border border-pink-500/20 text-pink-200',
          gradientBg: 'from-pink-500/5 via-purple-500/2 to-transparent',
        };
      case 'ai':
        return {
          textPrimary: 'text-purple-200',
          textSecondary: 'text-cyan-300',
          borderAccent: 'border-purple-500/20 hover:border-cyan-400/40',
          btnPrimary: 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-purple-400/40',
          btnSecondary: 'border-purple-500/30 text-cyan-100 hover:bg-purple-950/40 bg-black/60',
          statCardGlow: 'hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
          skillBar: 'from-purple-500 to-cyan-400',
          activeTabBtn: 'bg-purple-600 text-white border-purple-500',
          tabBtn: 'text-purple-200 border-purple-500/20 hover:border-purple-500/40 bg-zinc-950/40',
          badgeStyle: 'bg-purple-500/10 border border-purple-500/20 text-purple-200',
          gradientBg: 'from-purple-500/5 via-indigo-500/2 to-transparent',
        };
      case 'terminal':
        return {
          textPrimary: 'text-[#33ff33]',
          textSecondary: 'text-[#22c55e]',
          borderAccent: 'border-[#33ff33]/20 hover:border-[#33ff33]/50',
          btnPrimary: 'bg-[#33ff33] text-black hover:bg-[#33ff33]/85 shadow-[0_0_15px_rgba(51,255,51,0.3)] border border-[#33ff33]/50',
          btnSecondary: 'border-[#33ff33]/30 text-[#33ff33] hover:bg-[#33ff33]/10 bg-black/60',
          statCardGlow: 'hover:border-[#33ff33]/50 hover:shadow-[0_0_25px_rgba(51,255,51,0.2)]',
          skillBar: 'from-[#22c55e] to-[#33ff33]',
          activeTabBtn: 'bg-zinc-900 text-[#33ff33] border-[#33ff33]',
          tabBtn: 'text-[#33ff33] border-[#33ff33]/20 hover:border-[#33ff33]/40 bg-black/40',
          badgeStyle: 'bg-emerald-950/20 border border-[#33ff33]/20 text-[#33ff33]',
          gradientBg: 'from-[#33ff33]/3 to-transparent',
        };
      case 'light':
        return {
          textPrimary: 'text-indigo-700',
          textSecondary: 'text-sky-700',
          borderAccent: 'border-slate-300 hover:border-indigo-400',
          btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md',
          btnSecondary: 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white',
          statCardGlow: 'hover:border-indigo-400 hover:shadow-lg',
          skillBar: 'from-indigo-500 to-sky-500',
          activeTabBtn: 'bg-indigo-650 text-white border-indigo-650',
          tabBtn: 'text-slate-700 border-slate-200 hover:border-slate-350 bg-slate-50',
          badgeStyle: 'bg-indigo-50 border border-indigo-100 text-indigo-700',
          gradientBg: 'from-indigo-500/3 via-purple-500/1 to-transparent',
        };
      default: // dark mode
        return {
          textPrimary: 'text-sky-300',
          textSecondary: 'text-indigo-300',
          borderAccent: 'border-zinc-800/80 hover:border-[#00ffcc]/30',
          btnPrimary: 'bg-indigo-650 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/40',
          btnSecondary: 'border-zinc-800 text-zinc-200 hover:bg-zinc-900/60 bg-black/60',
          statCardGlow: 'hover:border-indigo-500/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.08)]',
          skillBar: 'from-indigo-500 to-sky-400',
          activeTabBtn: 'bg-indigo-650 text-white border-indigo-500',
          tabBtn: 'text-zinc-300 border-zinc-800 hover:border-zinc-700 bg-zinc-950/40',
          badgeStyle: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200',
          gradientBg: 'from-indigo-500/5 via-purple-500/2 to-transparent',
        };
    }
  }, [theme]);

  const styleSet = useMemo(() => getThemeStyles(), [getThemeStyles]);

  // Testimonials database
  const testimonials = portfolioData.testimonials;

  // Certifications list
  const certifications = portfolioData.certifications;

  // Dynamic Skills Filter Grouping
  const filteredSkills = useMemo(() => portfolioData.skills.filter(s => {
    if (activeTab === 'All') return true;
    if (activeTab === 'AI/ML' && (s.category === 'AI/ML' || s.category === 'Research & Science')) return true;
    if (activeTab === 'Frontend' && s.category === 'Frontend') return true;
    if (activeTab === 'Backend' && s.category === 'Backend' && s.name !== 'PostgreSQL' && s.name !== 'Redis Caching') return true;
    if (activeTab === 'Database' && (s.name === 'PostgreSQL' || s.name === 'Redis Caching')) return true;
    if (activeTab === 'DevOps' && s.category === 'Systems & Devops') return true;
    return false;
  }), [activeTab]);

  // Stable context value: LandingBelowFold re-renders only when its actual
  // inputs change, not on every LandingPage state tick.
  // Form state has been moved into LandingBelowFold to prevent re-renders
  // of the expensive ThreeWormhole 3D scene on every keystroke.
  const contextValue = useMemo(() => ({
    theme, isWarping, onLaunchOS, onOpenWindowDirectly,
    articles, onOpenArticleDirectly, prefersReducedMotion,
    showBackToTop, activeTab, setActiveTab,
    activeTestimonial, setActiveTestimonial,
    testimonialPaused, setTestimonialPaused,
    styleSet, filteredSkills, testimonials, certifications,
    timelineRef, progressLineRef,
    handleAnchorClick, scrollToTop,
  }), [
    theme, isWarping, onLaunchOS, onOpenWindowDirectly,
    articles, onOpenArticleDirectly, prefersReducedMotion,
    showBackToTop, activeTab,
    activeTestimonial, testimonialPaused,
    styleSet, filteredSkills,
    handleAnchorClick, scrollToTop,
  ]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen flex flex-col w-full select-text bg-transparent md:pl-20 pb-16 sm:pb-20"
    >
      {/* Skip link for keyboard users */}
      <a
        href="#hero-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded focus:bg-indigo-600 focus:text-white focus:text-xs focus:font-mono"
      >
        Skip to main content
      </a>
      {/* 3D background starfield simulation — skipped on mobile for performance */}
      {!isMobile && (
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <ThreeWormhole isWarping={isWarping} theme={theme} />
        </Suspense>
      )}

      {/* Background glow meshes */}
      <div className={`pointer-events-none fixed inset-0 z-0 bg-gradient-to-br ${styleSet.gradientBg} opacity-80`} />

      {/* HEADER BAR */}
      <header 
        className="animate-slide-down"
      >
        <div className={`sticky top-0 z-[100] h-16 px-4 md:px-12 flex items-center justify-between border-b ${theme === 'light' ? 'border-slate-200/80 bg-white/70' : 'border-zinc-900/60 bg-black/45'} backdrop-blur-md transition-all`}>
          <div className="flex items-center gap-3">
            <span 
              className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-badge-pulse"
            />
            <div className="flex flex-col">
              <span className={`text-xs font-black tracking-widest uppercase font-sans ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>FARHAN KABIR</span>
              <span className="hidden lg:block text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest">COGNITIVE SYSTEMS ARCHITECT</span>
            </div>
          </div>

          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="site-mobile-hamburger md:hidden flex items-center justify-center w-8 h-8 rounded text-zinc-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <nav className="site-desktop-nav hidden md:flex items-center gap-x-4 text-[10.5px] font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
            {[
              { href: "#about", label: "ABOUT", target: "about" },
              { href: "#skills", label: "STATIONS", target: "skills" },
              { href: "#timeline", label: "CHRONOLOGY", target: "timeline" },
              { href: "#prof-timeline", label: "PROF. TIMELINE", target: "prof-timeline" },
              { href: "#projects", label: "INNOVATIONS", target: "projects" },
              { href: "#certifications", label: "CERTIFICATES", target: "certifications" },
              { href: "#contact", label: "TRANSMIT", target: "contact" }
            ].map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { handleAnchorClick(e, link.target); }}
                className="relative hover:text-white transition-colors group hover:translate-y-[-2px]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
              </a>
            ))}
          </nav>

          <div className="site-desktop-launch hidden md:flex items-center gap-3">
            <button 
              onClick={onLaunchOS}
              disabled={isWarping}
              className={`cursor-pointer text-[10px] font-mono font-extrabold uppercase px-4 py-2 rounded-lg transition-all active:scale-95 duration-150 hover:scale-105 hover:opacity-95 ${styleSet.btnPrimary}`}
            >
              {isWarping ? "Warp Core Charging..." : "Launch OS"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="site-mobile-overlay fixed inset-0 z-[9999] md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div ref={mobileMenuRef} className="absolute right-0 top-0 h-full w-72 bg-zinc-950/95 border-l border-zinc-800/60 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-800/40">
              <span className="text-xs font-mono font-bold text-white tracking-tight">NAVIGATION</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {[
                { href: "#about", label: "ABOUT", target: "about" },
                { href: "#skills", label: "STATIONS", target: "skills" },
                { href: "#timeline", label: "CHRONOLOGY", target: "timeline" },
                { href: "#prof-timeline", label: "PROF. TIMELINE", target: "prof-timeline" },
                { href: "#projects", label: "INNOVATIONS", target: "projects" },
                { href: "#certifications", label: "CERTIFICATES", target: "certifications" },
                { href: "#contact", label: "TRANSMIT", target: "contact" }
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { handleAnchorClick(e, link.target); setMobileMenuOpen(false); }}
                  className="flex items-center px-3 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all text-sm font-mono tracking-wider"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-800/40">
              <button
                onClick={() => { onLaunchOS(); setMobileMenuOpen(false); }}
                disabled={isWarping}
                className={`w-full cursor-pointer text-xs font-mono font-extrabold uppercase px-4 py-3 rounded-lg transition-all hover:scale-102 active:scale-98 ${styleSet.btnPrimary}`}
              >
                {isWarping ? "Warp Core Charging..." : "Launch OS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content landmark: hero + anchored sections (#about, #skills, …) */}
      <main id="main-content">
      {/* SECTION 1: HERO / INTRODUCTION */}
      <section id="hero-content" aria-labelledby="hero-heading" className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center px-6 md:px-12 py-16 text-center select-none z-10">
        {/* Single primary H1 (visually hidden; visual headline is the typewriter effect) */}
        <h1 id="hero-heading" className="sr-only">
          Farhan Kabir — AI Engineer and Full-Stack Developer specializing in NLP and LLM applications
        </h1>
        
        {/* Glowing border portrait frame */}
        <div 
          className="animate-fade-in-delay-01 relative mb-8 flex items-center justify-center"
        >
          <div className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full border border-dashed border-sky-500/20 animate-spin-slow pointer-events-none" />
          <div className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full border border-indigo-500/10 animate-spin-reverse pointer-events-none" />
          <div className="absolute -inset-4 bg-indigo-500/5 rounded-full filter blur-2xl animate-pulse pointer-events-none" />

           {/* Portrait Image Container */}
           <div 
             className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-zinc-950/80 border-2 border-indigo-500/35 overflow-hidden group shadow-2xl spring-hover hover-scale-105 hover:border-[#00ffcc]"
           >
             <picture>
               <source type="image/avif" srcSet={`${avatarImgAvif} 329w`} sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1536px) 224px, 288px" />
               <source type="image/webp" srcSet={`${avatarImgWebp} 329w`} sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1536px) 224px, 288px" />
               <img 
                 src={avatarImg}
                 srcSet={`${avatar288} 288w, ${avatarImg} 329w`}
                 sizes="(max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1536px) 224px, 288px"
                 alt="Farhan Kabir portrait" 
                 width="288"
                 height="288"
                 fetchPriority="high"
                 loading="eager"
                 decoding="async"
                 className="w-full h-full object-cover grayscale-30 group-hover:grayscale-0 transition-all duration-500"
                />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
        </div>

        {/* Text Area */}
        <div className="animate-fade-in-delay-02 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-[9px] font-mono uppercase tracking-widest text-indigo-300">
            <Sparkle className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
            <span>CLINICAL NLP & SAAS PLATFORMS</span>
          </div>

          <div className="relative text-center">
            <div
              aria-hidden="true"
              className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl animate-fade-in-delay"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <span className="block text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-tight select-text mb-2">
                <span 
                  className="inline-block animate-wave"
                  style={{ transformOrigin: '70% 70%' }}
                >
                  👋
                </span>
              </span>
              <span className="block text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight select-text">
                <LoopingTypewriter
                  text="Hi, I'm Farhan Kabir!"
                  speed={70}
                  holdTime={2200}
                  className={theme === 'light' ? 'text-slate-800' : 'text-white'}
                />
              </span>

              <p className="animate-fade-in-delay-03 mt-4 text-base sm:text-lg md:text-xl font-medium font-sans tracking-wide text-zinc-400 select-text">
                <OneTimeTypewriter
                  text="Crafting Digital Experience with code and creativity"
                  speed={55}
                />
              </p>
            </div>
          </div>
        </div>

        {/* Interactive CTA buttons */}
        <div 
          className="animate-fade-in-delay-03 flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 w-full max-w-md"
        >
          <button 
            onClick={onLaunchOS}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-[10.5px] font-mono font-bold tracking-wider uppercase cursor-pointer active:scale-95 duration-100 flex items-center justify-center hover:scale-103 hover:opacity-95 transition-transform ${styleSet.btnPrimary}`}
          >
            Activate Cosmic OS
          </button>
          
          <button 
            onClick={() => onOpenWindowDirectly('resume')}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-[10.5px] font-mono font-bold tracking-wider uppercase cursor-pointer active:scale-95 duration-100 flex items-center justify-center gap-2 border hover:scale-103 transition-transform ${styleSet.btnSecondary}`}
          >
            <Download className="w-4 h-4" />
            <span>Get Resume (CV)</span>
          </button>
        </div>

        {/* Secondary controls and Socials */}
        <div 
          className="animate-fade-in-delay-03 flex items-center justify-center gap-3 mt-8 text-[9px] font-mono"
        >
          <button 
            onClick={() => onOpenWindowDirectly('brief')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/70 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all cursor-pointer shadow-xs hover:scale-103 active:scale-97"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>MISSION BRIEF (CONTACT)</span>
          </button>

          {[
            { href: "https://github.com/farhankabir133", Icon: Github, title: "GitHub" },
            { href: "https://www.linkedin.com/in/farhankabir133/", Icon: Linkedin, title: "LinkedIn" },
            { href: "https://medium.com/@farhankabir133", Icon: MediumIcon, title: "Medium" },
            { href: "https://x.com/fkh_236", Icon: XIcon, title: "X (Twitter)" },
            { href: "https://www.instagram.com/_farhan_kabir/", Icon: Instagram, title: "Instagram" },
            { href: "https://gravatar.com/fk133", Icon: User, title: "Gravatar" }
          ].map((social, i) => (
            <a
              key={i}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {}}
              className="p-2 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900/60 text-zinc-400 hover:text-white transition-all cursor-pointer hover:scale-115 active:scale-95"
              title={social.title}
              aria-label={social.title}
            >
              <social.Icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>

        {/* Float design indicators — fully responsive across all screen sizes */}
        <div className="absolute bottom-5 xs:bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 xl:bottom-14 2xl:bottom-16 3xl:bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-pulse z-10">
          <span className="text-[10px] xs:text-[10px] sm:text-[10px] md:text-[10px] lg:text-[10px] xl:text-[10px] 2xl:text-[11px] 3xl:text-[12px] font-mono text-zinc-600 tracking-widest uppercase whitespace-nowrap select-none">
            SCROLL FOR DIAGNOSTICS
          </span>
          <div className="w-px xs:h-4 sm:h-5 md:h-6 lg:h-7 xl:h-7 2xl:h-8 3xl:h-9 bg-zinc-800 animate-pulse-height" />
        </div>

      </section>


      {/* BELOW-FOLD CONTENT: Lazily loaded when near viewport */}
      <LandingPageContext.Provider value={contextValue}>
        <LazySection
          loader={loadBelowFold}
          fallback={<div className="h-screen" />}
          rootMargin="300px"
        />
      </LandingPageContext.Provider>
      </main>
    </div>
  );
}
