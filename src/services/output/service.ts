import type { ContentPackage } from "../content/types.js";
import type { OutputRenderer } from "./types.js";

export class MarkdownOutputRenderer implements OutputRenderer {
  renderMarkdown(contentPackage: ContentPackage): string {
    return [
      `# ${contentPackage.metaTitle}`,
      "",
      `**Slug:** ${contentPackage.slug}`,
      "",
      `**Target keyword:** ${contentPackage.seoBrief.targetKeyword}`,
      "",
      `**SEO score:** ${contentPackage.seoBrief.score}/100`,
      "",
      contentPackage.draftBody,
      "",
      "## SEO Metadata",
      "",
      `- Meta title: ${contentPackage.metaTitle}`,
      `- Meta description: ${contentPackage.metaDescription}`,
      `- Search intent: ${contentPackage.seoBrief.searchIntent}`,
      `- Keywords: ${contentPackage.seoBrief.keywords.join(", ")}`,
      "",
      "## JSON-LD Schema",
      "",
      "```json",
      contentPackage.schemaJsonLd,
      "```"
    ].join("\n");
  }

  renderJson(contentPackage: ContentPackage, pretty = true): string {
    return JSON.stringify(contentPackage, null, pretty ? 2 : 0);
  }
}
