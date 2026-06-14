import { describe, expect, it } from "vitest";
import { TemplateContentGenerator } from "../src/services/content/index.js";
import { MarkdownOutputRenderer } from "../src/services/output/index.js";
import { DeterministicResearchService } from "../src/services/research/index.js";
import { DeterministicSeoService } from "../src/services/seo/index.js";

describe("default deterministic services", () => {
  it("generates a complete content package without provider API keys", async () => {
    const request = {
      topic: "How to plan a sustainable garden",
      language: "en",
      audience: "beginners",
      tone: "friendly",
      targetKeyword: "sustainable garden"
    };
    const research = await new DeterministicResearchService().research(request);
    const seoReport = new DeterministicSeoService().analyze(request);
    const contentPackage = await new TemplateContentGenerator().generatePackage({
      topicInput: request,
      research,
      seoReport
    });
    const markdown = new MarkdownOutputRenderer().renderMarkdown(contentPackage);

    expect(contentPackage.slug).toBe("sustainable-garden");
    expect(contentPackage.citations).toHaveLength(research.sources.length);
    expect(contentPackage.schemaJsonLd).toContain('"@type": "Article"');
    expect(markdown).toContain("sustainable garden");
    expect(markdown).toContain("## Sources");
  });
});
