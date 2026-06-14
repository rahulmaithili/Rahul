import { describe, expect, it } from "vitest";
import { DeterministicResearchService } from "../src/services/research/index.js";
import { ManualSourceProvider } from "../src/services/research/providers/manual.js";
import { deduplicateSources, rankSources, summarize } from "../src/services/research/resolvers/index.js";

describe("research services", () => {
  it("normalizes topic and extracts keywords", async () => {
    const service = new DeterministicResearchService();
    const request = {
      topic: "How to plan a SUSTAINABLE garden",
      language: "en",
      audience: "beginners",
      tone: "friendly",
      targetKeyword: "sustainable garden",
      length: "medium" as const
    };
    const notes = await service.research(request);

    expect(notes.normalizedTopic).toBe("how to plan a sustainable garden");
    expect(notes.notes[0].keyPoints.length).toBeGreaterThan(0);
    expect(notes.sources.length).toBeGreaterThan(0);
    expect(notes.confidence).toBeGreaterThan(0);
  });

  it("maxSources from context restricts sources", async () => {
    const provider = new ManualSourceProvider();
    const sources = provider.discover({
      topic: "AI",
      keywords: ["ai", "ml", "dl", "nlp", "cv"],
      context: {
        maxSources: 3,
        includeQuotes: true,
        language: "en",
        audience: "engineers"
      }
    });

    expect(sources.length).toBe(3);
    expect(sources[0].title).toBe("Manual source: ai");
    expect(sources[2].title).toBe("Manual source: dl");
  });

  it("dedup removes duplicate URLs", () => {
    const sources = [
      { id: "1", url: "https://example.com/a", title: "A", snippet: "s", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.8 },
      { id: "2", url: "https://example.com/a", title: "A again", snippet: "s2", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.6 },
      { id: "3", url: "https://example.com/b", title: "B", snippet: "s3", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.9 }
    ];
    const deduped = deduplicateSources(sources);

    expect(deduped).toHaveLength(2);
    expect(deduped[0].title).toBe("A");
  });

  it("rank sorts by confidence descending, then title", () => {
    const sources = [
      { id: "1", url: "https://example.com/a", title: "B", snippet: "s", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.6 },
      { id: "2", url: "https://example.com/b", title: "A", snippet: "s3", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.9 }
    ];
    const ranked = rankSources(sources);

    expect(ranked[0].title).toBe("A");
    expect(ranked[1].title).toBe("B");
  });

  it("summarize produces key points and quotes", () => {
    const sources = [
      { id: "1", url: "https://example.com/a", title: "Source A", snippet: "First sentence. Second sentence.", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.8 },
      { id: "2", url: "https://example.com/b", title: "Source B", snippet: "Another finding.", provider: "manual" as const, retrievedAt: new Date().toISOString(), confidence: 0.6 }
    ];
    const result = summarize({
      topic: "sustainable garden",
      keywords: ["sustainable", "garden"],
      sources,
      maxSources: 2,
      includeQuotes: true
    });

    expect(result.keyPoints.length).toBe(2);
    expect(result.quotes.length).toBeGreaterThan(0);
    expect(result.quotes[0].sourceId).toBe(sources[0].id);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.salience).toBeGreaterThan(0);
  });
});
