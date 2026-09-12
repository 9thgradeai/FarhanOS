/**
 * Lightweight intent-mode detection for Farhan AI.
 * Classifies each user turn into a response-shaping mode so answers are
 * tailored without burning tokens on a full secondary model call. Pure and
 * deterministic — new files must never fabricate knowledge.
 */

export type IntentMode = 'recruiter' | 'developer' | 'research';

const MODE_KEYWORDS: Record<IntentMode, Array<[string, number]>> = {
  recruiter: [
    ['hire', 3],
    ['hiring', 3],
    ['recruit', 3],
    ['employment', 2],
    ['vacanc', 3],
    ['open to work', 4],
    ['job', 3],
    ['position', 3],
    ['role', 2],
    ['salary', 3],
    ['compensation', 2],
    ['freelanc', 3],
    ['contractor', 2],
    ['contract work', 3],
    ['sponsorship', 2],
    ['collaborat', 2],
    ['partnership', 2],
    ['work with him', 3],
    ['work with farhan', 4],
    ['available for', 2],
    ['availability', 2],
    ['hourly rate', 3],
    ['team', 1],
  ],
  developer: [
    ['build', 1],
    ['architecture', 2],
    ['system design', 3],
    ['code', 2],
    ['programming', 2],
    ['frontend', 2],
    ['backend', 2],
    ['full-stack', 2],
    ['stack', 2],
    ['api design', 2],
    ['database', 2],
    ['deploy', 2],
    ['debug', 2],
    ['docker', 2],
    ['typescript', 2],
    ['react', 2],
    ['node.js', 2],
    ['golang', 2],
    ['microservice', 2],
    ['performance', 2],
    ['optimization', 2],
    ['framework', 2],
    ['how would you', 2],
    ['engineering', 1],
    ['streaming', 1],
  ],
  research: [
    ['research', 3],
    ['paper', 3],
    ['publication', 3],
    ['study', 2],
    ['methodology', 2],
    ['perplexity', 3],
    ['adversarial', 3],
    ['roberta', 3],
    ['bert', 3],
    ['fine-tun', 2],
    ['depression', 2],
    ['emotion', 2],
    ['clinical', 2],
    ['cognitive', 3],
    ['f1', 2],
    ['benchmark', 2],
    ['dataset', 2],
    ['accuracy', 1],
    ['state of the art', 2],
    ['evaluation', 1],
    ['nlp', 2],
    ['llm', 1],
    ['model', 1],
    ['wav2vec', 3],
    ['posture', 2],
    ['interview system', 2],
  ],
};

const MODE_PRIORITY: IntentMode[] = ['recruiter', 'research', 'developer'];

/** Scores a message against the three mode keyword tables. */
export function scoreIntentMode(message: string): Map<IntentMode, number> {
  const q = message.toLowerCase();
  const scores = new Map<IntentMode, number>();
  for (const mode of MODE_PRIORITY) {
    let total = 0;
    for (const [keyword, weight] of MODE_KEYWORDS[mode]) {
      let start = 0;
      let index: number;
      while ((index = q.indexOf(keyword, start)) !== -1) {
        total += weight;
        start = index + keyword.length;
      }
    }
    scores.set(mode, total);
  }
  return scores;
}

/** Returns the dominant intent mode, or null when no signal is present. */
export function inferIntentMode(message: string | undefined | null): IntentMode | null {
  if (typeof message !== 'string' || !message.trim()) return null;
  const scores = scoreIntentMode(message);
  let best: IntentMode | null = null;
  let bestScore = 0;
  for (const mode of MODE_PRIORITY) {
    const score = scores.get(mode) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = mode;
    }
  }
  return bestScore >= 2 ? best : null;
}

/** Verifies a caller-provided mode string against the known set. */
export function isIntentMode(value: unknown): value is IntentMode {
  return value === 'recruiter' || value === 'developer' || value === 'research';
}

/** Builds the mode-shaping instruction block appended to the system prompt. */
export function buildModePrompt(mode: IntentMode): string {
  switch (mode) {
    case 'recruiter':
      return `MODE: RECRUITER DIALOGUE
The visitor is evaluating Farhan as a potential hire or collaborator. Lead with a crisp value proposition (2-4 lines) they can act on: core strengths, headline research, and pragmatism. Be concise and confident — no jargon walls. Confirm readiness, mention that Farhan is based in Rajshahi, Bangladesh (UTC+6) and available remotely, and offer a next step (open resume, brief/hire window, or open external links). Keep the answer tight unless asked for depth.`;
    case 'developer':
      return `MODE: DEVELOPER DIALOGUE
The visitor sounds like another engineer. Answer like a senior engineer: lead with the concrete technical answer, give real architectural reasoning, share Farhan's actual opinions (he prefers pragmatic, boring-robust stacks; monolith first; Go over Node for perf-critical services; PostgreSQL over Mongo for relational data). Offer a short code-shaped or architecture-shaped take before general commentary. Prefer opening the relevant window (projects/github/garden/whiteboard) when it directly proves the point.`;
    case 'research':
      return `MODE: RESEARCH DIALOGUE
The visitor is engaging with Farhan's research. Ground every claim in verified knowledge: name the paper or study, the method, and the reported metric exactly (e.g. F1 0.914 depression detection, 94.2% adversarial-prompt defense at 4.5ms overhead, 91.6% multimodal interview assessment). Tie methodology to the retrieved documents. Offer to open the research window or fetch live articles where relevant. Do not invent papers, numbers, or venues.`;
  }
}