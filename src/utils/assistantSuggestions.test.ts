import { describe, expect, it } from 'vitest';
import {
  resolveContextGroup,
  sectionToContext,
  suggestGreeting,
  suggestQuestions,
  windowToContext,
} from './assistantSuggestions';

describe('sectionToContext', () => {
  it('maps landing sections to groups', () => {
    expect(sectionToContext('research')).toBe('research');
    expect(sectionToContext('projects')).toBe('projects');
    expect(sectionToContext('about')).toBe('about');
    expect(sectionToContext('contact')).toBe('contact');
    expect(sectionToContext('PROJECTS')).toBe('projects');
  });

  it('returns null for unknown sections', () => {
    expect(sectionToContext('news')).toBeNull();
    expect(sectionToContext(undefined)).toBeNull();
    expect(sectionToContext(null)).toBeNull();
  });
});

describe('windowToContext', () => {
  it('maps OS windows to groups', () => {
    expect(windowToContext('profTimeline')).toBe('career');
    expect(windowToContext('research')).toBe('research');
    expect(windowToContext('garden')).toBe('projects');
    expect(windowToContext('github')).toBe('writing');
  });

  it('returns null for unknown windows', () => {
    expect(windowToContext('settings')).toBeNull();
    expect(windowToContext(undefined)).toBeNull();
  });
});

describe('resolveContextGroup', () => {
  it('prefers the active section, then window, then open windows', () => {
    expect(
      resolveContextGroup({ activeSection: 'research', activeWindow: 'projects' })
    ).toBe('research');
    expect(resolveContextGroup({ activeSection: null, activeWindow: 'profTimeline' })).toBe('career');
    expect(
      resolveContextGroup({ activeSection: null, activeWindow: null, openWindows: ['writing'] })
    ).toBe('writing');
    expect(
      resolveContextGroup({ activeSection: null, activeWindow: null, openWindows: [] })
    ).toBeNull();
  });
});

describe('suggestQuestions', () => {
  it('returns context-aware questions', () => {
    const qs = suggestQuestions({ activeSection: 'research' });
    expect(qs.length).toBe(4);
    expect(qs.join(' ').toLowerCase()).toContain('paper');
  });

  it('falls back to defaults with no context', () => {
    const qs = suggestQuestions({});
    expect(qs.length).toBe(4);
    expect(qs.join(' ').toLowerCase()).toContain('research');
  });

  it('respects the count limit', () => {
    expect(suggestQuestions({ activeSection: 'projects', count: 2 }).length).toBe(2);
  });
});

describe('suggestGreeting', () => {
  it('greets first-time visitors with the brand', () => {
    const g = suggestGreeting({ returning: false });
    expect(g.title).toContain('Farhan AI');
    expect(g.message.length).toBeGreaterThan(0);
    expect(g.query.length).toBeGreaterThan(0);
  });

  it('acknowledges returning visitors', () => {
    expect(suggestGreeting({ returning: true }).title).toBe('Welcome back');
  });

  it('contextualizes to research sections', () => {
    expect(suggestGreeting({ returning: false, activeSection: 'research' }).title).toBe(
      'Research desk'
    );
  });
});