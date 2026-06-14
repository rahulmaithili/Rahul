import type { ResearchNotes, ResearchRequest, ResearchService, ResearchSource } from "./types.js";
import type { ResearchProviderContext } from "./providers/types.js";
import { ManualSourceProvider } from "./providers/manual.js";
import { deduplicateSources } from "./resolvers/dedup.js";
import { rankSources } from "./resolvers/rank.js";
import { buildNote } from "./resolvers/summarize.js";

export class DeterministicResearchService implements ResearchService {
  async research(request: ResearchRequest): Promise<ResearchNotes> {
    const normalizedTopic = request.topic.trim().toLowerCase();
    const keywords = extractKeywordsFromTopic(normalizedTopic, 4);
    const context = this.buildContext(request);
    const sources = await this.collectSources(request, keywords, context);
    const deduped = deduplicateSources(sources);
    const ranked = rankSources(deduped);
    const selected = ranked.slice(0, Math.min(context.maxSources, ranked.length));
    const note = buildNote({
      topic: normalizedTopic,
      keywords,
      sources: selected,
      maxSources: context.maxSources,
      includeQuotes: context.includeQuotes
    });
    const confidence = Math.min(0.9, note.confidence + selected.length * 0.03);

    return {
      topic: request.topic,
      normalizedTopic,
      language: request.language,
      audience: request.audience,
      notes: [note],
      sources: selected,
      confidence
    };
  }

  private buildContext(request: ResearchRequest): ResearchProviderContext {
    return {
      maxSources: 5,
      includeQuotes: request.length !== "short",
      audience: request.audience,
      language: request.language
    };
  }

  private async collectSources(
    request: ResearchRequest,
    keywords: string[],
    context: ResearchProviderContext
  ): Promise<ResearchSource[]> {
    const provider = new ManualSourceProvider();

    return provider.discover({
      topic: request.topic,
      keywords,
      context
    });
  }
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

function extractKeywordsFromTopic(topic: string, limit = 5): string[] {
  const tokens = topic
    .split(/\s+/u)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  const uniqueTokens: string[] = [];

  for (const token of tokens) {
    if (!uniqueTokens.includes(token)) {
      uniqueTokens.push(token);
    }

    if (uniqueTokens.length >= limit) {
      break;
    }
  }

  return uniqueTokens;
}
