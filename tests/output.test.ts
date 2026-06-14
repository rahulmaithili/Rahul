import { describe, expect, it } from "vitest";
import { MarkdownOutputRenderer } from "../src/services/output/service.js";
import { TemplateContentGenerator } from "../src/services/content/index.js";
import { DeterministicResearchService } from "../src/services/research/index.js";
import { DeterministicSeoService } from "../src/services/seo/index.js";
import type { ContentPackage } from "../src/services/content/types.js";

describe("MarkdownOutputRenderer", () => {
  const renderer = new MarkdownOutputRenderer();

  const createTestPackage = async (): Promise<ContentPackage> => {
    const research = await new DeterministicResearchService().research({ topic: "test topic" });
    const seoReport = new DeterministicSeoService().analyze({ topic: "test topic" });
    return new TemplateContentGenerator().generatePackage({
      topicInput: { topic: "test topic" },
      research,
      seoReport
    });
  };

  it("renders markdown with required sections", async () => {
    const contentPackage = await createTestPackage();
    const result = renderer.renderMarkdown(contentPackage);

    expect(result).toContain("# ");
    expect(result).toContain("## Sources");
    expect(result).toContain("## SEO Metadata");
    expect(result).toContain("## JSON-LD Schema");
  });

  it("includes slug in markdown output", async () => {
    const contentPackage = await createTestPackage();
    const result = renderer.renderMarkdown(contentPackage);

    expect(result).toContain(`**Slug:** ${contentPackage.slug}`);
  });

  it("includes target keyword in markdown output", async () => {
    const contentPackage = await createTestPackage();
    const result = renderer.renderMarkdown(contentPackage);

    expect(result).toContain(`**Target keyword:** ${contentPackage.seoBrief.targetKeyword}`);
  });

  it("includes SEO score in markdown output", async () => {
    const contentPackage = await createTestPackage();
    const result = renderer.renderMarkdown(contentPackage);

    expect(result).toContain(`**SEO score:** ${contentPackage.seoBrief.score}/100`);
  });

  it("renders JSON output with pretty formatting", async () => {
    const contentPackage = await createTestPackage();
    const result = renderer.renderJson(contentPackage, true);

    expect(() => JSON.parse(result)).not.toThrow();
    expect(result).toContain('"topic"');
    expect(result).toContain('"slug"');
    expect(result).toContain('"seoBrief"');
  });

  it("renders JSON output without pretty formatting when specified", async () => {
    const contentPackage = await createTestPackage();
    const result = renderer.renderJson(contentPackage, false);

    expect(result).not.toContain("\n  ");
  });

  it("produces valid JSON that parses correctly", async () => {
    const contentPackage = await createTestPackage();
    const json = renderer.renderJson(contentPackage);
    const parsed = JSON.parse(json);

    expect(parsed.topic).toBe(contentPackage.topic);
    expect(parsed.slug).toBe(contentPackage.slug);
    expect(parsed.seoBrief.targetKeyword).toBe(contentPackage.seoBrief.targetKeyword);
  });
});