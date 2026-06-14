import { extractKeywords, normalizeTopic, truncate } from "../../core/text.js";
import { slugify } from "../../core/slug.js";
import type { SeoKeyword, SeoReport, SeoRequest, SeoService, SearchIntent } from "./types.js";

export class DeterministicSeoService implements SeoService {
  analyze(request: SeoRequest): SeoReport {
    const targetKeyword = request.targetKeyword ?? extractKeywords(request.topic, 1)[0] ?? request.topic;
    const keywords = this.buildKeywords(request, targetKeyword);
    const searchIntent = classifySearchIntent(request.topic);
    const title = this.generateTitle(request, targetKeyword);
    const metaDescription = this.generateMetaDescription(request, targetKeyword);
    const headingRecommendations = this.buildHeadingRecommendations(request);
    const checks = this.buildChecks(title, metaDescription, request);
    const score = this.calculateScore(checks);

    return {
      targetKeyword,
      keywords,
      searchIntent,
      title,
      metaDescription,
      outlineScore: 78,
      readabilityScore: 72,
      headingRecommendations,
      internalLinkSuggestions: [
        `Link to a glossary page for ${targetKeyword}.`,
        `Link to related how-to guides around ${slugify(targetKeyword)}.`
      ],
      faqSuggestions: [
        `What is ${targetKeyword}?`,
        `How does ${targetKeyword} work?`,
        `What are the best practices for ${targetKeyword}?`
      ],
      schemaSuggestions: ["Article", "FAQPage", "BreadcrumbList"],
      score,
      checks
    };
  }

  private buildKeywords(request: SeoRequest, targetKeyword: string): SeoKeyword[] {
    const keywords = [targetKeyword, ...extractKeywords(request.topic, 5)].filter(
      (keyword, index, list) => list.indexOf(keyword) === index
    );

    return keywords.map((keyword, index) => ({
      keyword,
      score: Math.max(35, 100 - index * 12),
      intent: classifySearchIntent(keyword)
    }));
  }

  private generateTitle(request: SeoRequest, targetKeyword: string): string {
    const prefix = request.tone === "friendly" ? "A practical guide to" : "Guide to";
    return truncate(`${prefix} ${targetKeyword}${request.audience ? ` for ${request.audience}` : ""}`, 60);
  }

  private generateMetaDescription(request: SeoRequest, targetKeyword: string): string {
    const audience = request.audience ? ` for ${request.audience}` : "";
    return truncate(
      `Learn ${targetKeyword}${audience} with a clear outline, practical steps, SEO recommendations, and cited research notes.`,
      155
    );
  }

  private buildHeadingRecommendations(request: SeoRequest): string[] {
    const topic = normalizeTopic(request.topic);
    const targetKeyword = request.targetKeyword ?? extractKeywords(topic, 1)[0] ?? topic;

    return [
      "Use one H1 that includes the target keyword.",
      `Add an H2 that defines ${targetKeyword}.`,
      "Add H2 sections for benefits, implementation steps, examples, and common mistakes.",
      "Close with an H2 FAQ section and a concise conclusion."
    ];
  }

  private buildChecks(title: string, metaDescription: string, request: SeoRequest): SeoReport["checks"] {
    const titleLength = title.length;
    const metaLength = metaDescription.length;

    return [
      {
        id: "title-length",
        status: titleLength >= 35 && titleLength <= 60 ? "pass" : "warn",
        message: `Title length is ${titleLength} characters.`
      },
      {
        id: "meta-description-length",
        status: metaLength >= 120 && metaLength <= 155 ? "pass" : "warn",
        message: `Meta description length is ${metaLength} characters.`
      },
      {
        id: "target-keyword",
        status: request.targetKeyword || extractKeywords(request.topic, 1).length > 0 ? "pass" : "warn",
        message: "Target keyword is available for optimization."
      },
      {
        id: "faq-schema",
        status: "pass",
        message: "FAQ suggestions are included for schema markup."
      }
    ];
  }

  private calculateScore(checks: SeoReport["checks"]): number {
    const points = checks.reduce((total, check) => {
      if (check.status === "pass") {
        return total + 25;
      }

      if (check.status === "warn") {
        return total + 12;
      }

      return total;
    }, 0);

    return Math.min(100, points);
  }
}

export function classifySearchIntent(topic: string): SearchIntent {
  const normalized = normalizeTopic(topic);

  if (/\b(buy|price|pricing|cost|deal|best|review|vs|compare)\b/u.test(normalized)) {
    return "commercial";
  }

  if (/\b(buy now|order|subscribe|hire|book|download)\b/u.test(normalized)) {
    return "transactional";
  }

  if (/\b(login|signin|sign in|contact|website|official)\b/u.test(normalized)) {
    return "navigational";
  }

  if (/\b(what|how|why|when|where|guide|tutorial|examples|tips)\b/u.test(normalized)) {
    return "informational";
  }

  return "unknown";
}
