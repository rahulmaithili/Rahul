import type { ResearchProviderContext, ResearchSource } from "../types.js";

export class ManualSourceProvider {
  readonly name = "manual";

  discover(request: {
    topic: string;
    keywords: string[];
    context: ResearchProviderContext;
  }): ResearchSource[] {
    const retrievedAt = new Date().toISOString();
    const limit = Math.max(1, Math.min(request.keywords.length, request.context.maxSources));

    return request.keywords.slice(0, limit).map((keyword, index) => ({
      id: `manual-source-${index + 1}`,
      title: `Manual source: ${keyword}`,
      url: `https://example.com/research/${encodeURIComponent(keyword.replace(/\s+/g, "-").toLowerCase())}`,
      snippet: `Use this deterministic source placeholder for ${keyword} until a search provider is configured.`,
      provider: "manual",
      retrievedAt,
      confidence: 0.55
    }));
  }
}
