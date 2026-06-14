import type { ResearchSource, ResearchQuote, ResearchNote } from "../types.js";

export interface SummarizationResult {
  keyPoints: string[];
  quotes: ResearchQuote[];
  salience: number;
  confidence: number;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "with"
]);

function sentenceLikelihood(sentence: string, topic: string, keywords: string[]): number {
  const normalized = sentence.toLowerCase();
  const normalizedTopic = topic.toLowerCase();
  const allKeywords = [normalizedTopic, ...keywords.map((keyword) => keyword.toLowerCase())];
  let score = 0;

  for (const keyword of allKeywords) {
    const tokens = keyword.split(" ").filter((token) => token.length > 2 && !STOP_WORDS.has(token));

    for (const token of tokens) {
      if (normalized.includes(token)) {
        score += token.length;
      }
    }
  }

  return score / Math.max(sentence.length, 1);
}

export function summarize(request: {
  topic: string;
  keywords: string[];
  sources: ResearchSource[];
  maxSources: number;
  includeQuotes: boolean;
}): SummarizationResult {
  const ranked = rankCandidates(buildCandidates(request.sources), request.topic, request.keywords);
  const selected = ranked.slice(0, Math.max(request.maxSources, 1));
  const keyPoints = selected.map(({ source }) =>
    `Reference ${source.title} to support points about ${request.topic}.`
  );
  const quotes = request.includeQuotes ? selected.slice(0, 2).map(({ source, text }) => ({
    text,
    sourceId: source.id
  })) : [];

  const confidence = selected.length > 0 ? Math.min(0.85, 0.45 + selected.length * 0.08) : 0.35;
  const salience = selected.length > 0 ? Math.min(0.9, 0.5 + selected.length * 0.07) : 0.35;

  return {
    keyPoints,
    quotes,
    salience,
    confidence
  };
}

function buildCandidates(sources: ResearchSource[]): Array<{ source: ResearchSource; text: string }> {
  const candidates: Array<{ source: ResearchSource; text: string }> = [];

  for (const source of sources) {
    const sentences = source.snippet
      .split(/(?<=[.!?])\s+/u)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    if (sentences.length === 0) {
      candidates.push({ source, text: source.snippet });
      continue;
    }

    candidates.push({ source, text: sentences[0] });

    if (sentences.length > 1) {
      candidates.push({ source, text: sentences[1] });
    }
  }

  return candidates;
}

function rankCandidates(
  candidates: Array<{ source: ResearchSource; text: string }>,
  topic: string,
  keywords: string[]
): Array<{ source: ResearchSource; text: string }> {
  return candidates
    .slice()
    .sort((a, b) => {
      const scoreA = computeScore(a, topic, keywords);
      const scoreB = computeScore(b, topic, keywords);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return a.source.title.localeCompare(b.source.title);
    });
}

function computeScore(
  candidate: { source: ResearchSource; text: string },
  topic: string,
  keywords: string[]
): number {
  const s1 = candidate.source.confidence;
  const s2 = sentenceLikelihood(candidate.text, topic, keywords);
  return s1 * 0.6 + s2 * 0.4;
}

export function buildNote(request: {
  topic: string;
  keywords: string[];
  sources: ResearchSource[];
  maxSources: number;
  includeQuotes: boolean;
}): ResearchNote {
  const { keyPoints, quotes, salience, confidence } = summarize(request);
  const selected = request.sources.slice(0, Math.max(request.maxSources, 1));

  return {
    id: `research-note-${Date.now()}`,
    topic: request.topic,
    keyPoints,
    quotes,
    sources: selected,
    salience,
    confidence
  };
}
