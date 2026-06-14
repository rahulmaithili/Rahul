import { extractKeywords, normalizeTopic } from "../../core/text.js";
import { slugify } from "../../core/slug.js";
import type { ResearchNotes, ResearchRequest, ResearchService, ResearchSource } from "./types.js";

export class DeterministicResearchService implements ResearchService {
  async research(request: ResearchRequest): Promise<ResearchNotes> {
    const normalizedTopic = normalizeTopic(request.topic);
    const keywords = extractKeywords(normalizedTopic, 4);
    const retrievedAt = new Date().toISOString();
    const sources = keywords.map((keyword, index) =>
      this.createManualSource(keyword, index, retrievedAt)
    );
    const keyPoints = this.buildKeyPoints(request, keywords);
    const includeQuotes = request.length !== "short";
    const notes = [
      {
        id: "research-note-1",
        topic: normalizedTopic,
        keyPoints,
        quotes: includeQuotes
          ? sources.slice(0, 2).map((source) => ({
              text: `Placeholder citation for ${source.title}.`,
              sourceId: source.id
            }))
          : [],
        sources,
        salience: 0.72,
        confidence: 0.48
      }
    ];

    return {
      topic: request.topic,
      normalizedTopic,
      language: request.language,
      audience: request.audience,
      notes,
      sources,
      confidence: 0.48
    };
  }

  private createManualSource(keyword: string, index: number, retrievedAt: string): ResearchSource {
    return {
      id: `manual-source-${index + 1}`,
      title: `Manual source: ${keyword}`,
      url: `https://example.com/research/${slugify(keyword)}`,
      snippet: `Use this deterministic source placeholder for ${keyword} until a search provider is configured.`,
      provider: "manual",
      retrievedAt,
      confidence: 0.55
    };
  }

  private buildKeyPoints(request: ResearchRequest, keywords: string[]): string[] {
    const audience = request.audience ? ` for ${request.audience}` : "";
    const targetKeyword = request.targetKeyword ? ` including ${request.targetKeyword}` : "";

    return [
      `Define ${request.topic}${audience}${targetKeyword}.`,
      `Explain the main benefits, risks, and trade-offs around ${keywords[0] ?? request.topic}.`,
      `Add practical steps, examples, and measurable outcomes readers can apply.`
    ];
  }
}
