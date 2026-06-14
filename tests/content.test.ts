import { describe, expect, it } from "vitest";
import { TemplateContentGenerator, buildContentPromptVariables } from "../src/services/content/service.js";
import type { ContentGenerationRequest } from "../src/services/content/types.js";
import { DeterministicResearchService } from "../src/services/research/index.js";
import { DeterministicSeoService } from "../src/services/seo/index.js";

describe("TemplateContentGenerator", () => {
  const generator = new TemplateContentGenerator();

  it("generates content package from research and SEO report", async () => {
    const research = await new DeterministicResearchService().research({
      topic: "sustainable garden",
      language: "en",
      audience: "beginners"
    });
    const seoReport = new DeterministicSeoService().analyze({
      topic: "sustainable garden",
      audience: "beginners"
    });

    const request: ContentGenerationRequest = {
      topicInput: { topic: "sustainable garden", language: "en", audience: "beginners" },
      research,
      seoReport
    };

    const result = await generator.generatePackage(request);

    expect(result.topic).toBe("sustainable garden");
    expect(result.slug).toBeTruthy();
    expect(result.seoBrief.targetKeyword).toBe(seoReport.targetKeyword);
    expect(result.seoBrief.title).toBe(seoReport.title);
    expect(result.seoBrief.metaDescription).toBe(seoReport.metaDescription);
    expect(result.outline.length).toBeGreaterThan(0);
    expect(result.draftBody).toBeTruthy();
    expect(result.metaTitle).toBe(seoReport.title);
    expect(result.metaDescription).toBe(seoReport.metaDescription);
    expect(result.faqs.length).toBeGreaterThan(0);
    expect(result.schemaJsonLd).toContain("@type");
    expect(result.schemaJsonLd).toContain("Article");
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("creates citations from research sources", async () => {
    const research = await new DeterministicResearchService().research({ topic: "test" });
    const seoReport = new DeterministicSeoService().analyze({ topic: "test" });

    const result = await generator.generatePackage({
      topicInput: { topic: "test" },
      research,
      seoReport
    });

    expect(result.citations.length).toBe(research.sources.length);
    expect(result.citations[0]).toHaveProperty("id");
    expect(result.citations[0]).toHaveProperty("title");
    expect(result.citations[0]).toHaveProperty("url");
    expect(result.citations[0]).toHaveProperty("note");
  });

  it("generates valid JSON-LD schema", async () => {
    const research = await new DeterministicResearchService().research({ topic: "test" });
    const seoReport = new DeterministicSeoService().analyze({ topic: "test" });

    const result = await generator.generatePackage({
      topicInput: { topic: "test" },
      research,
      seoReport
    });

    const parsed = JSON.parse(result.schemaJsonLd);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Article");
    expect(parsed.headline).toBeTruthy();
    expect(parsed.description).toBeTruthy();
    expect(parsed.keywords).toBeInstanceOf(Array);
    expect(parsed.author).toBeTruthy();
  });

  it("builds outline sections from research notes", async () => {
    const research = await new DeterministicResearchService().research({ topic: "test topic" });
    const seoReport = new DeterministicSeoService().analyze({ topic: "test topic" });

    const result = await generator.generatePackage({
      topicInput: { topic: "test topic" },
      research,
      seoReport
    });

    expect(result.outline.length).toBe(research.notes[0].keyPoints.length);
    result.outline.forEach((section) => {
      expect(section.heading).toBeTruthy();
      expect(section.subheadings).toBeInstanceOf(Array);
    });
  });

  it("returns prompt template via getPromptTemplate", () => {
    const template = generator.getPromptTemplate();
    expect(template).toBeTruthy();
    expect(template.system).toBeTruthy();
    expect(template.user).toBeTruthy();
  });
});

describe("buildContentPromptVariables", () => {
  it("extracts prompt variables from request", () => {
    const request = {
      topicInput: { topic: "sustainable garden", audience: "beginners", tone: "friendly", language: "en" },
      seoReport: { targetKeyword: "permaculture" }
    } as ContentGenerationRequest;

    const result = buildContentPromptVariables(request);

    expect(result.topic).toBe("sustainable garden");
    expect(result.targetKeyword).toBe("permaculture");
    expect(result.audience).toBe("beginners");
    expect(result.tone).toBe("friendly");
    expect(result.language).toBe("en");
    expect(result.keywords).toBeTruthy();
  });

  it("uses defaults for missing optional fields", () => {
    const request = {
      topicInput: { topic: "test" },
      seoReport: { targetKeyword: "test" }
    } as ContentGenerationRequest;

    const result = buildContentPromptVariables(request);

    expect(result.audience).toBe("target audience");
    expect(result.tone).toBe("professional");
    expect(result.language).toBe("en");
  });
});