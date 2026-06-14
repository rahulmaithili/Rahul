import { extractKeywords, normalizeTopic } from "../../core/text.js";
import { slugify } from "../../core/slug.js";
import type {
  ArticleOutlineSection,
  ContentGenerationRequest,
  ContentGenerationService,
  ContentPackage
} from "./types.js";
import { CONTENT_GENERATION_PROMPT_TEMPLATE } from "./prompts.js";

export class TemplateContentGenerator implements ContentGenerationService {
  async generatePackage(request: ContentGenerationRequest): Promise<ContentPackage> {
    const targetKeyword = request.seoReport.targetKeyword;
    const slug = slugify(targetKeyword);
    const outline = this.buildOutline(request);
    const citations = request.research.sources.map((source) => ({
      id: source.id,
      title: source.title,
      url: source.url,
      note: source.snippet
    }));
    const draftBody = this.buildDraftBody(request, outline, citations);
    const schemaJsonLd = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: request.seoReport.title,
        description: request.seoReport.metaDescription,
        keywords: request.seoReport.keywords.map((keyword) => keyword.keyword),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://example.com/${slug}`
        },
        author: {
          "@type": "Organization",
          name: "Content Automation Tool"
        }
      },
      null,
      2
    );

    return {
      topic: request.topicInput.topic,
      slug,
      seoBrief: {
        targetKeyword,
        keywords: request.seoReport.keywords.map((keyword) => keyword.keyword),
        searchIntent: request.seoReport.searchIntent,
        title: request.seoReport.title,
        metaDescription: request.seoReport.metaDescription,
        score: request.seoReport.score
      },
      outline,
      draftBody,
      metaTitle: request.seoReport.title,
      metaDescription: request.seoReport.metaDescription,
      faqs: request.seoReport.faqSuggestions,
      schemaJsonLd,
      citations,
      createdAt: new Date().toISOString()
    };
  }

  getPromptTemplate(): typeof CONTENT_GENERATION_PROMPT_TEMPLATE {
    return CONTENT_GENERATION_PROMPT_TEMPLATE;
  }

  private buildOutline(request: ContentGenerationRequest): ArticleOutlineSection[] {
    return request.research.notes.flatMap((note) =>
      note.keyPoints.map((keyPoint, index) => ({
        heading: keyPoint.replace(/\.$/u, ""),
        subheadings: [
          `Explain ${request.seoReport.targetKeyword} in this section.`,
          `Add example ${index + 1} for ${normalizeTopic(request.topicInput.topic)}.`
        ]
      }))
    );
  }

  private buildDraftBody(
    request: ContentGenerationRequest,
    outline: ArticleOutlineSection[],
    citations: ContentPackage["citations"]
  ): string {
    const keyword = request.seoReport.targetKeyword;
    const sections = outline
      .map((section, index) => {
        const citation = citations[index % Math.max(citations.length, 1)]?.id;

        return [
          `## ${section.heading}`,
          "",
          `Cover ${keyword} with practical context for ${request.topicInput.audience ?? "the target audience"}.`,
          "",
          section.subheadings.map((subheading) => `- ${subheading}`).join("\n"),
          citation ? `\n\nSource: [${citations[index % citations.length].title}](${citations[index % citations.length].url})` : ""
        ].join("\n");
      })
      .join("\n\n");

    const faqs = request.seoReport.faqSuggestions
      .map((question) => `### ${question}\n\nAdd a concise, source-backed answer for this question.`)
      .join("\n\n");

    const sourceList = citations
      .map((citation, index) => `${index + 1}. [${citation.title}](${citation.url}) - ${citation.note}`)
      .join("\n");

    return [
      `# ${request.seoReport.title}`,
      "",
      `**Target keyword:** ${keyword}`,
      "",
      sections,
      "## Frequently Asked Questions",
      "",
      faqs,
      "## Sources",
      "",
      sourceList
    ].join("\n\n");
  }
}

export function buildContentPromptVariables(request: ContentGenerationRequest): Record<string, string> {
  const keywords = extractKeywords(request.topicInput.topic, 3).join(", ");

  return {
    topic: request.topicInput.topic,
    targetKeyword: request.seoReport.targetKeyword,
    audience: request.topicInput.audience ?? "target audience",
    tone: request.topicInput.tone ?? "professional",
    language: request.topicInput.language ?? "en",
    keywords
  };
}
