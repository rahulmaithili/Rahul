import { describe, expect, it } from "vitest";
import { DeterministicSeoService, classifySearchIntent } from "../src/services/seo/service.js";
import type { SeoRequest } from "../src/services/seo/types.js";

describe("DeterministicSeoService", () => {
  const service = new DeterministicSeoService();

  it("analyzes SEO for a topic", () => {
    const request: SeoRequest = {
      topic: "How to plan a sustainable garden",
      language: "en",
      audience: "beginners",
      tone: "friendly",
      targetKeyword: "sustainable garden"
    };

    const result = service.analyze(request);

    expect(result.targetKeyword).toBe("sustainable garden");
    expect(result.keywords.length).toBeGreaterThan(0);
    expect(result.title).toBeTruthy();
    expect(result.metaDescription).toBeTruthy();
    expect(result.headingRecommendations.length).toBeGreaterThan(0);
    expect(result.internalLinkSuggestions.length).toBeGreaterThan(0);
    expect(result.faqSuggestions.length).toBeGreaterThan(0);
    expect(result.schemaSuggestions).toContain("Article");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("generates title with tone prefix", () => {
    const friendlyRequest: SeoRequest = {
      topic: "sustainable garden",
      tone: "friendly",
      audience: "beginners"
    };
    const professionalRequest: SeoRequest = {
      topic: "sustainable garden",
      tone: "professional",
      audience: "experts"
    };

    const friendlyResult = service.analyze(friendlyRequest);
    const professionalResult = service.analyze(professionalRequest);

    expect(friendlyResult.title).toContain("A practical guide to");
    expect(professionalResult.title).toContain("Guide to");
  });

  it("generates meta description within recommended length", () => {
    const request: SeoRequest = {
      topic: "sustainable garden",
      audience: "beginners"
    };

    const result = service.analyze(request);

    expect(result.metaDescription.length).toBeGreaterThanOrEqual(100);
    expect(result.metaDescription.length).toBeLessThanOrEqual(155);
  });

  it("creates SEO checks with pass/warn status", () => {
    const request: SeoRequest = {
      topic: "sustainable garden",
      tone: "friendly",
      audience: "beginners",
      targetKeyword: "sustainable garden"
    };

    const result = service.analyze(request);

    expect(result.checks).toHaveLength(4);
    expect(result.checks.every((c) => ["pass", "warn", "fail"].includes(c.status))).toBe(true);
    expect(result.checks.every((c) => c.message)).toBe(true);
  });

  it("calculates score based on checks", () => {
    const result = service.analyze({ topic: "sustainable garden" });

    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("includes target keyword in keywords list", () => {
    const request: SeoRequest = {
      topic: "sustainable garden",
      targetKeyword: "permaculture"
    };

    const result = service.analyze(request);

    expect(result.keywords[0].keyword).toBe("permaculture");
  });
});

describe("classifySearchIntent", () => {
  it("classifies informational intent", () => {
    expect(classifySearchIntent("how to plant tomatoes")).toBe("informational");
    expect(classifySearchIntent("what is photosynthesis")).toBe("informational");
    expect(classifySearchIntent("guide to gardening")).toBe("informational");
  });

  it("classifies commercial intent", () => {
    expect(classifySearchIntent("buy solar panels")).toBe("commercial");
    expect(classifySearchIntent("best price for compost")).toBe("commercial");
    expect(classifySearchIntent("compare tiller vs manual")).toBe("commercial");
  });

  it("classifies transactional intent", () => {
    expect(classifySearchIntent("how to order seeds online")).toBe("transactional");
    expect(classifySearchIntent("how to download software")).toBe("transactional");
  });

  it("classifies navigational intent", () => {
    expect(classifySearchIntent("login to dashboard")).toBe("navigational");
    expect(classifySearchIntent("official website garden")).toBe("navigational");
  });

  it("defaults to unknown for unrecognized patterns", () => {
    expect(classifySearchIntent("xyzabc123")).toBe("unknown");
    expect(classifySearchIntent("random topic")).toBe("unknown");
  });
});