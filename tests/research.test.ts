import { describe, expect, it } from "vitest";
import { DeterministicResearchService } from "../src/services/research/index.js";
import type { ResearchRequest } from "../src/services/research/types.js";

describe("DeterministicResearchService", () => {
  const service = new DeterministicResearchService();

  it("generates research notes with sources", async () => {
    const request: ResearchRequest = {
      topic: "How to plan a sustainable garden",
      language: "en",
      audience: "beginners",
      tone: "friendly",
      targetKeyword: "sustainable garden"
    };

    const result = await service.research(request);

    expect(result.topic).toBe("How to plan a sustainable garden");
    expect(result.normalizedTopic).toBe("how to plan a sustainable garden");
    expect(result.language).toBe("en");
    expect(result.audience).toBe("beginners");
    expect(result.notes).toHaveLength(1);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("creates sources with correct provider", async () => {
    const request: ResearchRequest = {
      topic: "sustainable garden",
      language: "en"
    };

    const r = await service.research(request);
    expect(r.sources.every((s) => s.provider === "manual")).toBe(true);
    expect(r.sources.every((s) => s.retrievedAt)).toBe(true);
    expect(r.sources.every((s) => s.id)).toBe(true);
    expect(r.sources.every((s) => s.title)).toBe(true);
    expect(r.sources.every((s) => s.url)).toBe(true);
    expect(r.sources.every((s) => s.snippet)).toBe(true);
  });

  it("omits quotes for short content length", async () => {
    const request: ResearchRequest = {
      topic: "sustainable garden",
      language: "en",
      length: "short"
    };

    const result = await service.research(request);
    expect(result.notes[0].quotes).toHaveLength(0);
  });

  it("includes quotes for medium and long content length", async () => {
    const request: ResearchRequest = {
      topic: "sustainable garden",
      language: "en",
      length: "medium"
    };

    const result = await service.research(request);
    expect(result.notes[0].quotes.length).toBeGreaterThan(0);
    expect(result.notes[0].quotes.length).toBeLessThanOrEqual(2);
  });

  it("builds key points from request", async () => {
    const request: ResearchRequest = {
      topic: "sustainable garden",
      language: "en",
      audience: "beginners",
      targetKeyword: "permaculture"
    };

    const result = await service.research(request);
    
    expect(result.notes[0].keyPoints.some((kp) => kp.includes("beginners"))).toBe(true);
    expect(result.notes[0].keyPoints.some((kp) => kp.includes("permaculture"))).toBe(true);
  });
});