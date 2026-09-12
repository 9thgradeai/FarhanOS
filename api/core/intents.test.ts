import { describe, expect, it } from 'vitest';
import {
  buildModePrompt,
  inferIntentMode,
  isIntentMode,
  scoreIntentMode,
} from './intents';
import { buildAskTwinSystemPrompt, INLINE_SYSTEM_PROMPT } from './prompts';

describe('inferIntentMode', () => {
  it('detects recruiter intent', () => {
    expect(inferIntentMode('I would like to hire Farhan for a contract role')).toBe('recruiter');
    expect(inferIntentMode('Is Farhan available for freelance work?')).toBe('recruiter');
    expect(inferIntentMode('What is Farhan’s salary expectation for this job?')).toBe('recruiter');
  });

  it('detects research intent', () => {
    expect(inferIntentMode('Explain the methodology behind the depression detection paper')).toBe('research');
    expect(inferIntentMode('What F1 score did the RoBERTa model achieve?')).toBe('research');
    expect(inferIntentMode('Tell me about the perplexity-based adversarial study')).toBe('research');
  });

  it('detects developer intent', () => {
    expect(inferIntentMode('How would Farhan architect a real-time streaming backend?')).toBe('developer');
    expect(inferIntentMode('What is his tech stack and how does he deploy with Docker?')).toBe('developer');
    expect(inferIntentMode('Full-stack React and Go freelance project')).toBe('developer');
  });

  it('resolves hire vs research overlap toward recruiter on ties', () => {
    // hire (3) vs research (3) — exactly tied → recruiter wins by priority.
    expect(inferIntentMode('I need to hire Farhan for research')).toBe('recruiter');
  });

  it('returns null for greetings and weak signals', () => {
    expect(inferIntentMode('hello')).toBeNull();
    expect(inferIntentMode('how are you?')).toBeNull();
    expect(inferIntentMode('')).toBeNull();
    expect(inferIntentMode(undefined)).toBeNull();
    expect(inferIntentMode(null)).toBeNull();
  });

  it('counts repeats', () => {
    expect(inferIntentMode('hire hire hire')).toBe('recruiter');
  });
});

describe('scoreIntentMode', () => {
  it('returns a map with positive scores for matched modes', () => {
    const scores = scoreIntentMode('hire');
    expect(scores.get('recruiter')!).toBeGreaterThan(0);
  });
});

describe('isIntentMode', () => {
  it('validates known modes only', () => {
    expect(isIntentMode('recruiter')).toBe(true);
    expect(isIntentMode('developer')).toBe(true);
    expect(isIntentMode('research')).toBe(true);
    expect(isIntentMode('poetry')).toBe(false);
    expect(isIntentMode(undefined)).toBe(false);
  });
});

describe('buildModePrompt', () => {
  it('produces a compact shaping block for each mode', () => {
    for (const mode of ['recruiter', 'developer', 'research'] as const) {
      const block = buildModePrompt(mode);
      expect(block).toContain(`MODE: ${mode.toUpperCase()}`);
      expect(block.length).toBeLessThan(700);
    }
  });

  it('composes cleanly with the system prompt', () => {
    const withMode = `${buildAskTwinSystemPrompt()}\n\n${buildModePrompt('recruiter')}`;
    expect(withMode).toContain('Farhan AI');
    expect(withMode).toContain('MODE: RECRUITER DIALOGUE');
    expect(withMode).toContain(INLINE_SYSTEM_PROMPT);
  });
});